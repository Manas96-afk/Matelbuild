/**
 * Vision-Based Drawing Type Detector
 * Upgrades the filename-only classifier to use actual image content via Gemini Vision.
 * Falls back to filename classification when vision API is unavailable.
 */

import { DrawingType } from '../../../types/blueprint';
import { classifyDrawingByFilename, ClassificationResult } from './drawingClassifier';
import { classifyDrawingWithGemini, GeminiClassificationResult } from './geminiVisionClient';

export interface VisionClassificationResult extends ClassificationResult {
  visionConfidence: number;
  filenameConfidence: number;
  usedVision: boolean;
  visualReasoning: string;
  alternativeType: DrawingType | null;
}

/**
 * Classify a drawing using combined vision + filename analysis.
 * Vision result takes priority if confidence > 0.6, otherwise falls back to filename.
 *
 * @param fileName   - Original file name (for filename-based fallback)
 * @param imageBase64 - Base64 image data for vision analysis
 * @param mimeType   - MIME type of the image
 * @param apiKey     - Gemini API key (empty string to skip vision)
 */
export async function classifyDrawingVision(
  fileName: string,
  imageBase64: string,
  mimeType: 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/webp',
  apiKey: string
): Promise<VisionClassificationResult> {
  // Always run filename classification first (fast, synchronous)
  const filenameResult = classifyDrawingByFilename(fileName);

  // If no API key, return filename result with vision data = none
  if (!apiKey || !imageBase64) {
    return {
      ...filenameResult,
      visionConfidence: 0,
      filenameConfidence: filenameResult.confidence,
      usedVision: false,
      visualReasoning: 'Vision API not available — using filename classification',
      alternativeType: null,
    };
  }

  // Run vision classification
  let visionResult: GeminiClassificationResult;
  try {
    visionResult = await classifyDrawingWithGemini(imageBase64, mimeType, apiKey);
  } catch (error) {
    console.warn('[VisionClassifier] Vision classification failed, using filename:', error);
    return {
      ...filenameResult,
      visionConfidence: 0,
      filenameConfidence: filenameResult.confidence,
      usedVision: false,
      visualReasoning: `Vision failed: ${(error as Error).message}`,
      alternativeType: null,
    };
  }

  // ── Reconcile Vision + Filename Results ────────────────────────────────────

  // Vision wins if confidence >= 0.65
  const useVision = visionResult.usedRealAI && visionResult.confidence >= 0.65;

  const finalType = useVision ? visionResult.drawingType : filenameResult.drawingType;

  // Final confidence = weighted combination
  const finalConfidence = useVision
    ? Math.min(0.98, visionResult.confidence * 0.8 + filenameResult.confidence * 0.2)
    : Math.min(0.97, filenameResult.confidence);

  const LABELS: Record<DrawingType, string> = {
    foundation:    'Foundation Plan',
    structural:    'Structural Drawing',
    column_layout: 'Column Layout',
    beam_layout:   'Beam Layout',
    section:       'Section Drawing',
    elevation:     'Elevation Drawing',
    architectural: 'Architectural Plan',
    unknown:       'Unknown Drawing',
  };

  const DESCRIPTIONS: Record<DrawingType, string> = {
    foundation:    'Shows foundation system: footings, depth, reinforcement details below ground',
    structural:    'RCC structural plans showing frames, slabs, and reinforcement layout',
    column_layout: 'Column position plan showing grid, sizes, and spacing of vertical members',
    beam_layout:   'Beam schedule showing sizes, spans, and positions of horizontal members',
    section:       'Cross-sectional view through the building showing internal structure',
    elevation:     'External face view of the building (front, rear, or side)',
    architectural: 'Floor layout plan showing rooms, walls, doors, windows, and dimensions',
    unknown:       'Drawing type could not be determined automatically',
  };

  return {
    drawingType: finalType,
    confidence: Math.round(finalConfidence * 100) / 100,
    label: LABELS[finalType],
    description: DESCRIPTIONS[finalType],
    visionConfidence: visionResult.confidence,
    filenameConfidence: filenameResult.confidence,
    usedVision: useVision,
    visualReasoning: visionResult.reasoning,
    alternativeType: visionResult.alternativeType,
  };
}
