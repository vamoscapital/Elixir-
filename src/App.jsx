import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Droplets, HeartPulse, ShieldPlus, FlaskConical, ArrowRight, ArrowLeft, Upload, Activity, Leaf, Camera } from 'lucide-react';

function getStatus(meta, value) {
  if (!meta || value === null || value === undefined) return { label: 'No range', color: 'bg-slate-400', badge: 'border-slate-600 text-slate-300 bg-slate-800' };
  if (value === 0 && meta.placeholder) return { label: 'Awaiting data', color: 'bg-slate-400', badge: 'border-slate-600 text-slate-300 bg-slate-800' };
  if (meta.type === 'max') {
    if (value <= meta.goodMax) return { label: 'Optimal', color: 'bg-emerald-500', badge: 'border-emerald-500/30 text-emerald-200 bg-emerald-500/10' };
    if (meta.borderlineMax !== undefined && value <= meta.borderlineMax) return { label: 'Borderline', color: 'bg-yellow-400', badge: 'border-yellow-500/30 text-yellow-200 bg-yellow-500/10' };
    return { label: 'High', color: 'bg-red-500', badge: 'border-red-500/30 text-red-200 bg-red-500/10' };
  }
  if (meta.type === 'min') {
    if (value >= meta.goodMin) return { label: 'Optimal', color: 'bg-emerald-500', badge: 'border-emerald-500/30 text-emerald-200 bg-emerald-500/10' };
    if (meta.borderlineMin !== undefined && value >= meta.borderlineMin) return { label: 'Borderline', color: 'bg-yellow-400', badge: 'border-yellow-500/30 text-yellow-200 bg-yellow-500/10' };
    return { label: 'Low', color: 'bg-red-500', badge: 'border-red-500/30 text-red-200 bg-red-500/10' };
  }
  if (meta.type === 'range') {
    if (value >= meta.min && value <= meta.max) return { label: 'Optimal', color: 'bg-emerald-500', badge: 'border-emerald-500/30 text-emerald-200 bg-emerald-500/10' };
    return { label: 'Out of range', color: 'bg-red-500', badge: 'border-red-500/30 text-red-200 bg-red-500/10' };
  }
  return { label: 'No range', color: 'bg-slate-400', badge: 'border-slate-600 text-slate-300 bg-slate-800' };
}

function formatReference(meta) {
  if (!meta) return 'Reference range unavailable';
  if (meta.type === 'max') return `< ${meta.goodMax} ${meta.unit}`;
  if (meta.type === 'min') return `> ${meta.goodMin} ${meta.unit}`;
  if (meta.type === 'range') return `${meta.min} - ${meta.max} ${meta.unit}`;
  return 'Reference range unavailable';
}

function getChartBounds(history, meta) {
  const values = history.map((p) => p.value);
  const refs = [];
  if (meta?.type === 'max') refs.push(meta.goodMax, meta.borderlineMax ?? meta.goodMax);
  if (meta?.type === 'min') refs.push(meta.goodMin, meta.borderlineMin ?? meta.goodMin);
  if (meta?.type === 'range') refs.push(meta.min, meta.max);
  const minValue = Math.min(...values, ...refs);
  const maxValue = Math.max(...values, ...refs);
  const padding = Math.max((maxValue - minValue) * 0.2, 1);
  return { min: Math.max(0, minValue - padding), max: maxValue + padding };
}

