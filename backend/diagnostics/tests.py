import io
import tempfile
from unittest.mock import patch
from django.test import TestCase,override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from PIL import Image
from .models import Patient
from .integration import local_media_path
from components.canine_ehrlichiosis.cbc import parse_text,analyze_cbc,fuse_analyses,normalize_values,extract_pdf

NORMAL={"rbc":{"value":7},"pcv":{"value":47},"hb":{"value":16},"wbc":{"value":9},"platelets":{"value":300}}
SAMPLE="""RBC
6.17 /uL
3.4-7.6 10^6
PCV
42.9
25-47 %
HGB
13.3 g/dl
9-19
Platelets
53 /uL
200-500 * 10^3
WBC
6.91 /uL
5-21.5 * 10^3
Neutrophils
[56.44%] 4 /uL
2.4-15 10^3
RDW
14.9 %
Comments
FBC: findings (1-2 H.P.F.)
"""

class CbcRuleTests(TestCase):
    def test_extraction_keeps_result_reference_and_differential_units_separate(self):
        data=parse_text(SAMPLE)
        self.assertEqual(data['values']['platelets']['value'],53)
        self.assertEqual(data['values']['neutrophils']['value'],56.44)
        self.assertEqual(data['values']['neutrophilsAbsolute']['value'],4)
        self.assertNotIn('neutrophils',data['reportRanges'])
        self.assertEqual(data['reportRanges']['neutrophilsAbsolute']['min'],2.4)
        self.assertNotIn('rdw',data['reportRanges'])
        result=analyze_cbc(data['values'],data['reportRanges'])
        self.assertEqual(result['parameters']['platelets']['status'],'Low')
        self.assertEqual(result['parameters']['hb']['status'],'Normal')
        self.assertAlmostEqual(result['score'],.563875)

    def test_healthy_values_have_zero_pattern_score(self):
        self.assertEqual(analyze_cbc(NORMAL,profile='cornell')['score'],0)

    def test_missing_invalid_and_zero_platelet_values(self):
        for value in [None,'',float('nan'),float('inf'),-1]:
            with self.assertRaises(ValueError):
                normalize_values({**NORMAL,'platelets':{'value':value}},required=True)
        result=analyze_cbc({**NORMAL,'platelets':{'value':0}})
        self.assertGreaterEqual(result['score'],.65)
        with self.assertRaises(ValueError):
            normalize_values({'neutrophils':{'value':101}})

    def test_unit_conversion_and_reference_is_not_missing_result(self):
        parsed=parse_text('RBC 6170000 cells/uL\n5.7-8.5 10^6\nWBC 6910 cells/uL\n5-21.5 10^3\nPlatelets\n200-500 *10^3')
        self.assertAlmostEqual(parsed['values']['rbc']['value'],6.17)
        self.assertAlmostEqual(parsed['values']['wbc']['value'],6.91)
        self.assertNotIn('platelets',parsed['values'])

    def test_requested_fusion_and_fallback_are_distinct(self):
        cbc={'score':.6,'pattern':'Higher CBC pattern concern'}
        fusion=fuse_analyses(cbc,{'available':True,'positiveScore':.8,'boxes':[]})
        self.assertAlmostEqual(fusion['score'],.74)
        self.assertEqual(fusion['mode'],'multimodal')
        self.assertEqual(fusion['imageWeight'],.7)
        for image in [{'available':False,'reason':'model missing'},{'available':True,'positiveScore':float('nan')}]:
            fallback=fuse_analyses(cbc,image)
            self.assertEqual(fallback['mode'],'cbc_only')
            self.assertEqual(fallback['cbcWeight'],1)
            self.assertEqual(fallback['score'],.6)

    def test_invalid_pdf_returns_manual_entry_error(self):
        with self.assertRaises(ValueError):
            extract_pdf(b'not a PDF')

