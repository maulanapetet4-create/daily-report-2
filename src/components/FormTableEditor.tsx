import React from 'react';
import {
  CncDailyReport,
  CycleTimeMachine,
  PemotonganMachine,
  SheetRowNumeric,
  SheetRowString,
} from '../types/cncReport';
import { Calculator, Plus, RotateCcw, Trash2 } from 'lucide-react';

interface FormTableEditorProps {
  report: CncDailyReport;
  onChange: (updated: CncDailyReport) => void;
  onResetEmpty: () => void;
}

const SHEET_KEYS: (keyof SheetRowNumeric)[] = [
  'sheet_1',
  'sheet_2',
  'sheet_3',
  'sheet_4',
  'sheet_5',
  'sheet_6',
  'total',
];

function parseNullableNumberInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const num = Number(trimmed.replace(',', '.'));
  return Number.isFinite(num) ? num : null;
}

function parseNullableStringInput(raw: string): string | null {
  const trimmed = raw.trim();
  return trimmed === '' ? null : raw;
}

export const FormTableEditor: React.FC<FormTableEditorProps> = ({
  report,
  onChange,
  onResetEmpty,
}) => {
  const updateMetadata = (field: keyof CncDailyReport['metadata'], value: string | null) => {
    onChange({
      ...report,
      metadata: {
        ...report.metadata,
        [field]: value,
      },
    });
  };

  const updateJamKerja = (field: 'mulai' | 'selesai', value: string | null) => {
    onChange({
      ...report,
      metadata: {
        ...report.metadata,
        jam_kerja: {
          ...report.metadata.jam_kerja,
          [field]: value,
        },
      },
    });
  };

  const updateKesiapan = <K extends keyof CncDailyReport['kesiapan_jalur']>(
    field: K,
    value: CncDailyReport['kesiapan_jalur'][K]
  ) => {
    onChange({
      ...report,
      kesiapan_jalur: {
        ...report.kesiapan_jalur,
        [field]: value,
      },
    });
  };

  const updateCycleCell = (
    machine: 'mesin_cnc_quick_putih' | 'mesin_cnc_tekma_biru',
    metric: keyof Omit<CycleTimeMachine, 'diverifikasi_oleh'>,
    col: keyof SheetRowNumeric,
    rawVal: string
  ) => {
    const parsed = parseNullableNumberInput(rawVal);
    onChange({
      ...report,
      cycle_time: {
        ...report.cycle_time,
        [machine]: {
          ...report.cycle_time[machine],
          [metric]: {
            ...report.cycle_time[machine][metric],
            [col]: parsed,
          },
        },
      },
    });
  };

  const recalculateCycleTotals = () => {
    const calcRow = (row: SheetRowNumeric): SheetRowNumeric => {
      const vals = [row.sheet_1, row.sheet_2, row.sheet_3, row.sheet_4, row.sheet_5, row.sheet_6]
        .map((v) => (typeof v === 'number' ? v : v !== null ? Number(v) : NaN))
        .filter((v) => Number.isFinite(v));
      return {
        ...row,
        total: vals.length > 0 ? vals.reduce((a, b) => a + b, 0) : null,
      };
    };

    const calcMachine = (m: CycleTimeMachine): CycleTimeMachine => ({
      ...m,
      waktu_proses_produksi: calcRow(m.waktu_proses_produksi),
      delay_waiting_time: calcRow(m.delay_waiting_time),
      setup_time: calcRow(m.setup_time),
      waktu_inspeksi_perbaikan: calcRow(m.waktu_inspeksi_perbaikan),
    });

    onChange({
      ...report,
      cycle_time: {
        ...report.cycle_time,
        mesin_cnc_quick_putih: calcMachine(report.cycle_time.mesin_cnc_quick_putih),
        mesin_cnc_tekma_biru: calcMachine(report.cycle_time.mesin_cnc_tekma_biru),
      },
    });
  };

  const updatePemotonganCell = (
    machine: 'mesin_cnc_quick_putih' | 'mesin_cnc_tekma_biru',
    metric: keyof Omit<PemotonganMachine, 'diverifikasi_oleh'>,
    col: keyof SheetRowString,
    rawVal: string
  ) => {
    const isNumericRow = metric === 'total_komponen';
    const parsed = isNumericRow ? parseNullableNumberInput(rawVal) : parseNullableStringInput(rawVal);
    onChange({
      ...report,
      pemotongan_sheet_material: {
        ...report.pemotongan_sheet_material,
        [machine]: {
          ...report.pemotongan_sheet_material[machine],
          [metric]: {
            ...report.pemotongan_sheet_material[machine][metric],
            [col]: parsed,
          },
        },
      },
    });
  };

  const renderCycleTable = (
    title: string,
    machineKey: 'mesin_cnc_quick_putih' | 'mesin_cnc_tekma_biru'
  ) => {
    const machine = report.cycle_time[machineKey];
    const rows: {
      key: keyof Omit<CycleTimeMachine, 'diverifikasi_oleh'>;
      label: string;
    }[] = [
      { key: 'waktu_proses_produksi', label: 'Waktu Proses Produksi (menit)' },
      { key: 'delay_waiting_time', label: 'Delay / Waiting Time (menit)' },
      { key: 'setup_time', label: 'Setup Time (menit)' },
      { key: 'waktu_inspeksi_perbaikan', label: 'Waktu Inspeksi & Perbaikan (menit)' },
    ];

    return (
      <div className="border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <span className="text-xs font-semibold text-slate-800">{title}</span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Diverifikasi Oleh:</label>
            <input
              type="text"
              value={machine.diverifikasi_oleh ?? ''}
              placeholder="null"
              onChange={(e) =>
                onChange({
                  ...report,
                  cycle_time: {
                    ...report.cycle_time,
                    [machineKey]: {
                      ...machine,
                      diverifikasi_oleh: parseNullableStringInput(e.target.value),
                    },
                  },
                })
              }
              className="w-36 border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                <th className="min-w-[210px] border-r border-slate-200 px-3 py-2 font-semibold">
                  Parameter Cycle Time
                </th>
                <th className="w-20 border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                  Sheet 1
                </th>
                <th className="w-20 border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                  Sheet 2
                </th>
                <th className="w-20 border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                  Sheet 3
                </th>
                <th className="w-20 border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                  Sheet 4
                </th>
                <th className="w-20 border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                  Sheet 5
                </th>
                <th className="w-20 border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                  Sheet 6
                </th>
                <th className="w-24 bg-slate-100/70 px-2 py-2 text-right font-mono font-semibold text-slate-900">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r) => (
                <tr key={r.key} className="hover:bg-slate-50/80">
                  <td className="border-r border-slate-200 px-3 py-1.5 font-medium text-slate-800">
                    {r.label}
                  </td>
                  {SHEET_KEYS.map((colKey) => {
                    const cellVal = machine[r.key][colKey];
                    const isTotal = colKey === 'total';
                    return (
                      <td
                        key={colKey}
                        className={`border-r border-slate-200 p-0 last:border-r-0 ${
                          isTotal ? 'bg-slate-50/80 font-semibold' : ''
                        }`}
                      >
                        <input
                          type="text"
                          inputMode="decimal"
                          value={cellVal ?? ''}
                          placeholder="null"
                          onChange={(e) =>
                            updateCycleCell(machineKey, r.key, colKey, e.target.value)
                          }
                          className="w-full bg-transparent px-2 py-2 text-right font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-300 focus:bg-amber-50/60 focus:outline-none"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPemotonganTable = (
    title: string,
    machineKey: 'mesin_cnc_quick_putih' | 'mesin_cnc_tekma_biru'
  ) => {
    const machine = report.pemotongan_sheet_material[machineKey];
    const rows: {
      key: keyof Omit<PemotonganMachine, 'diverifikasi_oleh'>;
      label: string;
      numeric?: boolean;
    }[] = [
      { key: 'nama_produk', label: 'Nama Produk' },
      { key: 'jenis_material', label: 'Jenis Material' },
      { key: 'total_komponen', label: 'Total Komponen', numeric: true },
      { key: 'jenis_potongan', label: 'Jenis Potongan' },
      { key: 'kualitas_hasil_potong', label: 'Kualitas Hasil Potong' },
    ];

    return (
      <div className="border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <span className="text-xs font-semibold text-slate-800">{title}</span>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Diverifikasi Oleh:</label>
            <input
              type="text"
              value={machine.diverifikasi_oleh ?? ''}
              placeholder="null"
              onChange={(e) =>
                onChange({
                  ...report,
                  pemotongan_sheet_material: {
                    ...report.pemotongan_sheet_material,
                    [machineKey]: {
                      ...machine,
                      diverifikasi_oleh: parseNullableStringInput(e.target.value),
                    },
                  },
                })
              }
              className="w-36 border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                <th className="min-w-[180px] border-r border-slate-200 px-3 py-2 font-semibold">
                  Parameter Pemotongan
                </th>
                <th className="min-w-[110px] border-r border-slate-200 px-2 py-2 font-mono font-semibold">
                  Sheet 1
                </th>
                <th className="min-w-[110px] border-r border-slate-200 px-2 py-2 font-mono font-semibold">
                  Sheet 2
                </th>
                <th className="min-w-[110px] border-r border-slate-200 px-2 py-2 font-mono font-semibold">
                  Sheet 3
                </th>
                <th className="min-w-[110px] border-r border-slate-200 px-2 py-2 font-mono font-semibold">
                  Sheet 4
                </th>
                <th className="min-w-[110px] border-r border-slate-200 px-2 py-2 font-mono font-semibold">
                  Sheet 5
                </th>
                <th className="min-w-[110px] border-r border-slate-200 px-2 py-2 font-mono font-semibold">
                  Sheet 6
                </th>
                <th className="min-w-[110px] bg-slate-100/70 px-2 py-2 font-mono font-semibold text-slate-900">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((r) => (
                <tr key={r.key} className="hover:bg-slate-50/80">
                  <td className="border-r border-slate-200 px-3 py-1.5 font-medium text-slate-800">
                    {r.label}
                  </td>
                  {SHEET_KEYS.map((colKey) => {
                    const cellVal = machine[r.key][colKey];
                    const isTotal = colKey === 'total';
                    return (
                      <td
                        key={colKey}
                        className={`border-r border-slate-200 p-0 last:border-r-0 ${
                          isTotal ? 'bg-slate-50/80 font-semibold' : ''
                        }`}
                      >
                        <input
                          type="text"
                          value={cellVal ?? ''}
                          placeholder="null"
                          onChange={(e) =>
                            updatePemotonganCell(machineKey, r.key, colKey, e.target.value)
                          }
                          className={`w-full bg-transparent px-2 py-2 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-300 focus:bg-amber-50/60 focus:outline-none ${
                            r.numeric ? 'text-right font-mono tabular-nums' : 'text-left'
                          }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Document Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
            <span>{report.metadata.nomor_dokumen}</span>
            <span aria-hidden="true">·</span>
            <span>Revisi {report.metadata.revisi}</span>
            <span aria-hidden="true">·</span>
            <span>Efektif {report.metadata.tanggal_efektif}</span>
            <span aria-hidden="true">·</span>
            <span>Halaman {report.metadata.halaman}</span>
            <span aria-hidden="true">·</span>
            <span>Departemen {report.metadata.departement}</span>
          </div>
          <h2 className="mt-1 text-base font-bold text-slate-900">
            {report.metadata.judul_form}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={recalculateCycleTotals}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Calculator className="h-3.5 w-3.5" />
            Hitung Total Cycle Time
          </button>
          <button
            type="button"
            onClick={onResetEmpty}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset ke Null
          </button>
        </div>
      </div>

      {/* SECTION 1: METADATA OPERATOR & JAM KERJA */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900">
            01. Identitas Operator, Shift & Project (metadata)
          </h3>
          <span className="text-xs text-slate-500">
            Kosongkan input untuk menghasilkan nilai <code className="font-mono">null</code>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Nama Operator (<code className="font-mono">nama_operator</code>)
            </label>
            <input
              type="text"
              value={report.metadata.nama_operator ?? ''}
              placeholder="null"
              onChange={(e) =>
                updateMetadata('nama_operator', parseNullableStringInput(e.target.value))
              }
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Shift (<code className="font-mono">shift</code>)
            </label>
            <input
              type="text"
              value={report.metadata.shift ?? ''}
              placeholder="null"
              onChange={(e) => updateMetadata('shift', parseNullableStringInput(e.target.value))}
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Hari / Tanggal (<code className="font-mono">hari_tanggal</code>)
            </label>
            <input
              type="text"
              value={report.metadata.hari_tanggal ?? ''}
              placeholder="null"
              onChange={(e) =>
                updateMetadata('hari_tanggal', parseNullableStringInput(e.target.value))
              }
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              SOSA No (<code className="font-mono">sosa_no</code>)
            </label>
            <input
              type="text"
              value={report.metadata.sosa_no ?? ''}
              placeholder="null"
              onChange={(e) => updateMetadata('sosa_no', parseNullableStringInput(e.target.value))}
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600">
              Nama Project (<code className="font-mono">project</code>)
            </label>
            <input
              type="text"
              value={report.metadata.project ?? ''}
              placeholder="null"
              onChange={(e) => updateMetadata('project', parseNullableStringInput(e.target.value))}
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Jam Kerja Mulai (<code className="font-mono">jam_kerja.mulai</code>)
            </label>
            <input
              type="text"
              value={report.metadata.jam_kerja.mulai ?? ''}
              placeholder="null (cth: 08:00)"
              onChange={(e) => updateJamKerja('mulai', parseNullableStringInput(e.target.value))}
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Jam Kerja Selesai (<code className="font-mono">jam_kerja.selesai</code>)
            </label>
            <input
              type="text"
              value={report.metadata.jam_kerja.selesai ?? ''}
              placeholder="null (cth: 17:00)"
              onChange={(e) => updateJamKerja('selesai', parseNullableStringInput(e.target.value))}
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION 2: KESIAPAN JALUR */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900">
          02. Kesiapan Jalur & Pemeriksaan Tooling (kesiapan_jalur)
        </h3>

        <div className="grid grid-cols-1 gap-4 border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Volume Pengisian Oli (ml) (<code className="font-mono">volume_pengisian_oli_ml</code>)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={report.kesiapan_jalur.volume_pengisian_oli_ml ?? ''}
              placeholder="null (number)"
              onChange={(e) =>
                updateKesiapan(
                  'volume_pengisian_oli_ml',
                  parseNullableNumberInput(e.target.value)
                )
              }
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600">
              Tanggal Pergantian Mata Pisau (<code className="font-mono">tanggal_pergantian_mata_pisau</code>)
            </label>
            <input
              type="text"
              value={report.kesiapan_jalur.tanggal_pergantian_mata_pisau ?? ''}
              placeholder="null"
              onChange={(e) =>
                updateKesiapan(
                  'tanggal_pergantian_mata_pisau',
                  parseNullableStringInput(e.target.value)
                )
              }
              className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 font-mono text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Opsi Level Oli (<code className="font-mono">level_oli</code>)
            </label>
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1">
              {(['Rendah', 'Normal', 'Diatas Normal'] as const).map((opt) => {
                const active = report.kesiapan_jalur.level_oli === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateKesiapan('level_oli', opt)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => updateKesiapan('level_oli', null)}
                className={`px-2.5 py-1.5 font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
                  report.kesiapan_jalur.level_oli === null
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                null
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Opsi Jenis Mata Pisau (<code className="font-mono">jenis_mata_pisau</code>)
            </label>
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1">
              {(['Vcut', 'End Mill 3mm', 'End Mill 6mm'] as const).map((opt) => {
                const active = report.kesiapan_jalur.jenis_mata_pisau === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => updateKesiapan('jenis_mata_pisau', opt)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => updateKesiapan('jenis_mata_pisau', null)}
                className={`px-2.5 py-1.5 font-mono text-xs transition-colors whitespace-nowrap shrink-0 ${
                  report.kesiapan_jalur.jenis_mata_pisau === null
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                null
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CYCLE TIME */}
      <section className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900">
          03. Cycle Time Mesin CNC (cycle_time)
        </h3>
        {renderCycleTable('Mesin CNC Quick (Putih) — mesin_cnc_quick_putih', 'mesin_cnc_quick_putih')}
        {renderCycleTable('Mesin CNC Tekma (Biru) — mesin_cnc_tekma_biru', 'mesin_cnc_tekma_biru')}
        <div className="border border-slate-200 bg-white p-3">
          <label className="block text-xs font-medium text-slate-600">
            Keterangan Cycle Time (<code className="font-mono">cycle_time.keterangan</code>)
          </label>
          <input
            type="text"
            value={report.cycle_time.keterangan ?? ''}
            placeholder="null"
            onChange={(e) =>
              onChange({
                ...report,
                cycle_time: {
                  ...report.cycle_time,
                  keterangan: parseNullableStringInput(e.target.value),
                },
              })
            }
            className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>
      </section>

      {/* SECTION 4: PEMOTONGAN SHEET MATERIAL */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold text-slate-900">
            04. Pemotongan Sheet Material (pemotongan_sheet_material)
          </h3>
          <button
            type="button"
            onClick={() => {
              const fillPolypropilen = (m: PemotonganMachine): PemotonganMachine => {
                const nextMat = { ...m.jenis_material };
                (['sheet_1', 'sheet_2', 'sheet_3', 'sheet_4', 'sheet_5', 'sheet_6'] as const).forEach(
                  (sk) => {
                    if (m.nama_produk[sk] !== null || m.jenis_material[sk] !== null) {
                      nextMat[sk] = 'Polypropilen';
                    }
                  }
                );
                return { ...m, jenis_material: nextMat };
              };
              const nextTabelMat = report.pengambilan_material.tabel_material.map((row) =>
                row.no === 4 ? { ...row, jenis_material: 'Polypropilen' } : row
              );
              onChange({
                ...report,
                pemotongan_sheet_material: {
                  ...report.pemotongan_sheet_material,
                  mesin_cnc_quick_putih: fillPolypropilen(
                    report.pemotongan_sheet_material.mesin_cnc_quick_putih
                  ),
                  mesin_cnc_tekma_biru: fillPolypropilen(
                    report.pemotongan_sheet_material.mesin_cnc_tekma_biru
                  ),
                },
                pengambilan_material: {
                  ...report.pengambilan_material,
                  tabel_material: nextTabelMat,
                },
              });
            }}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            Set Material Aktif: Polypropilen
          </button>
        </div>
        {renderPemotonganTable(
          'Mesin CNC Quick (Putih) — mesin_cnc_quick_putih',
          'mesin_cnc_quick_putih'
        )}
        {renderPemotonganTable(
          'Mesin CNC Tekma (Biru) — mesin_cnc_tekma_biru',
          'mesin_cnc_tekma_biru'
        )}
        <div className="border border-slate-200 bg-white p-3">
          <label className="block text-xs font-medium text-slate-600">
            Keterangan Pemotongan (<code className="font-mono">pemotongan_sheet_material.keterangan</code>)
          </label>
          <input
            type="text"
            value={report.pemotongan_sheet_material.keterangan ?? ''}
            placeholder="null"
            onChange={(e) =>
              onChange({
                ...report,
                pemotongan_sheet_material: {
                  ...report.pemotongan_sheet_material,
                  keterangan: parseNullableStringInput(e.target.value),
                },
              })
            }
            className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
          />
        </div>
      </section>

      {/* SECTION 5 & 6: PENGAMBILAN MATERIAL & DIMENSI HASIL POTONG */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pengambilan Material */}
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-900">
              05. Pengambilan Material (pengambilan_material)
            </h3>
            <button
              type="button"
              onClick={() => {
                const currentRows = report.pengambilan_material.tabel_material;
                const nextNo = currentRows.length + 1;
                onChange({
                  ...report,
                  pengambilan_material: {
                    ...report.pengambilan_material,
                    tabel_material: [
                      ...currentRows,
                      {
                        no: nextNo,
                        jenis_material: 'Lain-lain (Kostum)',
                        lembar: null,
                        sisa: null,
                      },
                    ],
                  },
                });
              }}
              className="inline-flex items-center gap-1 border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Material Kostum
            </button>
          </div>
          <div className="border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
              <span className="text-xs font-semibold text-slate-700">
                PP 6 mm, PP 8 mm, PP 10 mm & Material Kostum
              </span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Diverifikasi:</label>
                <input
                  type="text"
                  value={report.pengambilan_material.diverifikasi_oleh ?? ''}
                  placeholder="null"
                  onChange={(e) =>
                    onChange({
                      ...report,
                      pengambilan_material: {
                        ...report.pengambilan_material,
                        diverifikasi_oleh: parseNullableStringInput(e.target.value),
                      },
                    })
                  }
                  className="w-32 border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                  <th className="w-10 border-r border-slate-200 px-2 py-2 text-center font-mono">No</th>
                  <th className="border-r border-slate-200 px-3 py-2 font-semibold">
                    Jenis Material (PP / Kostum Manual)
                  </th>
                  <th className="w-20 border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                    Lembar
                  </th>
                  <th className="w-20 px-2 py-2 text-right font-mono font-semibold">Sisa</th>
                  <th className="w-9 px-1 py-2 text-center font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.pengambilan_material.tabel_material.map((item, idx) => {
                  const isCustomRow = idx >= 3;
                  return (
                    <tr key={item.no} className="hover:bg-slate-50/80">
                      <td className="border-r border-slate-200 px-2 py-2 text-center font-mono tabular-nums text-slate-500">
                        {item.no}
                      </td>
                      <td className="border-r border-slate-200 p-0">
                        {isCustomRow ? (
                          <div className="flex items-center px-2 py-1 gap-1.5">
                            <span className="text-[11px] text-slate-500 shrink-0">Kostum:</span>
                            <input
                              type="text"
                              value={item.jenis_material === 'Lain-lain' ? '' : item.jenis_material}
                              placeholder="Ketik material kostum manual (misal: PP 12 mm / PVC)..."
                              onChange={(e) => {
                                const raw = e.target.value;
                                const next = [...report.pengambilan_material.tabel_material];
                                next[idx] = {
                                  ...item,
                                  jenis_material: raw.trim() === '' ? 'Lain-lain' : raw,
                                };
                                onChange({
                                  ...report,
                                  pengambilan_material: {
                                    ...report.pengambilan_material,
                                    tabel_material: next,
                                  },
                                });
                              }}
                              className="w-full border border-slate-300 bg-slate-50/60 px-2 py-1 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
                            />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={item.jenis_material}
                            onChange={(e) => {
                              const next = [...report.pengambilan_material.tabel_material];
                              next[idx] = { ...item, jenis_material: e.target.value };
                              onChange({
                                ...report,
                                pengambilan_material: {
                                  ...report.pengambilan_material,
                                  tabel_material: next,
                                },
                              });
                            }}
                            className="w-full bg-transparent px-3 py-2 text-xs font-medium text-slate-900 focus:bg-amber-50/60 focus:outline-none"
                          />
                        )}
                      </td>
                      <td className="border-r border-slate-200 p-0">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.lembar ?? ''}
                          placeholder="null"
                          onChange={(e) => {
                            const next = [...report.pengambilan_material.tabel_material];
                            next[idx] = {
                              ...item,
                              lembar: parseNullableNumberInput(e.target.value),
                            };
                            onChange({
                              ...report,
                              pengambilan_material: {
                                ...report.pengambilan_material,
                                tabel_material: next,
                              },
                            });
                          }}
                          className="w-full bg-transparent px-2 py-2 text-right font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-300 focus:bg-amber-50/60 focus:outline-none"
                        />
                      </td>
                      <td className="border-r border-slate-200 p-0">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.sisa ?? ''}
                          placeholder="null"
                          onChange={(e) => {
                            const next = [...report.pengambilan_material.tabel_material];
                            next[idx] = {
                              ...item,
                              sisa: parseNullableNumberInput(e.target.value),
                            };
                            onChange({
                              ...report,
                              pengambilan_material: {
                                ...report.pengambilan_material,
                                tabel_material: next,
                              },
                            });
                          }}
                          className="w-full bg-transparent px-2 py-2 text-right font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-300 focus:bg-amber-50/60 focus:outline-none"
                        />
                      </td>
                      <td className="px-1 py-1 text-center">
                        {idx >= 4 ? (
                          <button
                            type="button"
                            title="Hapus baris material kostum"
                            onClick={() => {
                              const filtered = report.pengambilan_material.tabel_material
                                .filter((_, i) => i !== idx)
                                .map((row, i) => ({ ...row, no: i + 1 }));
                              onChange({
                                ...report,
                                pengambilan_material: {
                                  ...report.pengambilan_material,
                                  tabel_material: filtered,
                                },
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : idx === 3 && item.jenis_material !== 'Lain-lain' ? (
                          <button
                            type="button"
                            title="Reset ke Lain-lain"
                            onClick={() => {
                              const next = [...report.pengambilan_material.tabel_material];
                              next[3] = {
                                ...item,
                                jenis_material: 'Lain-lain',
                                lembar: null,
                                sisa: null,
                              };
                              onChange({
                                ...report,
                                pengambilan_material: {
                                  ...report.pengambilan_material,
                                  tabel_material: next,
                                },
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-slate-800"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="border-t border-slate-200 bg-slate-50/70 px-3 py-2 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <span>
                Baris 4+ dapat diisi manual untuk material kostum (kosongkan nama kostum untuk kembali ke nilai default <code className="font-mono">Lain-lain</code>).
              </span>
            </div>
          </div>
        </section>

        {/* Dimensi Hasil Potong */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900">
            06. Dimensi Hasil Potong (dimensi_hasil_potong)
          </h3>
          <div className="border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
              <span className="text-xs font-semibold text-slate-700">Tabel Dimensi (Sheet 1–6)</span>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-600">Diverifikasi:</label>
                <input
                  type="text"
                  value={report.dimensi_hasil_potong.diverifikasi_oleh ?? ''}
                  placeholder="null"
                  onChange={(e) =>
                    onChange({
                      ...report,
                      dimensi_hasil_potong: {
                        ...report.dimensi_hasil_potong,
                        diverifikasi_oleh: parseNullableStringInput(e.target.value),
                      },
                    })
                  }
                  className="w-32 border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
                />
              </div>
            </div>
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600">
                  <th className="w-14 border-r border-slate-200 px-2 py-2 text-center font-mono">
                    Sheet
                  </th>
                  <th className="border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                    Panjang (mm)
                  </th>
                  <th className="border-r border-slate-200 px-2 py-2 text-right font-mono font-semibold">
                    Lebar (mm)
                  </th>
                  <th className="px-2 py-2 text-right font-mono font-semibold">Tebal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {report.dimensi_hasil_potong.tabel_dimensi.map((item, idx) => (
                  <tr key={item.sheet} className="hover:bg-slate-50/80">
                    <td className="border-r border-slate-200 px-2 py-1.5 text-center font-mono tabular-nums text-slate-500">
                      {item.sheet}
                    </td>
                    <td className="border-r border-slate-200 p-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.panjang_mm ?? ''}
                        placeholder="null"
                        onChange={(e) => {
                          const next = [...report.dimensi_hasil_potong.tabel_dimensi];
                          next[idx] = {
                            ...item,
                            panjang_mm: parseNullableNumberInput(e.target.value),
                          };
                          onChange({
                            ...report,
                            dimensi_hasil_potong: {
                              ...report.dimensi_hasil_potong,
                              tabel_dimensi: next,
                            },
                          });
                        }}
                        className="w-full bg-transparent px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-300 focus:bg-amber-50/60 focus:outline-none"
                      />
                    </td>
                    <td className="border-r border-slate-200 p-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.lebar_mm ?? ''}
                        placeholder="null"
                        onChange={(e) => {
                          const next = [...report.dimensi_hasil_potong.tabel_dimensi];
                          next[idx] = {
                            ...item,
                            lebar_mm: parseNullableNumberInput(e.target.value),
                          };
                          onChange({
                            ...report,
                            dimensi_hasil_potong: {
                              ...report.dimensi_hasil_potong,
                              tabel_dimensi: next,
                            },
                          });
                        }}
                        className="w-full bg-transparent px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-300 focus:bg-amber-50/60 focus:outline-none"
                      />
                    </td>
                    <td className="p-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={item.tebal ?? ''}
                        placeholder="null"
                        onChange={(e) => {
                          const next = [...report.dimensi_hasil_potong.tabel_dimensi];
                          next[idx] = {
                            ...item,
                            tebal: parseNullableNumberInput(e.target.value),
                          };
                          onChange({
                            ...report,
                            dimensi_hasil_potong: {
                              ...report.dimensi_hasil_potong,
                              tabel_dimensi: next,
                            },
                          });
                        }}
                        className="w-full bg-transparent px-2 py-1.5 text-right font-mono text-xs tabular-nums text-slate-900 placeholder:text-slate-300 focus:bg-amber-50/60 focus:outline-none"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* SECTION 7: INFORMASI TAMBAHAN & SECTION 8: PERSETUJUAN */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900">
            07. Informasi Tambahan (informasi_tambahan)
          </h3>
          <div className="space-y-3 border border-slate-200 bg-white p-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Pekerjaan Lainnya (<code className="font-mono">pekerjaan_lainnya</code>)
              </label>
              <input
                type="text"
                value={report.informasi_tambahan.pekerjaan_lainnya ?? ''}
                placeholder="null"
                onChange={(e) =>
                  onChange({
                    ...report,
                    informasi_tambahan: {
                      ...report.informasi_tambahan,
                      pekerjaan_lainnya: parseNullableStringInput(e.target.value),
                    },
                  })
                }
                className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Pesan / Informasi (<code className="font-mono">pesan_informasi</code>)
              </label>
              <input
                type="text"
                value={report.informasi_tambahan.pesan_informasi ?? ''}
                placeholder="null"
                onChange={(e) =>
                  onChange({
                    ...report,
                    informasi_tambahan: {
                      ...report.informasi_tambahan,
                      pesan_informasi: parseNullableStringInput(e.target.value),
                    },
                  })
                }
                className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Kendala (<code className="font-mono">kendala</code>)
              </label>
              <input
                type="text"
                value={report.informasi_tambahan.kendala ?? ''}
                placeholder="null"
                onChange={(e) =>
                  onChange({
                    ...report,
                    informasi_tambahan: {
                      ...report.informasi_tambahan,
                      kendala: parseNullableStringInput(e.target.value),
                    },
                  })
                }
                className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-xs font-bold text-slate-900">
            08. Persetujuan & Pengesahan (persetujuan)
          </h3>
          <div className="space-y-3 border border-slate-200 bg-white p-4">
            <div>
              <label className="block text-xs font-medium text-slate-600">
                Disusun Oleh (<code className="font-mono">disusun_oleh</code>)
              </label>
              <input
                type="text"
                value={report.persetujuan.disusun_oleh ?? ''}
                placeholder="null"
                onChange={(e) =>
                  onChange({
                    ...report,
                    persetujuan: {
                      ...report.persetujuan,
                      disusun_oleh: parseNullableStringInput(e.target.value),
                    },
                  })
                }
                className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Diketahui Oleh (<code className="font-mono">diketahui_oleh</code>)
              </label>
              <input
                type="text"
                value={report.persetujuan.diketahui_oleh ?? ''}
                placeholder="Mulyana"
                onChange={(e) =>
                  onChange({
                    ...report,
                    persetujuan: {
                      ...report.persetujuan,
                      diketahui_oleh: parseNullableStringInput(e.target.value),
                    },
                  })
                }
                className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600">
                Disetujui Oleh (<code className="font-mono">disetujui_oleh</code>)
              </label>
              <input
                type="text"
                value={report.persetujuan.disetujui_oleh ?? ''}
                placeholder="Arifin"
                onChange={(e) =>
                  onChange({
                    ...report,
                    persetujuan: {
                      ...report.persetujuan,
                      disetujui_oleh: parseNullableStringInput(e.target.value),
                    },
                  })
                }
                className="mt-1 w-full border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 placeholder:font-mono placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
