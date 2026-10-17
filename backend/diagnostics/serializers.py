from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='custom_id', read_only=True)
    dogName = serializers.CharField(source='dog_name', required=False)
    ownerName = serializers.CharField(source='owner_name', required=False)
    contactNumber = serializers.CharField(source='contact_number', required=False)
    sampleDate = serializers.CharField(source='sample_date', required=False)
    clinicalNotes = serializers.CharField(source='clinical_notes', required=False, allow_blank=True)
    bloodSmearImage = serializers.CharField(source='blood_smear_image', required=False, allow_blank=True)
    cbcReportPdf = serializers.CharField(source='cbc_report_pdf', required=False, allow_blank=True)
    cbcData = serializers.JSONField(source='cbc_data', required=False)
    primaryPrediction = serializers.CharField(source='primary_prediction', required=False)
    overallConfidence = serializers.FloatField(source='overall_confidence', required=False)
    estimatedParasitemia = serializers.FloatField(source='estimated_parasitemia', required=False)
    zoonoticRisk = serializers.CharField(source='zoonotic_risk', required=False)
    diseasePredictions = serializers.JSONField(source='disease_predictions', required=False)
    imageAnnotations = serializers.JSONField(source='image_annotations', required=False)
    fusionDetails = serializers.JSONField(source='fusion_details', required=False)
    doctorReview = serializers.JSONField(source='doctor_review', required=False)

    class Meta:
        model = Patient
        fields = [
            'id', 'custom_id', 'dogName', 'dog_name', 'ownerName', 'owner_name',
            'age', 'sex', 'breed', 'weight', 'contactNumber', 'contact_number',
            'sampleDate', 'sample_date', 'status', 'clinicalNotes', 'clinical_notes',
            'bloodSmearImage', 'blood_smear_image', 'cbcReportPdf', 'cbc_report_pdf',
            'cbcData', 'cbc_data', 'primaryPrediction', 'primary_prediction',
            'overallConfidence', 'overall_confidence', 'estimatedParasitemia', 'estimated_parasitemia',
            'zoonoticRisk', 'zoonotic_risk', 'diseasePredictions', 'disease_predictions',
            'imageAnnotations', 'image_annotations', 'fusionDetails', 'fusion_details',
            'doctorReview', 'doctor_review', 'timeline', 'created_at', 'updated_at'
        ]

    def to_representation(self, instance):
        res = super().to_representation(instance)
        # Always format output to match frontend structure exactly
        return {
            'id': instance.custom_id,
            'dogName': instance.dog_name,
            'ownerName': instance.owner_name,
            'age': instance.age,
            'sex': instance.sex,
            'breed': instance.breed,
            'weight': instance.weight,
            'contactNumber': instance.contact_number,
            'sampleDate': instance.sample_date,
            'status': instance.status,
            'clinicalNotes': instance.clinical_notes,
            'bloodSmearImage': instance.blood_smear_image,
            'cbcReportPdf': instance.cbc_report_pdf,
            'cbcData': instance.cbc_data,
            'primaryPrediction': instance.primary_prediction,
            'overallConfidence': instance.overall_confidence,
            'estimatedParasitemia': instance.estimated_parasitemia,
            'zoonoticRisk': instance.zoonotic_risk,
            'diseasePredictions': instance.disease_predictions,
            'imageAnnotations': instance.image_annotations,
            'fusionDetails': instance.fusion_details,
            'doctorReview': instance.doctor_review,
            'timeline': instance.timeline,
            'createdAt': instance.created_at.strftime('%Y-%m-%d %H:%M:%S') if instance.created_at else '',
            'updatedAt': instance.updated_at.strftime('%Y-%m-%d %H:%M:%S') if instance.updated_at else ''
        }
