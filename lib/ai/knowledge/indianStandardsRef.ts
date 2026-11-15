/**
 * Indian Standards Reference for Construction Drawings
 * Quick-reference data for validating AI-extracted values against IS codes.
 *
 * References:
 *   IS 456:2000  — Plain and Reinforced Concrete Code of Practice
 *   IS 1904:1986 — Foundations in Soils
 *   IS 875:1987  — Design Loads (Parts 1-5)
 *   IS 13920:2016 — Ductile Design and Detailing
 *   IS 800:2007  — General Construction in Steel
 *   IS 962:1989  — Architectural Drawing Practice
 *   NBC 2016     — National Building Code of India
 */

// ─────────────────────────────────────────────────────────────────────────────
// DIMENSIONAL LIMITS (IS 456:2000)
// ─────────────────────────────────────────────────────────────────────────────

export const IS456_LIMITS = {
  column: {
    minDimensionMm: 200,          // Cl. 26.5.3 — minimum 200mm
    minDimensionIn: 8,
    minSteelPercent: 0.8,         // Cl. 26.5.3.1
    maxSteelPercent: 6.0,         // Cl. 26.5.3.1
    minLateralTieDiamMm: 6,       // Cl. 26.5.3.2
    maxLateralTieSpacingMm: 300,  // Cl. 26.5.3.2
    coverMm: 40,                  // Cl. 26.4.1 Table 16
  },
  beam: {
    minWidthMm: 200,              // Cl. 26.5.1.1
    minWidthIn: 8,
    minSteelPercent: 0.85 / 415,  // Cl. 26.5.1.1 — As/bd ≥ 0.85/fy
    maxSteelPercent: 4.0,         // Cl. 26.5.1.1 — tension zone
    minCoverMm: 25,               // Cl. 26.4 — moderate exposure
    coverMm: 25,
  },
  slab: {
    minThicknessMm: 100,          // Cl. 24.1 — minimum 100mm (4")
    minThicknessIn: 4,
    coverMm: 20,
    maxSpacingMm: 300,            // Cl. 26.3.3 — main bars
    minSteelPercent: 0.12,        // Cl. 26.5.2.1 (HYSD) / 0.15 (mild steel)
  },
  wall: {
    minThicknessMm: 100,          // for RCC walls
    loadBearingMinMm: 200,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FLOOR HEIGHT STANDARDS (NBC 2016)
// ─────────────────────────────────────────────────────────────────────────────

export const NBC_FLOOR_HEIGHTS = {
  residential: {
    minClearHeightM: 2.75,        // NBC 2016 Part 4 — 2.75m minimum
    minClearHeightFt: 9,
    typicalFloorToFloorFt: { min: 9, max: 11, typical: 10 },
  },
  commercial: {
    minClearHeightM: 3.0,
    minClearHeightFt: 10,
    typicalFloorToFloorFt: { min: 10, max: 14, typical: 12 },
  },
  industrial: {
    minClearHeightM: 4.0,
    minClearHeightFt: 13,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// OPENING DIMENSIONS (NBC 2016 + IS 4351)
// ─────────────────────────────────────────────────────────────────────────────

export const STANDARD_OPENINGS = {
  doors: {
    residential: {
      mainDoor: { widthFt: [3, 3.5, 4], heightFt: [7, 7.5, 8] },
      bedroom: { widthFt: [2.5, 3], heightFt: [7] },
      bathroom: { widthFt: [2, 2.5], heightFt: [7] },
    },
    commercial: {
      entrance: { widthFt: [4, 5, 6], heightFt: [8, 9] },
    },
  },
  windows: {
    residential: {
      bedroom: { widthFt: [3, 4, 5], heightFt: [3.5, 4, 4.5] },
      kitchen: { widthFt: [2.5, 3], heightFt: [3] },
      bathroom: { widthFt: [1.5, 2], heightFt: [2, 2.5] },
    },
    sillHeightFt: { min: 2.5, max: 3.5, typical: 3 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FOUNDATION DEPTH RULES (IS 1904:1986)
// ─────────────────────────────────────────────────────────────────────────────

export const IS1904_FOUNDATION_DEPTHS = {
  minimum: {
    note: 'Minimum depth from finished ground level',
    depthM: 0.5,
    depthFt: 1.5,
  },
  frost: {
    note: 'Below frost line — not applicable for most Indian locations',
    depthM: 0,
  },
  bearingCapacityBased: {
    softSoil:   { qsafeKNm2: 75,  depthFt: 5 },
    mediumSoil: { qsafeKNm2: 100, depthFt: 4 },
    hardSoil:   { qsafeKNm2: 200, depthFt: 3 },
    softRock:   { qsafeKNm2: 440, depthFt: 2.5 },
    hardRock:   { qsafeKNm2: 3240, depthFt: 1 },
  },
  byFloors: {
    // Typical practice for Indian residential buildings
    1: { depthFt: 3, note: 'G+0: min 3ft in medium soil' },
    2: { depthFt: 4, note: 'G+1: min 4ft' },
    3: { depthFt: 5, note: 'G+2: min 5ft' },
    4: { depthFt: 6, note: 'G+3: min 6ft, often pile' },
    5: { depthFt: 7, note: 'G+4+: pile recommended' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SCALE STANDARDS (IS 962:1989)
// ─────────────────────────────────────────────────────────────────────────────

export const STANDARD_DRAWING_SCALES: Record<string, string[]> = {
  site_plan:       ['1:500', '1:1000', '1:2000'],
  architectural:   ['1:50', '1:100', '1:200'],
  structural:      ['1:50', '1:100'],
  foundation:      ['1:50', '1:100'],
  section:         ['1:25', '1:50'],
  detail:          ['1:10', '1:20'],
  elevation:       ['1:50', '1:100'],
};

// ─────────────────────────────────────────────────────────────────────────────
// UNIT CONVERSION
// ─────────────────────────────────────────────────────────────────────────────

export const UNIT_CONVERSIONS = {
  ftToMm: 304.8,
  ftToM:  0.3048,
  inToMm: 25.4,
  inToFt: 0.0833,
  mToFt:  3.2808,
  mmToIn: 0.03937,
  sqFtToSqM: 0.0929,
  cftToM3: 0.02832,
};

/** Normalize a dimension string to feet value (handles mm, m, ft, inches) */
export function normalizeDimensionToFt(value: number, unit: 'mm' | 'm' | 'ft' | 'in'): number {
  switch (unit) {
    case 'mm': return value / 304.8;
    case 'm':  return value * 3.2808;
    case 'in': return value / 12;
    case 'ft': return value;
    default:   return value;
  }
}

/** Quick validation: is this dimension within plausible range for a construction element? */
export function validateDimension(
  valueFt: number,
  elementType: 'column_width' | 'beam_depth' | 'slab_thickness_in' | 'floor_height' | 'foundation_depth' | 'plot_dimension'
): { valid: boolean; message: string } {
  const ranges: Record<typeof elementType, { min: number; max: number; unit: string }> = {
    column_width:      { min: 0.5,  max: 4,    unit: 'ft' },
    beam_depth:        { min: 0.75, max: 3.5,  unit: 'ft' },
    slab_thickness_in: { min: 4,    max: 10,   unit: 'in' },
    floor_height:      { min: 8,    max: 16,   unit: 'ft' },
    foundation_depth:  { min: 2,    max: 50,   unit: 'ft' },
    plot_dimension:    { min: 10,   max: 500,  unit: 'ft' },
  };
  const r = ranges[elementType];
  if (valueFt < r.min || valueFt > r.max) {
    return { valid: false, message: `${elementType} value ${valueFt.toFixed(2)}${r.unit} is outside expected range [${r.min}–${r.max}${r.unit}]` };
  }
  return { valid: true, message: `${elementType} value ${valueFt.toFixed(2)}${r.unit} is valid` };
}
