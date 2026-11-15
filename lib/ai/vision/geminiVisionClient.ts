/**
 * Gemini Vision Client
 * Handles all communication with the Google Gemini Vision API.
 * Used SERVER-SIDE only (API route) to keep the API key secure.
 *
 * Supports:
 * - Image analysis (PNG, JPG, JPEG)
 * - Base64 PDF page analysis
 * - Structured JSON output
 * - Graceful fallback when API key is absent
 */

import { DrawingType } from '../../../types/blueprint';
import { getPromptForDrawingType, getDrawingClassificationPrompt } from './drawingPrompts';
import { guardDimension } from '../knowledge/dimensionRanges';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface GeminiAnalysisResult {
  /** Raw parsed JSON from Gemini */
  rawData: Record<string, unknown>;
  /** Drawing type this was analyzed as */
  drawingType: DrawingType;
  /** 0.0–1.0 overall confidence from Gemini */
  overallConfidence: number;
  /** All text/numbers Gemini found in the drawing */
  rawTextFound: string;
  /** Whether real Gemini API was used (vs. simulation) */
  usedRealAI: boolean;
  /** Any warnings produced during extraction */
  warnings: string[];
}

export interface GeminiClassificationResult {
  drawingType: DrawingType;
  confidence: number;
  reasoning: string;
  alternativeType: DrawingType | null;
  usedRealAI: boolean;
}

interface GeminiAPIResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// GEMINI API CLIENT (works via fetch — no SDK dependency needed)
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.0-flash';

/**
 * Call Gemini Vision API with an image and a prompt.
 * Returns the parsed JSON response, or throws on failure.
 *
 * @param imageBase64 - Base64-encoded image data (without data:image/... prefix)
 * @param mimeType    - MIME type of the image
 * @param prompt      - The prompt to send
 * @param apiKey      - Gemini API key
 */
async function callGeminiVision(
  imageBase64: string,
  mimeType: 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/webp',
  prompt: string,
  apiKey: string
): Promise<string> {
  const url = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: imageBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,          // Low temperature = more deterministic / accurate
      topP: 0.8,
      maxOutputTokens: 4096,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${error}`);
  }

  const data = (await response.json()) as GeminiAPIResponse;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('Gemini returned empty response');
  }

  return text;
}

/**
 * Parse JSON from Gemini output, handling code fences and trailing text.
 */
function parseGeminiJSON(text: string): Record<string, unknown> {
  // Remove markdown code fences
  let cleaned = text.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();

  // Find the first { and last }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`No JSON object found in Gemini response: ${cleaned.substring(0, 200)}`);
  }
  cleaned = cleaned.substring(start, end + 1);

  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch (e) {
    throw new Error(`Failed to parse Gemini JSON: ${(e as Error).message}. Content: ${cleaned.substring(0, 300)}`);
  }
}

/**
 * Apply dimension guard rails to an analysis result.
 * Replaces impossible values with null and records warnings.
 */
function applyGuardRails(
  data: Record<string, unknown>,
  warnings: string[]
): Record<string, unknown> {
  const checks: Array<{ path: string; elementType: string; property: string; unit: 'ft' | 'in' | 'mm' | 'm' }> = [
    { path: 'floorToFloorHeightFt',    elementType: 'floor',         property: 'height',       unit: 'ft' },
    { path: 'slabThicknessInch',       elementType: 'slab',          property: 'thickness',    unit: 'in' },
    { path: 'wallThicknessInch',       elementType: 'external_wall', property: 'thickness',    unit: 'in' },
    { path: 'foundationDepthFt',       elementType: 'footing',       property: 'depth',        unit: 'ft' },
    { path: 'totalHeightFt',           elementType: 'building',      property: 'height',       unit: 'ft' },
    { path: 'buildingLengthFt',        elementType: 'plot',          property: 'length',       unit: 'ft' },
    { path: 'buildingWidthFt',         elementType: 'plot',          property: 'width',        unit: 'ft' },
  ];

  const result = { ...data };
  for (const check of checks) {
    const value = result[check.path];
    if (typeof value === 'number' && value > 0) {
      const guard = guardDimension(check.elementType, check.property, value, check.unit);
      if (guard && !guard.valid) {
        warnings.push(guard.message);
        result[check.path] = null; // Invalidate impossible value
      }
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Classify a drawing by its visual content using Gemini Vision.
 * Falls back to 'unknown' with low confidence if API is unavailable.
 */
export async function classifyDrawingWithGemini(
  imageBase64: string,
  mimeType: 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/webp',
  apiKey: string
): Promise<GeminiClassificationResult> {
  if (!apiKey) {
    return {
      drawingType: 'unknown',
      confidence: 0,
      reasoning: 'No Gemini API key configured — using filename classification only',
      alternativeType: null,
      usedRealAI: false,
    };
  }

  try {
    const prompt = getDrawingClassificationPrompt();
    const rawText = await callGeminiVision(imageBase64, mimeType, prompt, apiKey);
    const parsed = parseGeminiJSON(rawText);

    return {
      drawingType: (parsed.drawingType as DrawingType) || 'unknown',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5,
      reasoning: (parsed.reasoning as string) || '',
      alternativeType: (parsed.alternativeType as DrawingType) || null,
      usedRealAI: true,
    };
  } catch (error) {
    console.error('[GeminiVision] Classification failed:', error);
    return {
      drawingType: 'unknown',
      confidence: 0.3,
      reasoning: `Vision API error: ${(error as Error).message}`,
      alternativeType: null,
      usedRealAI: false,
    };
  }
}

/**
 * Fully analyze a drawing with Gemini Vision.
 * Returns structured extraction results plus raw text.
 */
export async function analyzeDrawingWithGemini(
  imageBase64: string,
  mimeType: 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/webp',
  drawingType: DrawingType,
  apiKey: string
): Promise<GeminiAnalysisResult> {
  const warnings: string[] = [];

  if (!apiKey) {
    return {
      rawData: {},
      drawingType,
      overallConfidence: 0,
      rawTextFound: '',
      usedRealAI: false,
      warnings: ['No Gemini API key — analysis simulated'],
    };
  }

  try {
    const prompt = getPromptForDrawingType(drawingType);
    const rawText = await callGeminiVision(imageBase64, mimeType, prompt, apiKey);
    const parsed = parseGeminiJSON(rawText);

    // Apply dimension guard rails
    const guarded = applyGuardRails(parsed, warnings);

    return {
      rawData: guarded,
      drawingType,
      overallConfidence: typeof guarded.overallConfidence === 'number'
        ? (guarded.overallConfidence as number)
        : 0.7,
      rawTextFound: (guarded.rawTextFound as string) || '',
      usedRealAI: true,
      warnings,
    };
  } catch (error) {
    const msg = `Gemini analysis error: ${(error as Error).message}`;
    console.error('[GeminiVision]', msg);
    return {
      rawData: {},
      drawingType,
      overallConfidence: 0,
      rawTextFound: '',
      usedRealAI: false,
      warnings: [msg],
    };
  }
}

/**
 * Check if the Gemini API key is configured in the environment.
 */
export function isGeminiAvailable(): boolean {
  return !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

/**
 * Get the configured API key (checks multiple env var names).
 */
export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
}
