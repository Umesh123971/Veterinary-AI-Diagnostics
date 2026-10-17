from django.db import models

STATUS_CHOICES = (
    ('Awaiting Diagnosis', 'Awaiting Diagnosis'),
    ('Doctor Review', 'Doctor Review'),
    ('Diagnosis Complete', 'Diagnosis Complete'),
    ('Re-diagnosis Requested', 'Re-diagnosis Requested'),
)

class Patient(models.Model):
    custom_id = models.CharField(max_length=50, unique=True)
    dog_name = models.CharField(max_length=150)
    owner_name = models.CharField(max_length=150)
    age = models.CharField(max_length=50, default='3 years')
    sex = models.CharField(max_length=20, default='Male')
    breed = models.CharField(max_length=100, default='Mixed Breed')
    weight = models.CharField(max_length=50, default='20.0 kg')
    contact_number = models.CharField(max_length=50, default='+94 77 000 0000')
    sample_date = models.CharField(max_length=50, default='')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Awaiting Diagnosis')
    clinical_notes = models.TextField(blank=True, default='')

    # Media assets
    blood_smear_image = models.TextField(blank=True, default='')
    cbc_report_pdf = models.TextField(blank=True, default='')

    # Extracted CBC Data
    cbc_data = models.JSONField(default=dict, blank=True)

    # AI Diagnosis Predictions
    primary_prediction = models.CharField(max_length=100, default='Canine Babesiosis')
    overall_confidence = models.FloatField(default=90.0)
    estimated_parasitemia = models.FloatField(default=3.5)
    zoonotic_risk = models.CharField(max_length=50, default='Low')

    # Comprehensive multi-disease predictions breakdown
    disease_predictions = models.JSONField(default=dict, blank=True)

    # Visual detection & bounding box annotations
    image_annotations = models.JSONField(default=dict, blank=True)

    # Multi-modal fusion details (weighting, fusion score, explanation)
    fusion_details = models.JSONField(default=dict, blank=True)

    # Doctor review details (status, doctorName, reviewDate, comments)
    doctor_review = models.JSONField(default=dict, blank=True)

    # Event timeline history
    timeline = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.custom_id} - {self.dog_name} ({self.status})"
