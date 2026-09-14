import React, { useState } from 'react';
import {
  FileText, CheckCircle2, AlertTriangle, Upload,
  RefreshCw, FileSearch, ArrowRight, ChevronRight,
  Eye, Layers, TrendingUp, Clock, Coins, Shield
} from 'lucide-react';

// ── Static demo document data ────────────────────────────────────────────────
const DEMO_DOC = {
  id: 'MH-LA-2024-1059',
  docType: 'Village Form VII-XII',
  district: 'Pune',
  village: 'Wagholi',
  processedAt: '08 Sep 2026, 04:23 AM',
  fields: [
    { key: 'Survey No.',      value: '142/2A, 143/1B',      confidence: 98, status: 'ok' },
    { key: 'Land Area',       value: '3.85 Ha (9.51 Acres)', confidence: 96, status: 'ok' },
    { key: 'Tenure',          value: 'Class-1 Occupant',     confidence: 91, status: 'ok' },
    { key: 'Circle Multiplier', value: '1.42x',             confidence: 87, status: 'warn', note: 'Below 2.0x statutory demand' },
    { key: 'Legal Status',    value: 'No active stay',       confidence: 94, status: 'ok' },
    { key: 'Land Use',        value: 'Agricultural (Mixed)', confidence: 89, status: 'ok' },
  ],
  riskSummary: {
    score: 0.68,
    level: 'Elevated',
    drivers: [
      { label: 'Valuation gap',    detail: '1.42x vs 2.0x demanded', delta: '+0.34' },
      { label: 'Title dispute',    detail: 'Civil suit 382/2024 pending', delta: '+0.16' },
      { label: 'Stage delay',      detail: '+45 days over milestone', delta: '+0.12' },
    ]
  }
};

const RECENT_DOCS = [
  { id: 'MH-LA-2024-1059', docType: 'Village Form VII-XII', district: 'Pune',       status: 'processed', score: 0.68 },
  { id: 'MH-LA-2024-1028', docType: 'Possession Order',     district: 'Nagpur',     status: 'processed', score: 0.91 },
  { id: 'MH-LA-2024-1068', docType: 'Award Notice',         district: 'Pune',       status: 'processed', score: 0.89 },
  { id: 'MH-LA-2024-1041', docType: 'Survey Report',        district: 'Nashik',     status: 'pending',   score: null },
];

function StatusPill({ status }) {
  if (status === 'ok')      return <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">✓ Verified</span>;
  if (status === 'warn')    return <span className="px-1.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">⚠ Review</span>;
  return null;
}

function ConfidenceBar({ value }) {
  const color = value >= 95 ? 'bg-emerald-500' : value >= 85 ? 'bg-blue-500' : 'bg-amber-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-[#181E28] overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-500 dark:text-[#7A8A9A] w-8 text-right">{value}%</span>
    </div>
  );
}