function BiomarkerTimelineCard({ biomarker }) {
  const latest = biomarker.history[biomarker.history.length - 1];
  const status = getStatus(biomarker.reference, latest.value);
  const chartWidth = 300;
  const chartHeight = 88;
  const bounds = useMemo(() => getChartBounds(biomarker.history, biomarker.reference), [biomarker.history, biomarker.reference]);
  const toX = (index) => biomarker.history.length === 1 ? chartWidth / 2 : (index / (biomarker.history.length - 1)) * chartWidth;
  const toY = (value) => chartHeight - ((value - bounds.min) / (bounds.max - bounds.min || 1)) * chartHeight;
  const path = biomarker.history.map((point, index) => `${index === 0 ? 'M' : 'L'} ${toX(index)} ${toY(point.value)}`).join(' ');
  const upperLine = biomarker.reference?.type === 'max' ? biomarker.reference.goodMax : biomarker.reference?.type === 'range' ? biomarker.reference.max : undefined;
  const lowerLine = biomarker.reference?.type === 'min' ? biomarker.reference.goodMin : biomarker.reference?.type === 'range' ? biomarker.reference.min : undefined;
  const thresholdY = (value) => chartHeight - ((value - bounds.min) / (bounds.max - bounds.min || 1)) * chartHeight;

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-100">{biomarker.name}</div>
          <div className="mt-1 text-xs text-slate-400">Reference: {formatReference(biomarker.reference)}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-2xl font-bold text-white">{latest.value || '—'}</span>
            <span className="text-sm text-slate-400">{biomarker.unit}</span>
            <Badge className={status.badge}>{status.label}</Badge>
          </div>
        </div>
        <div className="text-left md:text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Latest year</div>
          <div className="mt-1 text-sm text-slate-300">{latest.year}</div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/80 p-3">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`} className="w-full overflow-visible">
          {upperLine !== undefined && <line x1="0" x2={chartWidth} y1={thresholdY(upperLine)} y2={thresholdY(upperLine)} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.8" />}
          {lowerLine !== undefined && <line x1="0" x2={chartWidth} y1={thresholdY(lowerLine)} y2={thresholdY(lowerLine)} stroke="#10b981" strokeDasharray="4 4" strokeWidth="1.5" opacity="0.8" />}
          <path d={path} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {biomarker.history.map((point, index) => <g key={`${biomarker.name}-${point.year}`}><circle cx={toX(index)} cy={toY(point.value)} r="4.5" className={status.color} fill="currentColor" /><text x={toX(index)} y={chartHeight + 18} textAnchor="middle" className="fill-slate-500 text-[10px]">{point.year}</text></g>)}
        </svg>
      </div>
    </div>
  );
}

function HeartOrganIcon({ className = 'h-6 w-6' }) { return <svg viewBox="0 0 64 64" className={className} fill="none"><path d="M32 54C29 51.6 25.8 49 22.7 46.2C13.8 38.4 8 31.7 8 22.5C8 15.3 13.6 10 20.5 10C25.1 10 29.1 12.2 32 15.8C34.9 12.2 38.9 10 43.5 10C50.4 10 56 15.3 56 22.5C56 31.7 50.2 38.4 41.3 46.2C38.2 49 35 51.6 32 54Z" className="fill-rose-500/20 stroke-rose-300" strokeWidth="2.5" strokeLinejoin="round"/><path d="M20 31H27L30.5 24L35 38L38 31H45" className="stroke-rose-300" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> }
function LiverOrganIcon({ className = 'h-6 w-6' }) { return <svg viewBox="0 0 64 64" className={className} fill="none"><path d="M10 35C10 24 18 16 31 16H35C46 16 54 22 56 32C57.2 38.7 55.4 44.5 50.6 48.3C44.8 52.9 36.5 54 27.3 52.3C16.8 50.4 10 44.2 10 35Z" className="fill-amber-500/20 stroke-amber-300" strokeWidth="2.5" strokeLinejoin="round"/><path d="M30 18C30 23 33 27 39 29C44.5 30.8 50.5 30.7 56 29" className="stroke-amber-300" strokeWidth="2.5" strokeLinecap="round"/><path d="M20 42C24 38.5 30.5 36 38 35.5" className="stroke-amber-300" strokeWidth="2.5" strokeLinecap="round"/></svg> }
function PancreasOrganIcon({ className = 'h-6 w-6' }) { return <svg viewBox="0 0 64 64" className={className} fill="none"><path d="M8 33C11.5 25.5 19 21 28 21C36 21 42.5 23 49 27C53 29.4 56 33 56 37C56 41.8 51.5 45 45.5 45H31C23.5 45 18 42.8 13.5 38.8C10.5 36.2 9 34.9 8 33Z" className="fill-violet-500/20 stroke-violet-300" strokeWidth="2.5" strokeLinejoin="round"/><path d="M21 28C24.5 31 29 32.5 34.5 32.5H48" className="stroke-violet-300" strokeWidth="2.5" strokeLinecap="round"/><circle cx="16" cy="34" r="2.5" className="fill-violet-300" /></svg> }
function KidneyOrganIcon({ className = 'h-6 w-6' }) { return <svg viewBox="0 0 64 64" className={className} fill="none"><path d="M24 14C16.8 14 11 20.6 11 29V35C11 43.3 17 50 24.5 50C30.5 50 35 45 35 38V26C35 19.4 30.1 14 24 14Z" className="fill-cyan-500/20 stroke-cyan-300" strokeWidth="2.5" strokeLinejoin="round"/><path d="M40 14C47.2 14 53 20.6 53 29V35C53 43.3 47 50 39.5 50C33.5 50 29 45 29 38V26C29 19.4 33.9 14 40 14Z" className="fill-cyan-500/20 stroke-cyan-300" strokeWidth="2.5" strokeLinejoin="round"/><path d="M32 24V51" className="stroke-cyan-300" strokeWidth="2.5" strokeLinecap="round"/></svg> }

