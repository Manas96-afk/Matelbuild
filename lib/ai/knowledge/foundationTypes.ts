/**
 * Foundation Types Knowledge Base
 * Domain knowledge for Buildora AI — teaches the system to recognize and interpret
 * all foundation system types found in Indian construction drawings.
 *
 * References:
 *   IS 1904:1986 — Code of Practice for Design and Construction of Foundations in Soils
 *   IS 2911:2010 — Code of Practice for Design and Construction of Pile Foundations
 *   SP 34:1987   — Handbook on Concrete Reinforcement and Detailing
 */

export interface FoundationTypeDefinition {
  id: string;
  name: string;
  aliases: string[];                     // common names on drawings
  visualSignatures: string[];            // what it looks like in a plan
  typicalUseCase: string;
  typicalDimensions: {
    depthFt: { min: number; max: number; typical: number };
    widthFt?: { min: number; max: number; typical: number };
    lengthFt?: { min: number; max: number; typical: number };
    thicknessInch?: { min: number; max: number; typical: number };
  };
  associatedElements: string[];          // what else appears near it on drawings
  isCodeRef: string;
}

export const FOUNDATION_TYPES: FoundationTypeDefinition[] = [
  {
    id: 'isolated_footing',
    name: 'Isolated Column Footing',
    aliases: ['isolated footing', 'pad footing', 'independent footing', 'IF', 'F-1', 'F1', 'column footing'],
    visualSignatures: [
      'square or rectangular hatched shape at column base',
      'stepped pyramid cross-section in section drawings',
      'label like F1, F2, F-TYPE-1 next to column grid intersection',
      'dimension lines showing footing width and depth',
      'column stub (pedestal) shown protruding from footing top',
    ],
    typicalUseCase: 'Single column load transfer to soil — most common for 1–4 storey RCC residential buildings',
    typicalDimensions: {
      depthFt: { min: 3, max: 8, typical: 5 },
      widthFt: { min: 3, max: 8, typical: 5 },
      lengthFt: { min: 3, max: 8, typical: 5 },
    },
    associatedElements: ['column stub', 'PCC bed', 'anchor bolts', 'reinforcement mat'],
    isCodeRef: 'IS 1904:1986 Cl. 6',
  },
  {
    id: 'combined_footing',
    name: 'Combined Footing',
    aliases: ['combined footing', 'CF', 'combined', 'strap footing', 'cantilever footing'],
    visualSignatures: [
      'elongated rectangular shape connecting two or more columns',
      'two column stubs within one footing boundary',
      'trapezoidal profile in section when loads are unequal',
      'label CF-1 or CF TYPE',
    ],
    typicalUseCase: 'Two close columns sharing one footing, or column near property boundary',
    typicalDimensions: {
      depthFt: { min: 3, max: 6, typical: 4.5 },
      widthFt: { min: 4, max: 8, typical: 5 },
      lengthFt: { min: 8, max: 20, typical: 12 },
    },
    associatedElements: ['multiple column stubs', 'tie beams', 'PCC bed'],
    isCodeRef: 'IS 1904:1986 Cl. 7',
  },
  {
    id: 'raft_foundation',
    name: 'Raft / Mat Foundation',
    aliases: ['raft', 'mat foundation', 'raft slab', 'floating foundation', 'RF', 'mat slab'],
    visualSignatures: [
      'large continuous slab covering entire building footprint',
      'uniform hatch over full plot area in plan',
      'thickened edges visible in section',
      'grid of beams visible on underside (beam-slab raft)',
      'notes: "raft foundation" or "mat foundation"',
    ],
    typicalUseCase: 'Weak soil, high water table, or heavy loads across entire building footprint',
    typicalDimensions: {
      depthFt: { min: 1, max: 3, typical: 1.5 },
      thicknessInch: { min: 8, max: 24, typical: 12 },
    },
    associatedElements: ['downstand beams', 'waterproofing layer', 'PCC blinding'],
    isCodeRef: 'IS 1904:1986 Cl. 8',
  },
  {
    id: 'strip_footing',
    name: 'Strip / Continuous Footing',
    aliases: ['strip footing', 'continuous footing', 'wall footing', 'strip foundation', 'SF'],
    visualSignatures: [
      'long continuous band under load-bearing walls',
      'parallel lines in plan tracing wall layout',
      'T-shaped cross-section in section drawings',
      'label: strip footing, wall footing',
    ],
    typicalUseCase: 'Load-bearing masonry walls, row houses, boundary walls',
    typicalDimensions: {
      depthFt: { min: 2.5, max: 5, typical: 3.5 },
      widthFt: { min: 2, max: 5, typical: 3 },
    },
    associatedElements: ['load-bearing walls above', 'DPC course', 'PCC bed'],
    isCodeRef: 'IS 1904:1986 Cl. 9',
  },
  {
    id: 'pile_foundation',
    name: 'Pile Foundation',
    aliases: ['pile', 'piles', 'bored pile', 'driven pile', 'cast in-situ pile', 'micro pile', 'pile cap'],
    visualSignatures: [
      'circular symbols in plan arranged in groups (pile clusters)',
      'pile cap shown as square/rectangular shape surrounding pile group',
      'diameter callout (e.g. Ø450, Ø600)',
      'pile schedule table showing pile number, diameter, depth',
      'cross-hatching in section at pile cap level',
      'label: P-1, P-2, pile cap PC-1',
    ],
    typicalUseCase: 'Soft soil, expansive clay, or high-rise buildings requiring deep load transfer',
    typicalDimensions: {
      depthFt: { min: 15, max: 80, typical: 30 },
      widthFt: { min: 1.2, max: 3, typical: 1.5 }, // diameter in ft
    },
    associatedElements: ['pile cap', 'grade beams', 'pile schedule table'],
    isCodeRef: 'IS 2911 Part 1:2010',
  },
  {
    id: 'well_foundation',
    name: 'Well Foundation',
    aliases: ['well foundation', 'caisson', 'open caisson'],
    visualSignatures: [
      'large circular or rectangular caisson in plan',
      'annular cross-section showing outer shell and inner fill',
      'typically found in bridge or heavy industrial drawings',
    ],
    typicalUseCase: 'Bridges, heavy structures over water or deep soil',
    typicalDimensions: {
      depthFt: { min: 15, max: 50, typical: 25 },
      widthFt: { min: 6, max: 20, typical: 10 },
    },
    associatedElements: ['curb', 'steining', 'sand fill'],
    isCodeRef: 'IS 3955:1967',
  },
  {
    id: 'plinth_beam',
    name: 'Plinth Beam / Grade Beam',
    aliases: ['plinth beam', 'grade beam', 'tie beam', 'plinth band', 'PB'],
    visualSignatures: [
      'horizontal beam connecting column bases at plinth level',
      'shown as parallel lines at foundation/ground level in section',
      'label: PB, plinth beam, grade beam',
      'typically 9" × 12" to 12" × 18" cross section',
    ],
    typicalUseCase: 'Connects column footings to prevent differential settlement, holds brick plinth',
    typicalDimensions: {
      depthFt: { min: 0.5, max: 1.5, typical: 1 },
      widthFt: { min: 0.5, max: 1, typical: 0.75 },
    },
    associatedElements: ['column stubs', 'isolated footings', 'ground floor slab'],
    isCodeRef: 'IS 456:2000 Cl. 26.5',
  },
];

