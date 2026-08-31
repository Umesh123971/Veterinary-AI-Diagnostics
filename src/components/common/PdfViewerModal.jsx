import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { ZoomIn, ZoomOut, RotateCw, Download, FileText, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

export const PdfViewerModal = ({ isOpen, onClose, fileName = 'CBC_Report.pdf', patientName = 'Patient' }) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);
  const totalPages = 2;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 20, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 20, 60));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Document Viewer: ${fileName}`}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Extracted CBC parameters auto-synchronized with research database</span>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>Close Document</Button>
        </div>
      }
    >
      {/* PDF Controls Toolbar */}
      <div className="bg-slate-800 text-white rounded-t-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <span className="font-medium truncate max-w-[200px] sm:max-w-xs">{fileName}</span>
          <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">PDF Document</span>
        </div>

        {/* Page Controls */}
        <div className="flex items-center gap-2 bg-slate-700/80 px-3 py-1 rounded">
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(p => p - 1)}
            className="hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {page} of {totalPages}</span>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-slate-700/80 px-3 py-1 rounded">
          <button onClick={handleZoomOut} className="hover:text-emerald-400 p-0.5"><ZoomOut className="w-3.5 h-3.5" /></button>
          <span className="min-w-[40px] text-center font-mono">{zoom}%</span>
          <button onClick={handleZoomIn} className="hover:text-emerald-400 p-0.5"><ZoomIn className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Simulated PDF Canvas View */}
      <div className="bg-slate-200 p-6 min-h-[420px] flex items-center justify-center overflow-auto rounded-b-lg border border-t-0 border-slate-300">
        <div 
          className="bg-white shadow-xl rounded p-8 w-full max-w-2xl transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          {/* Header of Simulated Report */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">VETERINARY HEMATOLOGY LABORATORY REPORT</h2>
              <p className="text-xs text-slate-500 font-mono mt-1">Ref: LAB-CBC-2026-88492 • Specimen: Canine EDTA Blood</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded">
                COMPLETED
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Date: 2026-08-28</p>
            </div>
          </div>

          {/* Patient Details Sub-header */}
          <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
            <div><span className="text-slate-400 block text-[10px]">PATIENT</span><span className="font-semibold text-slate-800">{patientName}</span></div>
            <div><span className="text-slate-400 block text-[10px]">SPECIES/BREED</span><span className="font-semibold text-slate-800">Canine / Lab</span></div>
            <div><span className="text-slate-400 block text-[10px]">AGE / SEX</span><span className="font-semibold text-slate-800">4 yrs / Male</span></div>
            <div><span className="text-slate-400 block text-[10px]">COLLECTION</span><span className="font-semibold text-slate-800">08:30 AM</span></div>
          </div>

          {page === 1 ? (
            /* Page 1: Erythrocytes & Leukocytes Table */
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">Automated Complete Blood Count (CBC)</h4>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2 px-2">Parameter</th>
                    <th className="py-2 px-2">Measured</th>
                    <th className="py-2 px-2">Reference Range</th>
                    <th className="py-2 px-2">Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="py-2 px-2 font-sans font-medium text-slate-800">RBC Count</td>
                    <td className="py-2 px-2 text-rose-600 font-bold">4.2 ×10⁶/µL</td>
                    <td className="py-2 px-2 text-slate-500">5.5 – 8.5</td>
                    <td className="py-2 px-2"><span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">LOW</span></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-sans font-medium text-slate-800">PCV (Hematocrit)</td>
                    <td className="py-2 px-2 text-rose-600 font-bold">28.0 %</td>
                    <td className="py-2 px-2 text-slate-500">37.0 – 55.0</td>
                    <td className="py-2 px-2"><span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">LOW</span></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-sans font-medium text-slate-800">Hemoglobin</td>
                    <td className="py-2 px-2 text-rose-600 font-bold">9.4 g/dL</td>
                    <td className="py-2 px-2 text-slate-500">12.0 – 18.0</td>
                    <td className="py-2 px-2"><span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">LOW</span></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-sans font-medium text-slate-800">WBC Count</td>
                    <td className="py-2 px-2 text-slate-800">12.4 ×10³/µL</td>
                    <td className="py-2 px-2 text-slate-500">6.0 – 17.0</td>
                    <td className="py-2 px-2"><span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">NORMAL</span></td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-sans font-medium text-slate-800">Platelet Count</td>
                    <td className="py-2 px-2 text-amber-600 font-bold">180 ×10³/µL</td>
                    <td className="py-2 px-2 text-slate-500">200 – 500</td>
                    <td className="py-2 px-2"><span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">LOW</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            /* Page 2: Differential Leukocyte & Microscopic Notes */
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1">Differential Leukocyte Count (%)</h4>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2 px-2">Cell Type</th>
                    <th className="py-2 px-2">Relative %</th>
                    <th className="py-2 px-2">Normal Range</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr><td className="py-2 px-2 font-sans font-medium text-slate-800">Neutrophils</td><td className="py-2 px-2">72 %</td><td className="py-2 px-2 text-slate-500">60 – 77 %</td></tr>
                  <tr><td className="py-2 px-2 font-sans font-medium text-slate-800">Lymphocytes</td><td className="py-2 px-2">15 %</td><td className="py-2 px-2 text-slate-500">12 – 30 %</td></tr>
                  <tr><td className="py-2 px-2 font-sans font-medium text-slate-800">Monocytes</td><td className="py-2 px-2">8 %</td><td className="py-2 px-2 text-slate-500">3 – 10 %</td></tr>
                  <tr><td className="py-2 px-2 font-sans font-medium text-slate-800">Eosinophils</td><td className="py-2 px-2">4 %</td><td className="py-2 px-2 text-slate-500">2 – 10 %</td></tr>
                  <tr><td className="py-2 px-2 font-sans font-medium text-slate-800">Basophils</td><td className="py-2 px-2">1 %</td><td className="py-2 px-2 text-slate-500">0 – 1 %</td></tr>
                </tbody>
              </table>

              <div className="mt-6 p-4 bg-amber-50/60 border border-amber-200 rounded text-slate-700 font-sans text-xs">
                <p className="font-bold text-amber-900 mb-1">Pathologist / Analyzer Observation:</p>
                <p>Anisocytosis present. Polychromasia observed. Microscopic smear confirmation recommended for intra-erythrocytic parasite screening.</p>
              </div>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400">
            <span>Automated Analyzer Output: Sysmex XN-V System</span>
            <span>Page {page} of {totalPages}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
