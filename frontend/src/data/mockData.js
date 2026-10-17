export const MOCK_USERS = [
  {
    id: 'USR-001',
    name: 'Dr. Eleanor Vance',
    email: 'admin@vetai.demo',
    role: 'admin',
    roleLabel: 'Administrator',
    status: 'Active',
    createdDate: '2025-11-10',
    phone: '+1 (555) 234-5678',
    organization: 'Central Veterinary AI Research Institute',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-002',
    name: 'Sarah Jenkins, RVT',
    email: 'technician@vetai.demo',
    role: 'technician',
    roleLabel: 'Lab Technician',
    status: 'Active',
    createdDate: '2025-12-01',
    phone: '+1 (555) 345-6789',
    organization: 'Department of Veterinary Pathology',
    avatar: 'https://images.unsplash.com/photo-1594824813566-78a99477d94b?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-003',
    name: 'Dr. Marcus Sterling, DVM',
    email: 'doctor@vetai.demo',
    role: 'doctor',
    roleLabel: 'Doctor / Clinician',
    status: 'Active',
    createdDate: '2026-01-15',
    phone: '+1 (555) 456-7890',
    organization: 'Companion Animal Clinical Diagnostics',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-004',
    name: 'Dr. Amara Fernando',
    email: 'amara.f@vetai.demo',
    role: 'doctor',
    roleLabel: 'Doctor / Clinician',
    status: 'Active',
    createdDate: '2026-02-01',
    phone: '+1 (555) 567-8901',
    organization: 'Faculty of Veterinary Medicine & Animal Science',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'USR-005',
    name: 'Kevin Brooks, MT',
    email: 'kbrooks@vetai.demo',
    role: 'technician',
    roleLabel: 'Lab Technician',
    status: 'Active',
    createdDate: '2026-02-10',
    phone: '+1 (555) 678-9012',
    organization: 'Department of Hematology',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80'
  }
];

export const CBC_REFERENCE_RANGES = {
  rbc: { name: 'RBC Count', min: 5.5, max: 8.5, unit: '×10⁶/µL' },
  pcv: { name: 'PCV (Hematocrit)', min: 37, max: 55, unit: '%' },
  hb: { name: 'Hemoglobin', min: 12, max: 18, unit: 'g/dL' },
  wbc: { name: 'WBC Count', min: 6.0, max: 17.0, unit: '×10³/µL' },
  platelets: { name: 'Platelets', min: 200, max: 500, unit: '×10³/µL' },
  neutrophils: { name: 'Neutrophils', min: 60, max: 77, unit: '%' },
  lymphocytes: { name: 'Lymphocytes', min: 12, max: 30, unit: '%' },
  monocytes: { name: 'Monocytes', min: 3, max: 10, unit: '%' },
  eosinophils: { name: 'Eosinophils', min: 2, max: 10, unit: '%' },
  basophils: { name: 'Basophils', min: 0, max: 1, unit: '%' },
};

