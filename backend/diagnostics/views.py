import logging
import uuid
from django.db import transaction
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from rest_framework import status,viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Patient
from .serializers import PatientSerializer
from .integration import save_image,save_pdf,local_media_path,run_image_analysis
from components.canine_ehrlichiosis.cbc import extract_pdf,parse_text,parameters,normalize_values,analyze_cbc,fuse_analyses

log=logging.getLogger(__name__)
DISEASES={"ehrlichiosis":"Canine Ehrlichiosis","babesiosis":"Canine Babesiosis","dirofilariasis":"Canine Dirofilariasis","hepatozoonosis":"Canine Hepatozoonosis"}


def clear_results(patient):
    patient.cbc_confirmed=False
    patient.cbc_analysis={}; patient.image_analysis={}; patient.fusion_details={}
    patient.disease_predictions={}; patient.image_annotations={}
    patient.primary_prediction="Not analysed"; patient.overall_confidence=0.
    patient.status="Awaiting Diagnosis"
    patient.doctor_review={"status":"Pending","comments":""}
    patient.cbc_revision=uuid.uuid4()


class PatientViewSet(viewsets.ModelViewSet):
    queryset=Patient.objects.all().order_by('-id')
    serializer_class=PatientSerializer
    permission_classes=[AllowAny]
    http_method_names=['get','post','patch','put','head','options']

    def get_object(self):
        key=self.kwargs.get('pk','')
        return get_object_or_404(Patient,custom_id=key) if key.startswith('PAT-') else super().get_object()

    def result(self,patient,**extra):
        return Response(dict(success=True,patient=self.get_serializer(patient).data,**extra))

    def create(self,request,*args,**kwargs):
        data=request.data
        if not str(data.get('dogName','')).strip() or not str(data.get('ownerName','')).strip():
            return Response({'error':'Patient name and owner name are required'},status=400)
        try:
            report=save_pdf(request.FILES['report']) if 'report' in request.FILES else ''
            image=save_image(request.FILES['image']) if 'image' in request.FILES else ''
        except ValueError as exc:
            return Response({'error':str(exc)},status=400)
        fields={}
        for external,internal in [('dogName','dog_name'),('ownerName','owner_name'),('age','age'),('sex','sex'),('breed','breed'),
                                  ('weight','weight'),('contactNumber','contact_number'),('sampleDate','sample_date'),('clinicalNotes','clinical_notes')]:
            value=str(data.get(external,'')).strip()
            if len(value)>(Patient._meta.get_field(internal).max_length or 10000):
                return Response({'error':f'{external} is too long'},status=400)
            fields[internal]=value
        patient=Patient.objects.create(custom_id='PAT-'+now().strftime('%Y%m%d')+'-'+uuid.uuid4().hex[:10].upper(),
                                       cbc_report_pdf=report,blood_smear_image=image,**fields)
        patient.timeline=[dict(date=now().isoformat(),title='Patient record and uploaded files saved',actor='Technician')]
        patient.save(update_fields=['timeline'])
        return Response(self.get_serializer(patient).data,status=201)

    def update(self,request,*args,**kwargs):
        return Response({'error':'Use the CBC review and replace-files actions to preserve diagnostic provenance'},status=405)

    @action(detail=True, methods=['get'], url_path='download-report')
    def download_report(self, request, pk=None):
        from django.http import HttpResponse
        from .report_pdf import build_report
        patient = self.get_object()
        response = HttpResponse(build_report(patient), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{patient.custom_id}-screening-report.pdf"'
        response['Cache-Control'] = 'private, no-store'
        return response

    @action(detail=False,methods=['get'],url_path='cbc-reference')
    def cbc_reference(self,request):
        return Response({'parameters':parameters(),'core':['rbc','pcv','hb','wbc','platelets']})

    @action(detail=True,methods=['post'],url_path='replace-files')
    def replace_files(self,request,pk=None):
        patient=self.get_object()
        try:
            report=save_pdf(request.FILES['report']) if 'report' in request.FILES else None
            image=save_image(request.FILES['image']) if 'image' in request.FILES else None
        except ValueError as exc:
            return Response({'error':str(exc)},status=400)
        if report is None and image is None:
            return Response({'error':'Choose a report or image to replace'},status=400)
        with transaction.atomic():
            patient=Patient.objects.select_for_update().get(pk=patient.pk)
            if report:
                patient.cbc_report_pdf=report; patient.cbc_extraction={}; patient.cbc_data={}
            if image:
                patient.blood_smear_image=image
            clear_results(patient)
            patient.timeline=list(patient.timeline)+[dict(date=now().isoformat(),title='Clinical upload replaced; CBC review required again',actor='Technician')]
            patient.save()
        return self.result(patient)

    @action(detail=True,methods=['post'],url_path='extract-cbc')
    def extract_cbc(self,request,pk=None):
        patient=self.get_object()
        if patient.cbc_extraction and request.data.get('force') is not True:
            return self.result(patient,extraction=patient.cbc_extraction)
        original_revision=patient.cbc_revision
        try:
            extracted=extract_pdf(local_media_path(patient.cbc_report_pdf).read_bytes())
        except ValueError as exc:
            extracted=parse_text(''); extracted['warnings'].insert(0,str(exc))
        clear_results(patient)
        extraction={**extracted,'extractedAt':now().isoformat(),'report':patient.cbc_report_pdf}
        # A single conditional UPDATE prevents concurrent extraction from overwriting reviews
        # and avoids SQLite transaction lock upgrades during React development re-mounts.
        changed=Patient.objects.filter(pk=patient.pk,cbc_revision=original_revision).update(
            cbc_data=normalize_values(extracted['values']),cbc_extraction=extraction,cbc_confirmed=False,
            cbc_analysis={},image_analysis={},fusion_details={},disease_predictions={},image_annotations={},
            primary_prediction='Not analysed',overall_confidence=0.,status='Awaiting Diagnosis',
            doctor_review={'status':'Pending','comments':''},cbc_revision=patient.cbc_revision,updated_at=now())
        patient=Patient.objects.get(pk=patient.pk)
        if not changed and (request.data.get('force') is True or not patient.cbc_extraction):
            return Response({'error':'This record changed during extraction. Reload the latest review.'},status=409)
        return self.result(patient,extraction=patient.cbc_extraction)

    @action(detail=True,methods=['get'],url_path='files/(?P<kind>cbc|image|annotated)')
    def asset(self,request,pk=None,kind=None):
        patient=self.get_object()
        value=patient.cbc_report_pdf if kind=='cbc' else patient.blood_smear_image if kind=='image' else patient.image_analysis.get('annotatedImage','')
        try:
            path=local_media_path(value)
        except ValueError:
            return Response({'error':'This uploaded file is unavailable'},status=404)
        return FileResponse(path.open('rb'),content_type='application/pdf' if kind=='cbc' else 'image/png',
                            filename='cbc-report.pdf' if kind=='cbc' else 'blood-smear.png',as_attachment=False)

    @action(detail=True,methods=['patch','put'],url_path='update-cbc')
    def update_cbc(self,request,pk=None):
        patient=self.get_object()
        if str(request.data.get('cbcRevision',''))!=str(patient.cbc_revision):
            return Response({'error':'CBC values changed. Reload this record before confirming.'},status=409)
        try:
            values=normalize_values(request.data.get('cbcData',{}),required=True)
            profile=request.data.get('referenceProfile','report')
            analysis=analyze_cbc(values,patient.cbc_extraction.get('reportRanges',{}),profile)
        except ValueError as exc:
            return Response({'error':str(exc)},status=400)
        if request.data.get('confirmed') is not True:
            return Response({'error':'Confirm the extracted values and units before continuing'},status=400)
        with transaction.atomic():
            patient=Patient.objects.select_for_update().get(pk=patient.pk)
            if str(patient.cbc_revision)!=str(request.data['cbcRevision']):
                return Response({'error':'Another review changed these CBC values. Reload first.'},status=409)
            clear_results(patient)
            patient.cbc_data={k:dict(value=row['value'],status=row['status'],unit=row['unit']) for k,row in analysis['parameters'].items() if row['value'] is not None}
            patient.cbc_analysis=analysis; patient.cbc_confirmed=True
            patient.cbc_extraction={**patient.cbc_extraction,'review':dict(reviewedAt=now().isoformat(),referenceProfile=profile,
                                      reviewedValues=values,reviewer=request.user.pk if request.user.is_authenticated else None)}
            patient.timeline=list(patient.timeline)+[dict(date=now().isoformat(),title='CBC values reviewed and rule analysis completed',actor='Technician')]
            patient.save()
        return self.result(patient)

    @action(detail=True,methods=['post'],url_path='run-ai')
    def run_ai_diagnosis(self,request,pk=None):
        patient=self.get_object()
        with transaction.atomic():
            patient=Patient.objects.select_for_update().get(pk=patient.pk)
            if not patient.cbc_confirmed or not patient.cbc_analysis:
                return Response({'error':'Extract, review and confirm CBC values before image analysis'},status=400)
            if str(request.data.get('cbcRevision',''))!=str(patient.cbc_revision):
                return Response({'error':'CBC review is stale. Reload and confirm again.'},status=409)
            if patient.status=='Analysing':
                return Response({'error':'Analysis is already running for this patient'},status=409)
            revision=patient.cbc_revision
            patient.status='Analysing'; patient.save(update_fields=['status'])
            cbc=patient.cbc_analysis; image_url=patient.blood_smear_image
        try:
            image=run_image_analysis(image_url)
        except Exception:
            log.exception('Image analysis failed for patient %s',patient.custom_id)
            image={'available':False,'reason':'Image analysis failed; CBC-only analysis is shown. You can retry the image later.'}
        fusion=fuse_analyses(cbc,image)
        with transaction.atomic():
            patient=Patient.objects.select_for_update().get(pk=patient.pk)
            if patient.cbc_revision!=revision or patient.blood_smear_image!=image_url or not patient.cbc_confirmed:
                return Response({'error':'The record changed during inference. Review the latest CBC before rerunning.'},status=409)
            patient.image_analysis=image; patient.fusion_details=fusion
            patient.primary_prediction=fusion['prediction']; patient.overall_confidence=round(fusion['score']*100,2)
            patient.estimated_parasitemia=0.; patient.zoonotic_risk='Not assessed'
            patient.image_annotations={'boxes':image.get('boxes',[]),'detectedRegionsCount':len(image.get('boxes',[]))}
            predictions={k:dict(diseaseName=name,available=False,prediction='Model not available',confidence=None,
                                findings='Not analysed; this disease model is not integrated yet.') for k,name in DISEASES.items()}
            predictions['ehrlichiosis']=dict(diseaseName=DISEASES['ehrlichiosis'],available=True,prediction=fusion['prediction'],
                                            confidence=patient.overall_confidence,score=fusion['score'],mode=fusion['mode'],
                                            findings=fusion['explanation'],imageFindings=image.get('warning',image.get('reason','')),
                                            cbcFindings='; '.join(cbc['abnormalities']) or cbc['status'])
            patient.disease_predictions=predictions; patient.status='Awaiting Verification'
            patient.timeline=list(patient.timeline)+[dict(date=now().isoformat(),title='Ehrlichiosis image + CBC screening completed' if fusion['mode']=='multimodal' else 'CBC-only screening completed; image unavailable',actor='Screening engine')]
            patient.save()
        return self.result(patient,ai_result=image)

    @action(detail=True,methods=['post'],url_path='technician-review')
    def submit_technician_review(self,request,pk=None):
        return self.submit_doctor_review(request,pk)

    @action(detail=True,methods=['post'],url_path='doctor-review')
    def submit_doctor_review(self,request,pk=None):
        patient=self.get_object()
        if not patient.fusion_details.get('mode'):
            return Response({'error':'Run the current CBC and image workflow before verification'},status=400)
        action_type=request.data.get('action')
        if action_type not in {'accept','reject','rediagnose'}:
            return Response({'error':'Choose accept or reject'},status=400)
        accepted=action_type=='accept'
        patient.status='Diagnosis Complete' if accepted else 'Re-diagnosis Requested'
        patient.doctor_review=dict(status='Accepted' if accepted else 'Re-diagnosis Requested',doctorName=request.data.get('reviewerName','Technician'),
                                   reviewDate=now().isoformat(),comments=request.data.get('comments',''))
        patient.timeline=list(patient.timeline)+[dict(date=now().isoformat(),title='Screening review accepted' if accepted else 'Re-analysis requested',actor=patient.doctor_review['doctorName'])]
        patient.save()
        return self.result(patient)
