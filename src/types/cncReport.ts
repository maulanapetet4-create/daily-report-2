export type SheetValueNumOrStr = number | string | null;

export interface SheetRowNumeric {
  sheet_1: number | string | null;
  sheet_2: number | string | null;
  sheet_3: number | string | null;
  sheet_4: number | string | null;
  sheet_5: number | string | null;
  sheet_6: number | string | null;
  total: number | string | null;
}

export interface SheetRowString {
  sheet_1: string | number | null;
  sheet_2: string | number | null;
  sheet_3: string | number | null;
  sheet_4: string | number | null;
  sheet_5: string | number | null;
  sheet_6: string | number | null;
  total: string | number | null;
}

export interface CycleTimeMachine {
  waktu_proses_produksi: SheetRowNumeric;
  delay_waiting_time: SheetRowNumeric;
  setup_time: SheetRowNumeric;
  waktu_inspeksi_perbaikan: SheetRowNumeric;
  diverifikasi_oleh: string | null;
}

export interface PemotonganMachine {
  nama_produk: SheetRowString;
  jenis_material: SheetRowString;
  total_komponen: SheetRowNumeric;
  jenis_potongan: SheetRowString;
  kualitas_hasil_potong: SheetRowString;
  diverifikasi_oleh: string | null;
}

export interface MaterialItem {
  no: number;
  jenis_material: string;
  lembar: number | string | null;
  sisa: number | string | null;
}

export interface DimensiItem {
  sheet: number;
  panjang_mm: number | string | null;
  lebar_mm: number | string | null;
  tebal: number | string | null;
}

export interface CncDailyReport {
  metadata: {
    nomor_dokumen: string;
    revisi: string;
    tanggal_efektif: string;
    halaman: string;
    judul_form: string;
    departement: string;
    produksi: string;
    nama_operator: string | null;
    shift: string | null;
    hari_tanggal: string | null;
    project: string | null;
    sosa_no: string | null;
    jam_kerja: {
      mulai: string | null;
      selesai: string | null;
    };
  };
  kesiapan_jalur: {
    volume_pengisian_oli_ml: number | null;
    level_oli: 'Rendah' | 'Normal' | 'Diatas Normal' | string | null;
    tanggal_pergantian_mata_pisau: string | null;
    jenis_mata_pisau: 'Vcut' | 'End Mill 3mm' | 'End Mill 6mm' | string | null;
  };
  cycle_time: {
    mesin_cnc_quick_putih: CycleTimeMachine;
    mesin_cnc_tekma_biru: CycleTimeMachine;
    keterangan: string | null;
  };
  pemotongan_sheet_material: {
    mesin_cnc_quick_putih: PemotonganMachine;
    mesin_cnc_tekma_biru: PemotonganMachine;
    keterangan: string | null;
  };
  pengambilan_material: {
    tabel_material: MaterialItem[];
    diverifikasi_oleh: string | null;
  };
  dimensi_hasil_potong: {
    tabel_dimensi: DimensiItem[];
    diverifikasi_oleh: string | null;
  };
  informasi_tambahan: {
    pekerjaan_lainnya: string | null;
    pesan_informasi: string | null;
    kendala: string | null;
  };
  persetujuan: {
    disusun_oleh: string | null;
    diketahui_oleh: string | null;
    disetujui_oleh: string | null;
  };
}

export interface SavedExtractionRecord {
  id: string;
  extractedAt: string;
  sourceFileName: string;
  confidenceNote: string;
  filledFieldsCount: number;
  nullFieldsCount: number;
  data: CncDailyReport;
}

export function createEmptySheetRow(): SheetRowNumeric {
  return {
    sheet_1: null,
    sheet_2: null,
    sheet_3: null,
    sheet_4: null,
    sheet_5: null,
    sheet_6: null,
    total: null,
  };
}

export function createEmptyCycleTimeMachine(): CycleTimeMachine {
  return {
    waktu_proses_produksi: createEmptySheetRow(),
    delay_waiting_time: createEmptySheetRow(),
    setup_time: createEmptySheetRow(),
    waktu_inspeksi_perbaikan: createEmptySheetRow(),
    diverifikasi_oleh: null,
  };
}

