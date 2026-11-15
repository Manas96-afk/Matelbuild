// Module 6: AAC Block Calculation
import { FormulaRegistry } from '../formulas/registry';
import { WallRules } from '../rules/ruleEngine';

export interface AACInput {
  totalWallLength: number;
  floorHeight: number;
  floors: number;
  blockThicknessOption?: '4 Inch' | '6 Inch' | '8 Inch';
  wastageOption: number;
}

export interface AACTypeOutput {
  wallAreaSqFt: number;
  wallVolumeCFT: number;
  blockQuantity: number;
  adhesiveBags: number;
}

export function calculateAAC(input: AACInput): AACTypeOutput {
  const { totalWallLength, floorHeight, floors, blockThicknessOption = '6 Inch', wastageOption } = input;

  const totalHeight = floorHeight * floors;
  // Deduct 15% for openings
  const wallAreaSqFt = totalWallLength * totalHeight * 0.85;

  let thicknessFt = 0.5; // default 6 Inch
  if (blockThicknessOption === '4 Inch') thicknessFt = 0.333;
  else if (blockThicknessOption === '8 Inch') thicknessFt = 0.667;

  const wallVolumeCFT = wallAreaSqFt * thicknessFt;

  const blockLength = FormulaRegistry.getCoefficient('masonry_aac_count', 'block_length');
  const blockHeight = FormulaRegistry.getCoefficient('masonry_aac_count', 'block_height');

  const blockQuantity = FormulaRegistry.evaluate('masonry_aac_count', {
    wallVolume: wallVolumeCFT,
    block_length: blockLength,
    block_height: blockHeight,
    default_block_thickness: thicknessFt,
    wastage: wastageOption
  });

  const adhesiveFactor = FormulaRegistry.getCoefficient('masonry_aac_count', 'adhesive_bags_per_m3');
  const wallVolumeM3 = wallVolumeCFT / 35.3147;
  const adhesiveBags = Math.round(wallVolumeM3 * adhesiveFactor);

  return {
    wallAreaSqFt: Math.round(wallAreaSqFt * 100) / 100,
    wallVolumeCFT: Math.round(wallVolumeCFT * 100) / 100,
    blockQuantity: Math.round(blockQuantity),
    adhesiveBags: Math.max(1, adhesiveBags)
  };
}
