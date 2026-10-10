import React, { useState, useEffect } from 'react';
import {
  CncDailyReport,
  countReportStats,
  normalizeToStrictCncReport,
} from '../types/cncReport';
import { Check, Copy, Download, FileCode, Save } from 'lucide-react';

interface StrictJsonPanelProps {
  report: CncDailyReport;
  onChange: (updated: CncDailyReport) => void;
  onSaveToHistory: () => void;
}

export const StrictJsonPanel: React.FC<StrictJsonPanelProps> = ({
  report,
  onChange,
  onSaveToHistory,
}) => {
  const [compactMode, setCompactMode] = useState(false);
  const [rawDraft, setRawDraft] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const strictJsonString = compactMode
    ? JSON.stringify(report)
    : JSON.stringify(report, null, 2);

  useEffect(() => {
    setRawDraft(strictJsonString);
    setParseError(null);
  }, [strictJsonString]);

  const stats = countReportStats(report);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(strictJsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy
    }
  };

  const handleDownload = () => {
    const sosaSlug = (report.metadata.sosa_no || 'tanpa-sosa')
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');
    const filename = `F-PRD-003_${sosaSlug}.json`;
    const blob = new Blob([strictJsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRawEditChange = (val: string) => {
    setRawDraft(val);
    try {
      const cleaned = val
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      const normalized = normalizeToStrictCncReport(parsed);
      setParseError(null);
      onChange(normalized);
    } catch (err: any) {
      setParseError(err?.message || 'Format JSON tidak valid');
    }
  };

  const handleSave = () => {
    onSaveToHistory();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 1800);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
            <span>Skema F-PRD-003 Rev 02</span>
            <span aria-hidden="true">·</span>
            <span>Terisi: {stats.filled} field</span>
            <span aria-hidden="true">·</span>
            <span>Bernilai null: {stats.nulls} field</span>
            <span aria-hidden="true">·</span>
            <span className={parseError ? 'text-red-600 font-semibold' : 'text-emerald-700 font-semibold'}>
              {parseError ? 'JSON Error' : 'Strict JSON Valid'}
            </span>
          </div>
          <h2 className="mt-1 text-sm font-bold text-slate-900">
            Output Strict JSON Murni (Tanpa Backtick Markdown)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setCompactMode(false)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                !compactMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Indented (2 Spasi)
            </button>
            <button
              type="button"
              onClick={() => setCompactMode(true)}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                compactMode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Minified (1 Baris)
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            {savedNotice ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Save className="h-3.5 w-3.5" />}
            {savedNotice ? 'Tersimpan di Riwayat' : 'Simpan ke Riwayat'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Unduh .json
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Strict JSON Tersalin' : 'Salin Strict JSON'}
          </button>
        </div>
      </div>

      {parseError && (
        <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 font-mono">
          Peringatan Sintaks JSON: {parseError}
        </div>
      )}

      <div className="border border-slate-200 bg-slate-950 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400 font-mono">
          <span className="flex items-center gap-2">
            <FileCode className="h-3.5 w-3.5" />
            F-PRD-003_strict_output.json
          </span>
          <span>Karakter: {rawDraft.length.toLocaleString('id-ID')} B</span>
        </div>
        <textarea
          value={rawDraft}
          onChange={(e) => handleRawEditChange(e.target.value)}
          spellCheck={false}
          className="h-[640px] w-full resize-y bg-slate-950 p-4 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none"
        />
      </div>
    </div>
  );
};
