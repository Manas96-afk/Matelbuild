'use client';

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { DrawingType, Drawing, DrawingFileType } from '../../types/blueprint';
import {
  UploadCloud, FileText, Image as ImageIcon, X, Loader2, CheckCircle,
  AlertTriangle, Eye, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  Maximize2, Grid3x3, Layers,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/** Drawing extended with client-only preview images (never persisted) */
export type DrawingWithPreviews = Drawing & {
  /** All PDF page images (base64 data URLs). For images: length === 1 */
  previewImages: string[];
};

interface BlueprintUploaderProps {
  projectId: string;
  onDrawingsChange: (drawings: DrawingWithPreviews[]) => void;
  onAnalyzeAll: () => void;
  drawings: DrawingWithPreviews[];
  isAnalyzing: boolean;
}

function generateId(): string {
  return 'drw-' + Math.random().toString(36).substring(2, 11);
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE COMPRESSOR  (prevents IndexedDB / localStorage quota errors)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compress / resize an image data-URL so it doesn't blow the IndexedDB quota.
 * Max dimension: 2048 px.  Output: JPEG at 80 % quality.
 */
function compressDataUrl(
  dataUrl: string,
  maxDim = 2048,
  quality = 0.80,
): Promise<string> {
  return new Promise(resolve => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback: return original
    img.src = dataUrl;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF → IMAGES CONVERTER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert every page of a PDF file into a compressed JPEG base64 data URL.
 * Uses PDF.js loaded dynamically; no local worker bundle needed.
 */
async function pdfToImages(
  file: File,
  onProgress?: (msg: string) => void,
): Promise<{ dataUrl: string; pageNum: number }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const { getDocument, GlobalWorkerOptions } = await import('pdfjs-dist');

  GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const images: { dataUrl: string; pageNum: number }[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    onProgress?.(`Rendering page ${pageNum} of ${pdf.numPages}…`);
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.8 });

    const canvas = document.createElement('canvas');
    canvas.width  = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d')!;

    await page.render({
      canvasContext: ctx,
      viewport,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any).promise;

    const dataUrl = await compressDataUrl(canvas.toDataURL('image/jpeg', 0.85));
    images.push({ dataUrl, pageNum });
  }

  return images;
}

// ─────────────────────────────────────────────────────────────────────────────
// IMAGE VIEWER MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ImageViewerModal({
  images,
  initialIndex = 0,
  fileName,
  onClose,
}: {
  images: string[];
  initialIndex?: number;
  fileName?: string;
  onClose: () => void;
}) {
  const [currentIdx, setCurrentIdx]   = useState(initialIndex);
  const [zoom, setZoom]               = useState(1);
  const [showSidebar, setShowSidebar] = useState(images.length > 1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setCurrentIdx(i => Math.min(images.length - 1, i + 1));
      else if (e.key === 'ArrowLeft')  setCurrentIdx(i => Math.max(0, i - 1));
      else if (e.key === '+' || e.key === '=') setZoom(z => Math.min(4, z + 0.25));
      else if (e.key === '-')                  setZoom(z => Math.max(0.25, z - 0.25));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="flex-1 flex flex-col relative"
        onClick={e => e.stopPropagation()}
      >
        {/* toolbar */}
        <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-xl px-3 py-1.5">
            {images.length > 1 && (
              <button
                className="p-1 rounded text-white/70 hover:text-amber-400 transition-colors"
                title="Toggle page strip"
                onClick={() => setShowSidebar(s => !s)}
              >
                <Grid3x3 className="h-3.5 w-3.5" />
              </button>
            )}
            <span className="text-[10px] font-bold text-white/80 max-w-[200px] truncate">
              {fileName || 'House Map'}
            </span>
            {images.length > 1 && (
              <span className="text-[10px] text-amber-400 font-bold">
                Page {currentIdx + 1}/{images.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-xl px-2 py-1.5">
            <button
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
              title="Zoom out (−)"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <span className="text-[10px] font-bold text-white/70 min-w-[36px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={() => setZoom(z => Math.min(4, z + 0.25))}
              title="Zoom in (+)"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1.5 rounded-lg bg-white/10 hover:bg-amber-500/30 text-white transition-colors ml-1"
              onClick={() => setZoom(1)}
              title="Reset zoom"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-1" />
            <button
              className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-white transition-colors"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* arrows */}
        {images.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-xl bg-black/50 hover:bg-amber-500/30 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-xl bg-black/50 hover:bg-amber-500/30 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              onClick={() => setCurrentIdx(i => Math.min(images.length - 1, i + 1))}
              disabled={currentIdx === images.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div
          ref={containerRef}
          className="flex-1 overflow-auto flex items-start justify-center p-12 pt-16"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[currentIdx]}
            alt={`Page ${currentIdx + 1}`}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
              maxWidth: '100%',
            }}
            className="rounded-xl shadow-2xl shadow-black/60 bg-white block"
          />
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-1.5 text-[9px] text-white/40 font-medium">
          {images.length > 1 ? '← → navigate  ·  ' : ''}+ / − zoom  ·  Esc close
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DRAWING CARD
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-amber-50 text-amber-700 border-amber-200',
  analyzing: 'bg-blue-50 text-blue-700 border-blue-200',
  complete:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed:    'bg-red-50 text-red-700 border-red-200',
};

function DrawingCard({
  drawing,
  onRemove,
}: {
  drawing: DrawingWithPreviews;
  onRemove: (id: string) => void;
}) {
  const [viewerOpen, setViewerOpen]     = useState(false);
  const [viewerStartIdx, setViewerStartIdx] = useState(0);
  const previews = drawing.previewImages ?? [];
  const isPdf = drawing.fileType === 'pdf';

  function openViewer(idx = 0) {
    if (previews.length === 0) return;
    setViewerStartIdx(idx);
    setViewerOpen(true);
  }

  return (
    <>
      {viewerOpen && previews.length > 0 && (
        <ImageViewerModal
          images={previews}
          initialIndex={viewerStartIdx}
          fileName={drawing.fileName}
          onClose={() => setViewerOpen(false)}
        />
      )}

      <div className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col">
        <div
          className="relative w-full aspect-[4/3] bg-slate-50 overflow-hidden cursor-pointer flex-shrink-0"
          onClick={() => openViewer(0)}
        >
          {previews.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previews[0]} alt={drawing.fileName} className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
              <FileText className="h-10 w-10 mb-1" />
              <span className="text-xs">No preview</span>
            </div>
          )}

          {previews.length > 0 && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 text-white text-xs font-bold bg-black/50 px-3 py-1.5 rounded-xl">
                <Eye className="h-3.5 w-3.5" />
                {previews.length > 1 ? `View all ${previews.length} pages` : 'View Full Map'}
              </div>
            </div>
          )}

          <button
            onClick={e => { e.stopPropagation(); onRemove(drawing.id); }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all"
            title="Remove map"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          <div className={`absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${STATUS_COLORS[drawing.analysisStatus] || ''}`}>
            {drawing.analysisStatus === 'analyzing' && <Loader2 className="inline h-2.5 w-2.5 mr-1 animate-spin" />}
            {drawing.analysisStatus === 'complete'  && <CheckCircle className="inline h-2.5 w-2.5 mr-1" />}
            {drawing.analysisStatus === 'failed'    && <AlertTriangle className="inline h-2.5 w-2.5 mr-1" />}
            {drawing.analysisStatus}
          </div>

          {isPdf && previews.length > 1 && (
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-900/80 text-white flex items-center gap-1">
              <Layers className="h-2.5 w-2.5 text-amber-400" />
              {previews.length}p Map PDF
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs font-bold text-slate-800 truncate" title={drawing.fileName}>
            {drawing.fileName}
          </p>
          <span className="inline-block mt-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5">
            🏡 House Floor Plan
          </span>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN BLUEPRINT ANALYZER
// ─────────────────────────────────────────────────────────────────────────────

export function BlueprintAnalyzer({
  projectId,
  onDrawingsChange,
  onAnalyzeAll,
  drawings,
  isAnalyzing,
}: BlueprintUploaderProps) {
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging]                 = useState(false);
  const [isConverting, setIsConverting]             = useState(false);
  const [conversionProgress, setConversionProgress] = useState('');
  const [uploadError, setUploadError]               = useState<string | null>(null);

  const drawingsRef = useRef<DrawingWithPreviews[]>(drawings);
  useEffect(() => { drawingsRef.current = drawings; }, [drawings]);

  const processFile = useCallback(async (file: File, drawingType: DrawingType = 'architectural') => {
    const ext     = file.name.split('.').pop()?.toLowerCase();
    const isPdf   = ext === 'pdf';
    const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(ext || '');
    if (!isPdf && !isImage) {
      setUploadError(`Unsupported file type: .${ext || 'unknown'}. Please upload PDF, PNG, JPG, or WEBP.`);
      return;
    }

    setUploadError(null);
    let previewImages: string[] = [];
    let fileDataUrl: string | undefined;
    const fileType: DrawingFileType = (['pdf','png','jpg','jpeg','webp'].includes(ext || '') ? ext : 'png') as DrawingFileType;

    if (isPdf) {
      setIsConverting(true);
      setConversionProgress(`Processing map "${file.name}"…`);
      try {
        const pages = await pdfToImages(file, msg => setConversionProgress(msg));
        previewImages = pages.map(p => p.dataUrl);
        fileDataUrl = previewImages[0];
        setConversionProgress(`✓ ${pages.length} page${pages.length > 1 ? 's' : ''} ready`);
      } catch (e) {
        console.error('PDF conversion failed:', e);
        setUploadError('PDF conversion failed. Try uploading your house map as PNG or JPG image.');
      } finally {
        setTimeout(() => { setIsConverting(false); setConversionProgress(''); }, 2500);
      }
    } else {
      const rawDataUrl = await new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload  = e => resolve(e.target!.result as string);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
      if (!rawDataUrl) return;
      const sizeKb = rawDataUrl.length * 0.75 / 1024;
      fileDataUrl = sizeKb > 800 ? await compressDataUrl(rawDataUrl) : rawDataUrl;
      previewImages = [fileDataUrl];
    }

    const newDrawing: DrawingWithPreviews = {
      id: generateId(),
      projectId,
      fileName: file.name,
      fileType,
      drawingType,
      fileDataUrl,
      previewImages,
      fileSizeBytes: file.size,
      analysisStatus: 'pending',
      uploadedAt: new Date().toISOString(),
    };

    const latest = drawingsRef.current;
    onDrawingsChange([...latest, newDrawing]);
  }, [projectId, onDrawingsChange]);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    arr.reduce((chain, file) => chain.then(() => processFile(file)), Promise.resolve());
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleRemove = useCallback((id: string) => {
    onDrawingsChange(drawings.filter(d => d.id !== id));
  }, [drawings, onDrawingsChange]);

  const pendingCount  = drawings.filter(d => d.analysisStatus === 'pending').length;
  const completeCount = drawings.filter(d => d.analysisStatus === 'complete').length;

  return (
    <div className="space-y-5">
      {uploadError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold">Upload Error</p>
            <p className="text-xs mt-0.5">{uploadError}</p>
          </div>
          <button onClick={() => setUploadError(null)} className="flex-shrink-0 p-1 rounded hover:bg-red-100 transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isConverting && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${isDragging ? 'border-amber-400 bg-amber-50/60 scale-[1.01]' : 'border-slate-200 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-100/50'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp"
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {isConverting ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-700">{conversionProgress}</p>
            <p className="text-xs text-slate-400">Reading house map images &amp; room dimensions for AI analysis…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-2xl bg-white border-2 shadow-sm transition-all ${isDragging ? 'border-amber-400 scale-105' : 'border-slate-200'}`}>
              <UploadCloud className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{isDragging ? 'Drop House Map Here' : 'Upload House Map (Ghar Ka Naksha)'}</p>
              <p className="text-xs text-slate-500 mt-1">Upload your floor plan / map (Image or PDF). AI will automatically read room sizes, kitchen, toilet, and calculate materials.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {[['PNG / JPG / WEBP', '🖼 Map Image', 'bg-emerald-50 border-emerald-200 text-emerald-700'], ['PDF Document', '📄 Map PDF', 'bg-blue-50 border-blue-200 text-blue-700']].map(([type, note, cls]) => (
                <div key={type} className={`flex items-center gap-1.5 text-[10px] font-bold border rounded-xl px-3 py-1.5 ${cls}`}>
                  <span>{note}</span>
                  <span className="opacity-60 font-normal">— {type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {drawings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="font-bold">
                {drawings.length} map{drawings.length !== 1 ? 's' : ''} uploaded
              </span>
              {completeCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  {completeCount} analyzed
                </span>
              )}
              {pendingCount > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  {pendingCount} pending
                </span>
              )}
            </div>

            {pendingCount > 0 && (
              <button
                onClick={onAnalyzeAll}
                disabled={isAnalyzing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Analyzing Map with AI…
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
                    Analyze House Map with AI
                  </>
                )}
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {drawings.map(drawing => (
              <DrawingCard
                key={drawing.id}
                drawing={drawing}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {drawings.length === 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-slate-400 font-medium">
            Upload your house map above — AI will scan room sizes, kitchen, toilet, and calculate building materials automatically.
          </p>
        </div>
      )}
    </div>
  );
}