export default function DocumentIntakeView({ onNavigate = () => {} }) {
  const [selectedDocId, setSelectedDocId] = useState('MH-LA-2024-1059');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);

  const doc = DEMO_DOC; // In production: look up by selectedDocId from API

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setProcessing(true);
    setTimeout(() => setProcessing(false), 2000);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const riskColor = doc.riskSummary.score >= 0.8
    ? 'text-red-600 dark:text-red-400'
    : doc.riskSummary.score >= 0.6
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400';

  const riskBg = doc.riskSummary.score >= 0.8
    ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30'
    : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/30';

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EEF2F7] tracking-tight">
            Document Intelligence
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#7A8A9A] mt-0.5">
            Upload land records to extract fields and assess risk
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ── Left: recent docs list ── */}
        <div className="glass-card p-4 space-y-3 lg:col-span-1">
          <h2 className="text-xs font-semibold text-slate-700 dark:text-[#B8C4D0] uppercase tracking-wide">
            Recent Documents
          </h2>

          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                : 'border-slate-300 dark:border-[rgba(255,255,255,0.1)] hover:border-slate-400 dark:hover:border-[rgba(255,255,255,0.2)]'
            }`}
          >
            {processing ? (
              <div className="flex flex-col items-center gap-1.5">
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-xs text-slate-500 dark:text-[#7A8A9A]">Processing…</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <Upload className="w-5 h-5 text-slate-400 dark:text-[#4D5C6E]" />
                <span className="text-xs text-slate-500 dark:text-[#7A8A9A]">Drop file or click to upload</span>
              </div>
            )}
          </div>

          {/* List */}
          <div className="space-y-1.5">
            {RECENT_DOCS.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDocId(d.id)}
                className={`w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  selectedDocId === d.id
                    ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/40'
                    : 'bg-slate-50 dark:bg-[#0F131A] border-slate-200 dark:border-[rgba(255,255,255,0.06)] hover:border-slate-300 dark:hover:border-[rgba(255,255,255,0.1)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-[#4D5C6E]" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 dark:text-[#EEF2F7] truncate">{d.docType}</div>
                    <div className="text-xs text-slate-500 dark:text-[#7A8A9A] flex items-center justify-between mt-0.5">
                      <span className="font-mono">{d.id}</span>
                      {d.status === 'processed' && d.score !== null
                        ? <span className={`font-bold font-mono ${d.score >= 0.8 ? 'text-red-500' : d.score >= 0.6 ? 'text-amber-500' : 'text-emerald-500'}`}>{d.score}</span>
                        : <span className="text-slate-400 dark:text-[#4D5C6E]">Pending</span>
                      }
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Center: Extracted Fields ── */}
        <div className="glass-card p-4 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-800 dark:text-[#EEF2F7] flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-blue-500" />
                Extracted Fields
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#7A8A9A] mt-0.5">
                {doc.docType} · {doc.district}, {doc.village}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 dark:text-[#4D5C6E]">{doc.id}</span>
          </div>

          <div className="space-y-2">
            {doc.fields.map(field => (
              <div
                key={field.key}
                className="p-3 rounded-lg bg-slate-50 dark:bg-[#0F131A] border border-slate-200 dark:border-[rgba(255,255,255,0.06)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-500 dark:text-[#7A8A9A] mb-0.5">{field.key}</div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-[#EEF2F7]">{field.value}</div>
                    {field.note && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{field.note}</div>
                    )}
                  </div>
                  <StatusPill status={field.status} />
                </div>
                <div className="mt-2">
                  <ConfidenceBar value={field.confidence} />
                </div>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 dark:text-[#4D5C6E] pt-1 border-t border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            Processed {doc.processedAt} · SHA-256 verified
          </div>
        </div>

        {/* ── Right: Risk Summary ── */}
        <div className="space-y-4 lg:col-span-1">
          {/* Score card */}
          <div className={`glass-card p-4 space-y-3 border ${riskBg}`}>
            <h2 className="text-xs font-semibold text-slate-600 dark:text-[#B8C4D0] uppercase tracking-wide">
              Risk Assessment
            </h2>
            <div className="flex items-center gap-3">
              <div className={`text-4xl font-bold font-mono ${riskColor}`}>
                {doc.riskSummary.score}
              </div>
              <div>
                <div className={`text-sm font-semibold ${riskColor}`}>{doc.riskSummary.level}</div>
                <div className="text-xs text-slate-500 dark:text-[#7A8A9A]">{doc.id}</div>
              </div>
            </div>
          </div>

          {/* Risk drivers */}
          <div className="glass-card p-4 space-y-3">
            <h2 className="text-xs font-semibold text-slate-600 dark:text-[#B8C4D0] uppercase tracking-wide flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-red-500" />
              Risk Drivers
            </h2>
            <div className="space-y-2.5">
              {doc.riskSummary.drivers.map(d => (
                <div key={d.label} className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 dark:text-[#EEF2F7]">{d.label}</div>
                    <div className="text-xs text-slate-500 dark:text-[#7A8A9A] leading-relaxed">{d.detail}</div>
                  </div>
                  <span className="text-xs font-bold font-mono text-red-600 dark:text-red-400 shrink-0">{d.delta}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="glass-card p-4 space-y-2">
            <h2 className="text-xs font-semibold text-slate-600 dark:text-[#B8C4D0] uppercase tracking-wide">
              Actions
            </h2>
            {[
              { label: 'Simulate intervention', icon: Layers, action: () => onNavigate('simulator') },
              { label: 'View in Case Intelligence', icon: Shield, action: () => onNavigate('case-intelligence') },
              { label: 'Log action item', icon: Clock, action: () => onNavigate('actions') },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-slate-50 dark:bg-[#0F131A] border border-slate-200 dark:border-[rgba(255,255,255,0.06)] text-slate-700 dark:text-[#B8C4D0] hover:bg-slate-100 dark:hover:bg-[#181E28] hover:text-slate-900 dark:hover:text-[#EEF2F7] transition-colors cursor-pointer text-left"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-[#7A8A9A]" />
                  {item.label}
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-300 dark:text-[#4D5C6E]" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
