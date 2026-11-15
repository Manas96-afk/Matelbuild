import { NextRequest, NextResponse } from 'next/server';
import {
  analyzeDrawingWithGemini,
  classifyDrawingWithGemini,
  isGeminiAvailable,
  getGeminiApiKey,
} from '../../../lib/ai/vision/geminiVisionClient';
import type { GeminiAnalysisResult } from '../../../lib/ai/vision/geminiVisionClient';
import { DrawingType, DrawingAnalysis, DetectedElement, ExtractedDimensions } from '../../../types/blueprint';
import { getDrawingTypeLabel } from '../../../lib/ai/vision/drawingClassifier';
import { guardDimension } from '../../../lib/ai/knowledge/dimensionRanges';

// Force this route to run as a server-side API (not statically generated)
export const dynamic = 'force-dynamic';

interface AnalyzeRequest {
  imageBase64: string;
  mimeType: 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/webp';
  drawingType: DrawingType;
  drawingId: string;
  projectId: string;
  fileName: string;
  classifyFirst?: boolean;  // If true, auto-detect type before analysis
  /** All PDF page images (base64, no data:…prefix). When provided, every page is analyzed. */
  allPageBase64?: string[];
}

interface AnalyzeResponse {
  success: boolean;
  analysis?: DrawingAnalysis;
  detectedType?: DrawingType;
  detectedTypeConfidence?: number;
  usedRealAI: boolean;
  geminiAvailable: boolean;
  pagesAnalyzed?: number;
  error?: string;
}

/**
 * POST /api/analyze-drawing
 * Analyzes a construction drawing image using Gemini Vision API.
 * The API key is used server-side only — never exposed to the browser.
 */