export function createEmptyPemotonganMachine(): PemotonganMachine {
  return {
    nama_produk: createEmptySheetRow(),
    jenis_material: createEmptySheetRow(),
    total_komponen: createEmptySheetRow(),
    jenis_potongan: createEmptySheetRow(),
    kualitas_hasil_potong: createEmptySheetRow(),
    diverifikasi_oleh: null,
  };
}

export function createEmptyCncReport(): CncDailyReport {
  return {
    metadata: {
      nomor_dokumen: 'F-PRD-003',
      revisi: '02',
      tanggal_efektif: '27-03-2026',
      halaman: '1 dari 1',
      judul_form: 'LAPORAN HARIAN DATA MESIN CNC',
      departement: 'CNC',
      produksi: 'CNC',
      nama_operator: null,
      shift: null,
      hari_tanggal: null,
      project: null,
      sosa_no: null,
      jam_kerja: {
        mulai: null,
        selesai: null,
      },
    },
    kesiapan_jalur: {
      volume_pengisian_oli_ml: null,
      level_oli: null,
      tanggal_pergantian_mata_pisau: null,
      jenis_mata_pisau: null,
    },
    cycle_time: {
      mesin_cnc_quick_putih: createEmptyCycleTimeMachine(),
      mesin_cnc_tekma_biru: createEmptyCycleTimeMachine(),
      keterangan: null,
    },
    pemotongan_sheet_material: {
      mesin_cnc_quick_putih: createEmptyPemotonganMachine(),
      mesin_cnc_tekma_biru: createEmptyPemotonganMachine(),
      keterangan: null,
    },
    pengambilan_material: {
      tabel_material: [
        { no: 1, jenis_material: 'PP 6 mm', lembar: null, sisa: null },
        { no: 2, jenis_material: 'PP 8 mm', lembar: null, sisa: null },
        { no: 3, jenis_material: 'PP 10 mm', lembar: null, sisa: null },
        { no: 4, jenis_material: 'Lain-lain', lembar: null, sisa: null },
      ],
      diverifikasi_oleh: null,
    },
    dimensi_hasil_potong: {
      tabel_dimensi: [
        { sheet: 1, panjang_mm: null, lebar_mm: null, tebal: null },
        { sheet: 2, panjang_mm: null, lebar_mm: null, tebal: null },
        { sheet: 3, panjang_mm: null, lebar_mm: null, tebal: null },
        { sheet: 4, panjang_mm: null, lebar_mm: null, tebal: null },
        { sheet: 5, panjang_mm: null, lebar_mm: null, tebal: null },
        { sheet: 6, panjang_mm: null, lebar_mm: null, tebal: null },
      ],
      diverifikasi_oleh: null,
    },
    informasi_tambahan: {
      pekerjaan_lainnya: null,
      pesan_informasi: null,
      kendala: null,
    },
    persetujuan: {
      disusun_oleh: null,
      diketahui_oleh: 'Mulyana',
      disetujui_oleh: 'Arifin',
    },
  };
}

function cleanScalar(val: unknown): string | number | null {
  if (val === undefined || val === null) return null;
  if (typeof val === 'number') {
    return Number.isNaN(val) ? null : val;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (
      trimmed === '' ||
      trimmed === '-' ||
      trimmed.toLowerCase() === 'null' ||
      trimmed.toLowerCase() === 'string atau null' ||
      trimmed.toLowerCase() === 'number atau null'
    ) {
      return null;
    }
    return trimmed;
  }
  return String(val);
}

function cleanStringOrNull(val: unknown, fallback: string | null = null): string | null {
  const cleaned = cleanScalar(val);
  if (cleaned === null) return fallback;
  return String(cleaned);
}

