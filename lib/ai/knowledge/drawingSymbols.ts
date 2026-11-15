/**
 * Drawing Symbols Knowledge Base
 * Visual vocabulary for reading Indian construction drawings.
 * Used to enrich AI prompts with symbol recognition context.
 *
 * References:
 *   IS 962:1989   — Code of Practice for Architectural and Building Drawings
 *   SP 46:2018    — Engineering Drawing Practice for Schools and Colleges
 *   BIS Drawing Standards
 */

export interface DrawingSymbol {
  name: string;
  drawingTypes: string[];        // which drawing type this appears on
  appearance: string;            // how it looks in a drawing
  meaning: string;               // what it represents
  commonAnnotation?: string;     // text label typically near it
}

// ─────────────────────────────────────────────────────────────────────────────
// HATCH PATTERNS
// ─────────────────────────────────────────────────────────────────────────────

export const HATCH_PATTERNS: DrawingSymbol[] = [
  {
    name: 'Brick Masonry Hatch',
    drawingTypes: ['architectural', 'section', 'elevation'],
    appearance: 'Diagonal lines with horizontal lines creating brick-like pattern',
    meaning: 'Brick or block masonry wall',
    commonAnnotation: '9" BW, BM, BRICK WALL',
  },
  {
    name: 'Concrete Hatch',
    drawingTypes: ['structural', 'section', 'foundation', 'column_layout'],
    appearance: 'Triangles with dots, or random dot stippling pattern',
    meaning: 'Plain or reinforced concrete',
    commonAnnotation: 'RCC, PCC, M20, M25',
  },
  {
    name: 'Earth / Soil Hatch',
    drawingTypes: ['foundation', 'section'],
    appearance: 'Diagonal lines with small triangles pointing down, or earth pattern',
    meaning: 'Natural ground / soil',
    commonAnnotation: 'Natural Ground, EGL, NGL',
  },
  {
    name: 'Steel / Metal Hatch',
    drawingTypes: ['structural', 'section'],
    appearance: 'Close diagonal parallel lines (45°)',
    meaning: 'Structural steel section or metal',
    commonAnnotation: 'ISMC, ISMB, Steel',
  },
  {
    name: 'Sand / Aggregate Hatch',
    drawingTypes: ['foundation', 'section'],
    appearance: 'Dots pattern (stippling)',
    meaning: 'Sand fill, gravel, or aggregate bed',
    commonAnnotation: 'Sand Filling, Gravel Bed, PCC',
  },
  {
    name: 'Cut Section Hatch',
    drawingTypes: ['section'],
    appearance: 'Solid fill or heavy parallel lines on cut material',
    meaning: 'Element cut by the section plane',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURAL NOTATION SYMBOLS
// ─────────────────────────────────────────────────────────────────────────────

export const STRUCTURAL_SYMBOLS: DrawingSymbol[] = [
  {
    name: 'Column Symbol',
    drawingTypes: ['column_layout', 'structural', 'architectural'],
    appearance: 'Filled or hatched square/rectangle at grid intersection',
    meaning: 'RCC column location',
    commonAnnotation: 'C1, C-1, COL-1, A/1, B/2',
  },
  {
    name: 'Column Cross-Section Note',
    drawingTypes: ['column_layout'],
    appearance: 'Dimensions alongside column rectangle: e.g. 230×300',
    meaning: 'Column width × depth in mm',
    commonAnnotation: '230×300, 9"×12", 300×450',
  },
  {
    name: 'Grid Line',
    drawingTypes: ['column_layout', 'structural', 'foundation', 'architectural'],
    appearance: 'Long dashed lines running across drawing with circle at end containing letter/number',
    meaning: 'Reference grid for locating structural elements',
    commonAnnotation: 'A, B, C... (columns), 1, 2, 3... (rows)',
  },
  {
    name: 'Beam Symbol in Plan',
    drawingTypes: ['beam_layout', 'structural'],
    appearance: 'Dashed rectangle or solid lines between columns',
    meaning: 'Beam position in plan view',
    commonAnnotation: 'B1, MB, SB, 230×450',
  },
  {
    name: 'Slab Direction Arrow',
    drawingTypes: ['structural'],
    appearance: 'Arrow within slab bay showing spanning direction',
    meaning: 'Direction of main slab reinforcement',
    commonAnnotation: 'Main bars direction indicator',
  },
  {
    name: 'Footing Symbol',
    drawingTypes: ['foundation'],
    appearance: 'Square/rectangle with hatching at grid intersections',
    meaning: 'Column footing location',
    commonAnnotation: 'F1, F-1, FOOTING TYPE-1',
  },
  {
    name: 'Level Marker',
    drawingTypes: ['section', 'elevation'],
    appearance: 'Arrow or triangle pointing to a horizontal level with elevation number',
    meaning: 'Floor level, datum reference',
    commonAnnotation: 'FL+0.00, PL+3.00, +600, RL',
  },
  {
    name: 'North Arrow',
    drawingTypes: ['architectural', 'foundation', 'structural'],
    appearance: 'Arrow pointing north with N label',
    meaning: 'Building orientation reference',
  },
  {
    name: 'Section Cut Line',
    drawingTypes: ['architectural', 'structural'],
    appearance: 'Thick chain line with arrow heads and label at ends',
    meaning: 'Location of section view shown in separate drawing',
    commonAnnotation: 'A-A, B-B, X-X, 1-1',
  },
  {
    name: 'Dimension Line',
    drawingTypes: ['architectural', 'structural', 'foundation', 'section'],
    appearance: 'Thin line with arrows or ticks at ends, number above or inline',
    meaning: 'Measured distance between two points',
    commonAnnotation: 'e.g. 3600, 14\'-6", 4500mm, 15ft',
  },
  {
    name: 'Rebar Notation',
    drawingTypes: ['structural', 'foundation', 'section'],
    appearance: 'Circle with cross inside (in cross-section), or curved lines (in elevation)',
    meaning: 'Reinforcement bar location',
    commonAnnotation: '2T16, 3-16Ø, 4T12@200c/c, #5@8"',
  },
  {
    name: 'Stirrup / Link',
    drawingTypes: ['structural', 'section'],
    appearance: 'Rectangular or spiral loops around main bars in section',
    meaning: 'Shear reinforcement in columns and beams',
    commonAnnotation: 'T8@150, R8@200, 8Ø@200',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ARCHITECTURAL SYMBOLS
// ─────────────────────────────────────────────────────────────────────────────

export const ARCHITECTURAL_SYMBOLS: DrawingSymbol[] = [
  {
    name: 'Door Symbol',
    drawingTypes: ['architectural'],
    appearance: 'Quarter-circle arc with a thin line (door leaf) showing swing direction',
    meaning: 'Door opening with swing direction',
    commonAnnotation: 'D1, D-1, 900W×2100H, 3\'×7\'',
  },
  {
    name: 'Window Symbol',
    drawingTypes: ['architectural'],
    appearance: 'Three parallel lines (or two lines with center line) in wall opening',
    meaning: 'Window opening',
    commonAnnotation: 'W1, W-1, 1200W×1200H, 4\'×4\'',
  },
  {
    name: 'Staircase Symbol',
    drawingTypes: ['architectural'],
    appearance: 'Stepped lines with arrow and UP/DN label',
    meaning: 'Staircase going up or down from current floor',
    commonAnnotation: 'UP, DN, STAIR, G+1',
  },
  {
    name: 'Toilet Fixtures',
    drawingTypes: ['architectural'],
    appearance: 'WC pan oval shape, basin rectangle, bathtub rectangle in bathroom area',
    meaning: 'Sanitary fixtures in bathroom or toilet',
    commonAnnotation: 'WC, LAVATORY, BATH, TOILET',
  },
  {
    name: 'Kitchen Counter',
    drawingTypes: ['architectural'],
    appearance: 'L-shaped or straight rectangle along wall in kitchen area',
    meaning: 'Kitchen counter / platform',
    commonAnnotation: 'KITCHEN, COOKING PLATFORM',
  },
  {
    name: 'Column in Architectural Plan',
    drawingTypes: ['architectural'],
    appearance: 'Solid filled square or rectangle (smaller than in structural plan)',
    meaning: 'RCC column location visible in floor plan',
    commonAnnotation: 'COL, C1',
  },
  {
    name: 'Wall Thickness Annotation',
    drawingTypes: ['architectural'],
    appearance: 'Arrow between parallel wall lines with dimension',
    meaning: 'Wall thickness measurement',
    commonAnnotation: '9", 230mm, 4.5", 115mm',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TITLE BLOCK INDICATORS
// ─────────────────────────────────────────────────────────────────────────────

export const TITLE_BLOCK_FIELDS = [
  'PROJECT NAME', 'PROJECT TITLE', 'CLIENT NAME', 'DRAWING TITLE',
  'DRAWING NO.', 'SHEET NO.', 'SCALE', 'DATE', 'REVISION',
  'DESIGNED BY', 'DRAWN BY', 'CHECKED BY', 'APPROVED BY',
  'NORTH DIRECTION', 'LEGEND', 'NOTES',
];

/** Get all symbol names grouped by drawing type for use in prompts */
export function getSymbolsForDrawingType(drawingType: string): DrawingSymbol[] {
  const all = [...HATCH_PATTERNS, ...STRUCTURAL_SYMBOLS, ...ARCHITECTURAL_SYMBOLS];
  return all.filter(s => s.drawingTypes.includes(drawingType));
}