class WorkflowTests(TestCase):
    def setUp(self):
        self.directory=tempfile.TemporaryDirectory()
        self.media=override_settings(MEDIA_ROOT=self.directory.name)
        self.media.enable()
        self.addCleanup(self.media.disable);self.addCleanup(self.directory.cleanup)
        self.api=APIClient()
        self.patient=self.api.post('/api/patients/',{'dogName':'Workflow Test','ownerName':'Test Owner'},format='json').json()
        self.base=f"/api/patients/{self.patient['id']}/"

    def review(self,values=None):
        extracted=self.api.post(self.base+'extract-cbc/',{},format='json').json()['patient']
        result=self.api.patch(self.base+'update-cbc/',{'cbcRevision':extracted['cbcRevision'],'cbcData':values or NORMAL,'referenceProfile':'cornell','confirmed':True},format='json')
        self.assertEqual(result.status_code,200,result.content)
        return result.json()['patient']

    def test_creation_never_accepts_client_predictions_and_requires_core_review(self):
        self.assertEqual(self.patient['cbcData'],{})
        self.assertEqual(self.patient['diseasePredictions'],{})
        self.assertEqual(self.patient['overallConfidence'],0)
        with patch('diagnostics.views.run_image_analysis') as image:
            response=self.api.post(self.base+'run-ai/',{'cbcRevision':self.patient['cbcRevision']},format='json')
            self.assertEqual(response.status_code,400)
            image.assert_not_called()

    def test_corrected_cbc_is_recomputed_and_real_image_score_used(self):
        reviewed=self.review({**NORMAL,'platelets':{'value':53}})
        image={'available':True,'positiveScore':.8,'boxes':[],'warning':'test'}
        with patch('diagnostics.views.run_image_analysis',return_value=image):
            response=self.api.post(self.base+'run-ai/',{'cbcRevision':reviewed['cbcRevision']},format='json')
        self.assertEqual(response.status_code,200,response.content)
        patient=response.json()['patient']
        self.assertAlmostEqual(patient['fusionDetails']['score'],.3*reviewed['cbcAnalysis']['score']+.7*.8,places=5)
        self.assertEqual(patient['fusionDetails']['mode'],'multimodal')
        self.assertEqual(patient['imageAnnotations']['boxes'],[])
        for key in ['babesiosis','dirofilariasis','hepatozoonosis']:
            self.assertFalse(patient['diseasePredictions'][key]['available'])
            self.assertIsNone(patient['diseasePredictions'][key]['confidence'])
        corrected=self.api.patch(self.base+'update-cbc/',{'cbcRevision':patient['cbcRevision'],'cbcData':NORMAL,'confirmed':True,'referenceProfile':'cornell'},format='json')
        self.assertEqual(corrected.status_code,200)
        self.assertEqual(corrected.json()['patient']['cbcAnalysis']['score'],0)
        self.assertEqual(corrected.json()['patient']['fusionDetails'],{})

    def test_image_exception_has_explicit_cbc_only_fallback(self):
        reviewed=self.review({**NORMAL,'platelets':{'value':53}})
        with patch('diagnostics.views.run_image_analysis',side_effect=RuntimeError('simulated model error')):
            response=self.api.post(self.base+'run-ai/',{'cbcRevision':reviewed['cbcRevision']},format='json')
        self.assertEqual(response.status_code,200)
        fusion=response.json()['patient']['fusionDetails']
        self.assertEqual(fusion['mode'],'cbc_only')
        self.assertEqual(fusion['imageWeight'],0)
        self.assertEqual(fusion['score'],reviewed['cbcAnalysis']['score'])
        self.assertIn('failed',fusion['imageFailureReason'])

    def test_confirmation_stale_revision_and_concurrent_edit_guard(self):
        reviewed=self.review()
        stale=self.api.post(self.base+'run-ai/',{'cbcRevision':self.patient['cbcRevision']},format='json')
        self.assertEqual(stale.status_code,409)
        def edit_during_inference(*args):
            patient=Patient.objects.get(custom_id=reviewed['id'])
            import uuid
            patient.cbc_revision=uuid.uuid4();patient.cbc_confirmed=False;patient.save()
            return {'available':True,'positiveScore':.9,'boxes':[]}
        with patch('diagnostics.views.run_image_analysis',side_effect=edit_during_inference):
            response=self.api.post(self.base+'run-ai/',{'cbcRevision':reviewed['cbcRevision']},format='json')
        self.assertEqual(response.status_code,409)
        self.assertEqual(Patient.objects.get(custom_id=reviewed['id']).fusion_details,{})

    def test_replace_files_invalidates_review_and_uploaded_image_is_preserved(self):
        reviewed=self.review()
        buffer=io.BytesIO();Image.new('RGB',(16,16),'red').save(buffer,format='PNG')
        response=self.api.post(self.base+'replace-files/',{'image':SimpleUploadedFile('smear.png',buffer.getvalue(),content_type='image/png')},format='multipart')
        self.assertEqual(response.status_code,200,response.content)
        patient=response.json()['patient']
        self.assertFalse(patient['cbcConfirmed'])
        self.assertNotEqual(patient['cbcRevision'],reviewed['cbcRevision'])
        image_response = self.api.get(patient['bloodSmearImage'])
        self.assertEqual(image_response.status_code, 200)
        b''.join(image_response.streaming_content)
        image_response.close()
        path=local_media_path(Patient.objects.get(custom_id=patient['id']).blood_smear_image)
        self.assertTrue(path.is_file())
        with self.assertRaises(ValueError):
            local_media_path('/media/../../manage.py')

    def test_invalid_confirmation_does_not_mutate_record(self):
        reviewed=self.review()
        response=self.api.patch(self.base+'update-cbc/',{'cbcRevision':reviewed['cbcRevision'],'cbcData':NORMAL,'confirmed':False},format='json')
        self.assertEqual(response.status_code,400)
        self.assertEqual(str(Patient.objects.get(custom_id=reviewed['id']).cbc_revision),reviewed['cbcRevision'])


class DownloadReportTests(TestCase):
    def test_download_pdf_uses_saved_cbc_only_result(self):
        import fitz
        cbc=analyze_cbc(NORMAL)
        image={'available':False,'reason':'No image uploaded'}
        patient=Patient.objects.create(custom_id='PAT-PDF-TEST',dog_name='Report animal',owner_name='Report owner',cbc_analysis=cbc,image_analysis=image,fusion_details=fuse_analyses(cbc,image))
        response=APIClient().get(f'/api/patients/{patient.custom_id}/download-report/',HTTP_ACCEPT='*/*')
        self.assertEqual(response.status_code,200)
        self.assertEqual(response['Content-Type'],'application/pdf')
        self.assertIn('attachment;',response['Content-Disposition'])
        with fitz.open(stream=response.content,filetype='pdf') as doc:
            text=''.join(page.get_text() for page in doc)
        for expected in ['Report animal','Report owner','CBC only','No image uploaded','Platelets','0.0%']:
            self.assertIn(expected,text)

    def test_pending_report_does_not_invent_results(self):
        import fitz
        patient=Patient.objects.create(custom_id='PAT-PDF-PENDING',dog_name='Pending animal',owner_name='Owner')
        response=APIClient().get(f'/api/patients/{patient.custom_id}/download-report/',HTTP_ACCEPT='*/*')
        with fitz.open(stream=response.content,filetype='pdf') as doc:
            self.assertIn('Analysis not completed', ''.join(page.get_text() for page in doc))