export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = (await request.json()) as AnalyzeRequest;

    const { imageBase64, mimeType, drawingType, drawingId, projectId, fileName, classifyFirst, allPageBase64 } = body;

    if (!imageBase64 || !drawingType || !drawingId || !projectId) {
      return NextResponse.json({
        success: false,
        usedRealAI: false,
        geminiAvailable: isGeminiAvailable(),
        error: 'Missing required fields: imageBase64, drawingType, drawingId, projectId',
      }, { status: 400 });
    }

    const apiKey = getGeminiApiKey();
    const geminiAvailable = !!apiKey;

    let finalDrawingType = drawingType;
    let detectedTypeConfidence: number | undefined;

    // ── Step 1: Auto-classify if requested (use page 1) ─────────────────────
    if (classifyFirst && geminiAvailable) {
      const classification = await classifyDrawingWithGemini(imageBase64, mimeType, apiKey);
      if (classification.usedRealAI && classification.confidence >= 0.65) {
        finalDrawingType = classification.drawingType;
        detectedTypeConfidence = classification.confidence;
      }
    }

    // ── Step 2: Decide which pages to analyze ───────────────────────────────
    // If the caller supplied allPageBase64 (multi-page PDF), analyze every page.
    // Otherwise fall back to the single imageBase64.
    const pagesToAnalyze: string[] =
      allPageBase64 && allPageBase64.length > 0
        ? allPageBase64
        : [imageBase64];

    // ── Step 3: Analyze each page sequentially ──────────────────────────────
    const pageResults = await Promise.all(
      pagesToAnalyze.map(pageBase64 =>
        analyzeDrawingWithGemini(pageBase64, mimeType, finalDrawingType, apiKey)
      )
    );

    // ── Step 4: Merge results from all pages ────────────────────────────────
    const mergedResult = mergePageResults(pageResults);

    // ── Step 5: Map merged Gemini output to DrawingAnalysis type ────────────
    const analysis = mapGeminiResultToDrawingAnalysis(
      mergedResult.rawData,
      finalDrawingType,
      drawingId,
      projectId,
      fileName,
      mergedResult
    );

    // Append per-page info to OCR text
    if (pagesToAnalyze.length > 1) {
      analysis.rawOcrText = `[Multi-page PDF: ${pagesToAnalyze.length} pages analyzed]\n` + analysis.rawOcrText;
    }

    return NextResponse.json({
      success: true,
      analysis,
      detectedType: finalDrawingType,
      detectedTypeConfidence,
      usedRealAI: mergedResult.usedRealAI,
      geminiAvailable,
      pagesAnalyzed: pagesToAnalyze.length,
    });

  } catch (error) {
    console.error('[API/analyze-drawing]', error);
    return NextResponse.json({
      success: false,
      usedRealAI: false,
      geminiAvailable: isGeminiAvailable(),
      error: `Analysis failed: ${(error as Error).message}`,
    }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE RESULT MERGER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merge Gemini results from multiple PDF pages into one cohesive result.
 * Strategy:
 *  - rawData: merge top-level arrays (rooms, columns, beams…) across pages
 *  - overallConfidence: average across pages that used real AI
 *  - rawTextFound: concatenate all page texts
 *  - warnings: deduplicate and join
 *  - usedRealAI: true if any page used real AI
 */
function mergePageResults(results: GeminiAnalysisResult[]): GeminiAnalysisResult {
  if (results.length === 0) {
    return {
      rawData: {},
      drawingType: 'unknown',
      overallConfidence: 0,
      rawTextFound: '',
      usedRealAI: false,
      warnings: [],
    };
  }
  if (results.length === 1) return results[0];

  // Arrays to merge across pages
  const ARRAY_KEYS = ['rooms', 'doors', 'windows', 'columns', 'beams', 'slabs', 'footings', 'walls'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mergedRawData: Record<string, any> = {};

  for (const key of ARRAY_KEYS) {
    const combined: unknown[] = [];
    for (const r of results) {
      const arr = r.rawData[key];
      if (Array.isArray(arr)) combined.push(...arr);
    }
    if (combined.length > 0) mergedRawData[key] = combined;
  }

  // Scalar fields: prefer from first page that has a non-null value
  const SCALAR_KEYS = [
    'buildingLengthFt', 'buildingWidthFt', 'floorToFloorHeightFt', 'totalHeightFt',
    'slabThicknessInch', 'wallThicknessInch', 'foundationDepthFt',
    'buildingType', 'drawingTitle', 'scale', 'overallConfidence',
  ];
  for (const key of SCALAR_KEYS) {
    for (const r of results) {
      if (r.rawData[key] != null) {
        mergedRawData[key] = r.rawData[key];
        break;
      }
    }
  }

  const realAIResults = results.filter(r => r.usedRealAI);
  const avgConf = realAIResults.length > 0
    ? realAIResults.reduce((s, r) => s + r.overallConfidence, 0) / realAIResults.length
    : 0;

  const combinedText = results
    .map((r, i) => r.rawTextFound ? `[Page ${i + 1}] ${r.rawTextFound}` : '')
    .filter(Boolean)
    .join('\n');

  const allWarnings = [...new Set(results.flatMap(r => r.warnings))];

  return {
    rawData: mergedRawData,
    drawingType: results[0].drawingType,
    overallConfidence: avgConf,
    rawTextFound: combinedText,
    usedRealAI: results.some(r => r.usedRealAI),
    warnings: allWarnings,
  };
}

/**
 * GET /api/analyze-drawing
 * Health check — returns whether Gemini is configured.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    geminiAvailable: isGeminiAvailable(),
    model: 'gemini-2.0-flash',
    supportedDrawingTypes: ['foundation', 'structural', 'column_layout', 'beam_layout', 'section', 'elevation', 'architectural'],
    status: 'ready',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAPPING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map raw Gemini extraction result to the structured DrawingAnalysis type.
 * This bridges the flexible Gemini JSON output into our strict type system.
 */
function mapGeminiResultToDrawingAnalysis(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
  drawingType: DrawingType,
  drawingId: string,
  projectId: string,
  fileName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  geminiResult: any
): DrawingAnalysis {
  const detectedElements: DetectedElement[] = [];
  const id = () => Math.random().toString(36).substring(2, 11);

  // ── Extract elements by drawing type ────────────────────────────────────

  if (drawingType === 'architectural') {
    // Rooms
    const rooms = Array.isArray(data.rooms) ? data.rooms : [];
    for (const room of rooms) {
      detectedElements.push({
        id: id(),
        type: 'room',
        label: room.name || 'Unknown Room',
        dimensions: {
          length: room.lengthFt || undefined,
          width: room.widthFt || undefined,
          area: room.areaSqFt || undefined,
          unit: 'ft',
        },
        confidence: room.confidence || 0.8,
        sourceDrawingId: drawingId,
      });
    }
    // Doors
    const doors = Array.isArray(data.doors) ? data.doors : [];
    for (const door of doors) {
      detectedElements.push({
        id: id(), type: 'door', label: door.label || 'Door',
        dimensions: { width: door.widthFt, height: door.heightFt, unit: 'ft' },
        confidence: door.confidence || 0.85,
        sourceDrawingId: drawingId,
      });
    }
    // Windows
    const windows = Array.isArray(data.windows) ? data.windows : [];
    for (const win of windows) {
      detectedElements.push({
        id: id(), type: 'window', label: win.label || 'Window',
        dimensions: { width: win.widthFt, height: win.heightFt, unit: 'ft' },
        confidence: win.confidence || 0.82,
        sourceDrawingId: drawingId,
      });
    }
    // Columns visible in arch plan
    const columns = Array.isArray(data.columns) ? data.columns : [];
    for (const col of columns) {
      detectedElements.push({
        id: id(), type: 'column', label: col.label || 'Column',
        dimensions: { width: col.widthIn, height: col.depthIn, unit: 'in' },
        confidence: col.confidence || 0.75,
        sourceDrawingId: drawingId,
      });
    }
  }

  if (drawingType === 'column_layout') {
    const columns = Array.isArray(data.columns) ? data.columns : [];
    for (const col of columns) {
      const widthIn = col.widthIn || (col.widthMm ? col.widthMm / 25.4 : undefined);
      const depthIn = col.depthIn || (col.depthMm ? col.depthMm / 25.4 : undefined);
      detectedElements.push({
        id: id(), type: 'column', label: col.label || col.gridRef || 'Column',
        dimensions: { width: widthIn, height: depthIn, unit: 'in' },
        confidence: col.confidence || 0.88,
        sourceDrawingId: drawingId,
      });
    }
  }

  if (drawingType === 'beam_layout') {
    const beams = Array.isArray(data.beams) ? data.beams : [];
    for (const beam of beams) {
      const widthIn = beam.widthIn || (beam.widthMm ? beam.widthMm / 25.4 : undefined);
      const depthIn = beam.depthIn || (beam.depthMm ? beam.depthMm / 25.4 : undefined);
      detectedElements.push({
        id: id(), type: 'beam', label: beam.label || 'Beam',
        dimensions: { length: beam.spanFt, width: widthIn, height: depthIn, unit: 'ft' },
        confidence: beam.confidence || 0.85,
        sourceDrawingId: drawingId,
      });
    }
  }

  if (drawingType === 'structural') {
    // Columns
    const columns = Array.isArray(data.columns) ? data.columns : [];
    for (const col of columns) {
      const widthIn = (col.widthMm || 0) / 25.4 || undefined;
      const depthIn = (col.depthMm || 0) / 25.4 || undefined;
      detectedElements.push({
        id: id(), type: 'column', label: col.label || 'Column',
        dimensions: { width: widthIn, height: depthIn, unit: 'in' },
        confidence: col.confidence || 0.85,
        sourceDrawingId: drawingId,
      });
    }
    // Beams
    const beams = Array.isArray(data.beams) ? data.beams : [];
    for (const beam of beams) {
      const widthIn = (beam.widthMm || 0) / 25.4 || undefined;
      const depthIn = (beam.depthMm || 0) / 25.4 || undefined;
      detectedElements.push({
        id: id(), type: 'beam', label: beam.label || 'Beam',
        dimensions: { length: beam.spanFt, width: widthIn, height: depthIn, unit: 'ft' },
        confidence: beam.confidence || 0.83,
        sourceDrawingId: drawingId,
      });
    }
    // Slabs
    const slabs = Array.isArray(data.slabs) ? data.slabs : [];
    for (const slab of slabs) {
      detectedElements.push({
        id: id(), type: 'slab', label: slab.label || 'Slab',
        dimensions: { thickness: slab.thicknessInch, unit: 'in' },
        confidence: slab.confidence || 0.82,
        sourceDrawingId: drawingId,
      });
    }
  }

  if (drawingType === 'foundation') {
    const footings = Array.isArray(data.footings) ? data.footings : [];
    for (const footing of footings) {
      detectedElements.push({
        id: id(), type: 'opening', // Using 'opening' as proxy for footing
        label: footing.label || 'Footing',
        dimensions: {
          length: footing.lengthFt,
          width: footing.widthFt,
          height: footing.depthFt,
          unit: 'ft',
        },
        confidence: footing.confidence || 0.85,
        sourceDrawingId: drawingId,
      });
    }
  }

  if (drawingType === 'section') {
    if (data.staircasePresent) {
      detectedElements.push({
        id: id(), type: 'staircase', label: 'Staircase',
        dimensions: {
          width: data.staircase?.flightWidthFt,
          height: data.staircase?.riserHeightIn,
          unit: 'ft',
        },
        confidence: 0.80,
        sourceDrawingId: drawingId,
      });
    }
  }

  // ── Extract Dimensions ────────────────────────────────────────────────────
  const dims: ExtractedDimensions = { isAssumed: false };

  // Universal fields
  dims.floorHeight = data.floorToFloorHeightFt || data.floorHeightFt || undefined;
  dims.slabThickness = data.slabThicknessInch || undefined;
  dims.wallThickness = data.wallThicknessInch || data.walls?.externalThicknessIn || undefined;
  dims.foundationDepth = data.foundationDepthFt || data.foundationDetails?.footingDepthFt || undefined;
  dims.totalLength = data.buildingLengthFt || undefined;
  dims.totalWidth = data.buildingWidthFt || undefined;

  // Column-specific
  if (drawingType === 'column_layout' || drawingType === 'structural') {
    const firstCol = Array.isArray(data.columns) && data.columns.length > 0 ? data.columns[0] : null;
    if (firstCol) {
      dims.columnWidth = firstCol.widthIn || (firstCol.widthMm ? firstCol.widthMm / 25.4 : undefined);
      dims.columnDepth = firstCol.depthIn || (firstCol.depthMm ? firstCol.depthMm / 25.4 : undefined);
    }
  }

  // Beam-specific
  if (drawingType === 'beam_layout' || drawingType === 'structural') {
    const domBeam = data.dominantBeamSize;
    if (domBeam) {
      dims.beamWidth = domBeam.widthIn || undefined;
      dims.beamDepth = domBeam.depthIn || undefined;
    }
  }

  // Validate the unit
  dims.unit = 'ft';
  if (!dims.floorHeight && !dims.totalLength) {
    dims.isAssumed = true;
  }

  // ── Guard individual dimension fields ─────────────────────────────────────
  if (dims.slabThickness) {
    const g = guardDimension('slab', 'thickness', dims.slabThickness, 'in');
    if (g && !g.valid) dims.slabThickness = undefined;
  }
  if (dims.floorHeight) {
    const g = guardDimension('floor', 'height', dims.floorHeight, 'ft');
    if (g && !g.valid) dims.floorHeight = undefined;
  }

  // ── Build final DrawingAnalysis ───────────────────────────────────────────
  const rawOcrText = [
    `[Gemini Vision] File: ${fileName} | Type: ${getDrawingTypeLabel(drawingType)}`,
    geminiResult.rawTextFound ? `OCR Text: ${geminiResult.rawTextFound.substring(0, 500)}` : '',
    geminiResult.warnings?.length ? `Warnings: ${geminiResult.warnings.join('; ')}` : '',
    `Real AI: ${geminiResult.usedRealAI ? 'Yes' : 'No (simulated)'}`,
  ].filter(Boolean).join('\n');

  return {
    id: id(),
    drawingId,
    projectId,
    detectedElements,
    extractedDimensions: dims,
    rawOcrText,
    analysisVersion: geminiResult.usedRealAI ? '2.0.0-gemini' : '1.0.0-mvp',
    analyzedAt: new Date().toISOString(),
    confidenceScore: geminiResult.overallConfidence || 0.75,
  };
}