const BLOOD_STATUS_DATA = { title: 'Blood Status', biomarkers: [
  { name: 'Red Blood Cells', unit: '·10^6/µL', reference: { type: 'range', min: 4.3, max: 5.6, unit: '·10^6/µL' }, history: [{ year: '2026', value: 5.11 }] },
  { name: 'Hemoglobin', unit: 'g/dL', reference: { type: 'range', min: 13, max: 17, unit: 'g/dL' }, history: [{ year: '2026', value: 14.6 }] },
  { name: 'Hematocrit', unit: '%', reference: { type: 'range', min: 40, max: 50, unit: '%' }, history: [{ year: '2026', value: 43.4 }] },
  { name: 'MCV (Mean Corpuscular Volume)', unit: 'fL', reference: { type: 'range', min: 80, max: 100, unit: 'fL' }, history: [{ year: '2026', value: 84.9 }] },
  { name: 'MCH (Mean Corpuscular Hemoglobin)', unit: 'pg', reference: { type: 'range', min: 27, max: 32, unit: 'pg' }, history: [{ year: '2026', value: 28.6 }] },
  { name: 'MCHC (Mean Corpuscular Hemoglobin Concentration)', unit: 'g/dL', reference: { type: 'range', min: 31.5, max: 34.5, unit: 'g/dL' }, history: [{ year: '2026', value: 33.6 }] },
  { name: 'RDW (Red Cell Distribution Width)', unit: '%', reference: { type: 'range', min: 11.6, max: 14.3, unit: '%' }, history: [{ year: '2026', value: 12.3 }] }
], insights: ['Complete blood count overview using your real red blood cell and erythrocyte index values.', 'Every biomarker is displayed with the same timeline card format used in the Heart module.', 'Add prior-year CBC values to convert these cards into longitudinal trend lines.'] };

const VITAL_ORGANS = [
  { name: 'Heart', icon: HeartOrganIcon, biomarkers: [
    { name: 'Total Cholesterol', unit: 'mg/dL', reference: { type: 'max', goodMax: 200, unit: 'mg/dL' }, history: [{ year: '2026', value: 207 }] },
    { name: 'Triglycerides', unit: 'mg/dL', reference: { type: 'max', goodMax: 150, borderlineMax: 200, unit: 'mg/dL' }, history: [{ year: '2026', value: 42 }] },
    { name: 'HDL Cholesterol', unit: 'mg/dL', reference: { type: 'min', goodMin: 55, borderlineMin: 35, unit: 'mg/dL' }, history: [{ year: '2026', value: 73 }] },
    { name: 'LDL Cholesterol (Friedewald)', unit: 'mg/dL', reference: { type: 'max', goodMax: 100, borderlineMax: 160, unit: 'mg/dL' }, history: [{ year: '2026', value: 126 }] },
    { name: 'Apolipoprotein B', unit: 'mg/dL', reference: { type: 'range', min: 66, max: 144, unit: 'mg/dL' }, history: [{ year: '2026', value: 204 }] },
    { name: 'Lipoprotein(a)', unit: 'nmol/L', reference: { type: 'max', goodMax: 75, unit: 'nmol/L' }, history: [{ year: '2026', value: 156.4 }] }
  ], insights: ['Cardiovascular risk overview using your real lipid and apolipoprotein lab values.', 'Dashed thresholds show the target or reference boundary for each biomarker.', 'Once you add prior-year tests, each chart will automatically become a multi-year trend line.'] },
  { name: 'Liver', icon: LiverOrganIcon, biomarkers: [
    { name: 'ALT', unit: 'U/L', reference: { type: 'range', min: 0, max: 45, unit: 'U/L', placeholder: true }, history: [{ year: '2026', value: 0 }] },
    { name: 'AST', unit: 'U/L', reference: { type: 'range', min: 0, max: 40, unit: 'U/L', placeholder: true }, history: [{ year: '2026', value: 0 }] },
    { name: 'GGT', unit: 'U/L', reference: { type: 'range', min: 0, max: 60, unit: 'U/L', placeholder: true }, history: [{ year: '2026', value: 0 }] }
  ], insights: ['Awaiting real liver panel values.', 'Add ALT, AST, GGT, ALP, and bilirubin history to unlock trend charts.', 'This module is ready for real lab ingestion once you paste the values.'] },
  { name: 'Pancreas', icon: PancreasOrganIcon, biomarkers: [
    { name: 'Fasting Glucose', unit: 'mg/dL', reference: { type: 'range', min: 70, max: 99, unit: 'mg/dL', placeholder: true }, history: [{ year: '2026', value: 0 }] },
    { name: 'HbA1c', unit: '%', reference: { type: 'max', goodMax: 5.6, borderlineMax: 6.4, unit: '%', placeholder: true }, history: [{ year: '2026', value: 0 }] }
  ], insights: ['Awaiting real pancreas and glucose-control values.', 'Add fasting glucose, HbA1c, fasting insulin, C-peptide, or lipase history.', 'Year-by-year charts will expand automatically once more data is added.'] },
  { name: 'Kidney', icon: KidneyOrganIcon, biomarkers: [
    { name: 'Creatinine', unit: 'mg/dL', reference: { type: 'range', min: 0.7, max: 1.3, unit: 'mg/dL', placeholder: true }, history: [{ year: '2026', value: 0 }] },
    { name: 'eGFR', unit: 'mL/min/1.73m²', reference: { type: 'min', goodMin: 90, unit: 'mL/min/1.73m²', placeholder: true }, history: [{ year: '2026', value: 0 }] }
  ], insights: ['Awaiting real kidney function values.', 'Add creatinine, eGFR, cystatin C, BUN, or urine albumin/creatinine history.', 'Trend visualization is already wired into the module.'] }
];

