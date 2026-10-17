import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Eye, 
  EyeOff, 
  Target, 
  Microscope, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { Button } from '../common/Button';

export const MicroscopicAnnotator = ({ patient }) => {
  const [zoom, setZoom] = useState(100);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [showInfectedHighlight, setShowInfectedHighlight] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const annotations = patient?.imageAnnotations || {
    infectedRbcCount: 18,
    detectedParasitesCount: 24,
    avgConfidence: 92.5,
    parasitemiaPercent: 3.8,
    boxes: [
      { id: 1, label: 'Babesia Pair', x: 28, y: 35, width: 18, height: 18, confidence: 96.4 },
      { id: 2, label: 'Infected RBC (Piriform)', x: 55, y: 42, width: 16, height: 16, confidence: 93.8 },
      { id: 3, label: 'Babesia Merozoite Single', x: 70, y: 22, width: 14, height: 14, confidence: 91.2 },
      { id: 4, label: 'Infected RBC', x: 40, y: 65, width: 18, height: 18, confidence: 95.0 }
    ]
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 250));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 75));
  const handleReset = () => setZoom(100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left 8 Cols: Microscopy Canvas Viewer */}
      <div className={`lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col ${
        isFullScreen ? 'fixed inset-4 z-50 shadow-2xl' : 'relative'
      }`}>
        {/* Canvas Header Controls Toolbar */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Microscope className="w-4 h-4 text-teal-400" />
            <span className="font-semibold text-white">Giemsa-Stained Microscopic Blood Smear</span>
            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded text-[10px] font-mono">
              100× Oil Immersion
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Annotation Toggles */}
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                showAnnotations ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {showAnnotations ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>Bounding Boxes</span>
            </button>

            <button
              onClick={() => setShowInfectedHighlight(!showInfectedHighlight)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                showInfectedHighlight ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Infected RBC Heatmap</span>
            </button>

            <div className="h-4 w-px bg-slate-700" />

            {/* Zoom controls */}
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded text-slate-300">
              <button onClick={handleZoomOut} className="hover:text-teal-400 p-0.5"><ZoomOut className="w-3.5 h-3.5" /></button>
              <span className="font-mono text-[11px] min-w-[36px] text-center">{zoom}%</span>
              <button onClick={handleZoomIn} className="hover:text-teal-400 p-0.5"><ZoomIn className="w-3.5 h-3.5" /></button>
              <button onClick={handleReset} title="Reset Zoom" className="hover:text-teal-400 p-0.5 ml-1"><RotateCcw className="w-3.5 h-3.5" /></button>
            </div>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Microscopy Visual Viewport */}
        <div className="relative bg-slate-950 min-h-[420px] flex items-center justify-center overflow-hidden p-4">
          <div 
            className="relative transition-transform duration-200 cursor-grab active:cursor-grabbing"
            style={{ transform: `scale(${zoom / 100})` }}
          >
            <img
              src={patient?.bloodSmearImage || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&auto=format&fit=crop&q=80'}
              alt="Microscopic Blood Smear"
              className="max-h-[500px] w-auto rounded-lg shadow-2xl object-cover select-none"
            />

            {/* AI Bounding Boxes Overlay */}
            {showAnnotations && annotations.boxes.map((box) => (
              <div
                key={box.id}
                className="absolute border-2 border-rose-500 bg-rose-500/10 rounded transition-all duration-300 animate-pulse hover:bg-rose-500/20"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-rose-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow whitespace-nowrap flex items-center gap-1">
                  <span>{box.label}</span>
                  <span className="bg-rose-950/80 px-1 rounded text-rose-200">{box.confidence}%</span>
                </div>
              </div>
            ))}

            {/* Infected RBC Highlight Heatmap Nodes */}
            {showInfectedHighlight && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[35%] left-[28%] w-16 h-16 rounded-full bg-rose-500/25 blur-sm border border-rose-500/50" />
                <div className="absolute top-[42%] left-[55%] w-14 h-14 rounded-full bg-amber-500/25 blur-sm border border-amber-500/50" />
                <div className="absolute top-[65%] left-[40%] w-16 h-16 rounded-full bg-rose-500/25 blur-sm border border-rose-500/50" />
              </div>
            )}
          </div>
        </div>

        {/* Viewport Footer Legend */}
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Babesia Merozoite</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Infected RBC Trophozoite</span>
          </div>
          <span>Model: ResNet50-YOLOv8 Dual-Stage Localizer</span>
        </div>
      </div>

      {/* Right 4 Cols: Detection Summary Panel */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Microscopic Detection Summary
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">YOLOv8 Microscopic Cell Segmenter Output</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Infected RBCs</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {annotations.infectedRbcCount}
            </span>
            <span className="text-[10px] text-slate-400">per high-power field</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Detected Parasites</span>
            <span className="text-xl font-extrabold text-slate-900 mt-1 block">
              {annotations.detectedParasitesCount}
            </span>
            <span className="text-[10px] text-slate-400">merozoite pairs</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block">Average Confidence</span>
            <span className="text-xl font-extrabold text-teal-600 mt-1 block">
              {annotations.avgConfidence}%
            </span>
            <span className="text-[10px] text-slate-400">spatial certainty</span>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200">
            <span className="text-[11px] font-semibold text-amber-800 block">Parasitemia Score</span>
            <span className="text-xl font-extrabold text-amber-900 mt-1 block">
              {annotations.parasitemiaPercent}%
            </span>
            <span className="text-[10px] text-amber-700 font-medium">Estimated RBC Burden</span>
          </div>
        </div>

        {/* Parasitemia Visual Progress Meter */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-800">
            <span>Estimated Parasitemia Burden</span>
            <span className="text-amber-700 font-bold">{annotations.parasitemiaPercent}%</span>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 to-rose-600 rounded-full" 
              style={{ width: `${Math.min(100, annotations.parasitemiaPercent * 10)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Calculated as infected RBCs / total count across 10 high-power visual microscopy fields.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          className="w-full"
          icon={Layers}
          onClick={() => setShowAnnotations(!showAnnotations)}
        >
          {showAnnotations ? 'Hide Annotation Layers' : 'View Annotated Image'}
        </Button>
      </div>
    </div>
  );
};
