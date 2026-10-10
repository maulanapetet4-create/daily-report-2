import { CncDailyReport, SheetRowNumeric, SheetRowString } from '../types/cncReport';

export function renderCncFormToDataUrl(report: CncDailyReport): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Warm paper background with subtle texture feel
  ctx.fillStyle = '#fcfbf7';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer form border
  const margin = 40;
  const w = canvas.width - margin * 2;
  let y = margin;

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, w, canvas.height - margin * 2);

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    opts?: { font?: string; color?: string; align?: CanvasTextAlign }
  ) => {
    ctx.font = opts?.font || '13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = opts?.color || '#0f172a';
    ctx.textAlign = opts?.align || 'left';
    ctx.fillText(text, x, yPos);
  };

  const drawHandwritten = (
    val: string | number | null | undefined,
    x: number,
    yPos: number,
    align: CanvasTextAlign = 'left'
  ) => {
    if (val === null || val === undefined || val === '') return;
    ctx.font = 'italic 600 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#1d4ed8'; // Blue ballpoint pen ink
    ctx.textAlign = align;
    ctx.fillText(String(val), x, yPos);
  };

  // 1. HEADER BLOCK
  const headerH = 100;
  ctx.strokeRect(margin, y, w, headerH);
  // Left company column (320px), Center Title (w - 640px), Right Doc Info (320px)
  ctx.beginPath();
  ctx.moveTo(margin + 330, y);
  ctx.lineTo(margin + 330, y + headerH);
  ctx.moveTo(margin + w - 330, y);
  ctx.lineTo(margin + w - 330, y + headerH);
  ctx.stroke();

  drawText('PT. LAB TEKNOLOGI INDONESIA', margin + 18, y + 36, {
    font: 'bold 17px "Plus Jakarta Sans", sans-serif',
  });
  drawText('DIVISI MANUFAKTUR & FABRIKASI LAB', margin + 18, y + 60, {
    font: '12px "Plus Jakarta Sans", sans-serif',
    color: '#475569',
  });
  drawText('Departemen: CNC   |   Produksi: CNC', margin + 18, y + 82, {
    font: '600 12px "Plus Jakarta Sans", sans-serif',
  });

  drawText(report.metadata.judul_form || 'LAPORAN HARIAN DATA MESIN CNC', margin + w / 2, y + 48, {
    font: 'bold 22px "Plus Jakarta Sans", sans-serif',
    align: 'center',
  });
  drawText('FORMULIR KENDALI MUTU & PRODUKSI HARIAN', margin + w / 2, y + 74, {
    font: '12px "Plus Jakarta Sans", sans-serif',
    color: '#475569',
    align: 'center',
  });

  // Right document metadata rows
  const docX = margin + w - 330;
  const rowH = headerH / 4;
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(docX, y + rowH * i);
    ctx.lineTo(margin + w, y + rowH * i);
    ctx.stroke();
  }
  drawText(`No. Dokumen : ${report.metadata.nomor_dokumen}`, docX + 12, y + 18, {
    font: '600 12px "JetBrains Mono", monospace',
  });
  drawText(`Revisi       : ${report.metadata.revisi}`, docX + 12, y + 43, {
    font: '600 12px "JetBrains Mono", monospace',
  });
  drawText(`Tgl. Efektif : ${report.metadata.tanggal_efektif}`, docX + 12, y + 68, {
    font: '600 12px "JetBrains Mono", monospace',
  });
  drawText(`Halaman      : ${report.metadata.halaman}`, docX + 12, y + 93, {
    font: '600 12px "JetBrains Mono", monospace',
  });

  y += headerH;

  // 2. OPERATOR & SHIFT METADATA BLOCK
  const metaH = 85;
  ctx.strokeRect(margin, y, w, metaH);
  const colW = w / 3;

  drawText('Nama Operator :', margin + 16, y + 26, { font: '600 13px sans-serif' });
  drawHandwritten(report.metadata.nama_operator, margin + 135, y + 26);

  drawText('Shift :', margin + 16, y + 52, { font: '600 13px sans-serif' });
  drawHandwritten(report.metadata.shift, margin + 135, y + 52);

  drawText('Hari / Tanggal :', margin + 16, y + 76, { font: '600 13px sans-serif' });
  drawHandwritten(report.metadata.hari_tanggal, margin + 135, y + 76);

  drawText('Project :', margin + colW + 16, y + 26, { font: '600 13px sans-serif' });
  drawHandwritten(report.metadata.project, margin + colW + 90, y + 26);

  drawText('SOSA No :', margin + colW + 16, y + 52, { font: '600 13px sans-serif' });
  drawHandwritten(report.metadata.sosa_no, margin + colW + 90, y + 52);

  drawText('Jam Mulai :', margin + colW * 2 + 16, y + 26, { font: '600 13px sans-serif' });
  drawHandwritten(report.metadata.jam_kerja.mulai, margin + colW * 2 + 115, y + 26);

  drawText('Jam Selesai :', margin + colW * 2 + 16, y + 52, { font: '600 13px sans-serif' });
  drawHandwritten(report.metadata.jam_kerja.selesai, margin + colW * 2 + 115, y + 52);

  y += metaH;

  // 3. KESIAPAN JALur (LINE CLEARANCE)
  const drawSectionBar = (title: string, yPos: number) => {
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(margin, yPos, w, 28);
    ctx.strokeRect(margin, yPos, w, 28);
    drawText(title, margin + 14, yPos + 19, { font: 'bold 13px sans-serif' });
    return yPos + 28;
  };

  y = drawSectionBar('A. KESIAPAN JALUR (LINE CLEARANCE & TOOLING)', y);

  const kesiapanH = 68;
  ctx.strokeRect(margin, y, w, kesiapanH);

  drawText('1. Volume Pengisian Oli (ml) :', margin + 16, y + 26, { font: '600 13px sans-serif' });
  drawHandwritten(
    report.kesiapan_jalur.volume_pengisian_oli_ml !== null
      ? `${report.kesiapan_jalur.volume_pengisian_oli_ml}`
      : null,
    margin + 230,
    y + 26
  );

  drawText('2. Level Oli :', margin + 16, y + 54, { font: '600 13px sans-serif' });
  const oliOptions = ['Rendah', 'Normal', 'Diatas Normal'];
  oliOptions.forEach((opt, i) => {
    const bx = margin + 135 + i * 165;
    const by = y + 40;
    ctx.strokeRect(bx, by, 16, 16);
    if (report.kesiapan_jalur.level_oli?.toLowerCase() === opt.toLowerCase()) {
      drawHandwritten('X', bx + 4, by + 13);
    }
    drawText(opt, bx + 24, by + 13, { font: '13px sans-serif' });
  });

  drawText('3. Tgl Pergantian Mata Pisau :', margin + w / 2 + 20, y + 26, { font: '600 13px sans-serif' });
  drawHandwritten(report.kesiapan_jalur.tanggal_pergantian_mata_pisau, margin + w / 2 + 235, y + 26);

  drawText('4. Jenis Mata Pisau :', margin + w / 2 + 20, y + 54, { font: '600 13px sans-serif' });
  const pisauOptions = ['Vcut', 'End Mill 3mm', 'End Mill 6mm'];
  pisauOptions.forEach((opt, i) => {
    const bx = margin + w / 2 + 170 + i * 155;
    const by = y + 40;
    ctx.strokeRect(bx, by, 16, 16);
    if (report.kesiapan_jalur.jenis_mata_pisau?.toLowerCase() === opt.toLowerCase()) {
      drawHandwritten('X', bx + 4, by + 13);
    }
    drawText(opt, bx + 22, by + 13, { font: '13px sans-serif' });
  });

  y += kesiapanH;

  // Helper to draw 6-sheet + Total matrix table
  const drawSheetMatrixTable = (
    machineTitle: string,
    rows: { label: string; values: SheetRowNumeric | SheetRowString }[],
    verifiedBy: string | null,
    startY: number
  ) => {
    let curY = startY;
    const labelColW = 300;
    const sheetColW = 115;
    const totalColW = 125;
    const verColW = w - labelColW - sheetColW * 6 - totalColW;
    const headerRowH = 30;
    const dataRowH = 28;

    // Machine Subheader + Column Headers
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(margin, curY, w, headerRowH);
    ctx.strokeRect(margin, curY, w, headerRowH);

    drawText(machineTitle, margin + 12, curY + 20, { font: 'bold 12px sans-serif' });

    const headers = ['Sheet 1', 'Sheet 2', 'Sheet 3', 'Sheet 4', 'Sheet 5', 'Sheet 6', 'Total', 'Diverifikasi Oleh'];
    let colX = margin + labelColW;
    headers.forEach((h, i) => {
      const cw = i < 6 ? sheetColW : i === 6 ? totalColW : verColW;
      ctx.strokeRect(colX, curY, cw, headerRowH);
      drawText(h, colX + cw / 2, curY + 20, { font: 'bold 12px sans-serif', align: 'center' });
      colX += cw;
    });

    curY += headerRowH;

    // Rows
    rows.forEach((r) => {
      ctx.strokeRect(margin, curY, labelColW, dataRowH);
      drawText(r.label, margin + 12, curY + 19, { font: '12px sans-serif' });

      const keys: (keyof SheetRowNumeric)[] = [
        'sheet_1',
        'sheet_2',
        'sheet_3',
        'sheet_4',
        'sheet_5',
        'sheet_6',
        'total',
      ];
      let cx = margin + labelColW;
      keys.forEach((k, idx) => {
        const cw = idx < 6 ? sheetColW : totalColW;
        ctx.strokeRect(cx, curY, cw, dataRowH);
        drawHandwritten(r.values[k], cx + cw / 2, curY + 19, 'center');
        cx += cw;
      });
      curY += dataRowH;
    });

    // Verified By merged cell on the right
    const totalDataH = rows.length * dataRowH;
    const verX = margin + labelColW + sheetColW * 6 + totalColW;
    ctx.fillStyle = '#fcfbf7';
    ctx.fillRect(verX, curY - totalDataH, verColW, totalDataH);
    ctx.strokeRect(verX, curY - totalDataH, verColW, totalDataH);
    drawHandwritten(verifiedBy, verX + verColW / 2, curY - totalDataH / 2 + 5, 'center');

    return curY;
  };

  // 4. CYCLE TIME (MENIT)
  y = drawSectionBar('B. CYCLE TIME PRODUKSI (MENIT)', y);

  y = drawSheetMatrixTable(
    '1. Mesin CNC Quick (Putih)',
    [
      { label: 'Waktu Proses Produksi', values: report.cycle_time.mesin_cnc_quick_putih.waktu_proses_produksi },
      { label: 'Delay / Waiting Time', values: report.cycle_time.mesin_cnc_quick_putih.delay_waiting_time },
      { label: 'Setup Time', values: report.cycle_time.mesin_cnc_quick_putih.setup_time },
      { label: 'Waktu Inspeksi & Perbaikan', values: report.cycle_time.mesin_cnc_quick_putih.waktu_inspeksi_perbaikan },
    ],
    report.cycle_time.mesin_cnc_quick_putih.diverifikasi_oleh,
    y
  );

  y = drawSheetMatrixTable(
    '2. Mesin CNC Tekma (Biru)',
    [
      { label: 'Waktu Proses Produksi', values: report.cycle_time.mesin_cnc_tekma_biru.waktu_proses_produksi },
      { label: 'Delay / Waiting Time', values: report.cycle_time.mesin_cnc_tekma_biru.delay_waiting_time },
      { label: 'Setup Time', values: report.cycle_time.mesin_cnc_tekma_biru.setup_time },
      { label: 'Waktu Inspeksi & Perbaikan', values: report.cycle_time.mesin_cnc_tekma_biru.waktu_inspeksi_perbaikan },
    ],
    report.cycle_time.mesin_cnc_tekma_biru.diverifikasi_oleh,
    y
  );

  // Keterangan Cycle Time
  ctx.strokeRect(margin, y, w, 32);
  drawText('Keterangan Cycle Time :', margin + 12, y + 21, { font: '600 12px sans-serif' });
  drawHandwritten(report.cycle_time.keterangan, margin + 175, y + 21);
  y += 32;

  // 5. PEMOTONGAN SHEET MATERIAL
  y = drawSectionBar('C. PEMOTONGAN SHEET MATERIAL', y);

  y = drawSheetMatrixTable(
    '1. Mesin CNC Quick (Putih)',
    [
      { label: 'Nama Produk', values: report.pemotongan_sheet_material.mesin_cnc_quick_putih.nama_produk },
      { label: 'Jenis Material', values: report.pemotongan_sheet_material.mesin_cnc_quick_putih.jenis_material },
      { label: 'Total Komponen', values: report.pemotongan_sheet_material.mesin_cnc_quick_putih.total_komponen },
      { label: 'Jenis Potongan', values: report.pemotongan_sheet_material.mesin_cnc_quick_putih.jenis_potongan },
      { label: 'Kualitas Hasil Potong', values: report.pemotongan_sheet_material.mesin_cnc_quick_putih.kualitas_hasil_potong },
    ],
    report.pemotongan_sheet_material.mesin_cnc_quick_putih.diverifikasi_oleh,
    y
  );

  y = drawSheetMatrixTable(
    '2. Mesin CNC Tekma (Biru)',
    [
      { label: 'Nama Produk', values: report.pemotongan_sheet_material.mesin_cnc_tekma_biru.nama_produk },
      { label: 'Jenis Material', values: report.pemotongan_sheet_material.mesin_cnc_tekma_biru.jenis_material },
      { label: 'Total Komponen', values: report.pemotongan_sheet_material.mesin_cnc_tekma_biru.total_komponen },
      { label: 'Jenis Potongan', values: report.pemotongan_sheet_material.mesin_cnc_tekma_biru.jenis_potongan },
      { label: 'Kualitas Hasil Potong', values: report.pemotongan_sheet_material.mesin_cnc_tekma_biru.kualitas_hasil_potong },
    ],
    report.pemotongan_sheet_material.mesin_cnc_tekma_biru.diverifikasi_oleh,
    y
  );

  // Keterangan Pemotongan
  ctx.strokeRect(margin, y, w, 32);
  drawText('Keterangan Pemotongan :', margin + 12, y + 21, { font: '600 12px sans-serif' });
  drawHandwritten(report.pemotongan_sheet_material.keterangan, margin + 185, y + 21);
  y += 32;

  // 6. SIDE-BY-SIDE: PENGAMBILAN MATERIAL (LEFT) & DIMENSI HASIL POTONG (RIGHT)
  y = drawSectionBar('D. PENGAMBILAN MATERIAL & E. DIMENSI HASIL POTONG (MM)', y);

  const halfW = w / 2;
  const subHeaderH = 30;
  const rowHMat = 30;

  // Left Table: Pengambilan Material (4 rows, each scaled to match 6 rows height = 180px total)
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(margin, y, halfW, subHeaderH);
  ctx.strokeRect(margin, y, halfW, subHeaderH);

  const matCols = [50, 240, 120, 120, halfW - 530];
  const matHeaders = ['No', 'Jenis Material', 'Lembar', 'Sisa', 'Diverifikasi'];
  let mx = margin;
  matHeaders.forEach((h, i) => {
    ctx.strokeRect(mx, y, matCols[i], subHeaderH);
    drawText(h, mx + matCols[i] / 2, y + 20, { font: 'bold 12px sans-serif', align: 'center' });
    mx += matCols[i];
  });

  // Right Table: Dimensi Hasil Potong (6 rows)
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(margin + halfW, y, halfW, subHeaderH);
  ctx.strokeRect(margin + halfW, y, halfW, subHeaderH);

  const dimCols = [70, 150, 150, 140, halfW - 510];
  const dimHeaders = ['Sheet', 'Panjang (mm)', 'Lebar (mm)', 'Tebal', 'Diverifikasi'];
  let dx = margin + halfW;
  dimHeaders.forEach((h, i) => {
    ctx.strokeRect(dx, y, dimCols[i], subHeaderH);
    drawText(h, dx + dimCols[i] / 2, y + 20, { font: 'bold 12px sans-serif', align: 'center' });
    dx += dimCols[i];
  });

  const tableBodyY = y + subHeaderH;
  const totalBodyH = 6 * rowHMat; // 180px

  // Draw Left rows dynamically (fitting totalBodyH = 180px)
  const matRows = report.pengambilan_material.tabel_material;
  const matRowCount = Math.max(4, matRows.length);
  const leftRowH = totalBodyH / matRowCount;
  const textYOffset = Math.min(27, Math.round(leftRowH * 0.62));
  matRows.forEach((item, idx) => {
    const ry = tableBodyY + idx * leftRowH;
    let cx = margin;
    // No
    ctx.strokeRect(cx, ry, matCols[0], leftRowH);
    drawText(String(item.no), cx + matCols[0] / 2, ry + textYOffset, { font: '12px sans-serif', align: 'center' });
    cx += matCols[0];
    // Jenis Material (rows 0..2 printed standard PP 6/8/10 mm; row 3+ printed Lain-lain or handwritten custom material)
    ctx.strokeRect(cx, ry, matCols[1], leftRowH);
    if (idx < 3) {
      drawText(item.jenis_material, cx + 12, ry + textYOffset, { font: '600 12px sans-serif' });
    } else if (item.jenis_material && item.jenis_material !== 'Lain-lain') {
      drawText('Lain-lain:', cx + 10, ry + textYOffset, { font: '11px sans-serif', color: '#475569' });
      drawHandwritten(item.jenis_material, cx + 68, ry + textYOffset, 'left');
    } else {
      drawText('Lain-lain: ....................', cx + 12, ry + textYOffset, { font: '600 12px sans-serif' });
    }
    cx += matCols[1];
    // Lembar
    ctx.strokeRect(cx, ry, matCols[2], leftRowH);
    drawHandwritten(item.lembar, cx + matCols[2] / 2, ry + textYOffset, 'center');
    cx += matCols[2];
    // Sisa
    ctx.strokeRect(cx, ry, matCols[3], leftRowH);
    drawHandwritten(item.sisa, cx + matCols[3] / 2, ry + textYOffset, 'center');
  });
  // Left Verified By
  const leftVerX = margin + matCols[0] + matCols[1] + matCols[2] + matCols[3];
  ctx.strokeRect(leftVerX, tableBodyY, matCols[4], totalBodyH);
  drawHandwritten(
    report.pengambilan_material.diverifikasi_oleh,
    leftVerX + matCols[4] / 2,
    tableBodyY + totalBodyH / 2 + 5,
    'center'
  );

  // Draw Right 6 rows (each 30px tall)
  report.dimensi_hasil_potong.tabel_dimensi.forEach((item, idx) => {
    const ry = tableBodyY + idx * rowHMat;
    let cx = margin + halfW;
    // Sheet
    ctx.strokeRect(cx, ry, dimCols[0], rowHMat);
    drawText(String(item.sheet), cx + dimCols[0] / 2, ry + 20, { font: '12px sans-serif', align: 'center' });
    cx += dimCols[0];
    // Panjang
    ctx.strokeRect(cx, ry, dimCols[1], rowHMat);
    drawHandwritten(item.panjang_mm, cx + dimCols[1] / 2, ry + 20, 'center');
    cx += dimCols[1];
    // Lebar
    ctx.strokeRect(cx, ry, dimCols[2], rowHMat);
    drawHandwritten(item.lebar_mm, cx + dimCols[2] / 2, ry + 20, 'center');
    cx += dimCols[2];
    // Tebal
    ctx.strokeRect(cx, ry, dimCols[3], rowHMat);
    drawHandwritten(item.tebal, cx + dimCols[3] / 2, ry + 20, 'center');
  });
  // Right Verified By
  const rightVerX = margin + halfW + dimCols[0] + dimCols[1] + dimCols[2] + dimCols[3];
  ctx.strokeRect(rightVerX, tableBodyY, dimCols[4], totalBodyH);
  drawHandwritten(
    report.dimensi_hasil_potong.diverifikasi_oleh,
    rightVerX + dimCols[4] / 2,
    tableBodyY + totalBodyH / 2 + 5,
    'center'
  );

  y = tableBodyY + totalBodyH;

  // 7. INFORMASI TAMBAHAN
  y = drawSectionBar('F. INFORMASI TAMBAHAN & KENDALA OPERASIONAL', y);

  const infoRowH = 34;
  ctx.strokeRect(margin, y, w, infoRowH);
  drawText('1. Pekerjaan Lainnya :', margin + 12, y + 22, { font: '600 12px sans-serif' });
  drawHandwritten(report.informasi_tambahan.pekerjaan_lainnya, margin + 175, y + 22);
  y += infoRowH;

  ctx.strokeRect(margin, y, w, infoRowH);
  drawText('2. Pesan / Informasi :', margin + 12, y + 22, { font: '600 12px sans-serif' });
  drawHandwritten(report.informasi_tambahan.pesan_informasi, margin + 175, y + 22);
  y += infoRowH;

  ctx.strokeRect(margin, y, w, infoRowH);
  drawText('3. Kendala Mesin/Produksi :', margin + 12, y + 22, { font: '600 12px sans-serif' });
  drawHandwritten(report.informasi_tambahan.kendala, margin + 195, y + 22);
  y += infoRowH;

  // 8. PERSETUJUAN (SIGNATURES)
  y = drawSectionBar('G. PENGESAHAN & PERSETUJUAN LAPORAN', y);

  const remH = canvas.height - margin - y;
  const sigColW = w / 3;

  const sigLabels = [
    { title: 'Disusun Oleh (Operator CNC)', name: report.persetujuan.disusun_oleh, printed: false },
    { title: 'Diketahui Oleh (Leader / SPV)', name: report.persetujuan.diketahui_oleh || 'Mulyana', printed: true },
    { title: 'Disetujui Oleh (Manager Produksi)', name: report.persetujuan.disetujui_oleh || 'Arifin', printed: true },
  ];

  sigLabels.forEach((sig, i) => {
    const sx = margin + i * sigColW;
    ctx.strokeRect(sx, y, sigColW, remH);
    drawText(sig.title, sx + sigColW / 2, y + 26, { font: 'bold 13px sans-serif', align: 'center' });

    if (sig.name) {
      // Draw a stylized signature scribble above the name
      ctx.save();
      ctx.strokeStyle = '#1d4ed8';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      const midX = sx + sigColW / 2;
      const midY = y + remH / 2;
      ctx.moveTo(midX - 45, midY + 8);
      ctx.bezierCurveTo(midX - 20, midY - 28, midX + 10, midY + 22, midX + 40, midY - 12);
      ctx.lineTo(midX + 55, midY + 4);
      ctx.stroke();
      ctx.restore();
    }

    if (sig.printed) {
      drawText(`( ${sig.name} )`, sx + sigColW / 2, y + remH - 22, {
        font: 'bold 14px "Plus Jakarta Sans", sans-serif',
        align: 'center',
      });
    } else {
      drawHandwritten(sig.name ? `( ${sig.name} )` : null, sx + sigColW / 2, y + remH - 22, 'center');
    }
  });

  return canvas.toDataURL('image/png');
}
