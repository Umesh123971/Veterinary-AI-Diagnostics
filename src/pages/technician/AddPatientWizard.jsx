import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import { 
  Upload, 
  FileText, 
  Microscope, 
  CheckCircle2, 
  Eye, 
  RefreshCw, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Edit3, 
  Cpu, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const AddPatientWizard = () => {
  const { addPatient, runAiDiagnosis } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProgressStage, setAiProgressStage] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    dogName: 'Max',
    ownerName: 'John Perera',
    age: '4 years',
    sex: 'Male',
    breed: 'Labrador Retriever',
    weight: '31.5 kg',
    contactNumber: '+94 77 123 4567',
    sampleDate: new Date().toISOString().split('T')[0],
    clinicalNotes: 'Presents with pale mucous membranes, high grade intermittent fever (40.1°C), lethargy, and splenomegaly.',
    
    // Media mock state
    bloodSmearFile: { name: 'Giemsa_Smear_Max_PAT-001.jpg', size: '2.4 MB', url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80' },
    cbcReportFile: { name: 'Max_CBC_Report.pdf', size: '1.1 MB' },

    // CBC Extracted Data
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
      basophils: { value: 1, status: 'Normal' }
    }
  });

  const [isEditingCbc, setIsEditingCbc] = useState(false);

  // Form handlers
  const handleInputChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleCbcChange = (paramKey, newVal) => {
    const val = parseFloat(newVal) || 0;
    let status = 'Normal';
    if (paramKey === 'rbc' && val < 5.5) status = 'Low';
    if (paramKey === 'pcv' && val < 37) status = 'Low';
    if (paramKey === 'hb' && val < 12) status = 'Low';
    if (paramKey === 'platelets' && val < 200) status = 'Low';

    setFormData(prev => ({
      ...prev,
      cbcData: {
        ...prev.cbcData,
        [paramKey]: { value: val, status }
      }
    }));
  };

  // AI Pipeline Execution Simulation (Steps 10 & 11 requirement)
  const handleStartAiDiagnosis = () => {
    setIsAiProcessing(true);
    setAiProgressStage(1);

    const createdPatient = addPatient(formData);

    // Progressive checkmarks simulation
    setTimeout(() => setAiProgressStage(2), 700);
    setTimeout(() => setAiProgressStage(3), 1400);
    setTimeout(() => setAiProgressStage(4), 2100);
    setTimeout(() => setAiProgressStage(5), 2800);
    setTimeout(() => {
      runAiDiagnosis(createdPatient.id);
      setIsAiProcessing(false);
      navigate(`/results/${createdPatient.id}`);
    }, 3600);
  };

  const steps = [
    { num: 1, title: 'Patient Information' },
    { num: 2, title: 'Upload Clinical Data' },
    { num: 3, title: 'CBC Data Review' },
    { num: 4, title: 'Review & Confirm' },
    { num: 5, title: 'AI Diagnosis' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Document PDF Modal */}
      <PdfViewerModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        fileName={formData.cbcReportFile?.name}
        patientName={formData.dogName}
      />

      {/* Header & Step Wizard Indicator */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add New Canine Patient & AI Diagnosis</h2>
          <p className="text-xs text-slate-500 mt-1">Multi-step multi-modal data intake pipeline</p>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-5 gap-2 pt-2">
          {steps.map((s) => (
            <div
              key={s.num}
              onClick={() => { if (s.num < currentStep) setCurrentStep(s.num); }}
              className={`p-3 rounded-lg border text-center transition-all ${
                s.num === currentStep
                  ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold shadow-xs'
                  : s.num < currentStep
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 cursor-pointer'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider">Step {s.num}</div>
              <div className="text-xs font-semibold mt-0.5 truncate">{s.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: PATIENT INFORMATION */}
      {currentStep === 1 && (
        <Card title="1. Patient & Owner Demographics" subtitle="Enter basic canine profile details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dog Name *</label>
              <input
                type="text"
                required
                value={formData.dogName}
                onChange={(e) => handleInputChange('dogName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Owner Name *</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Breed *</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age *</label>
              <input
                type="text"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sex *</label>
              <select
                value={formData.sex}
                onChange={(e) => handleInputChange('sex', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Neutered Male">Neutered Male</option>
                <option value="Spayed Female">Spayed Female</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight *</label>
              <input
                type="text"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Number</label>
              <input
                type="text"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sample Collection Date</label>
              <input
                type="date"
                value={formData.sampleDate}
                onChange={(e) => handleInputChange('sampleDate', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-4 text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Clinical Notes & Observations</label>
            <textarea
              rows={3}
              value={formData.clinicalNotes}
              onChange={(e) => handleInputChange('clinicalNotes', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button variant="primary" icon={ArrowRight} onClick={() => setCurrentStep(2)}>
              Save & Continue
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: UPLOAD CLINICAL DATA (CRITICAL STEP 9.2) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Microscope Blood Smear Upload Card */}
          <Card 
            title="Upload Microscopic Blood Smear Image" 
            subtitle="Upload a Giemsa-stained canine blood smear image captured through a microscope."
          >
            <div className="space-y-4">
              <div className="border-2 border-dashed border-teal-300 bg-teal-50/30 rounded-xl p-6 text-center hover:bg-teal-50/60 transition-colors">
                <Microscope className="w-10 h-10 text-teal-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Drag & Drop Giemsa Blood Smear Image here</p>
                <p className="text-xs text-slate-500 mt-1">Supports JPG, JPEG, PNG (High Power 100× Oil Immersion)</p>
                <div className="mt-3">
                  <label className="inline-block">
                    <input type="file" accept="image/*" className="hidden" onChange={() => alert('Demo environment: Preset blood smear image loaded.')} />
                    <span className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-4 h-4" /> Browse Files
                    </span>
                  </label>
                </div>
              </div>

              {/* Uploaded Microscopy Preview Card */}
              {formData.bloodSmearFile && (
                <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={formData.bloodSmearFile.url} 
                      alt="Smear Preview" 
                      className="w-16 h-16 rounded-lg object-cover border border-slate-700" 
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{formData.bloodSmearFile.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{formData.bloodSmearFile.size} • JPG Image</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Ready for AI Segmentation
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => alert('Viewing image preview.')}>
                      <Eye className="w-3.5 h-3.5" /> View / Zoom
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-300" onClick={() => alert('File replaced.')}>
                      <RefreshCw className="w-3.5 h-3.5" /> Replace
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* CBC / Hematology Report Upload Card */}
          <Card 
            title="Upload CBC / Hematology Report" 
            subtitle="Upload raw automated analyzer report (PDF or Image)"
          >
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-xl p-6 text-center hover:bg-slate-100 transition-colors">
                <FileText className="w-10 h-10 text-sky-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">Drag & Drop Hematology CBC Report here</p>
                <p className="text-xs text-slate-500 mt-1">Supports PDF, JPG, JPEG, PNG</p>
                <div className="mt-3">
                  <span className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer inline-flex items-center gap-1.5 shadow-sm">
                    <Upload className="w-4 h-4" /> Browse PDF Report
                  </span>
                </div>
              </div>

              {/* Uploaded Report Status Bar */}
              {formData.cbcReportFile && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-sky-100 text-sky-700 rounded-lg font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{formData.cbcReportFile.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">{formData.cbcReportFile.size} • CBC Document</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Extracted CBC parameters ready for review
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="primary" size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={() => setShowPdfModal(true)}>
                      <Eye className="w-3.5 h-3.5" /> View Report
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => alert('Report replaced.')}>
                      <RefreshCw className="w-3.5 h-3.5" /> Replace
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" icon={ArrowLeft} onClick={() => setCurrentStep(1)}>Back</Button>
              <Button variant="primary" icon={ArrowRight} onClick={() => setCurrentStep(3)}>Continue to CBC Data</Button>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 3: CBC DATA REVIEW */}
      {currentStep === 3 && (
        <Card 
          title="3. Extracted Hematological CBC Data Review" 
          subtitle="Review auto-extracted values from CBC report. Standard canine reference ranges applied."
          action={
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded uppercase font-mono">
                Demo / Mock Data
              </span>
              <Button variant="outline" size="sm" icon={Edit3} onClick={() => setIsEditingCbc(!isEditingCbc)}>
                {isEditingCbc ? 'Lock Edits' : 'Edit CBC Data'}
              </Button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Parameter</th>
                  <th className="py-2.5 px-3">Extracted Value</th>
                  <th className="py-2.5 px-3">Reference Range</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-mono">
                {Object.entries(formData.cbcData).map(([key, item]) => {
                  const titles = {
                    rbc: 'RBC Count', pcv: 'PCV (Hematocrit)', hb: 'Hemoglobin', wbc: 'WBC Count', platelets: 'Platelets',
                    neutrophils: 'Neutrophils', lymphocytes: 'Lymphocytes', monocytes: 'Monocytes', eosinophils: 'Eosinophils', basophils: 'Basophils'
                  };
                  const ranges = {
                    rbc: '5.5–8.5 ×10⁶/µL', pcv: '37–55 %', hb: '12–18 g/dL', wbc: '6–17 ×10³/µL', platelets: '200–500 ×10³/µL',
                    neutrophils: '60–77 %', lymphocytes: '12–30 %', monocytes: '3–10 %', eosinophils: '2–10 %', basophils: '0–1 %'
                  };

                  return (
                    <tr key={key} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{titles[key]}</td>
                      <td className="py-2.5 px-3">
                        {isEditingCbc ? (
                          <input
                            type="number"
                            step="0.1"
                            value={item.value}
                            onChange={(e) => handleCbcChange(key, e.target.value)}
                            className="w-24 px-2 py-1 border border-slate-300 rounded text-xs font-mono font-bold"
                          />
                        ) : (
                          <span className={`font-bold ${item.status === 'Low' ? 'text-rose-600' : 'text-slate-900'}`}>
                            {item.value}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{ranges[key]}</td>
                      <td className="py-2.5 px-3">
                        <Badge variant={item.status}>{item.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" icon={ArrowLeft} onClick={() => setCurrentStep(2)}>Back</Button>
            <Button variant="primary" icon={ArrowRight} onClick={() => setCurrentStep(4)}>Proceed to Review</Button>
          </div>
        </Card>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <Card title="4. Complete Case Summary Review" subtitle="Verify all clinical inputs prior to AI deep learning multi-modal fusion">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Patient Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Patient Demographics</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><span className="text-slate-400 block text-[10px]">DOG NAME</span><span className="font-semibold">{formData.dogName}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">OWNER</span><span className="font-semibold">{formData.ownerName}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">BREED</span><span className="font-semibold">{formData.breed}</span></div>
                  <div><span className="text-slate-400 block text-[10px]">AGE / SEX</span><span className="font-semibold">{formData.age} / {formData.sex}</span></div>
                </div>
              </div>

              {/* Uploaded Media Summary */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Uploaded Clinical Modalities</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                    <span className="flex items-center gap-2 font-medium"><Microscope className="w-4 h-4 text-teal-600" /> Giemsa Blood Smear</span>
                    <span className="text-emerald-700 font-bold text-[10px]">✓ Ready</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                    <span className="flex items-center gap-2 font-medium"><FileText className="w-4 h-4 text-sky-600" /> CBC Report</span>
                    <span className="text-emerald-700 font-bold text-[10px]">✓ Extracted</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 flex justify-between items-center pt-4 border-t border-slate-200">
              <Button variant="outline" icon={ArrowLeft} onClick={() => setCurrentStep(3)}>Back</Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => alert('Draft saved locally.')}>Save Draft</Button>
                <Button variant="primary" icon={Sparkles} className="bg-teal-600 hover:bg-teal-500 py-2.5 px-6 font-bold" onClick={handleStartAiDiagnosis}>
                  Start AI Diagnosis
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* STEP 5: AI PROCESSING ANIMATED MODAL / VIEW (STEP 11 REQUIREMENT) */}
      {(currentStep === 5 || isAiProcessing) && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-2xl p-8 max-w-xl w-full border border-teal-500/40 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-block p-4 bg-teal-500/20 text-teal-400 rounded-full border border-teal-500/40 animate-pulse">
                <Cpu className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold">Analyzing Clinical Data</h3>
              <p className="text-xs text-slate-400">Executing Multi-Modal Deep Learning Neural Networks</p>
            </div>

            {/* Checklist of pipeline stages */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono">
              <div className="flex items-center justify-between text-emerald-400">
                <span>✓ Blood smear image uploaded</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span>✓ CBC report uploaded</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className={`flex items-center justify-between ${aiProgressStage >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{aiProgressStage >= 2 ? '✓' : '⏳'} Image preprocessing & ROI segmentation</span>
                {aiProgressStage >= 2 && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div className={`flex items-center justify-between ${aiProgressStage >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{aiProgressStage >= 3 ? '✓' : '⏳'} Microscopic image feature analysis (YOLOv8)</span>
                {aiProgressStage >= 3 && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div className={`flex items-center justify-between ${aiProgressStage >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span>{aiProgressStage >= 4 ? '✓' : '⏳'} Hematological data tabular analysis</span>
                {aiProgressStage >= 4 && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div className={`flex items-center justify-between ${aiProgressStage >= 5 ? 'text-emerald-400' : 'text-slate-500 animate-pulse'}`}>
                <span>{aiProgressStage >= 5 ? '✓' : '⏳'} Multi-modal fusion & diagnostic result generation</span>
                {aiProgressStage >= 5 && <CheckCircle2 className="w-4 h-4" />}
              </div>
            </div>

            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-teal-400 h-full transition-all duration-500" 
                style={{ width: `${(aiProgressStage / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
