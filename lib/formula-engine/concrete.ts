import type { CalculationResult } from '@/src/types/shared';
import { round } from './utils';

export interface ConcreteInput {
  foundationType: string;
  plotSize: number; // m2
  floors: number;
  columnSize: { width: number; depth: number };
  beamSize: { width: number; depth: number };
  slabThickness: number;
  wallThickness: number;
  totalBuiltUpArea: number; // m2 across all floors
  floorHeight: number;
  projectType?: string;
}

const FOOTING_COEFFICIENT: Record<string, number> = {
  isolated_footing: 0.12,
  combined_footing: 0.16,
  raft: 0.35,
  pile: 0.20,
  strip: 0.14,
};

export function calcFoundationConcrete(input: ConcreteInput): CalculationResult {
  const isCommercial = input.projectType && ['commercial', 'industrial', 'warehouse', 'factory', 'hospital', 'school', 'apartment'].includes(input.projectType);
  const baseCoeff = FOOTING_COEFFICIENT[input.foundationType] ?? 0.12;
  const coeff = isCommercial ? baseCoeff * 1.35 : baseCoeff;
  const qty = input.plotSize * coeff;
  return {
    item: 'Foundation Concrete',
    quantity: round(qty, 2),
    unit: 'm3',
    formulaUsed: isCommercial 
      ? 'Foundation Volume = Plot Area × Footing Coefficient (soil & type based) × Commercial Load Factor (1.35)'
      : 'Foundation Volume = Plot Area × Footing Coefficient (soil & type based)',
    inputs: {
      plotArea_m2: input.plotSize,
      footingCoefficient: coeff,
      foundationType: input.foundationType,
      projectType: input.projectType || 'residential',
    },
    steps: [
      `Select footing coefficient for ${input.foundationType}: ${baseCoeff} m3/m2`,
      isCommercial ? `Apply commercial scaling factor: ${baseCoeff} × 1.35 = ${round(coeff, 3)} m3/m2` : `Residential configuration (1.0x factor)`,
      `Foundation Concrete = ${input.plotSize} × ${round(coeff, 3)} = ${round(qty, 2)} m3`,
    ],
    category: 'concrete',
  };
}

const COLUMN_SPACING_RESIDENTIAL = 25;
const COLUMN_SPACING_COMMERCIAL = 15;

export function calcColumnConcrete(input: ConcreteInput): CalculationResult {
  const isCommercial = input.projectType && ['commercial', 'industrial', 'warehouse', 'factory', 'hospital', 'school', 'apartment'].includes(input.projectType);
  const spacing = isCommercial ? COLUMN_SPACING_COMMERCIAL : COLUMN_SPACING_RESIDENTIAL;
  const colCount = Math.ceil(input.totalBuiltUpArea / spacing);
  const colHeight = input.floorHeight;
  const colVol = input.columnSize.width * input.columnSize.depth * colHeight;
  const qty = colVol * colCount * input.floors;
  return {
    item: 'Column Concrete',
    quantity: round(qty, 2),
    unit: 'm3',
    formulaUsed: isCommercial
      ? 'Column Volume = Columns (1 per 15m² built-up) × (b × d × h) × Floors'
      : 'Column Volume = Columns (1 per 25m² built-up) × (b × d × h) × Floors',
    inputs: {
      columnSize_b: input.columnSize.width,
      columnSize_d: input.columnSize.depth,
      columnHeight_m: colHeight,
      estimatedColumns: colCount,
      floors: input.floors,
      projectType: input.projectType || 'residential',
    },
    steps: [
      `Estimated columns = ceil(BuiltUpArea / ${spacing} m² spacing) = ${colCount}`,
      `Single column volume = ${input.columnSize.width} × ${input.columnSize.depth} × ${colHeight} = ${round(colVol, 3)} m3`,
      `Total column concrete = ${round(colVol, 3)} × ${colCount} columns × ${input.floors} floors = ${round(qty, 2)} m3`,
    ],
    category: 'concrete',
  };
}

export function calcBeamConcrete(input: ConcreteInput): CalculationResult {
  const isCommercial = input.projectType && ['commercial', 'industrial', 'warehouse', 'factory', 'hospital', 'school', 'apartment'].includes(input.projectType);
  const perimeter = 4 * Math.sqrt(input.plotSize);
  const multiplier = isCommercial ? 3.0 : 2.2;
  const beamLengthPerFloor = perimeter * multiplier;
  const beamVol = input.beamSize.width * input.beamSize.depth * beamLengthPerFloor;
  const qty = beamVol * input.floors;
  return {
    item: 'Beam Concrete',
    quantity: round(qty, 2),
    unit: 'm3',
    formulaUsed: isCommercial
      ? 'Beam Volume = Beam Section × (Perimeter × 3.0 commercial spacing) × Floors'
      : 'Beam Volume = Beam Section × (Perimeter × 2.2 residential spacing) × Floors',
    inputs: {
      beam_b: input.beamSize.width,
      beam_d: input.beamSize.depth,
      planPerimeter_m: round(perimeter, 2),
      beamLengthPerFloor_m: round(beamLengthPerFloor, 2),
      floors: input.floors,
      projectType: input.projectType || 'residential',
    },
    steps: [
      `Plan perimeter (square-equiv) = 4 × √${input.plotSize} = ${round(perimeter, 2)} m`,
      `Beam length/floor = ${round(perimeter, 2)} × ${multiplier} = ${round(beamLengthPerFloor, 2)} m`,
      `Beam volume/floor = ${input.beamSize.width} × ${input.beamSize.depth} × ${round(beamLengthPerFloor, 2)} = ${round(beamVol, 3)} m3`,
      `Total beam concrete = ${round(beamVol, 3)} × ${input.floors} floors = ${round(qty, 2)} m3`,
    ],
    category: 'concrete',
  };
}

export function calcSlabConcrete(input: ConcreteInput): CalculationResult {
  const slabArea = input.totalBuiltUpArea / input.floors;
  const qty = slabArea * input.slabThickness * input.floors;
  return {
    item: 'Slab Concrete',
    quantity: round(qty, 2),
    unit: 'm3',
    formulaUsed: 'Slab Volume = (BuiltUpArea / Floors) × Slab Thickness × Floors',
    inputs: {
      builtUpArea_m2: input.totalBuiltUpArea,
      floors: input.floors,
      slabThickness_m: input.slabThickness,
    },
    steps: [
      `Slab area per floor = ${input.totalBuiltUpArea} / ${input.floors} = ${round(slabArea, 2)} m2`,
      `Slab volume = ${round(slabArea, 2)} × ${input.slabThickness} × ${input.floors} = ${round(qty, 2)} m3`,
    ],
    category: 'concrete',
  };
}

export function calcAllConcrete(input: ConcreteInput): CalculationResult[] {
  return [
    calcFoundationConcrete(input),
    calcColumnConcrete(input),
    calcBeamConcrete(input),
    calcSlabConcrete(input),
  ];
}
