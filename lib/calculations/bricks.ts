// Module 5: Brick Calculation
import { FormulaRegistry } from '../formulas/registry';
import { WallRules } from '../rules/ruleEngine';

export interface BricksInput {
  totalWallLength: number;
  floorHeight: number;
  floors: number;
  wallThicknessOption?: '4.5 Inch' | '9 Inch';
  wastageOption: number;
}

export interface BricksOutput {
  wallAreaSqFt: number;
  wallVolumeCFT: number;
  brickQuantity: number;
  mortarVolumeCFT: number;
  cementBags: number;
  sandCFT: number;
}

export function calculateBricks(input: BricksInput): BricksOutput {
  const { totalWallLength, floorHeight, floors, wallThicknessOption = '9 Inch', wastageOption } = input;

  const totalHeight = floorHeight * floors;
  // Deduct 15% for opening sizes
  const wallAreaSqFt = totalWallLength * totalHeight * 0.85;

  const thicknessFt = wallThicknessOption === '9 Inch' ? 0.75 : 0.375;
  const wallVolumeCFT = wallAreaSqFt * thicknessFt;

  const bricksPerCFT = FormulaRegistry.getCoefficient('masonry_brick_count', 'bricks_per_cft');
  const mortarRatio = WallRules.getMortarRatio('Brick Masonry');

  const brickQuantity = FormulaRegistry.evaluate('masonry_brick_count', {
    wallVolume: wallVolumeCFT,
    bricks_per_cft: bricksPerCFT,
    wastage: wastageOption
  });

  const mortarVolumeCFT = wallVolumeCFT * mortarRatio;
  const dryMortarVol = mortarVolumeCFT * FormulaRegistry.getCoefficient('mortar_breakdown', 'dry_mortar_multiplier');
  const bagVolume = FormulaRegistry.getCoefficient('mortar_breakdown', 'cement_bag_volume_cft');

  const cementVolume = FormulaRegistry.evaluate('mortar_breakdown', {
    dryVolume: dryMortarVol,
    proportion: 1 / 7 // 1:6 ratio
  });
  const cementBags = cementVolume / bagVolume;

  const sandCFT = FormulaRegistry.evaluate('mortar_breakdown', {
    dryVolume: dryMortarVol,
    proportion: 6 / 7
  });

  return {
    wallAreaSqFt: Math.round(wallAreaSqFt * 100) / 100,
    wallVolumeCFT: Math.round(wallVolumeCFT * 100) / 100,
    brickQuantity: Math.round(brickQuantity),
    mortarVolumeCFT: Math.round(mortarVolumeCFT * 100) / 100,
    cementBags: Math.round(cementBags),
    sandCFT: Math.round(sandCFT * 100) / 100,
  };
}
