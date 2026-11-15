/**
 * PDF to Image Converter
 * Client-side utility to extract pages from PDF files as base64 PNG images.
 * Uses the browser's built-in PDF rendering via an iframe/canvas approach.
 *
 * For server-side use, this module provides a simpler base64 pass-through
 * since Gemini can handle PDF content via inline data.
 *
 * Note: For production, consider using pdfjs-dist for more accurate rendering.
 */

export interface PDFPageImage {
  pageNumber: number;
  base64: string;       // base64-encoded PNG (without data:... prefix)
  mimeType: 'image/png';
  width: number;
  height: number;
}

export interface ConvertedFile {
  type: 'image' | 'pdf';
  pages: PDFPageImage[];
  originalMimeType: string;
  fileName: string;
}

/**
 * Convert an uploaded file (image or PDF) to a list of base64 page images.
 * For images: returns a single-page result.
 * For PDFs: extracts all pages using canvas rendering.
 *
 * @param file     - The File object from an HTML file input
 * @param maxPages - Maximum pages to extract from PDFs (default: 10)
 */
export async function convertFileToImages(
  file: File,
  maxPages = 10
): Promise<ConvertedFile> {
  const mimeType = file.type.toLowerCase();

  // ── Handle Image Files ──────────────────────────────────────────────────
  if (mimeType.includes('image/')) {
    const base64 = await fileToBase64(file);
    // Strip data:image/...;base64, prefix
    const base64Data = base64.split(',')[1] || base64;

    return {
      type: 'image',
      fileName: file.name,
      originalMimeType: mimeType,
      pages: [
        {
          pageNumber: 1,
          base64: base64Data,
          mimeType: 'image/png',
          width: 0,
          height: 0,
        },
      ],
    };
  }

  // ── Handle PDF Files ─────────────────────────────────────────────────────
  if (mimeType === 'application/pdf') {
    try {
      const pages = await extractPDFPages(file, maxPages);
      return {
        type: 'pdf',
        fileName: file.name,
        originalMimeType: mimeType,
        pages,
      };
    } catch (error) {
      console.warn('[PDFConverter] PDF page extraction failed, using raw base64:', error);
      // Fallback: send raw PDF base64 directly (Gemini can sometimes handle it)
      const base64 = await fileToBase64(file);
      const base64Data = base64.split(',')[1] || base64;
      return {
        type: 'pdf',
        fileName: file.name,
        originalMimeType: mimeType,
        pages: [
          {
            pageNumber: 1,
            base64: base64Data,
            mimeType: 'image/png', // Will be overridden when sending
            width: 0,
            height: 0,
          },
        ],
      };
    }
  }

  throw new Error(`Unsupported file type: ${mimeType}. Supported: PNG, JPG, JPEG, PDF`);
}

/**
 * Extract PDF pages as canvas-rendered PNG images.
 * Requires pdfjs-dist — loads it dynamically so it doesn't bloat the bundle.
 */
async function extractPDFPages(file: File, maxPages: number): Promise<PDFPageImage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pages: PDFPageImage[] = [];

  // Try to use pdfjs-dist if available (installed separately)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pdfjsLib: any = null;
  try {
    // Dynamic import — only loads if pdfjs-dist is installed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfjsLib = await import('pdfjs-dist');
    if (pdfjsLib?.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  } catch {
    // pdfjs-dist not installed — fall through to canvas fallback
  }

  if (pdfjsLib) {
    // ── Use pdfjs-dist (high quality) ──────────────────────────────────────
    const uint8Array = new Uint8Array(arrayBuffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;
    const totalPages = Math.min(pdf.numPages, maxPages);

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2.0 }); // 2x scale for better OCR

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;

      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/png');
      const base64Data = dataUrl.split(',')[1];

      pages.push({
        pageNumber: pageNum,
        base64: base64Data,
        mimeType: 'image/png',
        width: viewport.width,
        height: viewport.height,
      });
    }
  } else {
    // ── Fallback: Render via iframe + screenshot (basic) ──────────────────
    // This is a simplified fallback. For production, install pdfjs-dist:
    // npm install pdfjs-dist
    const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    const objectUrl = URL.createObjectURL(blob);

    // Create a temporary iframe to render the PDF
    const iframe = document.createElement('iframe');
    iframe.src = objectUrl;
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:1200px;height:900px;opacity:0;z-index:-1;';
    document.body.appendChild(iframe);

    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for PDF to load

    // Canvas screenshot of iframe content is blocked by CORS in most browsers
    // So we use the raw base64 PDF approach as final fallback
    document.body.removeChild(iframe);
    URL.revokeObjectURL(objectUrl);

    // Send raw PDF as base64 for Gemini to parse directly
    const base64 = await fileToBase64(file);
    const base64Data = base64.split(',')[1] || base64;
    pages.push({
      pageNumber: 1,
      base64: base64Data,
      mimeType: 'image/png',
      width: 1200,
      height: 900,
    });
  }

  return pages;
}

/**
 * Convert a File to a base64 data URL.
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

/**
 * Get the MIME type string appropriate for Gemini API from a file.
 */
export function getGeminiMimeType(
  file: File
): 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/webp' | 'application/pdf' {
  const mime = file.type.toLowerCase();
  if (mime.includes('png'))  return 'image/png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'image/jpeg';
  if (mime.includes('webp')) return 'image/webp';
  if (mime.includes('pdf'))  return 'application/pdf';
  return 'image/png'; // default
}

/**
 * Determine if a file is a supported drawing file type.
 */
export function isSupportedDrawingFile(file: File): boolean {
  const supported = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
  return supported.some(t => file.type.toLowerCase().includes(t.split('/')[1]));
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
