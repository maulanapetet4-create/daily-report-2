import React, { useState } from 'react';
import { CncDailyReport, SavedExtractionRecord } from '../types/cncReport';
import { Check, Copy, Download, Eye, Search, Trash2 } from 'lucide-react';

interface ExtractionHistoryPanelProps {
  records: SavedExtractionRecord[];
  onLoadRecord: (report: CncDailyReport) => void;
  onDeleteRecord: (id: string) => void;
  onRestoreDefaults: () => void;
}

export const ExtractionHistoryPanel: React.FC<ExtractionHistoryPanelProps> = ({
  records,
  onLoadRecord,
  onDeleteRecord,
  onRestoreDefaults,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'shift1' | 'shift2'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecords = records.filter((rec) => {
    const meta = rec.data.metadata;
    const matchesSearch =
      !searchQuery.trim() ||
      [
        meta.nama_operator,
        meta.sosa_no,
        meta.project,
        meta.hari_tanggal,
        rec.sourceFileName,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(searchQuery.toLowerCase()));

    const shiftLower = (meta.shift || '').toLowerCase();
    const matchesShift =
      shiftFilter === 'all' ||
      (shiftFilter === 'shift1' && (shiftLower.includes('1') || shiftLower.includes('pagi'))) ||
      (shiftFilter === 'shift2' && (shiftLower.includes('2') || shiftLower.includes('sore')));

    return matchesSearch && matchesShift;
  });

  const handleCopyRecordJson = async (rec: SavedExtractionRecord) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rec.data, null, 2));
      setCopiedId(rec.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  const handleExportBatchJson = () => {
    const payload = filteredRecords.map((r) => r.data);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `F-PRD-003_Batch_${filteredRecords.length}_Laporan.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-slate-200 bg-white p-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono tabular-nums">
            <span>Total Arsip: {records.length} laporan</span>
            <span aria-hidden="true">·</span>
            <span> Ditampilkan: {filteredRecords.length} laporan</span>
          </div>
          <h2 className="mt-1 text-base font-bold text-slate-900">
            Log Riwayat Ekstraksi Formulir Harian CNC (F-PRD-003)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari operator, SOSA No, project..."
              className="w-60 border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setShiftFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                shiftFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Shift
            </button>
            <button
              type="button"
              onClick={() => setShiftFilter('shift1')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                shiftFilter === 'shift1'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shift 1
            </button>
            <button
              type="button"
              onClick={() => setShiftFilter('shift2')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                shiftFilter === 'shift2'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shift 2
            </button>
          </div>

          <button
            type="button"
            disabled={filteredRecords.length === 0}
            onClick={handleExportBatchJson}
            className="inline-flex items-center gap-1.5 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Unduh Batch JSON
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-900">
            Tidak ada data laporan CNC yang sesuai filter pencarian
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Simpan hasil ekstraksi baru dari tab Ekstraksi OCR atau pulihkan data contoh produksi.
          </p>
          <button
            type="button"
            onClick={onRestoreDefaults}
            className="mt-4 bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
          >
            Muat Data Contoh Produksi
          </button>
        </div>
      ) : (
        <div className="border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <th className="border-r border-slate-200 px-3 py-2.5 font-semibold">
                  SOSA No & Tanggal
                </th>
                <th className="border-r border-slate-200 px-3 py-2.5 font-semibold">
                  Operator & Shift
                </th>
                <th className="border-r border-slate-200 px-3 py-2.5 font-semibold">
                  Project
                </th>
                <th className="border-r border-slate-200 px-3 py-2.5 font-semibold">
                  Kesiapan Jalur
                </th>
                <th className="border-r border-slate-200 px-3 py-2.5 text-right font-mono font-semibold">
                  Field Terisi / Null
                </th>
                <th className="px-3 py-2.5 text-right font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.map((rec) => {
                const m = rec.data.metadata;
                const k = rec.data.kesiapan_jalur;
                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80">
                    <td className="border-r border-slate-200 px-3 py-2.5">
                      <div className="font-mono font-semibold text-slate-900">
                        {m.sosa_no ?? 'null'}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {m.hari_tanggal ?? 'Tanggal: null'}
                      </div>
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2.5">
                      <div className="font-medium text-slate-900">
                        {m.nama_operator ?? 'null'}
                      </div>
                      <div className="text-slate-500 mt-0.5 font-mono text-[11px]">
                        {m.shift ?? 'null'} · {m.jam_kerja.mulai ?? '--:--'}–{m.jam_kerja.selesai ?? '--:--'}
                      </div>
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2.5 max-w-[260px]">
                      <div className="truncate font-medium text-slate-800">
                        {m.project ?? 'null'}
                      </div>
                      <div className="truncate text-slate-500 mt-0.5 font-mono text-[11px]">
                        Sumber: {rec.sourceFileName}
                      </div>
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2.5">
                      <div className="text-slate-800">
                        Oli: <span className="font-mono">{k.volume_pengisian_oli_ml ?? 'null'}</span> ml ·{' '}
                        <span>{k.level_oli ?? 'null'}</span>
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Pisau: {k.jenis_mata_pisau ?? 'null'}
                      </div>
                    </td>
                    <td className="border-r border-slate-200 px-3 py-2.5 text-right font-mono tabular-nums">
                      <span className="text-slate-900 font-semibold">{rec.filledFieldsCount}</span>
                      <span className="text-slate-400"> / </span>
                      <span className="text-slate-500">{rec.nullFieldsCount} null</span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onLoadRecord(rec.data)}
                          className="inline-flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Buka
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyRecordJson(rec)}
                          className="inline-flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100 whitespace-nowrap shrink-0"
                        >
                          {copiedId === rec.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(rec.id)}
                          className="p-1 text-slate-400 hover:text-red-600"
                          title="Hapus dari riwayat"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
