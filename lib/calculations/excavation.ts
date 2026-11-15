// Module 2: Excavation Calculation
import { FormulaRegistry } from '../formulas/registry';

export interface ExcavationInput {
  plotAreaSqFt: number;
  floors: number;
  quality: 'Economy' | 'Standard' | 'Premium' | 'Luxury';
}

export interface ExcavationOutput {
  numColumns: number;
  excavationVolumeCFT: number;
  excavationVolumeM3: number;
  footingWidthFt: number;
  footingDepthFt: number;
}

export function calculateExcavation(input: ExcavationInput): ExcavationOutput {
  const { plotAreaSqFt, floors, quality } = input;

  const colsPerSqft = FormulaRegistry.getCoefficient('excavation_vol', 'columns_per_sqft_bua');
  const numColumns = Math.ceil(plotAreaSqFt / colsPerSqft);

  // Depth of foundation based on floor count
  let footingDepthFt = 4;
  if (floors === 2) footingDepthFt = 5;
  else if (floors === 3) footingDepthFt = 6;
  else if (floors >= 4) footingDepthFt = 7;

  // Dimensions of footing excavation based on quality grade
  let footingWidthFt = 4;
  if (quality === 'Premium' || quality === 'Luxury') {
    footingWidthFt = FormulaRegistry.getCoefficient('excavation_vol', 'default_footing_width');
  }

  const excavationVolumeCFT = FormulaRegistry.evaluate('excavation_vol', {
    numColumns,
    width: footingWidthFt,
    depth: footingDepthFt
  });

  const excavationVolumeM3 = excavationVolumeCFT / 35.3147;

  return {
    numColumns,
    excavationVolumeCFT: Math.round(excavationVolumeCFT * 100) / 100,
    excavationVolumeM3: Math.round(excavationVolumeM3 * 100) / 100,
    footingWidthFt,
    footingDepthFt,
  };
}
