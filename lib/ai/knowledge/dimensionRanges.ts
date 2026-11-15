/**
 * Dimension Ranges — Guard Rails for AI Extraction
 * Prevents OCR/AI errors from producing impossible structural values.
 * All ranges are based on IS codes and practical Indian construction experience.
 */

export interface DimensionRange {
  elementType: string;
  property: string;
  unit: 'ft' | 'in' | 'm' | 'mm';
  min: number;
  max: number;
  typical: number;
  note: string;
}

export const DIMENSION_RANGES: DimensionRange[] = [
  // ── Foundation ──────────────────────────────────────────────────────────────
  {
    elementType: 'footing', property: 'depth',
    unit: 'ft', min: 2, max: 25, typical: 5,
    note: 'Isolated column footing depth (for pile, depth can exceed 25ft)',
  },
  {
    elementType: 'footing', property: 'width',
    unit: 'ft', min: 2.5, max: 15, typical: 5,
    note: 'Footing plan width/length',
  },
  {
    elementType: 'raft', property: 'thickness',
    unit: 'in', min: 8, max: 24, typical: 12,
    note: 'Raft/mat slab thickness',
  },
  {
    elementType: 'pile', property: 'diameter',
    unit: 'mm', min: 300, max: 1500, typical: 450,
    note: 'Bored cast in-situ pile diameter',
  },
  {
    elementType: 'pile', property: 'depth',
    unit: 'ft', min: 15, max: 100, typical: 30,
    note: 'Pile depth from cut-off level',
  },
  {
    elementType: 'plinth_beam', property: 'depth',
    unit: 'in', min: 9, max: 18, typical: 12,
    note: 'Plinth / grade beam depth',
  },

  // ── Columns ─────────────────────────────────────────────────────────────────
  {
    elementType: 'column', property: 'width',
    unit: 'in', min: 8, max: 36, typical: 12,
    note: 'Column width (shorter dimension)',
  },
  {
    elementType: 'column', property: 'depth',
    unit: 'in', min: 9, max: 48, typical: 15,
    note: 'Column depth (longer dimension)',
  },
  {
    elementType: 'column', property: 'height',
    unit: 'ft', min: 8, max: 20, typical: 10,
    note: 'Floor-to-floor column height',
  },

  // ── Beams ────────────────────────────────────────────────────────────────────
  {
    elementType: 'beam', property: 'width',
    unit: 'in', min: 8, max: 24, typical: 9,
    note: 'Beam width (narrower dimension)',
  },
  {
    elementType: 'beam', property: 'depth',
    unit: 'in', min: 9, max: 36, typical: 18,
    note: 'Beam overall depth',
  },
  {
    elementType: 'beam', property: 'span',
    unit: 'ft', min: 4, max: 30, typical: 15,
    note: 'Beam clear span between supports',
  },
  {
    elementType: 'lintel', property: 'depth',
    unit: 'in', min: 6, max: 15, typical: 9,
    note: 'Lintel beam depth',
  },

  // ── Slabs ────────────────────────────────────────────────────────────────────
  {
    elementType: 'slab', property: 'thickness',
    unit: 'in', min: 4, max: 10, typical: 5,
    note: 'RCC slab thickness',
  },

  // ── Walls ────────────────────────────────────────────────────────────────────
  {
    elementType: 'external_wall', property: 'thickness',
    unit: 'in', min: 7, max: 12, typical: 9,
    note: 'External brick/AAC wall thickness',
  },
  {
    elementType: 'internal_wall', property: 'thickness',
    unit: 'in', min: 4, max: 9, typical: 4.5,
    note: 'Internal partition wall thickness',
  },

  // ── Floor Heights ─────────────────────────────────────────────────────────
  {
    elementType: 'floor', property: 'height',
    unit: 'ft', min: 8, max: 16, typical: 10,
    note: 'Floor-to-floor height (slab to slab)',
  },
  {
    elementType: 'parapet', property: 'height',
    unit: 'ft', min: 1.5, max: 4, typical: 3,
    note: 'Parapet wall height above roof slab',
  },

  // ── Plot / Building ──────────────────────────────────────────────────────
  {
    elementType: 'plot', property: 'length',
    unit: 'ft', min: 15, max: 1000, typical: 60,
    note: 'Plot length',
  },
  {
    elementType: 'plot', property: 'width',
    unit: 'ft', min: 10, max: 500, typical: 40,
    note: 'Plot width',
  },
  {
    elementType: 'building', property: 'height',
    unit: 'ft', min: 9, max: 300, typical: 30,
    note: 'Total building height (ground to roof)',
  },

  // ── Doors & Windows ──────────────────────────────────────────────────────
  {
    elementType: 'door', property: 'width',
    unit: 'ft', min: 1.5, max: 6, typical: 3,
    note: 'Door opening width',
  },
  {
    elementType: 'door', property: 'height',
    unit: 'ft', min: 6, max: 10, typical: 7,
    note: 'Door opening height',
  },
  {
    elementType: 'window', property: 'width',
    unit: 'ft', min: 1.5, max: 8, typical: 4,
    note: 'Window opening width',
  },
  {
    elementType: 'window', property: 'height',
    unit: 'ft', min: 2, max: 6, typical: 4,
    note: 'Window opening height',
  },
];

/**
 * Validate an extracted dimension value against known plausible ranges.
 * Returns null if the element/property combination is not in the guard table.
 */
export function guardDimension(
  elementType: string,
  property: string,
  value: number,
  unit: 'ft' | 'in' | 'm' | 'mm'
): { valid: boolean; clamped: number; message: string } | null {
  const range = DIMENSION_RANGES.find(
    r => r.elementType === elementType && r.property === property && r.unit === unit
  );
  if (!range) return null;

  if (value < range.min) {
    return {
      valid: false,
      clamped: range.typical,
      message: `${elementType} ${property} ${value}${unit} is below minimum ${range.min}${unit}. Using typical ${range.typical}${unit}.`,
    };
  }
  if (value > range.max) {
    return {
      valid: false,
      clamped: range.typical,
      message: `${elementType} ${property} ${value}${unit} exceeds maximum ${range.max}${unit}. Using typical ${range.typical}${unit}.`,
    };
  }
  return { valid: true, clamped: value, message: 'Value within expected range' };
}

/** Get typical dimension for an element property (fallback when AI cannot extract) */
export function getTypicalDimension(
  elementType: string,
  property: string,
  unit: 'ft' | 'in' | 'm' | 'mm'
): number | null {
  const range = DIMENSION_RANGES.find(
    r => r.elementType === elementType && r.property === property && r.unit === unit
  );
  return range ? range.typical : null;
}
