import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `# ROLE & TUJUAN SYSTEM
Anda adalah sistem OCR (Optical Character Recognition) Multimodal tingkat tinggi yang bertugas mengekstrak data dari formulir cetak "LAPORAN HARIAN DATA MESIN CNC" PT. Lab Teknologi Indonesia. Tugas utama Anda adalah membaca foto formulir yang diunggah oleh operator dan mengubah seluruh teks serta angka di dalamnya menjadi format JSON murni (Strict JSON) yang siap dimasukkan ke database Supabase.

# INSTRUKSI PROSES & ATURAN EKSTRAKSI DATA
1. Ekstrak data secara literal dan presisi berdasarkan apa yang tertulis pada gambar formulir.
2. Jika ada kolom, tabel, atau sel yang kosong (tidak diisi oleh operator), berikan nilai null. JANGAN PERNAH mengarang atau menebak data.
3. Untuk kolom pilihan/opsi (seperti Level Oli: Rendah/Normal/Diatas Normal atau Jenis Mata Pisau: Vcut/End Mill 3mm/End Mill 6mm), berikan nilai string sesuai opsi yang dicentang/disilang oleh operator.
4. Untuk kolom nama/jenis material, gunakan material "Polypropilen" (atau ketebalan spesifik seperti "PP 6 mm", "PP 8 mm", "PP 10 mm"). Pada tabel pengambilan_material, baris 1 adalah "PP 6 mm", baris 2 adalah "PP 8 mm", baris 3 adalah "PP 10 mm", dan baris 4 (atau baris tambahan) adalah material lainnya/kostum yang diisi manual oleh operator (jika operator menuliskan nama material kostum pada baris Lain-lain, ekstrak nama material kostum tersebut pada properti jenis_material).
5. Output harus berupa JSON murni. Jangan tambahkan teks pengantar seperti "Ini adalah hasil JSON Anda:" atau tanda petik backtick (\`\`\`json) di awal dan akhir respon. Cukup kembalikan objek JSON langsung dimulai dengan tanda kurung kurawal {.

# STRUKTUR JSON WAJIB (OUTPUT SCHEMA)
{
  "metadata": {
    "nomor_dokumen": "F-PRD-003",
    "revisi": "02",
    "tanggal_efektif": "27-03-2026",
    "halaman": "1 dari 1",
    "judul_form": "LAPORAN HARIAN DATA MESIN CNC",
    "departement": "CNC",
    "produksi": "CNC",
    "nama_operator": null,
    "shift": null,
    "hari_tanggal": null,
    "project": null,
    "sosa_no": null,
    "jam_kerja": {
      "mulai": null,
      "selesai": null
    }
  },
  "kesiapan_jalur": {
    "volume_pengisian_oli_ml": null,
    "level_oli": null,
    "tanggal_pergantian_mata_pisau": null,
    "jenis_mata_pisau": null
  },
  "cycle_time": {
    "mesin_cnc_quick_putih": {
      "waktu_proses_produksi": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "delay_waiting_time": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "setup_time": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "waktu_inspeksi_perbaikan": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "diverifikasi_oleh": null
    },
    "mesin_cnc_tekma_biru": {
      "waktu_proses_produksi": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "delay_waiting_time": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "setup_time": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "waktu_inspeksi_perbaikan": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "diverifikasi_oleh": null
    },
    "keterangan": null
  },
  "pemotongan_sheet_material": {
    "mesin_cnc_quick_putih": {
      "nama_produk": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "jenis_material": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "total_komponen": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "jenis_potongan": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "kualitas_hasil_potong": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "diverifikasi_oleh": null
    },
    "mesin_cnc_tekma_biru": {
      "nama_produk": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "jenis_material": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "total_komponen": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "jenis_potongan": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "kualitas_hasil_potong": {"sheet_1": null, "sheet_2": null, "sheet_3": null, "sheet_4": null, "sheet_5": null, "sheet_6": null, "total": null},
      "diverifikasi_oleh": null
    },
    "keterangan": null
  },
  "pengambilan_material": {
    "tabel_material": [
      {"no": 1, "jenis_material": "PP 6 mm", "lembar": null, "sisa": null},
      {"no": 2, "jenis_material": "PP 8 mm", "lembar": null, "sisa": null},
      {"no": 3, "jenis_material": "PP 10 mm", "lembar": null, "sisa": null},
      {"no": 4, "jenis_material": "Lain-lain", "lembar": null, "sisa": null}
    ],
    "diverifikasi_oleh": null
  },
  "dimensi_hasil_potong": {
    "tabel_dimensi": [
      {"sheet": 1, "panjang_mm": null, "lebar_mm": null, "tebal": null},
      {"sheet": 2, "panjang_mm": null, "lebar_mm": null, "tebal": null},
      {"sheet": 3, "panjang_mm": null, "lebar_mm": null, "tebal": null},
      {"sheet": 4, "panjang_mm": null, "lebar_mm": null, "tebal": null},
      {"sheet": 5, "panjang_mm": null, "lebar_mm": null, "tebal": null},
      {"sheet": 6, "panjang_mm": null, "lebar_mm": null, "tebal": null}
    ],
    "diverifikasi_oleh": null
  },
  "informasi_tambahan": {
    "pekerjaan_lainnya": null,
    "pesan_informasi": null,
    "kendala": null
  },
  "persetujuan": {
    "disusun_oleh": null,
    "diketahui_oleh": "Mulyana",
    "disetujui_oleh": "Arifin"
  }
}`;

function createSheetRowNumericSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      sheet_1: { type: Type.NUMBER, nullable: true },
      sheet_2: { type: Type.NUMBER, nullable: true },
      sheet_3: { type: Type.NUMBER, nullable: true },
      sheet_4: { type: Type.NUMBER, nullable: true },
      sheet_5: { type: Type.NUMBER, nullable: true },
      sheet_6: { type: Type.NUMBER, nullable: true },
      total: { type: Type.NUMBER, nullable: true },
    },
    required: ['sheet_1', 'sheet_2', 'sheet_3', 'sheet_4', 'sheet_5', 'sheet_6', 'total'],
  };
}

function createSheetRowStringSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      sheet_1: { type: Type.STRING, nullable: true },
      sheet_2: { type: Type.STRING, nullable: true },
      sheet_3: { type: Type.STRING, nullable: true },
      sheet_4: { type: Type.STRING, nullable: true },
      sheet_5: { type: Type.STRING, nullable: true },
      sheet_6: { type: Type.STRING, nullable: true },
      total: { type: Type.STRING, nullable: true },
    },
    required: ['sheet_1', 'sheet_2', 'sheet_3', 'sheet_4', 'sheet_5', 'sheet_6', 'total'],
  };
}

function createCycleMachineSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      waktu_proses_produksi: createSheetRowNumericSchema(),
      delay_waiting_time: createSheetRowNumericSchema(),
      setup_time: createSheetRowNumericSchema(),
      waktu_inspeksi_perbaikan: createSheetRowNumericSchema(),
      diverifikasi_oleh: { type: Type.STRING, nullable: true },
    },
    required: [
      'waktu_proses_produksi',
      'delay_waiting_time',
      'setup_time',
      'waktu_inspeksi_perbaikan',
      'diverifikasi_oleh',
    ],
  };
}

function createPemotonganMachineSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      nama_produk: createSheetRowStringSchema(),
      jenis_material: createSheetRowStringSchema(),
      total_komponen: createSheetRowNumericSchema(),
      jenis_potongan: createSheetRowStringSchema(),
      kualitas_hasil_potong: createSheetRowStringSchema(),
      diverifikasi_oleh: { type: Type.STRING, nullable: true },
    },
    required: [
      'nama_produk',
      'jenis_material',
      'total_komponen',
      'jenis_potongan',
      'kualitas_hasil_potong',
      'diverifikasi_oleh',
    ],
  };
}