/** Look up a foundation type by any known alias (case-insensitive) */
export function findFoundationTypeByAlias(text: string): FoundationTypeDefinition | undefined {
  const lower = text.toLowerCase();
  return FOUNDATION_TYPES.find(ft =>
    ft.aliases.some(alias => lower.includes(alias.toLowerCase()))
  );
}

/** Get all foundation type names for use in AI prompts */
export function getFoundationTypeNames(): string[] {
  return FOUNDATION_TYPES.map(ft => `${ft.name} (aliases: ${ft.aliases.slice(0, 3).join(', ')})`);
}

/** Validate if a detected foundation depth is within realistic range */
export function validateFoundationDepth(
  type: string,
  depthFt: number
): { valid: boolean; note: string } {
  const ft = FOUNDATION_TYPES.find(f => f.id === type);
  if (!ft) return { valid: true, note: 'Unknown type — cannot validate' };

  const { min, max } = ft.typicalDimensions.depthFt;
  if (depthFt < min * 0.5) {
    return { valid: false, note: `Depth ${depthFt}ft seems too shallow for ${ft.name} (typical: ${ft.typicalDimensions.depthFt.typical}ft)` };
  }
  if (depthFt > max * 1.5) {
    return { valid: false, note: `Depth ${depthFt}ft seems too deep for ${ft.name} (typical: ${ft.typicalDimensions.depthFt.typical}ft)` };
  }
  return { valid: true, note: `Depth ${depthFt}ft is within expected range for ${ft.name}` };
}
