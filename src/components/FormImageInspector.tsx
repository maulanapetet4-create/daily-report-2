import React, { useRef, useState } from 'react';
import {
  Camera,
  Download,
  FileImage,
  RotateCw,
  ScanText,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { SAMPLE_FORM_PRESETS, createEmptyCncReport } from '../types/cncReport';
import { renderCncFormToDataUrl } from '../utils/formCanvasGenerator';

interface FormImageInspectorProps {
  imageDataUrl: string | null;
  imageName: string;
  isExtracting: boolean;
  onSelectImage: (dataUrl: string, name: string) => void;
  onRunOcr: () => void;
}

export const FormImageInspector: React.FC<FormImageInspectorProps> = ({
  imageDataUrl,
  imageName,
  isExtracting,
  onSelectImage,
  onRunOcr,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>('shift-1-fume-hood');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileAsDataUrl(file);
  };

  const readFileAsDataUrl = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setZoom(1);
        setRotation(0);
        onSelectImage(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      readFileAsDataUrl(file);
    }
  };

  const handleLoadSampleFormImage = (presetId: string) => {
    setActivePresetId(presetId);
    setZoom(1);
    setRotation(0);
    if (presetId === 'blank-null-test') {
      const blankReport = createEmptyCncReport();
      const dataUrl = renderCncFormToDataUrl(blankReport);
      onSelectImage(dataUrl, 'F-PRD-003_Formulir_Kosong_Uji_Null.png');
      return;
    }
    const found = SAMPLE_FORM_PRESETS.find((p) => p.id === presetId);
    if (found) {
      const dataUrl = renderCncFormToDataUrl(found.report);
      onSelectImage(dataUrl, `F-PRD-003_${found.id}.png`);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1600 }, height: { ideal: 1200 } },
      });
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      setCameraError(
        err?.message || 'Tidak dapat mengakses kamera perangkat. Gunakan unggah file foto.'
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopCamera();
      onSelectImage(dataUrl, `Kamera_CNC_${Date.now()}.jpg`);
    }
  };

  const handleDownloadFormImage = () => {
    if (!imageDataUrl) return;
    const a = document.createElement('a');
    a.href = imageDataUrl;
    a.download = imageName || 'F-PRD-003_form.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col border border-slate-200 bg-white">
      {/* Top Action Bar for Image Source */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <span className="text-xs font-bold text-slate-900 block">
             Citra Formulir Cetak (F-PRD-003)
          </span>
          <span className="text-xs text-slate-500 font-mono truncate block max-w-[260px]">
            {imageName || 'Belum ada foto dipilih'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <Upload className="h-3.5 w-3.5" />
            Unggah Foto
          </button>

          <button
            type="button"
            onClick={cameraOpen ? stopCamera : startCamera}
            className="inline-flex items-center gap-1.5 border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <Camera className="h-3.5 w-3.5" />
            {cameraOpen ? 'Tutup Kamera' : 'Kamera'}
          </button>

          <button
            type="button"
            disabled={!imageDataUrl || isExtracting}
            onClick={onRunOcr}
            className="inline-flex items-center gap-1.5 bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0"
          >
            <ScanText className="h-3.5 w-3.5" />
            {isExtracting ? 'Mengekstrak OCR...' : 'Ekstrak OCR Multimodal'}
          </button>
        </div>
      </div>

      {/* Generator Simulator Bar for Instant Testing */}
      <div className="border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">
            Uji Coba Simulasi Lembar Cetak F-PRD-003:
          </span>
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1">
            {SAMPLE_FORM_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleLoadSampleFormImage(preset.id)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activePresetId === preset.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset.id === 'shift-1-fume-hood' ? 'Sampel Shift 1' : 'Sampel Shift 2'}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleLoadSampleFormImage('blank-null-test')}
              className={`px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activePresetId === 'blank-null-test'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Form Kosong (Uji Null)
            </button>
          </div>
        </div>
      </div>

      {cameraError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">
          {cameraError}
        </div>
      )}

      {/* Camera Modal / Stream View */}
      {cameraOpen && (
        <div className="relative border-b border-slate-200 bg-slate-950 p-4">
          <video
            ref={videoRef}
            className="mx-auto max-h-[380px] w-full object-contain border border-slate-800"
            playsInline
            muted
          />
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={capturePhoto}
              className="inline-flex items-center gap-2 bg-white px-4 py-2 text-xs font-semibold text-slate-900 hover:bg-slate-100"
            >
              <Camera className="h-4 w-4" />
              Ambil Foto Formulir
            </button>
            <button
              type="button"
              onClick={stopCamera}
              className="inline-flex items-center gap-1.5 border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Image Inspection Controls */}
      {imageDataUrl && (
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
              className="p-1 hover:bg-slate-200/70 text-slate-700"
              title="Perkecil"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="w-12 text-center font-mono tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
              className="p-1 hover:bg-slate-200/70 text-slate-700"
              title="Perbesar"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="ml-1 inline-flex items-center gap-1 px-2 py-1 hover:bg-slate-200/70 text-slate-700"
              title="Putar 90 Derajat"
            >
              <RotateCw className="h-3.5 w-3.5" />
              Putar 90°
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
              }}
              className="px-2 py-1 text-slate-500 hover:text-slate-900"
            >
              Reset
            </button>
          </div>

          <button
            type="button"
            onClick={handleDownloadFormImage}
            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium whitespace-nowrap shrink-0"
          >
            <Download className="h-3.5 w-3.5" />
            Unduh PNG Form
          </button>
        </div>
      )}

      {/* Viewport for the Form Image */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative h-[680px] overflow-auto bg-slate-100 p-4 flex items-start justify-center"
      >
        {imageDataUrl ? (
          <div className="inline-block transition-transform duration-150 origin-top">
            <img
              src={imageDataUrl}
              alt="Formulir Laporan Harian Data Mesin CNC F-PRD-003"
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
              }}
              className="max-w-full border border-slate-300 bg-white shadow-xs"
            />
          </div>
        ) : (
          <div className="my-auto flex max-w-sm flex-col items-center justify-center text-center p-6">
            <FileImage className="h-10 w-10 text-slate-400 mb-3" />
            <p className="text-sm font-semibold text-slate-800">
              Tarik & Lepas Foto Formulir F-PRD-003 di Sini
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Mendukung foto kertas laporan harian dari kamera operator (JPG, PNG, WEBP) atau gunakan tombol sampel di atas untuk menguji ekstraksi OCR.
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
            >
              Pilih File Foto
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
