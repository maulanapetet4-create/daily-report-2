import React, { useState } from 'react';
import { CncDailyReport } from '../types/cncReport';
import { Check, Copy, Database, Send, Terminal } from 'lucide-react';

interface SupabaseSchemaPanelProps {
  report: CncDailyReport;
}

export const SupabaseSchemaPanel: React.FC<SupabaseSchemaPanelProps> = ({ report }) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'ddl' | 'insert_sql' | 'supabase_js'>('ddl');
  const [copied, setCopied] = useState(false);

  // Optional live webhook/REST push state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [tableName, setTableName] = useState('laporan_harian_cnc');
  const [insertMode, setInsertMode] = useState<'normalized' | 'raw_json'>('normalized');
  const [pushStatus, setPushStatus] = useState<{
    loading: boolean;
    error: string | null;
    successMsg: string | null;
  }>({ loading: false, error: null, successMsg: null });

  const sqlEscape = (val: string | null | undefined) => {
    if (val === null || val === undefined) return 'NULL';
    return `'${String(val).replace(/'/g, "''")}'`;
  };

  const jsonbLiteral = (obj: unknown) => {
    return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
  };

  const ddlScript = `-- Skema Tabel Supabase (PostgreSQL) untuk Formulir F-PRD-003 Rev 02
-- PT. Lab Teknologi Indonesia — Laporan Harian Data Mesin CNC

CREATE TABLE IF NOT EXISTS public.laporan_harian_cnc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  nomor_dokumen TEXT NOT NULL DEFAULT 'F-PRD-003',
  revisi TEXT NOT NULL DEFAULT '02',
  nama_operator TEXT,
  shift TEXT,
  hari_tanggal TEXT,
  project TEXT,
  sosa_no TEXT,
  metadata JSONB NOT NULL,
  kesiapan_jalur JSONB NOT NULL,
  cycle_time JSONB NOT NULL,
  pemotongan_sheet_material JSONB NOT NULL,
  pengambilan_material JSONB NOT NULL,
  dimensi_hasil_potong JSONB NOT NULL,
  informasi_tambahan JSONB NOT NULL,
  persetujuan JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_laporan_cnc_sosa_no ON public.laporan_harian_cnc (sosa_no);
CREATE INDEX IF NOT EXISTS idx_laporan_cnc_operator ON public.laporan_harian_cnc (nama_operator);`;

  const insertSqlScript = `-- Query INSERT Langsung dari Hasil Ekstraksi OCR Saat Ini
INSERT INTO public.laporan_harian_cnc (
  nomor_dokumen,
  revisi,
  nama_operator,
  shift,
  hari_tanggal,
  project,
  sosa_no,
  metadata,
  kesiapan_jalur,
  cycle_time,
  pemotongan_sheet_material,
  pengambilan_material,
  dimensi_hasil_potong,
  informasi_tambahan,
  persetujuan
) VALUES (
  ${sqlEscape(report.metadata.nomor_dokumen)},
  ${sqlEscape(report.metadata.revisi)},
  ${sqlEscape(report.metadata.nama_operator)},
  ${sqlEscape(report.metadata.shift)},
  ${sqlEscape(report.metadata.hari_tanggal)},
  ${sqlEscape(report.metadata.project)},
  ${sqlEscape(report.metadata.sosa_no)},
  ${jsonbLiteral(report.metadata)},
  ${jsonbLiteral(report.kesiapan_jalur)},
  ${jsonbLiteral(report.cycle_time)},
  ${jsonbLiteral(report.pemotongan_sheet_material)},
  ${jsonbLiteral(report.pengambilan_material)},
  ${jsonbLiteral(report.dimensi_hasil_potong)},
  ${jsonbLiteral(report.informasi_tambahan)},
  ${jsonbLiteral(report.persetujuan)}
);`;

  const supabaseJsSnippet = `import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const extractedPayload = ${JSON.stringify(report, null, 2)};

export async function insertLaporanHarianCnc() {
  const { data, error } = await supabase
    .from('${tableName || 'laporan_harian_cnc'}')
    .insert([
      {
        nomor_dokumen: extractedPayload.metadata.nomor_dokumen,
        revisi: extractedPayload.metadata.revisi,
        nama_operator: extractedPayload.metadata.nama_operator,
        shift: extractedPayload.metadata.shift,
        hari_tanggal: extractedPayload.metadata.hari_tanggal,
        project: extractedPayload.metadata.project,
        sosa_no: extractedPayload.metadata.sosa_no,
        metadata: extractedPayload.metadata,
        kesiapan_jalur: extractedPayload.kesiapan_jalur,
        cycle_time: extractedPayload.cycle_time,
        pemotongan_sheet_material: extractedPayload.pemotongan_sheet_material,
        pengambilan_material: extractedPayload.pengambilan_material,
        dimensi_hasil_potong: extractedPayload.dimensi_hasil_potong,
        informasi_tambahan: extractedPayload.informasi_tambahan,
        persetujuan: extractedPayload.persetujuan,
      },
    ])
    .select();

  if (error) throw error;
  return data;
}`;

  const currentCode =
    activeCodeTab === 'ddl'
      ? ddlScript
      : activeCodeTab === 'insert_sql'
      ? insertSqlScript
      : supabaseJsSnippet;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleLiveSupabasePush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim() || !tableName.trim()) {
      setPushStatus({
        loading: false,
        error: 'Harap lengkapi Supabase Project URL, API Key, dan Nama Tabel.',
        successMsg: null,
      });
      return;
    }

    setPushStatus({ loading: true, error: null, successMsg: null });
    try {
      const response = await fetch('/api/supabase/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl: supabaseUrl.trim(),
          supabaseKey: supabaseKey.trim(),
          tableName: tableName.trim(),
          payload: report,
          mode: insertMode,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Gagal mengirim data ke Supabase.');
      }
      setPushStatus({
        loading: false,
        error: null,
        successMsg: `Berhasil dimasukkan ke tabel "${tableName.trim()}" di Supabase.`,
      });
    } catch (err: any) {
      setPushStatus({
        loading: false,
        error: err?.message || 'Gagal menghubungi endpoint Supabase.',
        successMsg: null,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>PostgreSQL JSONB</span>
              <span aria-hidden="true">·</span>
              <span>Supabase REST v1</span>
              <span aria-hidden="true">·</span>
              <span>Dokumen F-PRD-003</span>
            </div>
            <h2 className="mt-1 text-base font-bold text-slate-900">
              Skema Database Supabase & Generator Query SQL Otomatis
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveCodeTab('ddl')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeCodeTab === 'ddl'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1. DDL CREATE TABLE
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('insert_sql')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeCodeTab === 'insert_sql'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2. SQL INSERT Data Saat Ini
              </button>
              <button
                type="button"
                onClick={() => setActiveCodeTab('supabase_js')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeCodeTab === 'supabase_js'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3. Kode @supabase/supabase-js
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Kode Tersalin' : 'Salin Kode'}
            </button>
          </div>
        </div>

        <div className="mt-4 border border-slate-800 bg-slate-950 text-slate-100">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5" />
              {activeCodeTab === 'ddl'
                ? 'supabase_migration_f_prd_003.sql'
                : activeCodeTab === 'insert_sql'
                ? 'insert_laporan_cnc.sql'
                : 'insertLaporanCnc.ts'}
            </span>
            <span>Siap dijalankan pada Supabase SQL Editor</span>
          </div>
          <pre className="max-h-[420px] overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-100">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>

      {/* Direct Supabase REST API Connector */}
      <form
        onSubmit={handleLiveSupabasePush}
        className="border border-slate-200 bg-white p-5 space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-700" />
              Kirim Langsung ke Tabel Supabase (REST API Endpoint)
            </h3>
            <p className="mt-0.5 text-xs text-slate-600">
              Opsional: Masukkan URL Project Supabase dan Anon/Service Role Key untuk langsung menyisipkan objek JSON hasil ekstraksi ini ke database Anda.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setInsertMode('normalized')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                insertMode === 'normalized'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Skema DDL di Atas (Kolom + JSONB)
            </button>
            <button
              type="button"
              onClick={() => setInsertMode('raw_json')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                insertMode === 'raw_json'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Strict JSON Langsung (8 Kolom Utama)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">
              Supabase Project URL
            </label>
            <input
              type="url"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="mt-1 w-full border border-slate-300 px-3 py-1.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Nama Tabel Supabase
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="laporan_harian_cnc"
              className="mt-1 w-full border border-slate-300 px-3 py-1.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700">
              Supabase API Key (anon / service_role)
            </label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="mt-1 w-full border border-slate-300 px-3 py-1.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>

        {pushStatus.error && (
          <div className="border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 font-mono">
            {pushStatus.error}
          </div>
        )}

        {pushStatus.successMsg && (
          <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 font-medium">
            {pushStatus.successMsg}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pushStatus.loading}
            className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            {pushStatus.loading ? 'Mengirim ke Supabase...' : 'Insert Data ke Supabase'}
          </button>
        </div>
      </form>
    </div>
  );
};
