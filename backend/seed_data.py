import os
import sys
import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vetai_backend.settings')
django.setup()

from users.models import CustomUser
from diagnostics.models import Patient
from notifications.models import Notification

def seed_database():
    print("[VetAI Seed] Starting database seeding...")

    # 1. Seed Users
    users_data = [
        {
            'username': 'admin@vetai.demo',
            'email': 'admin@vetai.demo',
            'custom_id': 'USR-001',
            'name': 'Dr. Eleanor Vance',
            'role': 'admin',
            'role_label': 'Administrator',
            'status': 'Active',
            'phone': '+1 (555) 234-5678',
            'organization': 'Central Veterinary AI Research Institute',
            'avatar': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        },
        {
            'username': 'technician@vetai.demo',
            'email': 'technician@vetai.demo',
            'custom_id': 'USR-002',
            'name': 'Sarah Jenkins, RVT',
            'role': 'technician',
            'role_label': 'Lab Technician',
            'status': 'Active',
            'phone': '+1 (555) 345-6789',
            'organization': 'Department of Veterinary Pathology',
            'avatar': 'https://images.unsplash.com/photo-1594824813566-78a99477d94b?w=150&auto=format&fit=crop&q=80'
        },
        {
            'username': 'doctor@vetai.demo',
            'email': 'doctor@vetai.demo',
            'custom_id': 'USR-003',
            'name': 'Dr. Marcus Sterling, DVM',
            'role': 'doctor',
            'role_label': 'Doctor / Clinician',
            'status': 'Active',
            'phone': '+1 (555) 456-7890',
            'organization': 'Companion Animal Clinical Diagnostics',
            'avatar': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
        },
        {
            'username': 'amara.f@vetai.demo',
            'email': 'amara.f@vetai.demo',
            'custom_id': 'USR-004',
            'name': 'Dr. Amara Fernando',
            'role': 'doctor',
            'role_label': 'Doctor / Clinician',
            'status': 'Active',
            'phone': '+1 (555) 567-8901',
            'organization': 'Faculty of Veterinary Medicine & Animal Science',
            'avatar': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
        }
    ]

    for udata in users_data:
        user, created = CustomUser.objects.get_or_create(
            username=udata['username'],
            defaults=udata
        )
        if created:
            user.set_password('Password123!')
            user.save()
            print(f"  - Created User: {user.name} ({user.role})")

    # 2. Seed Patients
    patients_data = [
        {
            'custom_id': 'PAT-2026-001',
            'dog_name': 'Max',
            'owner_name': 'John Perera',
            'age': '4 years',
            'sex': 'Male',
            'breed': 'Labrador Retriever',
            'weight': '31.5 kg',
            'contact_number': '+94 77 123 4567',
            'sample_date': '2026-08-28',
            'status': 'Diagnosis Complete',
            'clinical_notes': 'Presents with pale mucous membranes, high grade intermittent fever (40.1 deg C), lethargy, and splenomegaly. Suspected tick-borne parasite infection.',
            'blood_smear_image': 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
            'cbc_report_pdf': 'Max_CBC_Report_PAT-2026-001.pdf',
            'cbc_data': {
                'rbc': {'value': 4.2, 'status': 'Low'},
                'pcv': {'value': 28, 'status': 'Low'},
                'hb': {'value': 9.4, 'status': 'Low'},
                'wbc': {'value': 12.4, 'status': 'Normal'},
                'platelets': {'value': 180, 'status': 'Low'},
                'neutrophils': {'value': 72, 'status': 'Normal'},
                'lymphocytes': {'value': 15, 'status': 'Normal'},
                'monocytes': {'value': 8, 'status': 'Normal'},
                'eosinophils': {'value': 4, 'status': 'Normal'},
                'basophils': {'value': 1, 'status': 'Normal'},
            },
            'primary_prediction': 'Canine Babesiosis',
            'overall_confidence': 94.2,
            'estimated_parasitemia': 3.8,
            'zoonotic_risk': 'Low',
            'disease_predictions': {
                'ehrlichiosis': {'diseaseName': 'Canine Ehrlichiosis', 'prediction': 'Negative', 'confidence': 88.4, 'findings': 'No intracytoplasmic morulae detected in monocytes or neutrophils. Mild thrombocytopenia noted.', 'imageFindings': 'Monocytes display clear cytoplasm without characteristic Ehrlichia canis inclusion bodies.', 'cbcFindings': 'Moderate thrombocytopenia present (180 x10^3/uL), but leucocyte indices remain stable.'},
                'babesiosis': {'diseaseName': 'Canine Babesiosis', 'prediction': 'Positive', 'confidence': 94.2, 'findings': 'High count of intracellular intra-erythrocytic piriform (pear-shaped) trophozoites occurring in pairs.', 'imageFindings': 'Classical Babesia canis / gibsoni merozoites localized inside red blood cells. 18 infected RBCs identified in field of view.', 'cbcFindings': 'Marked normocytic normochromic anemia (RBC 4.2 x10^6/uL, PCV 28%, Hb 9.4 g/dL). Severe hemolysis signature.'},
                'dirofilariasis': {'diseaseName': 'Canine Dirofilariasis', 'prediction': 'Negative', 'confidence': 96.1, 'findings': 'No circulating Dirofilaria immitis microfilariae detected in blood smear field.', 'imageFindings': 'Microfilarial visual detector model returned zero segmented structures.', 'cbcFindings': 'Eosinophil level (4%) within baseline limits.'},
                'hepatozoonosis': {'diseaseName': 'Canine Hepatozoonosis', 'prediction': 'Negative', 'confidence': 91.0, 'findings': 'No Hepatozoon canis gamont capsules detected inside neutrophils or monocytes.', 'imageFindings': 'Neutrophils exhibit typical multilobed morphology without capsule elongation.', 'cbcFindings': 'Total WBC count (12.4 x10^3/uL) does not show extreme leukocytosis typical of H. canis.'}
            },
            'image_annotations': {
                'infectedRbcCount': 18,
                'detectedParasitesCount': 24,
                'avgConfidence': 92.5,
                'parasitemiaPercent': 3.8,
                'boxes': [
                    {'id': 1, 'label': 'Babesia Merozoite Pair', 'x': 28, 'y': 35, 'width': 14, 'height': 16, 'confidence': 96.4},
                    {'id': 2, 'label': 'Infected RBC (Piriform)', 'x': 55, 'y': 42, 'width': 12, 'height': 14, 'confidence': 93.8},
                    {'id': 3, 'label': 'Babesia Merozoite Single', 'x': 70, 'y': 22, 'width': 10, 'height': 12, 'confidence': 91.2},
                    {'id': 4, 'label': 'Infected RBC', 'x': 40, 'y': 65, 'width': 15, 'height': 15, 'confidence': 95.0}
                ]
            },
            'fusion_details': {
                'visualWeight': 0.65,
                'hematologicalWeight': 0.35,
                'fusionScore': 0.942,
                'fusionExplanation': 'Deep late-fusion decision layer weighted visual features (Babesia merozoites in RBCs) at 65% and hematological markers (anemia + thrombocytopenia) at 35%, yielding 94.2% overall model certainty for Canine Babesiosis.'
            },
            'doctor_review': {
                'status': 'Accepted',
                'doctorName': 'Dr. Marcus Sterling, DVM',
                'reviewDate': '2026-08-28 14:30',
                'comments': 'Confirmed Babesia canis merozoites on microscopy visual overlay. Anemic response aligns with clinical signs. Approved treatment plan starting Imidocarb dipropionate.'
            },
            'timeline': [
                {'date': '2026-08-28 09:15', 'title': 'Patient Registered', 'actor': 'Sarah Jenkins, RVT'},
                {'date': '2026-08-28 09:30', 'title': 'Blood Smear Uploaded', 'actor': 'Sarah Jenkins, RVT'},
                {'date': '2026-08-28 09:32', 'title': 'CBC Report Uploaded', 'actor': 'Sarah Jenkins, RVT'},
                {'date': '2026-08-28 09:45', 'title': 'AI Image Analysis Completed', 'actor': 'VetAI Model v2.4'},
                {'date': '2026-08-28 14:30', 'title': 'Doctor Review Completed (Accepted)', 'actor': 'Dr. Marcus Sterling, DVM'}
            ]
        },
        {
            'custom_id': 'PAT-2026-002',
            'dog_name': 'Bella',
            'owner_name': 'Anita Silva',
            'age': '3 years',
            'sex': 'Female',
            'breed': 'German Shepherd',
            'weight': '28.0 kg',
            'contact_number': '+94 71 987 6543',
            'sample_date': '2026-08-29',
            'status': 'Doctor Review',
            'clinical_notes': 'Anorexia, epistaxis (nosebleeds), generalized lymphadenopathy, and petechial hemorrhages on abdomen.',
            'blood_smear_image': 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=800&auto=format&fit=crop&q=80',
            'cbc_report_pdf': 'Bella_CBC_Report_PAT-2026-002.pdf',
            'cbc_data': {
                'rbc': {'value': 5.8, 'status': 'Normal'},
                'pcv': {'value': 40, 'status': 'Normal'},
                'hb': {'value': 13.5, 'status': 'Normal'},
                'wbc': {'value': 4.1, 'status': 'Low'},
                'platelets': {'value': 45, 'status': 'Low'},
                'neutrophils': {'value': 62, 'status': 'Normal'},
                'lymphocytes': {'value': 25, 'status': 'Normal'},
                'monocytes': {'value': 9, 'status': 'Normal'},
                'eosinophils': {'value': 3, 'status': 'Normal'},
                'basophils': {'value': 1, 'status': 'Normal'},
            },
            'primary_prediction': 'Canine Ehrlichiosis',
            'overall_confidence': 91.5,
            'estimated_parasitemia': 2.1,
            'zoonotic_risk': 'Medium',
            'disease_predictions': {
                'ehrlichiosis': {'diseaseName': 'Canine Ehrlichiosis', 'prediction': 'Positive', 'confidence': 91.5, 'findings': 'Intracytoplasmic morulae clusters in monocytes.', 'imageFindings': 'Ehrlichia morulae detected in monocyte cytoplasm.', 'cbcFindings': 'Severe thrombocytopenia (45 x10^3/uL) & leukopenia.'},
                'babesiosis': {'diseaseName': 'Canine Babesiosis', 'prediction': 'Negative', 'confidence': 89.0, 'findings': 'No intra-erythrocytic Babesia merozoites.', 'imageFindings': 'Clear RBC cytoplasm.', 'cbcFindings': 'RBC count normal.'},
                'dirofilariasis': {'diseaseName': 'Canine Dirofilariasis', 'prediction': 'Negative', 'confidence': 97.0, 'findings': 'No microfilariae detected.', 'imageFindings': 'No microfilarial structures.', 'cbcFindings': 'Normal eosinophils.'},
                'hepatozoonosis': {'diseaseName': 'Canine Hepatozoonosis', 'prediction': 'Negative', 'confidence': 92.0, 'findings': 'No gamont capsules in neutrophils.', 'imageFindings': 'Normal PMNs.', 'cbcFindings': 'No leukocytosis.'}
            },
            'image_annotations': {
                'infectedRbcCount': 0,
                'detectedParasitesCount': 8,
                'avgConfidence': 91.0,
                'parasitemiaPercent': 2.1,
                'boxes': [
                    {'id': 1, 'label': 'Ehrlichia Morulae Cluster', 'x': 45, 'y': 50, 'width': 18, 'height': 18, 'confidence': 92.1}
                ]
            },
            'fusion_details': {
                'visualWeight': 0.60,
                'hematologicalWeight': 0.40,
                'fusionScore': 0.915,
                'fusionExplanation': 'Strong correlation between visual monocyte morulae and severe thrombocytopenia.'
            },
            'doctor_review': {
                'status': 'Pending',
                'doctorName': '',
                'reviewDate': '',
                'comments': ''
            },
            'timeline': [
                {'date': '2026-08-29 10:00', 'title': 'Patient Registered & Sample Uploaded', 'actor': 'Sarah Jenkins, RVT'},
                {'date': '2026-08-29 10:15', 'title': 'AI Diagnosis Executed', 'actor': 'VetAI Model v2.4'},
                {'date': '2026-08-29 10:16', 'title': 'Submitted to Doctor Review Queue', 'actor': 'System'}
            ]
        }
    ]

    for pdata in patients_data:
        patient, created = Patient.objects.get_or_create(
            custom_id=pdata['custom_id'],
            defaults=pdata
        )
        if created:
            print(f"  - Created Patient: {patient.custom_id} - {patient.dog_name}")

    # 3. Seed Notifications
    notifs = [
        {'title': 'New Patient Registered', 'message': 'Max (Labrador Retriever) registered for diagnostic analysis.', 'type': 'info'},
        {'title': 'AI Diagnosis Completed', 'message': 'Multi-modal fusion finished for Bella. Sent to Doctor Review queue.', 'type': 'success'},
        {'title': 'Doctor Review Pending', 'message': '1 case requires urgent clinical sign-off by attending clinician.', 'type': 'warning'}
    ]

    for idx, n in enumerate(notifs, start=1):
        Notification.objects.get_or_create(
            custom_id=f"NOTIF-DEMO-00{idx}",
            defaults={
                'title': n['title'],
                'message': n['message'],
                'type': n['type'],
                'timestamp': 'Just now',
                'read': False
            }
        )
        print(f"  - Created Notification: {n['title']}")

    print("[VetAI Seed] Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
