/**
 * Structural Elements Knowledge Base
 * Domain knowledge for Buildora AI — standard dimensions, grade specifications,
 * and visual identifiers for RCC structural elements in Indian construction.
 *
 * References:
 *   IS 456:2000  — Plain and Reinforced Concrete Code of Practice
 *   IS 875:1987  — Code of Practice for Design Loads
 *   SP 16:1980   — Design Aids for Reinforced Concrete
 *   SP 34:1987   — Handbook on Concrete Reinforcement and Detailing
 */

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN STANDARDS
// ─────────────────────────────────────────────────────────────────────────────

export interface ColumnStandard {
  floors: number;
  minSizeInch: number;    // minimum square size
  typicalSizes: string[]; // common W×D in inches
  typicalGrade: string;
  steelPercentRange: string;
}

export const COLUMN_STANDARDS: ColumnStandard[] = [
  { floors: 1, minSizeInch: 9,  typicalSizes: ['9×9', '9×12', '12×12'],         typicalGrade: 'M20', steelPercentRange: '1.0–2.0%' },
  { floors: 2, minSizeInch: 9,  typicalSizes: ['9×12', '12×12', '12×15'],        typicalGrade: 'M20', steelPercentRange: '1.0–2.5%' },
  { floors: 3, minSizeInch: 12, typicalSizes: ['12×12', '12×15', '12×18'],        typicalGrade: 'M25', steelPercentRange: '1.5–3.0%' },
  { floors: 4, minSizeInch: 12, typicalSizes: ['12×18', '15×18', '18×18'],        typicalGrade: 'M25', steelPercentRange: '2.0–4.0%' },
  { floors: 5, minSizeInch: 15, typicalSizes: ['15×18', '18×18', '18×24'],        typicalGrade: 'M25', steelPercentRange: '2.5–4.0%' },
  { floors: 6, minSizeInch: 18, typicalSizes: ['18×18', '18×24', '24×24'],        typicalGrade: 'M30', steelPercentRange: '3.0–4.0%' },
];

// ─────────────────────────────────────────────────────────────────────────────
// BEAM STANDARDS
// ─────────────────────────────────────────────────────────────────────────────

export interface BeamStandard {
  type: string;
  description: string;
  typicalSpanFt: { min: number; max: number };
  widthInch: { min: number; max: number; typical: number };
  depthInch: { min: number; max: number; typical: number };
  depthToSpanRatio: string; // L/D rule of thumb
  visualLabel: string[];
}