function cleanNumberOrNull(val: unknown): number | null {
  const cleaned = cleanScalar(val);
  if (cleaned === null) return null;
  if (typeof cleaned === 'number') return cleaned;
  const parsed = Number(String(cleaned).replace(',', '.').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeSheetRow(raw: unknown): SheetRowNumeric {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    sheet_1: cleanScalar(r.sheet_1),
    sheet_2: cleanScalar(r.sheet_2),
    sheet_3: cleanScalar(r.sheet_3),
    sheet_4: cleanScalar(r.sheet_4),
    sheet_5: cleanScalar(r.sheet_5),
    sheet_6: cleanScalar(r.sheet_6),
    total: cleanScalar(r.total),
  };
}

function normalizeCycleMachine(raw: unknown): CycleTimeMachine {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    waktu_proses_produksi: normalizeSheetRow(r.waktu_proses_produksi),
    delay_waiting_time: normalizeSheetRow(r.delay_waiting_time),
    setup_time: normalizeSheetRow(r.setup_time),
    waktu_inspeksi_perbaikan: normalizeSheetRow(r.waktu_inspeksi_perbaikan),
    diverifikasi_oleh: cleanStringOrNull(r.diverifikasi_oleh),
  };
}

function normalizeMaterialCell(val: unknown): string | number | null {
  const cleaned = cleanScalar(val);
  if (cleaned === null) return null;
  const s = String(cleaned).trim();
  if (/^(polypropilen|polypropylene|polipropilen|polipropilena|pp(\s+sheet)?)$/i.test(s)) {
    return 'Polypropilen';
  }
  return cleaned;
}

function normalizePemotonganMachine(raw: unknown): PemotonganMachine {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const rawMat = normalizeSheetRow(r.jenis_material);
  const normalizedMat: SheetRowString = {
    sheet_1: normalizeMaterialCell(rawMat.sheet_1),
    sheet_2: normalizeMaterialCell(rawMat.sheet_2),
    sheet_3: normalizeMaterialCell(rawMat.sheet_3),
    sheet_4: normalizeMaterialCell(rawMat.sheet_4),
    sheet_5: normalizeMaterialCell(rawMat.sheet_5),
    sheet_6: normalizeMaterialCell(rawMat.sheet_6),
    total: normalizeMaterialCell(rawMat.total),
  };
  return {
    nama_produk: normalizeSheetRow(r.nama_produk),
    jenis_material: normalizedMat,
    total_komponen: normalizeSheetRow(r.total_komponen),
    jenis_potongan: normalizeSheetRow(r.jenis_potongan),
    kualitas_hasil_potong: normalizeSheetRow(r.kualitas_hasil_potong),
    diverifikasi_oleh: cleanStringOrNull(r.diverifikasi_oleh),
  };
}