const CNC_REPORT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    metadata: {
      type: Type.OBJECT,
      properties: {
        nomor_dokumen: { type: Type.STRING },
        revisi: { type: Type.STRING },
        tanggal_efektif: { type: Type.STRING },
        halaman: { type: Type.STRING },
        judul_form: { type: Type.STRING },
        departement: { type: Type.STRING },
        produksi: { type: Type.STRING },
        nama_operator: { type: Type.STRING, nullable: true },
        shift: { type: Type.STRING, nullable: true },
        hari_tanggal: { type: Type.STRING, nullable: true },
        project: { type: Type.STRING, nullable: true },
        sosa_no: { type: Type.STRING, nullable: true },
        jam_kerja: {
          type: Type.OBJECT,
          properties: {
            mulai: { type: Type.STRING, nullable: true },
            selesai: { type: Type.STRING, nullable: true },
          },
          required: ['mulai', 'selesai'],
        },
      },
      required: [
        'nomor_dokumen',
        'revisi',
        'tanggal_efektif',
        'halaman',
        'judul_form',
        'departement',
        'produksi',
        'nama_operator',
        'shift',
        'hari_tanggal',
        'project',
        'sosa_no',
        'jam_kerja',
      ],
    },
    kesiapan_jalur: {
      type: Type.OBJECT,
      properties: {
        volume_pengisian_oli_ml: { type: Type.NUMBER, nullable: true },
        level_oli: { type: Type.STRING, nullable: true },
        tanggal_pergantian_mata_pisau: { type: Type.STRING, nullable: true },
        jenis_mata_pisau: { type: Type.STRING, nullable: true },
      },
      required: [
        'volume_pengisian_oli_ml',
        'level_oli',
        'tanggal_pergantian_mata_pisau',
        'jenis_mata_pisau',
      ],
    },
    cycle_time: {
      type: Type.OBJECT,
      properties: {
        mesin_cnc_quick_putih: createCycleMachineSchema(),
        mesin_cnc_tekma_biru: createCycleMachineSchema(),
        keterangan: { type: Type.STRING, nullable: true },
      },
      required: ['mesin_cnc_quick_putih', 'mesin_cnc_tekma_biru', 'keterangan'],
    },
    pemotongan_sheet_material: {
      type: Type.OBJECT,
      properties: {
        mesin_cnc_quick_putih: createPemotonganMachineSchema(),
        mesin_cnc_tekma_biru: createPemotonganMachineSchema(),
        keterangan: { type: Type.STRING, nullable: true },
      },
      required: ['mesin_cnc_quick_putih', 'mesin_cnc_tekma_biru', 'keterangan'],
    },
    pengambilan_material: {
      type: Type.OBJECT,
      properties: {
        tabel_material: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              no: { type: Type.INTEGER },
              jenis_material: { type: Type.STRING },
              lembar: { type: Type.NUMBER, nullable: true },
              sisa: { type: Type.NUMBER, nullable: true },
            },
            required: ['no', 'jenis_material', 'lembar', 'sisa'],
          },
        },
        diverifikasi_oleh: { type: Type.STRING, nullable: true },
      },
      required: ['tabel_material', 'diverifikasi_oleh'],
    },
    dimensi_hasil_potong: {
      type: Type.OBJECT,
      properties: {
        tabel_dimensi: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              sheet: { type: Type.INTEGER },
              panjang_mm: { type: Type.NUMBER, nullable: true },
              lebar_mm: { type: Type.NUMBER, nullable: true },
              tebal: { type: Type.NUMBER, nullable: true },
            },
            required: ['sheet', 'panjang_mm', 'lebar_mm', 'tebal'],
          },
        },
        diverifikasi_oleh: { type: Type.STRING, nullable: true },
      },
      required: ['tabel_dimensi', 'diverifikasi_oleh'],
    },
    informasi_tambahan: {
      type: Type.OBJECT,
      properties: {
        pekerjaan_lainnya: { type: Type.STRING, nullable: true },
        pesan_informasi: { type: Type.STRING, nullable: true },
        kendala: { type: Type.STRING, nullable: true },
      },
      required: ['pekerjaan_lainnya', 'pesan_informasi', 'kendala'],
    },
    persetujuan: {
      type: Type.OBJECT,
      properties: {
        disusun_oleh: { type: Type.STRING, nullable: true },
        diketahui_oleh: { type: Type.STRING, nullable: true },
        disetujui_oleh: { type: Type.STRING, nullable: true },
      },
      required: ['disusun_oleh', 'diketahui_oleh', 'disetujui_oleh'],
    },
  },
  required: [
    'metadata',
    'kesiapan_jalur',
    'cycle_time',
    'pemotongan_sheet_material',
    'pengambilan_material',
    'dimensi_hasil_potong',
    'informasi_tambahan',
    'persetujuan',
  ],
};

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak ditemukan pada environment server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // POST /api/ocr - Multimodal OCR extraction for F-PRD-003 Rev 02
  app.post('/api/ocr', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body || {};
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        res.status(400).json({ error: 'Data gambar (imageBase64) wajib disertakan.' });
        return;
      }

      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      const resolvedMime = mimeType || 'image/png';

      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: resolvedMime,
                data: cleanBase64,
              },
            },
            {
              text: 'Ekstrak seluruh data dari foto formulir cetak "LAPORAN HARIAN DATA MESIN CNC" (F-PRD-003 Rev 02) PT. Lab Teknologi Indonesia ini ke dalam objek JSON murni sesuai skema wajib. Kolom/sel kosong wajib bernilai null.',
            },
          ],
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: CNC_REPORT_RESPONSE_SCHEMA,
        },
      });

      const rawText = response.text || '{}';
      const cleanedText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(cleanedText);
      } catch {
        res.status(502).json({
          error: 'Respons model bukan JSON yang valid.',
          rawOutput: cleanedText,
        });
        return;
      }

      res.json({
        success: true,
        data: parsedJson,
      });
    } catch (error: any) {
      console.error('OCR Extraction Error:', error);
      res.status(500).json({
        error: error?.message || 'Terjadi kesalahan saat mengekstrak data formulir.',
      });
    }
  });

  // POST /api/supabase/insert - Optional proxy to insert extracted JSON into a real Supabase table
  app.post('/api/supabase/insert', async (req, res) => {
    try {
      const { supabaseUrl, supabaseKey, tableName, payload, mode } = req.body || {};
      if (!supabaseUrl || !supabaseKey || !tableName || !payload) {
        res.status(400).json({
          error: 'Parameter supabaseUrl, supabaseKey, tableName, dan payload wajib diisi.',
        });
        return;
      }

      const cleanUrl = String(supabaseUrl).replace(/\/+$/, '');
      const endpoint = `${cleanUrl}/rest/v1/${encodeURIComponent(String(tableName).trim())}`;

      // Support either flat column mapping or direct JSONB column insertion
      const rowBody =
        mode === 'normalized'
          ? {
              nomor_dokumen: payload.metadata?.nomor_dokumen ?? 'F-PRD-003',
              revisi: payload.metadata?.revisi ?? '02',
              nama_operator: payload.metadata?.nama_operator ?? null,
              shift: payload.metadata?.shift ?? null,
              hari_tanggal: payload.metadata?.hari_tanggal ?? null,
              project: payload.metadata?.project ?? null,
              sosa_no: payload.metadata?.sosa_no ?? null,
              metadata: payload.metadata,
              kesiapan_jalur: payload.kesiapan_jalur,
              cycle_time: payload.cycle_time,
              pemotongan_sheet_material: payload.pemotongan_sheet_material,
              pengambilan_material: payload.pengambilan_material,
              dimensi_hasil_potong: payload.dimensi_hasil_potong,
              informasi_tambahan: payload.informasi_tambahan,
              persetujuan: payload.persetujuan,
            }
          : payload;

      const supRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          apikey: String(supabaseKey),
          Authorization: `Bearer ${String(supabaseKey)}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify(rowBody),
      });

      const supText = await supRes.text();
      if (!supRes.ok) {
        res.status(supRes.status).json({
          error: `Supabase REST Error (${supRes.status}): ${supText}`,
        });
        return;
      }

      let supData: unknown = supText;
      try {
        supData = JSON.parse(supText);
      } catch {
        // leave as text
      }

      res.json({
        success: true,
        inserted: supData,
      });
    } catch (error: any) {
      res.status(500).json({
        error: error?.message || 'Gagal menghubungi endpoint Supabase.',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server OCR CNC PT. Lab Teknologi Indonesia berjalan pada port ${PORT}`);
  });
}

startServer();
