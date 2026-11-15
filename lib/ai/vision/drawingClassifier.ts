/**
 * Drawing Classifier
 * Module: Vision / AI
 * Classifies uploaded construction drawings by type based on:
 * 1. Filename keyword analysis
 * 2. Heuristic pattern matching
 * Returns a DrawingType and a confidence score.
 */

import { DrawingType } from '../../../types/blueprint';

export interface ClassificationResult {
  drawingType: DrawingType;
  confidence: number;
  label: string;
  description: string;
}

/** Keyword map for each drawing type — order matters (most specific first) */
const DRAWING_TYPE_KEYWORDS: Record<DrawingType, string[]> = {
  foundation: [
    'foundation', 'footing', 'footing plan', 'foundation plan', 'pile', 'raft', 'mat foundation',
    'strip footing', 'combined footing', 'pedestal', 'substructure', 'gravel', 'pad foundation'
  ],
  structural: [
    'structural', 'structure', 'struct', 'rcc plan', 'reinforcement', 'rebar', 'framing',
    'frame plan', 'roof plan', 'roof structure', 'floor plan structural', 'moment frame'
  ],
  column_layout: [
    'column', 'column layout', 'column plan', 'col layout', 'col plan', 'column schedule',
    'column detail', 'pillar', 'vertical member', 'column position'
  ],
  beam_layout: [
    'beam', 'beam layout', 'beam plan', 'beam detail', 'beam schedule', 'lintel',
    'lintel beam', 'plinth beam', 'grade beam', 'tie beam', 'horizontal member'
  ],
  section: [
    'section', 'cross section', 'cross-section', 'longitudinal section', 'sectional',
    'wall section', 'building section', 'aa section', 'bb section', 'cut section', 'detail'
  ],
  elevation: [
    'elevation', 'front elevation', 'rear elevation', 'side elevation', 'east elevation',
    'west elevation', 'north elevation', 'south elevation', 'facade', 'external view',
    'exterior view', 'perspective elevation'
  ],
  architectural: [
    'architectural', 'floor plan', 'plan', 'layout', 'room layout', 'apartment plan',
    'house plan', 'bungalow plan', 'villa plan', 'residential plan', 'flat plan',
    'bhk', 'ground floor', 'first floor', 'second floor', 'gf', 'ff', 'sf',
    'site plan', 'master plan', 'working plan', 'proposed plan', 'general arrangement'
  ],
  unknown: []
};

const DRAWING_TYPE_LABELS: Record<DrawingType, string> = {
  foundation:    'Foundation Plan',
  structural:    'Structural Drawing',
  column_layout: 'Column Layout',
  beam_layout:   'Beam Layout',
  section:       'Section Drawing',
  elevation:     'Elevation Drawing',
  architectural: 'Architectural Plan',
  unknown:       'Unknown Drawing'
};

const DRAWING_TYPE_DESCRIPTIONS: Record<DrawingType, string> = {
  foundation:    'Shows foundation system: footings, depth, reinforcement details below ground',
  structural:    'RCC structural plans showing frames, slabs, and reinforcement layout',
  column_layout: 'Column position plan showing grid, sizes, and spacing of vertical members',
  beam_layout:   'Beam schedule showing sizes, spans, and positions of horizontal members',
  section:       'Cross-sectional view through the building showing internal structure',
  elevation:     'External face view of the building (front, rear, or side)',
  architectural: 'Floor layout plan showing rooms, walls, doors, windows, and dimensions',
  unknown:       'Drawing type could not be determined automatically'
};

/**
 * Classify a drawing by its filename.
 * Returns the most likely DrawingType and a confidence score (0.0–1.0).
 */
export function classifyDrawingByFilename(fileName: string): ClassificationResult {
  const normalized = fileName.toLowerCase().replace(/[_\-\.]/g, ' ');

  let bestType: DrawingType = 'unknown';
  let bestScore = 0;
  let matchCount = 0;

  // Score each type — foundation / structural / column / beam take priority
  for (const [type, keywords] of Object.entries(DRAWING_TYPE_KEYWORDS)) {
    if (type === 'unknown') continue;
    let score = 0;
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        // Longer keyword matches get higher weight (more specific = more confidence)
        score += kw.length >= 10 ? 0.9 : kw.length >= 6 ? 0.7 : 0.4;
        matchCount++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestType = type as DrawingType;
    }
  }

  // Cap confidence to a realistic range
  let confidence = Math.min(0.97, bestScore > 0 ? 0.55 + bestScore * 0.15 : 0);
  
  // If no matches found, fall back to architectural (most common)
  if (bestType === 'unknown' && matchCount === 0) {
    bestType = 'architectural';
    confidence = 0.40; // low confidence assumption
  }

  return {
    drawingType: bestType,
    confidence: Math.round(confidence * 100) / 100,
    label: DRAWING_TYPE_LABELS[bestType],
    description: DRAWING_TYPE_DESCRIPTIONS[bestType]
  };
}

/**
 * Get a human-readable label for a given DrawingType.
 */
export function getDrawingTypeLabel(type: DrawingType): string {
  return DRAWING_TYPE_LABELS[type] || 'Unknown Drawing';
}

/**
 * Get a description for a given DrawingType.
 */
export function getDrawingTypeDescription(type: DrawingType): string {
  return DRAWING_TYPE_DESCRIPTIONS[type] || '';
}

/**
 * Return all available drawing types for selection in the UI.
 */
export function getAllDrawingTypes(): Array<{ value: DrawingType; label: string; description: string }> {
  return (Object.keys(DRAWING_TYPE_LABELS) as DrawingType[])
    .filter(t => t !== 'unknown')
    .map(t => ({
      value: t,
      label: DRAWING_TYPE_LABELS[t],
      description: DRAWING_TYPE_DESCRIPTIONS[t]
    }));
}