export function normalizeToStrictCncReport(raw: unknown): CncDailyReport {
  const empty = createEmptyCncReport();
  if (!raw || typeof raw !== 'object') return empty;
  const obj = raw as Record<string, any>;

  const meta = obj.metadata || {};
  const jam = meta.jam_kerja || {};
  const kesiapan = obj.kesiapan_jalur || {};
  const cycle = obj.cycle_time || {};
  const potong = obj.pemotongan_sheet_material || {};
  const mat = obj.pengambilan_material || {};
  const dim = obj.dimensi_hasil_potong || {};
  const info = obj.informasi_tambahan || {};
  const setuju = obj.persetujuan || {};

  const defaultMaterialNames = ['PP 6 mm', 'PP 8 mm', 'PP 10 mm', 'Lain-lain'];
  const rawTabelMat = Array.isArray(mat.tabel_material) ? mat.tabel_material : [];
  const rowCount = Math.max(4, rawTabelMat.length);
  const tabel_material: MaterialItem[] = Array.from({ length: rowCount }, (_, idx) => {
    const item = rawTabelMat[idx] || {};
    const fallbackName = defaultMaterialNames[idx] || 'Lain-lain';
    return {
      no: idx + 1,
      jenis_material:
        cleanStringOrNull(item.jenis_material, fallbackName) ?? fallbackName,
      lembar: cleanScalar(item.lembar),
      sisa: cleanScalar(item.sisa),
    };
  });

  const rawTabelDim = Array.isArray(dim.tabel_dimensi) ? dim.tabel_dimensi : [];
  const tabel_dimensi: DimensiItem[] = [0, 1, 2, 3, 4, 5].map((idx) => {
    const item = rawTabelDim[idx] || {};
    return {
      sheet: idx + 1,
      panjang_mm: cleanScalar(item.panjang_mm),
      lebar_mm: cleanScalar(item.lebar_mm),
      tebal: cleanScalar(item.tebal),
    };
  });

  return {
    metadata: {
      nomor_dokumen: cleanStringOrNull(meta.nomor_dokumen, 'F-PRD-003') || 'F-PRD-003',
      revisi: cleanStringOrNull(meta.revisi, '02') || '02',
      tanggal_efektif: cleanStringOrNull(meta.tanggal_efektif, '27-03-2026') || '27-03-2026',
      halaman: cleanStringOrNull(meta.halaman, '1 dari 1') || '1 dari 1',
      judul_form: cleanStringOrNull(meta.judul_form, 'LAPORAN HARIAN DATA MESIN CNC') || 'LAPORAN HARIAN DATA MESIN CNC',
      departement: cleanStringOrNull(meta.departement, 'CNC') || 'CNC',
      produksi: cleanStringOrNull(meta.produksi, 'CNC') || 'CNC',
      nama_operator: cleanStringOrNull(meta.nama_operator),
      shift: cleanStringOrNull(meta.shift),
      hari_tanggal: cleanStringOrNull(meta.hari_tanggal),
      project: cleanStringOrNull(meta.project),
      sosa_no: cleanStringOrNull(meta.sosa_no),
      jam_kerja: {
        mulai: cleanStringOrNull(jam.mulai),
        selesai: cleanStringOrNull(jam.selesai),
      },
    },
    kesiapan_jalur: {
      volume_pengisian_oli_ml: cleanNumberOrNull(kesiapan.volume_pengisian_oli_ml),
      level_oli: cleanStringOrNull(kesiapan.level_oli),
      tanggal_pergantian_mata_pisau: cleanStringOrNull(kesiapan.tanggal_pergantian_mata_pisau),
      jenis_mata_pisau: cleanStringOrNull(kesiapan.jenis_mata_pisau),
    },
    cycle_time: {
      mesin_cnc_quick_putih: normalizeCycleMachine(cycle.mesin_cnc_quick_putih),
      mesin_cnc_tekma_biru: normalizeCycleMachine(cycle.mesin_cnc_tekma_biru),
      keterangan: cleanStringOrNull(cycle.keterangan),
    },
    pemotongan_sheet_material: {
      mesin_cnc_quick_putih: normalizePemotonganMachine(potong.mesin_cnc_quick_putih),
      mesin_cnc_tekma_biru: normalizePemotonganMachine(potong.mesin_cnc_tekma_biru),
      keterangan: cleanStringOrNull(potong.keterangan),
    },
    pengambilan_material: {
      tabel_material,
      diverifikasi_oleh: cleanStringOrNull(mat.diverifikasi_oleh),
    },
    dimensi_hasil_potong: {
      tabel_dimensi,
      diverifikasi_oleh: cleanStringOrNull(dim.diverifikasi_oleh),
    },
    informasi_tambahan: {
      pekerjaan_lainnya: cleanStringOrNull(info.pekerjaan_lainnya),
      pesan_informasi: cleanStringOrNull(info.pesan_informasi),
      kendala: cleanStringOrNull(info.kendala),
    },
    persetujuan: {
      disusun_oleh: cleanStringOrNull(setuju.disusun_oleh),
      diketahui_oleh: cleanStringOrNull(setuju.diketahui_oleh, 'Mulyana') || 'Mulyana',
      disetujui_oleh: cleanStringOrNull(setuju.disetujui_oleh, 'Arifin') || 'Arifin',
    },
  };
}

export function countReportStats(report: CncDailyReport): { filled: number; nulls: number; total: number } {
  let filled = 0;
  let nulls = 0;

  function walk(val: unknown) {
    if (val === null || val === undefined) {
      nulls++;
      return;
    }
    if (Array.isArray(val)) {
      val.forEach(walk);
      return;
    }
    if (typeof val === 'object') {
      Object.values(val as Record<string, unknown>).forEach(walk);
      return;
    }
    filled++;
  }

  walk(report);
  return { filled, nulls, total: filled + nulls };
}

export interface SampleFormPreset {
  id: string;
  label: string;
  subtitle: string;
  report: CncDailyReport;
}