export const BEAM_STANDARDS: BeamStandard[] = [
  {
    type: 'primary_beam',
    description: 'Main spanning beam between columns',
    typicalSpanFt: { min: 10, max: 25 },
    widthInch: { min: 9, max: 18, typical: 12 },
    depthInch: { min: 14, max: 30, typical: 18 },
    depthToSpanRatio: 'L/12 to L/10',
    visualLabel: ['B', 'MB', 'PB', 'MAIN BEAM', 'FB'],
  },
  {
    type: 'secondary_beam',
    description: 'Secondary beam between primary beams',
    typicalSpanFt: { min: 8, max: 18 },
    widthInch: { min: 9, max: 12, typical: 9 },
    depthInch: { min: 12, max: 20, typical: 15 },
    depthToSpanRatio: 'L/12 to L/10',
    visualLabel: ['SB', 'SEC BEAM', 'SECONDARY BEAM'],
  },
  {
    type: 'lintel_beam',
    description: 'Beam over door/window openings',
    typicalSpanFt: { min: 3, max: 8 },
    widthInch: { min: 9, max: 12, typical: 9 },
    depthInch: { min: 9, max: 12, typical: 9 },
    depthToSpanRatio: 'L/10',
    visualLabel: ['L', 'LL', 'LINTEL', 'LB', 'LINTEL BEAM'],
  },
  {
    type: 'plinth_beam',
    description: 'Beam at plinth level connecting column footings',
    typicalSpanFt: { min: 8, max: 20 },
    widthInch: { min: 9, max: 12, typical: 9 },
    depthInch: { min: 12, max: 18, typical: 12 },
    depthToSpanRatio: 'L/15 (tied to column grid)',
    visualLabel: ['PB', 'GB', 'PLINTH BEAM', 'GRADE BEAM', 'TIE BEAM'],
  },
  {
    type: 'cantilever_beam',
    description: 'Projecting beam (chajja/overhang support)',
    typicalSpanFt: { min: 2, max: 6 },
    widthInch: { min: 9, max: 12, typical: 9 },
    depthInch: { min: 12, max: 18, typical: 14 },
    depthToSpanRatio: 'L/7 to L/5 (deeper at root)',
    visualLabel: ['CB', 'CANT BEAM', 'CANTILEVER', 'CHAJJA BEAM'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SLAB STANDARDS
// ─────────────────────────────────────────────────────────────────────────────

export const SLAB_STANDARDS = {
  oneWaySlab: {
    description: 'Slab spanning in one direction (L/B ≥ 2)',
    thicknessInch: { min: 4, max: 6, typical: 5 },
    spanToDepthRatio: 'L/d = 26 (simply supported)',
    reinfLayout: 'Main bars one direction, distributors other',
  },
  twoWaySlab: {
    description: 'Slab spanning in two directions (L/B < 2)',
    thicknessInch: { min: 4.5, max: 6, typical: 5 },
    spanToDepthRatio: 'L/d = 32 (two-way)',
    reinfLayout: 'Steel in both directions at similar spacing',
  },
  flatSlab: {
    description: 'Slab directly supported on columns without beams',
    thicknessInch: { min: 6, max: 10, typical: 8 },
    spanToDepthRatio: 'L/d = 32 with drop panels',
    reinfLayout: 'Column strip and middle strip reinforcement pattern',
  },
  roofSlab: {
    description: 'Exposed terrace slab (may be thicker for thermal)',
    thicknessInch: { min: 5, max: 6, typical: 5 },
    waterproofing: 'IPS or china mosaic typically shown in elevation',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CONCRETE GRADES REFERENCE
// ─────────────────────────────────────────────────────────────────────────────

export interface ConcreteGradeInfo {
  grade: string;
  fckMPa: number;           // characteristic compressive strength
  typicalUse: string;
  mixRatio?: string;        // nominal mix
  waterCementRatio: number;
}

export const CONCRETE_GRADES: ConcreteGradeInfo[] = [
  { grade: 'M5',   fckMPa: 5,   typicalUse: 'PCC lean mix under footings',                mixRatio: '1:5:10', waterCementRatio: 0.8 },
  { grade: 'M7.5', fckMPa: 7.5, typicalUse: 'PCC blinding under slabs',                   mixRatio: '1:4:8',  waterCementRatio: 0.8 },
  { grade: 'M10',  fckMPa: 10,  typicalUse: 'PCC works, non-structural',                  mixRatio: '1:3:6',  waterCementRatio: 0.6 },
  { grade: 'M15',  fckMPa: 15,  typicalUse: 'Lightly loaded RCC, rarely used',            mixRatio: '1:2:4',  waterCementRatio: 0.6 },
  { grade: 'M20',  fckMPa: 20,  typicalUse: 'Standard residential RCC (slabs, beams)',    mixRatio: '1:1.5:3', waterCementRatio: 0.55 },
  { grade: 'M25',  fckMPa: 25,  typicalUse: 'Premium residential and commercial columns', mixRatio: '1:1:2',  waterCementRatio: 0.50 },
  { grade: 'M30',  fckMPa: 30,  typicalUse: 'High-rise columns and foundations',          waterCementRatio: 0.45 },
  { grade: 'M35',  fckMPa: 35,  typicalUse: 'Heavy commercial, bridges',                  waterCementRatio: 0.40 },
  { grade: 'M40',  fckMPa: 40,  typicalUse: 'Prestressed concrete, high-rise',            waterCementRatio: 0.38 },
];

// ─────────────────────────────────────────────────────────────────────────────
// STEEL / REBAR REFERENCE
// ─────────────────────────────────────────────────────────────────────────────

export const REBAR_STANDARDS = {
  grades: [
    { grade: 'Fe415', fy: 415, description: 'Standard HYSD bars — most common in India', color: 'standard' },
    { grade: 'Fe500', fy: 500, description: 'High-strength HYSD bars — premium projects', color: 'standard' },
    { grade: 'Fe550', fy: 550, description: 'Very high strength — heavy commercial', color: 'standard' },
    { grade: 'TMT',   fy: 500, description: 'Thermo-mechanically treated bars', color: 'standard' },
  ],
  commonDiametersMm: [8, 10, 12, 16, 20, 25, 32],
  notation: {
    'T8': 'Tor 8mm bar',
    'T10': 'Tor 10mm bar',
    'T12': 'Tor 12mm bar',
    'T16': 'Tor 16mm bar',
    'R8': 'Plain round 8mm (stirrups)',
    'R6': 'Plain round 6mm (ties)',
  },
  coverMm: {
    footing: 50,
    column: 40,
    beam: 25,
    slab: 20,
    exposed: 50,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN GRID DETECTION RULES
// ─────────────────────────────────────────────────────────────────────────────

/** Standard column grid spacings used in Indian residential buildings */
export const STANDARD_GRID_SPACINGS_FT = [10, 12, 13.12, 14, 15, 16, 18, 20, 22, 25];

/** Detect a grid spacing from extracted drawing value with snapping to standard values */
export function snapToNearestGridSpacing(detectedFt: number): number {
  let nearest = STANDARD_GRID_SPACINGS_FT[0];
  let minDiff = Math.abs(detectedFt - nearest);
  for (const s of STANDARD_GRID_SPACINGS_FT) {
    const diff = Math.abs(detectedFt - s);
    if (diff < minDiff) { minDiff = diff; nearest = s; }
  }
  return nearest;
}

/** Get recommended column size for given number of floors */
export function getRecommendedColumnSize(floors: number): ColumnStandard {
  const match = COLUMN_STANDARDS.find(s => s.floors === floors);
  return match || COLUMN_STANDARDS[COLUMN_STANDARDS.length - 1];
}