export const MOCK_PATIENTS = [
  {
    id: 'PAT-2026-001',
    dogName: 'Max',
    ownerName: 'John Perera',
    age: '4 years',
    sex: 'Male',
    breed: 'Labrador Retriever',
    weight: '31.5 kg',
    contactNumber: '+94 77 123 4567',
    sampleDate: '2026-08-28',
    status: 'Diagnosis Complete',
    clinicalNotes: 'Presents with pale mucous membranes, high grade intermittent fever (40.1°C), lethargy, and splenomegaly. Suspected tick-borne parasite infection.',
    
    // Media mock URLs & details
    bloodSmearImage: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80',
    cbcReportPdf: 'Max_CBC_Report_PAT-2026-001.pdf',
    
    // Extracted CBC Data
    cbcData: {
      rbc: { value: 4.2, status: 'Low' },
      pcv: { value: 28, status: 'Low' },
      hb: { value: 9.4, status: 'Low' },
      wbc: { value: 12.4, status: 'Normal' },
      platelets: { value: 180, status: 'Low' },
      neutrophils: { value: 72, status: 'Normal' },
      lymphocytes: { value: 15, status: 'Normal' },
      monocytes: { value: 8, status: 'Normal' },
      eosinophils: { value: 4, status: 'Normal' },
      basophils: { value: 1, status: 'Normal' },
    },

    // AI Analysis Output
    primaryPrediction: 'Canine Babesiosis',
    overallConfidence: 94.2,
    estimatedParasitemia: 3.8,
    zoonoticRisk: 'Low',

    diseasePredictions: {
      ehrlichiosis: {
        diseaseName: 'Canine Ehrlichiosis',
        prediction: 'Negative',
        confidence: 88.4,
        findings: 'No intracytoplasmic morulae detected in monocytes or neutrophils. Mild thrombocytopenia noted.',
        imageFindings: 'Monocytes display clear cytoplasm without characteristic Ehrlichia canis inclusion bodies.',
        cbcFindings: 'Moderate thrombocytopenia present (180 ×10³/µL), but leucocyte indices remain stable.'
      },
      babesiosis: {
        diseaseName: 'Canine Babesiosis',
        prediction: 'Positive',
        confidence: 94.2,
        findings: 'High count of intracellular intra-erythrocytic piriform (pear-shaped) trophozoites occurring in pairs.',
        imageFindings: 'Classical Babesia canis / gibsoni merozoites localized inside red blood cells. 18 infected RBCs identified in field of view.',
        cbcFindings: 'Marked normocytic normochromic anemia (RBC 4.2 ×10⁶/µL, PCV 28%, Hb 9.4 g/dL). Severe hemolysis signature.'
      },
      dirofilariasis: {
        diseaseName: 'Canine Dirofilariasis',
        prediction: 'Negative',
        confidence: 96.1,
        findings: 'No circulating Dirofilaria immitis microfilariae detected in blood smear field.',
        imageFindings: 'Microfilarial visual detector model returned zero segmented structures.',
        cbcFindings: 'Eosinophil level (4%) within baseline limits.'
      },
      hepatozoonosis: {
        diseaseName: 'Canine Hepatozoonosis',
        prediction: 'Negative',
        confidence: 91.0,
        findings: 'No Hepatozoon canis gamont capsules detected inside neutrophils or monocytes.',
        imageFindings: 'Neutrophils exhibit typical multilobed morphology without capsule elongation.',
        cbcFindings: 'Total WBC count (12.4 ×10³/µL) does not show extreme leukocytosis typical of H. canis.'
      }
    },

    imageAnnotations: {
      infectedRbcCount: 18,
      detectedParasitesCount: 24,
      avgConfidence: 92.5,
      parasitemiaPercent: 3.8,
      boxes: [
        { id: 1, label: 'Babesia Merozoite Pair', x: 28, y: 35, width: 14, height: 16, confidence: 96.4 },
        { id: 2, label: 'Infected RBC (Piriform)', x: 55, y: 42, width: 12, height: 14, confidence: 93.8 },
        { id: 3, label: 'Babesia Merozoite Single', x: 70, y: 22, width: 10, height: 12, confidence: 91.2 },
        { id: 4, label: 'Infected RBC', x: 40, y: 65, width: 15, height: 15, confidence: 95.0 }
      ]
    },

    fusionDetails: {
      visualWeight: 0.65,
      hematologicalWeight: 0.35,
      fusionScore: 0.942,
      fusionExplanation: 'Deep late-fusion decision layer weighted visual features (Babesia merozoites in RBCs) at 65% and hematological markers (anemia + thrombocytopenia) at 35%, yielding 94.2% overall model certainty for Canine Babesiosis.'
    },

    doctorReview: {
      status: 'Accepted',
      doctorName: 'Dr. Marcus Sterling, DVM',
      reviewDate: '2026-08-28 14:30',
      comments: 'Confirmed Babesia canis merozoites on microscopy visual overlay. Anemic response aligns with clinical signs. Approved treatment plan starting Imidocarb dipropionate.'
    },

    timeline: [
      { date: '2026-08-28 09:15', title: 'Patient Registered', actor: 'Sarah Jenkins, RVT' },
      { date: '2026-08-28 09:30', title: 'Blood Smear Uploaded', actor: 'Sarah Jenkins, RVT' },
      { date: '2026-08-28 09:32', title: 'CBC Report Uploaded', actor: 'Sarah Jenkins, RVT' },
      { date: '2026-08-28 09:40', title: 'CBC Data Extracted & Reviewed', actor: 'Sarah Jenkins, RVT' },
      { date: '2026-08-28 09:45', title: 'AI Image Analysis Completed', actor: 'VetAI Model v2.4' },
      { date: '2026-08-28 09:46', title: 'AI Hematological Analysis Completed', actor: 'VetAI Model v2.4' },
      { date: '2026-08-28 09:47', title: 'Multi-Modal Fusion Generated', actor: 'VetAI Model v2.4' },
      { date: '2026-08-28 14:30', title: 'Doctor Review Completed (Accepted)', actor: 'Dr. Marcus Sterling, DVM' },
      { date: '2026-08-28 14:35', title: 'Final Report Generated', actor: 'System' },
    ]
  },
  {
    id: 'PAT-2026-002',
    dogName: 'Bella',
    ownerName: 'Anita Silva',
    age: '3 years',
    sex: 'Female',
    breed: 'German Shepherd',
    weight: '28.0 kg',
    contactNumber: '+94 71 987 6543',
    sampleDate: '2026-08-29',
    status: 'Doctor Review',
    clinicalNotes: 'Anorexia, epistaxis (nosebleeds), generalized lymphadenopathy, and petechial hemorrhages on abdomen.',
    
    bloodSmearImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80',
    cbcReportPdf: 'Bella_CBC_Report_PAT-2026-002.pdf',

    cbcData: {
      rbc: { value: 5.1, status: 'Low' },
      pcv: { value: 34, status: 'Low' },
      hb: { value: 11.0, status: 'Low' },
      wbc: { value: 4.8, status: 'Low' },
      platelets: { value: 45, status: 'Low' },
      neutrophils: { value: 52, status: 'Low' },
      lymphocytes: { value: 35, status: 'High' },
      monocytes: { value: 11, status: 'High' },
      eosinophils: { value: 2, status: 'Normal' },
      basophils: { value: 0, status: 'Normal' },
    },

    primaryPrediction: 'Canine Ehrlichiosis',
    overallConfidence: 91.5,
    estimatedParasitemia: 2.1,
    zoonoticRisk: 'Low',

    diseasePredictions: {
      ehrlichiosis: {
        diseaseName: 'Canine Ehrlichiosis',
        prediction: 'Positive',
        confidence: 91.5,
        findings: 'Ehrlichia canis intracytoplasmic morulae detected in circulating monocytes.',
        imageFindings: 'Monocytes contain dark-staining mulberry-like inclusion bodies (morulae).',
        cbcFindings: 'Pancytopenia signature: Severe thrombocytopenia (45 ×10³/µL), mild leukopenia (4.8 ×10³/µL), and anemia.'
      },
      babesiosis: {
        diseaseName: 'Canine Babesiosis',
        prediction: 'Negative',
        confidence: 89.0,
        findings: 'No intra-erythrocytic Babesia merozoites observed.',
        imageFindings: 'RBC morphology is intact without pear-shaped parasites.',
        cbcFindings: 'Anemia is secondary to platelet consumption and hemorrhagic signs.'
      },
      dirofilariasis: {
        diseaseName: 'Canine Dirofilariasis',
        prediction: 'Negative',
        confidence: 94.2,
        findings: 'Microfilariae Absent.',
        imageFindings: 'No elongated microfilarial structures.',
        cbcFindings: 'Normal eosinophil count.'
      },
      hepatozoonosis: {
        diseaseName: 'Canine Hepatozoonosis',
        prediction: 'Negative',
        confidence: 90.1,
        findings: 'No Hepatozoon gamonts.',
        imageFindings: 'Neutrophil cytoplasm clean.',
        cbcFindings: 'No extreme neutrophilic leukocytosis.'
      }
    },

    imageAnnotations: {
      infectedRbcCount: 4,
      detectedParasitesCount: 8,
      avgConfidence: 89.8,
      parasitemiaPercent: 2.1,
      boxes: [
        { id: 1, label: 'Ehrlichia Morula in Monocyte', x: 45, y: 50, width: 18, height: 18, confidence: 92.1 }
      ]
    },

    fusionDetails: {
      visualWeight: 0.50,
      hematologicalWeight: 0.50,
      fusionScore: 0.915,
      fusionExplanation: 'Balanced visual morulae detection and classic severe thrombocytopenic pancytopenia yielded 91.5% confidence for Ehrlichia canis.'
    },

    doctorReview: {
      status: 'Pending',
      doctorName: '',
      reviewDate: '',
      comments: ''
    },

    timeline: [
      { date: '2026-08-29 10:00', title: 'Patient Registered', actor: 'Sarah Jenkins, RVT' },
      { date: '2026-08-29 10:15', title: 'Blood Smear & CBC Uploaded', actor: 'Sarah Jenkins, RVT' },
      { date: '2026-08-29 10:20', title: 'AI Multi-Modal Fusion Executed', actor: 'VetAI Model v2.4' },
      { date: '2026-08-29 10:22', title: 'Submitted for Doctor Review', actor: 'System' },
    ]
  },
  {
    id: 'PAT-2026-003',
    dogName: 'Rocky',
    ownerName: 'David Miller',
    age: '5 years',
    sex: 'Male',
    breed: 'Golden Retriever',
    weight: '34.2 kg',
    contactNumber: '+1 (555) 789-0123',
    sampleDate: '2026-08-27',
    status: 'Diagnosis Complete',
    clinicalNotes: 'Exercise intolerance, persistent dry cough, weight loss, and mild dyspnea.',
    
    bloodSmearImage: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800&auto=format&fit=crop&q=80',
    cbcReportPdf: 'Rocky_CBC_Report_PAT-2026-003.pdf',

    cbcData: {
      rbc: { value: 6.2, status: 'Normal' },
      pcv: { value: 42, status: 'Normal' },
      hb: { value: 14.2, status: 'Normal' },
      wbc: { value: 18.5, status: 'High' },
      platelets: { value: 240, status: 'Normal' },
      neutrophils: { value: 58, status: 'Low' },
      lymphocytes: { value: 20, status: 'Normal' },
      monocytes: { value: 6, status: 'Normal' },
      eosinophils: { value: 15, status: 'High' },
      basophils: { value: 1, status: 'Normal' },
    },

    primaryPrediction: 'Canine Dirofilariasis',
    overallConfidence: 88.7,
    estimatedParasitemia: 1.5,
    zoonoticRisk: 'Moderate (Vector Dependent)',

    diseasePredictions: {
      ehrlichiosis: { diseaseName: 'Canine Ehrlichiosis', prediction: 'Negative', confidence: 93.0, findings: 'No morulae.', imageFindings: 'Clear monocytes.', cbcFindings: 'Platelets within normal range.' },
      babesiosis: { diseaseName: 'Canine Babesiosis', prediction: 'Negative', confidence: 95.2, findings: 'No intra-erythrocytic forms.', imageFindings: 'Normal RBC morphology.', cbcFindings: 'PCV and RBC counts normal.' },
      dirofilariasis: {
        diseaseName: 'Canine Dirofilariasis',
        prediction: 'Positive',
        confidence: 88.7,
        findings: 'Circulating Dirofilaria immitis microfilariae identified in blood smear field.',
        imageFindings: 'Distinct elongated microfilaria body structure (length ~300 µm) detected with clear tapered anterior end.',
        cbcFindings: 'Significant eosinophilia (15%, Ref 2-10%) and mild leukocytosis indicating allergic/helminthic immune response.'
      },
      hepatozoonosis: { diseaseName: 'Canine Hepatozoonosis', prediction: 'Negative', confidence: 92.4, findings: 'No Hepatozoon gamonts.', imageFindings: 'No neutrophil inclusion.', cbcFindings: 'WBC elevated due to eosinophilia.' }
    },

    imageAnnotations: {
      infectedRbcCount: 0,
      detectedParasitesCount: 3,
      avgConfidence: 88.7,
      parasitemiaPercent: 1.5,
      boxes: [
        { id: 1, label: 'Dirofilaria Microfilaria', x: 20, y: 40, width: 35, height: 18, confidence: 90.4 }
      ]
    },

    fusionDetails: {
      visualWeight: 0.70,
      hematologicalWeight: 0.30,
      fusionScore: 0.887,
      fusionExplanation: 'Visual segmenter located characteristic microfilarial body while CBC confirmed marked eosinophilia.'
    },

    doctorReview: {
      status: 'Accepted',
      doctorName: 'Dr. Eleanor Vance',
      reviewDate: '2026-08-27 16:00',
      comments: 'Microfilariae identified on peripheral smear. Eosinophilia confirms heartworm infection. Recommended antigen test and adulticide protocol initialization.'
    },

    timeline: [
      { date: '2026-08-27 11:00', title: 'Patient Registered', actor: 'Kevin Brooks, MT' },
      { date: '2026-08-27 11:30', title: 'Data Uploaded & AI Diagnostics Executed', actor: 'System' },
      { date: '2026-08-27 16:00', title: 'Doctor Review Accepted', actor: 'Dr. Eleanor Vance' },
    ]
  },
  {
    id: 'PAT-2026-004',
    dogName: 'Luna',
    ownerName: 'Chaminda Bandara',
    age: '2 years',
    sex: 'Female',
    breed: 'Beagle',
    weight: '11.8 kg',
    contactNumber: '+94 72 345 6789',
    sampleDate: '2026-08-26',
    status: 'Re-diagnosis Requested',
    clinicalNotes: 'Severe hyperesthesia along spinal column, muscle atrophy, stiffness, high fever (40.5°C), severe ocular discharge.',
    
    bloodSmearImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
    cbcReportPdf: 'Luna_CBC_Report_PAT-2026-004.pdf',

    cbcData: {
      rbc: { value: 4.9, status: 'Low' },
      pcv: { value: 32, status: 'Low' },
      hb: { value: 10.5, status: 'Low' },
      wbc: { value: 48.6, status: 'High' },
      platelets: { value: 210, status: 'Normal' },
      neutrophils: { value: 85, status: 'High' },
      lymphocytes: { value: 8, status: 'Low' },
      monocytes: { value: 5, status: 'Normal' },
      eosinophils: { value: 2, status: 'Normal' },
      basophils: { value: 0, status: 'Normal' },
    },

    primaryPrediction: 'Canine Hepatozoonosis',
    overallConfidence: 93.0,
    estimatedParasitemia: 4.2,
    zoonoticRisk: 'Low',

    diseasePredictions: {
      ehrlichiosis: { diseaseName: 'Canine Ehrlichiosis', prediction: 'Negative', confidence: 87.5, findings: 'No morulae.', imageFindings: 'Clear cytoplasm.', cbcFindings: 'Platelets normal.' },
      babesiosis: { diseaseName: 'Canine Babesiosis', prediction: 'Negative', confidence: 89.2, findings: 'Mild anemia only.', imageFindings: 'No Babesia merozoites.', cbcFindings: 'Non-hemolytic pattern.' },
      dirofilariasis: { diseaseName: 'Canine Dirofilariasis', prediction: 'Negative', confidence: 97.0, findings: 'No microfilariae.', imageFindings: 'Zero helical structures.', cbcFindings: 'Eosinophils normal.' },
      hepatozoonosis: {
        diseaseName: 'Canine Hepatozoonosis',
        prediction: 'Positive',
        confidence: 93.0,
        findings: 'Large oblong Hepatozoon canis gamont capsules detected inside neutrophil cytoplasm.',
        imageFindings: 'Distinctive "capsule" or "cigar-shaped" unpigmented gamont parasite inside PMNs.',
        cbcFindings: 'Extreme neutrophilic leukocytosis (WBC 48.6 ×10³/µL, 85% neutrophils) classic for H. canis.'
      }
    },

    imageAnnotations: {
      infectedRbcCount: 0,
      detectedParasitesCount: 12,
      avgConfidence: 93.0,
      parasitemiaPercent: 4.2,
      boxes: [
        { id: 1, label: 'Hepatozoon Gamont in PMN', x: 38, y: 44, width: 22, height: 14, confidence: 94.5 }
      ]
    },

    fusionDetails: {
      visualWeight: 0.55,
      hematologicalWeight: 0.45,
      fusionScore: 0.930,
      fusionExplanation: 'Severe leukocytosis (>45k WBC) coupled with cigar-shaped gamont visual localization yields high confidence for Hepatozoonosis.'
    },

    doctorReview: {
      status: 'Re-diagnosis Requested',
      doctorName: 'Dr. Amara Fernando',
      reviewDate: '2026-08-26 17:15',
      comments: 'Smear quality has slight stain precipitate artifacts near neutrophil clusters. Please re-stain Giemsa slide and re-upload smear for confirmation.'
    },

    timeline: [
      { date: '2026-08-26 13:00', title: 'Patient Registered', actor: 'Sarah Jenkins, RVT' },
      { date: '2026-08-26 13:30', title: 'Initial AI Diagnosis Executed', actor: 'VetAI Model' },
      { date: '2026-08-26 17:15', title: 'Doctor Requested Re-Diagnosis', actor: 'Dr. Amara Fernando' },
    ]
  },
  {
    id: 'PAT-2026-005',
    dogName: 'Cooper',
    ownerName: 'Susan Clark',
    age: '6 years',
    sex: 'Male',
    breed: 'Poodle',
    weight: '9.5 kg',
    contactNumber: '+1 (555) 890-1234',
    sampleDate: '2026-08-30',
    status: 'Diagnosis Complete',
    clinicalNotes: 'Routine pre-surgical health screening prior to dental prophylaxis. No clinical symptoms reported.',
    
    bloodSmearImage: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&auto=format&fit=crop&q=80',
    cbcReportPdf: 'Cooper_CBC_Report_PAT-2026-005.pdf',

    cbcData: {
      rbc: { value: 6.8, status: 'Normal' },
      pcv: { value: 46, status: 'Normal' },
      hb: { value: 15.1, status: 'Normal' },
      wbc: { value: 9.2, status: 'Normal' },
      platelets: { value: 310, status: 'Normal' },
      neutrophils: { value: 65, status: 'Normal' },
      lymphocytes: { value: 24, status: 'Normal' },
      monocytes: { value: 6, status: 'Normal' },
      eosinophils: { value: 4, status: 'Normal' },
      basophils: { value: 1, status: 'Normal' },
    },

    primaryPrediction: 'All Vector-Borne Diseases Negative',
    overallConfidence: 98.4,
    estimatedParasitemia: 0.0,
    zoonoticRisk: 'None',

    diseasePredictions: {
      ehrlichiosis: { diseaseName: 'Canine Ehrlichiosis', prediction: 'Negative', confidence: 98.8, findings: 'Clean monocyte cytoplasm.', imageFindings: 'No inclusions.', cbcFindings: 'Platelets & WBC normal.' },
      babesiosis: { diseaseName: 'Canine Babesiosis', prediction: 'Negative', confidence: 99.1, findings: 'Normal erythrocyte architecture.', imageFindings: 'Zero merozoites.', cbcFindings: 'RBC & PCV optimal.' },
      dirofilariasis: { diseaseName: 'Canine Dirofilariasis', prediction: 'Negative', confidence: 98.5, findings: 'No microfilariae.', imageFindings: 'Clean field.', cbcFindings: 'Eosinophils normal.' },
      hepatozoonosis: { diseaseName: 'Canine Hepatozoonosis', prediction: 'Negative', confidence: 97.2, findings: 'No PMN gamonts.', imageFindings: 'Clean PMNs.', cbcFindings: 'Leucocytes baseline.' }
    },

    imageAnnotations: {
      infectedRbcCount: 0,
      detectedParasitesCount: 0,
      avgConfidence: 98.4,
      parasitemiaPercent: 0.0,
      boxes: []
    },

    fusionDetails: {
      visualWeight: 0.50,
      hematologicalWeight: 0.50,
      fusionScore: 0.984,
      fusionExplanation: 'Zero visual parasites found and all CBC parameters strictly within healthy reference intervals.'
    },

    doctorReview: {
      status: 'Accepted',
      doctorName: 'Dr. Marcus Sterling, DVM',
      reviewDate: '2026-08-30 11:20',
      comments: 'Health check cleared. Cleared for dental procedure.'
    },

    timeline: [
      { date: '2026-08-30 08:30', title: 'Patient Registered', actor: 'Sarah Jenkins, RVT' },
      { date: '2026-08-30 09:00', title: 'AI Multi-Modal Fusion Executed', actor: 'System' },
      { date: '2026-08-30 11:20', title: 'Doctor Review Accepted', actor: 'Dr. Marcus Sterling, DVM' },
    ]
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    title: 'Re-diagnosis Requested',
    message: 'Dr. Amara Fernando requested re-diagnosis for Luna (PAT-2026-004) due to slide stain artifact.',
    timestamp: '10 mins ago',
    type: 'warning',
    read: false
  },
  {
    id: 'NOTIF-2',
    title: 'New Patient Diagnosis Completed',
    message: 'Multi-modal AI fusion completed for Max (PAT-2026-001). Babesiosis detected (94.2%).',
    timestamp: '1 hour ago',
    type: 'success',
    read: false
  },
  {
    id: 'NOTIF-3',
    title: 'Case Pending Review',
    message: 'Bella (PAT-2026-002) Ehrlichiosis case awaiting doctor clinical review.',
    timestamp: '2 hours ago',
    type: 'info',
    read: true
  },
  {
    id: 'NOTIF-4',
    title: 'Report Generated',
    message: 'Diagnostic Report generated for Rocky (PAT-2026-003).',
    timestamp: 'Yesterday',
    type: 'neutral',
    read: true
  }
];

export const RESEARCH_METRICS = {
  overallAccuracy: 95.8,
  sensitivity: 96.2,
  specificity: 95.4,
  aucRoc: 0.982,
  f1Score: 0.958,
  datasetSmears: 4500,
  datasetHematology: 4500,
  modelName: 'VetAI-MultiModalFusionNet v2.4 (ResNet50 + Transformer Fusion)',
  diseaseAccuracy: [
    { disease: 'Canine Babesiosis', accuracy: 96.5, sensitivity: 97.1, specificity: 95.9 },
    { disease: 'Canine Ehrlichiosis', accuracy: 95.2, sensitivity: 94.8, specificity: 95.6 },
    { disease: 'Canine Dirofilariasis', accuracy: 96.8, sensitivity: 96.0, specificity: 97.4 },
    { disease: 'Canine Hepatozoonosis', accuracy: 94.7, sensitivity: 93.9, specificity: 95.5 }
  ]
};