export const SAMPLE_FORM_PRESETS: SampleFormPreset[] = [
  {
    id: 'shift-1-fume-hood',
    label: 'Sampel 1 · Shift Pagi (Fume Hood Lab Kimia)',
    subtitle: 'Operator: Hendra Saputra · SOSA-2026-0412 · CNC Quick & Tekma Aktif',
    report: {
      metadata: {
        nomor_dokumen: 'F-PRD-003',
        revisi: '02',
        tanggal_efektif: '27-03-2026',
        halaman: '1 dari 1',
        judul_form: 'LAPORAN HARIAN DATA MESIN CNC',
        departement: 'CNC',
        produksi: 'CNC',
        nama_operator: 'Hendra Saputra',
        shift: 'Shift 1 (Pagi)',
        hari_tanggal: 'Senin, 06-04-2026',
        project: 'Fume Hood & Island Bench Lab Farmasi UI',
        sosa_no: 'SOSA-2026-0412',
        jam_kerja: {
          mulai: '08:00',
          selesai: '17:00',
        },
      },
      kesiapan_jalur: {
        volume_pengisian_oli_ml: 250,
        level_oli: 'Normal',
        tanggal_pergantian_mata_pisau: '04-04-2026',
        jenis_mata_pisau: 'End Mill 6mm',
      },
      cycle_time: {
        mesin_cnc_quick_putih: {
          waktu_proses_produksi: { sheet_1: 24, sheet_2: 26, sheet_3: 25, sheet_4: 24, sheet_5: null, sheet_6: null, total: 99 },
          delay_waiting_time: { sheet_1: 3, sheet_2: 0, sheet_3: 4, sheet_4: 0, sheet_5: null, sheet_6: null, total: 7 },
          setup_time: { sheet_1: 12, sheet_2: 5, sheet_3: 5, sheet_4: 5, sheet_5: null, sheet_6: null, total: 27 },
          waktu_inspeksi_perbaikan: { sheet_1: 4, sheet_2: 3, sheet_3: 3, sheet_4: 4, sheet_5: null, sheet_6: null, total: 14 },
          diverifikasi_oleh: 'Mulyana',
        },
        mesin_cnc_tekma_biru: {
          waktu_proses_produksi: { sheet_1: 28, sheet_2: 27, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: 55 },
          delay_waiting_time: { sheet_1: 2, sheet_2: 2, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: 4 },
          setup_time: { sheet_1: 10, sheet_2: 6, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: 16 },
          waktu_inspeksi_perbaikan: { sheet_1: 3, sheet_2: 3, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: 6 },
          diverifikasi_oleh: 'Mulyana',
        },
        keterangan: 'Sheet 5 & 6 tidak diproses karena kuota komponen kabinet atas sudah terpenuhi di Sheet 4.',
      },
      pemotongan_sheet_material: {
        mesin_cnc_quick_putih: {
          nama_produk: { sheet_1: 'Side Panel FH-120', sheet_2: 'Side Panel FH-120', sheet_3: 'Top Baffle FH', sheet_4: 'Base Cabinet L1', sheet_5: null, sheet_6: null, total: '4 Sheet' },
          jenis_material: { sheet_1: 'Polypropilen', sheet_2: 'Polypropilen', sheet_3: 'Polypropilen', sheet_4: 'Polypropilen', sheet_5: null, sheet_6: null, total: null },
          total_komponen: { sheet_1: 8, sheet_2: 8, sheet_3: 14, sheet_4: 10, sheet_5: null, sheet_6: null, total: 40 },
          jenis_potongan: { sheet_1: 'Through Cut', sheet_2: 'Through Cut', sheet_3: 'Groove & Cut', sheet_4: 'Pocket & Cut', sheet_5: null, sheet_6: null, total: null },
          kualitas_hasil_potong: { sheet_1: 'OK', sheet_2: 'OK', sheet_3: 'OK', sheet_4: 'OK', sheet_5: null, sheet_6: null, total: '100% OK' },
          diverifikasi_oleh: 'Mulyana',
        },
        mesin_cnc_tekma_biru: {
          nama_produk: { sheet_1: 'Pintu Kabinet Reagen', sheet_2: 'Sekat Laci Lab', sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: '2 Sheet' },
          jenis_material: { sheet_1: 'Polypropilen', sheet_2: 'Polypropilen', sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          total_komponen: { sheet_1: 12, sheet_2: 16, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: 28 },
          jenis_potongan: { sheet_1: 'Through Cut', sheet_2: 'Through Cut', sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          kualitas_hasil_potong: { sheet_1: 'OK', sheet_2: 'OK', sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: '100% OK' },
          diverifikasi_oleh: 'Mulyana',
        },
        keterangan: 'Material menggunakan Polypropilen tahan kimia. Presisi sudut potong sesuai gambar kerja.',
      },
      pengambilan_material: {
        tabel_material: [
          { no: 1, jenis_material: 'PP 6 mm', lembar: 1, sisa: 0 },
          { no: 2, jenis_material: 'PP 8 mm', lembar: 3, sisa: 0.5 },
          { no: 3, jenis_material: 'PP 10 mm', lembar: 2, sisa: 0 },
          { no: 4, jenis_material: 'PP 12 mm (Kostum)', lembar: 1, sisa: 0.25 },
        ],
        diverifikasi_oleh: 'Mulyana',
      },
      dimensi_hasil_potong: {
        tabel_dimensi: [
          { sheet: 1, panjang_mm: 2440, lebar_mm: 1220, tebal: 8 },
          { sheet: 2, panjang_mm: 2440, lebar_mm: 1220, tebal: 8 },
          { sheet: 3, panjang_mm: 2440, lebar_mm: 1220, tebal: 6 },
          { sheet: 4, panjang_mm: 2440, lebar_mm: 1220, tebal: 10 },
          { sheet: 5, panjang_mm: 1800, lebar_mm: 900, tebal: 8 },
          { sheet: 6, panjang_mm: null, lebar_mm: null, tebal: null },
        ],
        diverifikasi_oleh: 'Mulyana',
      },
      informasi_tambahan: {
        pekerjaan_lainnya: 'Pembersihan jalur vakum meja CNC Quick dan kalibrasi titik nol Z-axis.',
        pesan_informasi: 'Stok mata pisau End Mill 6mm tersisa 2 pcs di tool cabinet.',
        kendala: 'Tekanan angin kompresor sempat turun 10 menit pukul 10:15 namun kembali stabil.',
      },
      persetujuan: {
        disusun_oleh: 'Hendra Saputra',
        diketahui_oleh: 'Mulyana',
        disetujui_oleh: 'Arifin',
      },
    },
  },
  {
    id: 'shift-2-biosafety',
    label: 'Sampel 2 · Shift Sore (Meja Timbang Anti-Vibrasi)',
    subtitle: 'Operator: Rizky Pratama · SOSA-2026-0419 · 6 Sheet Penuh di CNC Quick',
    report: {
      metadata: {
        nomor_dokumen: 'F-PRD-003',
        revisi: '02',
        tanggal_efektif: '27-03-2026',
        halaman: '1 dari 1',
        judul_form: 'LAPORAN HARIAN DATA MESIN CNC',
        departement: 'CNC',
        produksi: 'CNC',
        nama_operator: 'Rizky Pratama',
        shift: 'Shift 2 (Sore)',
        hari_tanggal: 'Selasa, 07-04-2026',
        project: 'Balance Table & Wall Cabinet Lab Kalibrasi BBLK',
        sosa_no: 'SOSA-2026-0419',
        jam_kerja: {
          mulai: '16:00',
          selesai: '23:30',
        },
      },
      kesiapan_jalur: {
        volume_pengisian_oli_ml: 180,
        level_oli: 'Diatas Normal',
        tanggal_pergantian_mata_pisau: '07-04-2026',
        jenis_mata_pisau: 'End Mill 3mm',
      },
      cycle_time: {
        mesin_cnc_quick_putih: {
          waktu_proses_produksi: { sheet_1: 20, sheet_2: 22, sheet_3: 21, sheet_4: 20, sheet_5: 23, sheet_6: 19, total: 125 },
          delay_waiting_time: { sheet_1: 0, sheet_2: 0, sheet_3: 5, sheet_4: 0, sheet_5: 2, sheet_6: 0, total: 7 },
          setup_time: { sheet_1: 10, sheet_2: 4, sheet_3: 4, sheet_4: 4, sheet_5: 4, sheet_6: 4, total: 30 },
          waktu_inspeksi_perbaikan: { sheet_1: 3, sheet_2: 2, sheet_3: 3, sheet_4: 2, sheet_5: 3, sheet_6: 2, total: 15 },
          diverifikasi_oleh: 'Mulyana',
        },
        mesin_cnc_tekma_biru: {
          waktu_proses_produksi: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          delay_waiting_time: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          setup_time: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          waktu_inspeksi_perbaikan: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          diverifikasi_oleh: null,
        },
        keterangan: 'Mesin CNC Tekma (Biru) sedang jadwal preventive maintenance bulanan.',
      },
      pemotongan_sheet_material: {
        mesin_cnc_quick_putih: {
          nama_produk: { sheet_1: 'Frame Meja Timbang', sheet_2: 'Frame Meja Timbang', sheet_3: 'Panel Belakang', sheet_4: 'Ambalan Rak', sheet_5: 'Pintu Geser', sheet_6: 'Cover Ducting', total: '6 Sheet' },
          jenis_material: { sheet_1: 'Polypropilen', sheet_2: 'Polypropilen', sheet_3: 'Polypropilen', sheet_4: 'Polypropilen', sheet_5: 'Polypropilen', sheet_6: 'Polypropilen', total: null },
          total_komponen: { sheet_1: 6, sheet_2: 6, sheet_3: 10, sheet_4: 12, sheet_5: 8, sheet_6: 14, total: 56 },
          jenis_potongan: { sheet_1: 'Bevel & Cut', sheet_2: 'Bevel & Cut', sheet_3: 'Through Cut', sheet_4: 'Dato & Cut', sheet_5: 'Pocket & Cut', sheet_6: 'Through Cut', total: null },
          kualitas_hasil_potong: { sheet_1: 'OK', sheet_2: 'OK', sheet_3: 'OK', sheet_4: 'OK', sheet_5: 'OK', sheet_6: 'OK', total: 'OK Semua' },
          diverifikasi_oleh: 'Mulyana',
        },
        mesin_cnc_tekma_biru: {
          nama_produk: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          jenis_material: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          total_komponen: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          jenis_potongan: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          kualitas_hasil_potong: { sheet_1: null, sheet_2: null, sheet_3: null, sheet_4: null, sheet_5: null, sheet_6: null, total: null },
          diverifikasi_oleh: null,
        },
        keterangan: 'Seluruh pekerjaan pemotongan sheet Polypropilen dialihkan ke CNC Quick Putih.',
      },
      pengambilan_material: {
        tabel_material: [
          { no: 1, jenis_material: 'PP 6 mm', lembar: 2, sisa: 0 },
          { no: 2, jenis_material: 'PP 8 mm', lembar: 2, sisa: 0 },
          { no: 3, jenis_material: 'PP 10 mm', lembar: 2, sisa: 0.25 },
          { no: 4, jenis_material: 'Lain-lain', lembar: null, sisa: null },
        ],
        diverifikasi_oleh: 'Mulyana',
      },
      dimensi_hasil_potong: {
        tabel_dimensi: [
          { sheet: 1, panjang_mm: 2440, lebar_mm: 1220, tebal: 10 },
          { sheet: 2, panjang_mm: 2440, lebar_mm: 1220, tebal: 10 },
          { sheet: 3, panjang_mm: 2440, lebar_mm: 1220, tebal: 6 },
          { sheet: 4, panjang_mm: 2440, lebar_mm: 1220, tebal: 8 },
          { sheet: 5, panjang_mm: 2440, lebar_mm: 1220, tebal: 8 },
          { sheet: 6, panjang_mm: 2440, lebar_mm: 1220, tebal: 6 },
        ],
        diverifikasi_oleh: 'Mulyana',
      },
      informasi_tambahan: {
        pekerjaan_lainnya: 'Sorting dan labeling barcode komponen untuk divisi Edging.',
        pesan_informasi: 'Mohon tim gudang siapkan Plywood 18mm 10 lembar untuk jadwal besok pagi.',
        kendala: null,
      },
      persetujuan: {
        disusun_oleh: 'Rizky Pratama',
        diketahui_oleh: 'Mulyana',
        disetujui_oleh: 'Arifin',
      },
    },
  },
];