function LandingScreen({ onEnter }) {
  return <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-6"><div className="max-w-4xl text-center"><Badge className="mb-6 bg-cyan-500/10 text-cyan-200 border-cyan-500/20">Next-gen clinical intelligence platform</Badge><h1 className="text-6xl md:text-7xl font-bold tracking-tight">Elixir</h1><p className="mt-6 text-lg text-slate-300">Your path to longevity</p><Button onClick={onEnter} className="mt-8 bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-4">Enter platform <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div>;
}

function UploadPanel() {
  const [bloodFile, setBloodFile] = useState(null);
  const [urineFile, setUrineFile] = useState(null);
  const uploadItems = [{ label: 'Blood', set: setBloodFile, file: bloodFile, icon: Droplets }, { label: 'Urine', set: setUrineFile, file: urineFile, icon: Camera }];
  return <div className="space-y-6 max-w-3xl mx-auto w-full mb-10">{uploadItems.map(({ label, set, file, icon: Icon }) => <Card key={label} className="rounded-2xl bg-slate-900 border border-slate-800 text-white"><CardContent className="p-6 text-center"><Icon className="mx-auto mb-3 text-teal-300" /><h3 className="text-lg font-semibold mb-4">{label === 'Urine' ? 'Scan Blood Test' : `Upload ${label} Test`}</h3><input id={`${label.toLowerCase()}-file-input`} type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" onChange={(e) => set(e.target.files?.[0])} className="hidden" />{file && <p className="text-sm text-slate-400">{file.name}</p>}<Button className="mt-4 bg-teal-600" onClick={() => document.getElementById(`${label.toLowerCase()}-file-input`)?.click()}><Upload className="mr-2 h-4 w-4" /> {label === 'Urine' ? 'Load scan/image' : `Analyze ${label}`}</Button><p className="mt-3 text-xs text-slate-500">Ready for backend/OCR connection.</p></CardContent></Card>)}</div>;
}

function OrganDetailScreen({ organ, onBack }) {
  const Icon = organ.icon;
  return <div className="space-y-6"><Button onClick={onBack} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Vital Organs</Button><Card className="bg-slate-900 border border-slate-800 text-white overflow-hidden"><div className="h-1 w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500" /><CardContent className="p-8"><div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8"><div className="flex items-center gap-4"><div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700"><Icon className="h-10 w-10" /></div><div><p className="text-sm uppercase tracking-[0.2em] text-slate-400">Vital organ module</p><h3 className="text-3xl font-bold">{organ.name}</h3></div></div><Badge className="bg-teal-500/10 text-teal-200 border-teal-500/20">Real Biomarkers + Trend</Badge></div><div className="grid md:grid-cols-2 gap-6"><div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-5"><h4 className="text-lg font-semibold mb-4">Biomarker timeline</h4><div className="space-y-4">{organ.biomarkers.map((marker) => <BiomarkerTimelineCard key={marker.name} biomarker={marker} />)}</div></div><div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-5"><h4 className="text-lg font-semibold mb-4">Clinical insights</h4><div className="space-y-3">{organ.insights.map((insight) => <div key={insight} className="flex gap-3 items-start"><div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-300" /><p className="text-slate-300 leading-relaxed">{insight}</p></div>)}</div></div></div></CardContent></Card></div>;
}

function ModuleDetailScreen({ module, onBack }) {
  const [selectedOrgan, setSelectedOrgan] = useState(null);
  if (selectedOrgan) return <OrganDetailScreen organ={selectedOrgan} onBack={() => setSelectedOrgan(null)} />;
  return <div className="max-w-5xl mx-auto space-y-6 w-full"><Button onClick={onBack} variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button><Card className="bg-slate-900 border border-slate-800 text-white overflow-hidden"><div className="h-1 w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500" /><CardContent className="p-8 text-center"><module.icon className="mx-auto mb-4 h-10 w-10 text-teal-300" /><h2 className="text-2xl font-bold mb-2">{module.title}</h2><p className="text-slate-400 mb-8">Explore each organ or biomarker to review values, references, and trend charts.</p>{module.subgroup ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">{module.subgroup.map((item) => { const Icon = item.icon; return <button key={item.name} onClick={() => setSelectedOrgan(item)} className="w-full p-5 bg-slate-800 rounded-2xl border border-slate-700 hover:border-teal-400 hover:bg-slate-800/90 transition-all text-left group"><div className="relative flex items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center group-hover:border-teal-400 transition-colors"><Icon className="h-9 w-9" /></div><div><div className="text-lg font-semibold">{item.name}</div><div className="text-sm text-slate-400">Tap to open drill-down</div></div></div><ArrowRight className="h-5 w-5 text-slate-500 group-hover:text-teal-300 transition-colors" /></div></button> })}</div> : module.biomarkers ? <div className="grid md:grid-cols-2 gap-6 text-left"><div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-5"><h4 className="text-lg font-semibold mb-4">Biomarker timeline</h4><div className="space-y-4">{module.biomarkers.map((marker) => <BiomarkerTimelineCard key={marker.name} biomarker={marker} />)}</div></div><div className="rounded-2xl bg-slate-800/70 border border-slate-700 p-5"><h4 className="text-lg font-semibold mb-4">Clinical insights</h4><div className="space-y-3">{module.insights?.map((insight) => <div key={insight} className="flex gap-3 items-start"><div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-300" /><p className="text-slate-300 leading-relaxed">{insight}</p></div>)}</div></div></div> : <p className="text-slate-300">Clinical insights available. Backend/OCR connection can be added here.</p>}</CardContent></Card></div>;
}

function ModuleCard({ module, onOpen }) {
  return <Card onClick={() => onOpen(module)} className="cursor-pointer w-full h-full bg-slate-900 border border-slate-800 text-white hover:border-teal-400 transition-colors rounded-2xl"><CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[160px]"><module.icon className="mx-auto h-8 w-8 text-teal-300 mb-3" /><h2 className="font-semibold text-base leading-tight">{module.title}</h2></CardContent></Card>;
}

function WorkspaceScreen({ onBack }) {
  const [selectedModule, setSelectedModule] = useState(null);
  const modules = [
    { title: BLOOD_STATUS_DATA.title, icon: Droplets, biomarkers: BLOOD_STATUS_DATA.biomarkers, insights: BLOOD_STATUS_DATA.insights },
    { title: 'Vital Organs', icon: HeartPulse, subgroup: VITAL_ORGANS },
    { title: 'Immune System', icon: ShieldPlus },
    { title: 'Metabolic', icon: FlaskConical },
    { title: 'Hormones', icon: Activity },
    { title: 'Nutrients', icon: Leaf }
  ];
  if (selectedModule) return <div className="min-h-screen bg-slate-950 text-white p-6"><ModuleDetailScreen module={selectedModule} onBack={() => setSelectedModule(null)} /></div>;
  return <div className="min-h-screen bg-slate-950 text-white p-6"><div className="max-w-6xl mx-auto w-full"><div className="flex justify-between items-center mb-6 gap-4"><div><h1 className="text-3xl font-bold">Elixir Platform</h1><p className="text-slate-400 text-sm mt-1">Interactive local app · Ready for OCR / backend ingestion</p></div><Button onClick={onBack}>Back</Button></div><UploadPanel /><div className="grid grid-cols-2 md:grid-cols-3 gap-4">{modules.map((module) => <ModuleCard key={module.title} module={module} onOpen={setSelectedModule} />)}</div></div></div>;
}

export default function App() {
  const [entered, setEntered] = useState(false);
  return entered ? <WorkspaceScreen onBack={() => setEntered(false)} /> : <LandingScreen onEnter={() => setEntered(true)} />;
}
