import React, { useEffect, useState } from 'react';
import {
  CncDailyReport,
  SAMPLE_FORM_PRESETS,
  SavedExtractionRecord,
  countReportStats,
  createEmptyCncReport,
  normalizeToStrictCncReport,
} from './types/cncReport';
import { renderCncFormToDataUrl } from './utils/formCanvasGenerator';
import { FormImageInspector } from './components/FormImageInspector';
import { FormTableEditor } from './components/FormTableEditor';
import { StrictJsonPanel } from './components/StrictJsonPanel';
import { SupabaseSchemaPanel } from './components/SupabaseSchemaPanel';
import { ExtractionHistoryPanel } from './components/ExtractionHistoryPanel';
import { Check, Copy, FileCode, ScanText, Table2 } from 'lucide-react';

type ActiveMainView = 'workbench' | 'table' | 'json' | 'supabase' | 'history';

const STORAGE_KEY_HISTORY = 'lti_cnc_f_prd_003_history_v3';

function buildInitialHistory(): SavedExtractionRecord[] {
  return SAMPLE_FORM_PRESETS.map((preset, idx) => {
    const stats = countReportStats(preset.report);
    return {
      id: `seed-${preset.id}`,
      extractedAt: idx === 0 ? '06-04-2026 17:05 WIB' : '07-04-2026 23:35 WIB',
      sourceFileName: `F-PRD-003_${preset.id}.png`,
      confidenceNote: 'Terverifikasi Literal OCR',
      filledFieldsCount: stats.filled,
      nullFieldsCount: stats.nulls,
      data: preset.report,
    };
  });
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveMainView>('workbench');
  const [workbenchRightTab, setWorkbenchRightTab] = useState<'json' | 'table'>('json');

  const [report, setReport] = useState<CncDailyReport>(() => SAMPLE_FORM_PRESETS[0].report);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('F-PRD-003_shift-1-fume-hood.png');

  const [isExtracting, setIsExtracting] = useState(false);
  const [ocrStatusMsg, setOcrStatusMsg] = useState<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);

  const [copiedHeaderBtn, setCopiedHeaderBtn] = useState(false);

  const [historyRecords, setHistoryRecords] = useState<SavedExtractionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return buildInitialHistory();
  });

  // Render initial sample form canvas on mount so the inspector has an immediate authentic form image
  useEffect(() => {
    const url = renderCncFormToDataUrl(SAMPLE_FORM_PRESETS[0].report);
    if (url) {
      setImageDataUrl(url);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyRecords));
    } catch {
      // ignore storage quota
    }
  }, [historyRecords]);

  const handleSelectImage = (dataUrl: string, name: string) => {
    setImageDataUrl(dataUrl);
    setImageName(name);
    setOcrStatusMsg({
      type: 'info',
      text: `Citra "${name}" siap. Klik "Ekstrak OCR Multimodal" untuk membaca formulir ke Strict JSON.`,
    });
  };

  const handleRunOcr = async () => {
    if (!imageDataUrl) return;
    setIsExtracting(true);
    setOcrStatusMsg({
      type: 'info',
      text: 'Sedang mengekstrak teks & angka formulir F-PRD-003 melalui Gemini Multimodal OCR...',
    });

    try {
      const mimeMatch = imageDataUrl.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageDataUrl,
          mimeType,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || 'Gagal menjalankan ekstraksi OCR.');
      }

      const normalized = normalizeToStrictCncReport(result.data);
      setReport(normalized);

      const stats = countReportStats(normalized);
      const newRecord: SavedExtractionRecord = {
        id: `ocr-${Date.now()}`,
        extractedAt: new Date().toLocaleString('id-ID'),
        sourceFileName: imageName || 'Formulir_CNC.png',
        confidenceNote: 'Hasil Ekstraksi Multimodal OCR',
        filledFieldsCount: stats.filled,
        nullFieldsCount: stats.nulls,
        data: normalized,
      };
      setHistoryRecords((prev) => [newRecord, ...prev]);

      setOcrStatusMsg({
        type: 'success',
        text: `Ekstraksi OCR selesai: ${stats.filled} field terisi, ${stats.nulls} field kosong diset ke null sesuai aturan F-PRD-003.`,
      });
    } catch (err: any) {
      setOcrStatusMsg({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan saat mengekstrak formulir.',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveCurrentToHistory = () => {
    const stats = countReportStats(report);
    const newRecord: SavedExtractionRecord = {
      id: `manual-${Date.now()}`,
      extractedAt: new Date().toLocaleString('id-ID'),
      sourceFileName: imageName || 'Verifikasi_Manual_F-PRD-003',
      confidenceNote: 'Disimpan dari Editor',
      filledFieldsCount: stats.filled,
      nullFieldsCount: stats.nulls,
      data: report,
    };
    setHistoryRecords((prev) => [newRecord, ...prev]);
  };

  const handleCopyStrictJsonTop = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopiedHeaderBtn(true);
      setTimeout(() => setCopiedHeaderBtn(false), 1800);
    } catch {
      // ignore
    }
  };

  const stats = countReportStats(report);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 border-b border-slate-200 bg-white px-6 py-3.5">
        <a
          href="#workbench"
          onClick={(e) => {
            e.preventDefault();
            setActiveView('workbench');
          }}
          className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          PT. Lab Teknologi Indonesia
        </a>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setActiveView('workbench')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'workbench'
                ? 'text-slate-900 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Workbench OCR
          </button>
          <button
            type="button"
            onClick={() => setActiveView('table')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'table'
                ? 'text-slate-900 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Tabel F-PRD-003
          </button>
          <button
            type="button"
            onClick={() => setActiveView('json')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'json'
                ? 'text-slate-900 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Strict JSON
          </button>
          <button
            type="button"
            onClick={() => setActiveView('supabase')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'supabase'
                ? 'text-slate-900 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Skema Supabase
          </button>
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'history'
                ? 'text-slate-900 font-semibold underline underline-offset-8 decoration-2'
                : 'hover:text-slate-900'
            }`}
          >
            Riwayat ({historyRecords.length})
          </button>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyStrictJsonTop}
            className="inline-flex items-center gap-1.5 bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            {copiedHeaderBtn ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedHeaderBtn ? 'JSON Tersalin' : 'Salin Strict JSON'}
          </button>
        </div>
      </header>

      {/* Subheader Context Bar */}
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
              <span>Dokumen F-PRD-003</span>
              <span aria-hidden="true">·</span>
              <span>Revisi 02</span>
              <span aria-hidden="true">·</span>
              <span>Efektif 27-03-2026</span>
              <span aria-hidden="true">·</span>
              <span>Departemen CNC</span>
              <span aria-hidden="true">·</span>
              <span>Operator Aktif: {report.metadata.nama_operator ?? 'null'}</span>
              <span aria-hidden="true">·</span>
              <span>SOSA: {report.metadata.sosa_no ?? 'null'}</span>
            </div>
            <h1 className="mt-0.5 text-lg font-bold tracking-tight text-slate-900">
              Sistem Ekstraksi OCR Laporan Harian Data Mesin CNC
            </h1>
          </div>

          {/* Mobile / Quick View Switcher & Metric Summary */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-3 font-mono tabular-nums text-slate-600">
              <span>
                Terisi: <strong className="text-slate-900">{stats.filled}</strong>
              </span>
              <span aria-hidden="true">/</span>
              <span>
                Null: <strong className="text-slate-900">{stats.nulls}</strong>
              </span>
            </div>

            <div className="flex md:hidden items-center gap-1 bg-slate-100 p-1">
              {(['workbench', 'table', 'json', 'supabase', 'history'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setActiveView(v)}
                  className={`px-2 py-1 text-xs font-medium whitespace-nowrap shrink-0 ${
                    activeView === v ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {v === 'workbench'
                    ? 'OCR'
                    : v === 'table'
                    ? 'Tabel'
                    : v === 'json'
                    ? 'JSON'
                    : v === 'supabase'
                    ? 'Supabase'
                    : 'Riwayat'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* OCR Notification Banner if present */}
      {ocrStatusMsg && (
        <div
          className={`border-b px-6 py-2.5 text-xs ${
            ocrStatusMsg.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-800'
              : ocrStatusMsg.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-slate-200 bg-slate-100 text-slate-800'
          }`}
        >
          <div className="mx-auto max-w-[1440px] flex items-center justify-between gap-4">
            <span>{ocrStatusMsg.text}</span>
            <button
              type="button"
              onClick={() => setOcrStatusMsg(null)}
              className="text-xs font-medium underline hover:no-underline whitespace-nowrap shrink-0"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area (1440px container) */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6">
        {activeView === 'workbench' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
            {/* Left Column: Multimodal Image Inspector (5 cols on lg) */}
            <div className="lg:col-span-5">
              <FormImageInspector
                imageDataUrl={imageDataUrl}
                imageName={imageName}
                isExtracting={isExtracting}
                onSelectImage={handleSelectImage}
                onRunOcr={handleRunOcr}
              />
            </div>

            {/* Right Column: Dual-Mode Verification (Strict JSON / Interactive F-PRD-003 Form Table) (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 bg-white px-4 py-2.5">
                <div className="flex items-center gap-1 bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setWorkbenchRightTab('json')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      workbenchRightTab === 'json'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    Output Strict JSON (Supabase)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkbenchRightTab('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      workbenchRightTab === 'table'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Table2 className="h-3.5 w-3.5" />
                    Editor Tabel F-PRD-003
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!imageDataUrl || isExtracting}
                  onClick={handleRunOcr}
                  className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
                >
                  <ScanText className="h-3.5 w-3.5" />
                  {isExtracting ? 'Memproses OCR...' : 'Jalankan Ulang OCR dari Foto'}
                </button>
              </div>

              {workbenchRightTab === 'json' ? (
                <div className="border border-slate-200 bg-white p-4">
                  <StrictJsonPanel
                    report={report}
                    onChange={setReport}
                    onSaveToHistory={handleSaveCurrentToHistory}
                  />
                </div>
              ) : (
                <div className="border border-slate-200 bg-white p-4">
                  <FormTableEditor
                    report={report}
                    onChange={setReport}
                    onResetEmpty={() => setReport(createEmptyCncReport())}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'table' && (
          <div className="border border-slate-200 bg-white p-6">
            <FormTableEditor
              report={report}
              onChange={setReport}
              onResetEmpty={() => setReport(createEmptyCncReport())}
            />
          </div>
        )}

        {activeView === 'json' && (
          <div className="border border-slate-200 bg-white p-6">
            <StrictJsonPanel
              report={report}
              onChange={setReport}
              onSaveToHistory={handleSaveCurrentToHistory}
            />
          </div>
        )}

        {activeView === 'supabase' && <SupabaseSchemaPanel report={report} />}

        {activeView === 'history' && (
          <ExtractionHistoryPanel
            records={historyRecords}
            onLoadRecord={(loadedReport) => {
              setReport(loadedReport);
              const rendered = renderCncFormToDataUrl(loadedReport);
              if (rendered) {
                setImageDataUrl(rendered);
                setImageName(
                  `F-PRD-003_${loadedReport.metadata.sosa_no || 'arsip'}.png`
                );
              }
              setActiveView('workbench');
            }}
            onDeleteRecord={(id) =>
              setHistoryRecords((prev) => prev.filter((item) => item.id !== id))
            }
            onRestoreDefaults={() => setHistoryRecords(buildInitialHistory())}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
        <div className="mx-auto max-w-[1440px] flex flex-wrap items-center justify-between gap-4">
          <span>
            PT. Lab Teknologi Indonesia · Divisi Produksi & Departemen CNC · Formulir F-PRD-003 Revisi 02
          </span>
          <span className="font-mono">
            Strict JSON Schema · Diketahui: Mulyana · Disetujui: Arifin
          </span>
        </div>
      </footer>
    </div>
  );
}
