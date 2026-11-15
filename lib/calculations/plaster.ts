// Module 7: Plaster Calculation
import { FormulaRegistry } from '../formulas/registry';

export interface PlasterInput {
  builtUpAreaSqFt: number;
  totalWallLength: number;
  floorHeight: number;
  floors: number;
}

export interface PlasterDetail {
  areaSqFt: number;
  cementBags: number;
  sandCFT: number;
}

export interface PlasterOutput {
  internalPlaster: PlasterDetail;
  externalPlaster: PlasterDetail;
  ceilingPlaster: PlasterDetail;
  totalCementBags: number;
  totalSandCFT: number;
}

function getPlasterDetail(
  areaSqFt: number,
  thicknessMm: number,
  proportionCement: number,
  proportionTotal: number
): PlasterDetail {
  const thicknessFt = thicknessMm / 304.8;
  const volumeCFT = areaSqFt * thicknessFt;

  const dryMultiplier = FormulaRegistry.getCoefficient('mortar_breakdown', 'dry_mortar_multiplier');
  const bagVolume = FormulaRegistry.getCoefficient('mortar_breakdown', 'cement_bag_volume_cft');

  const dryVolumeCFT = volumeCFT * dryMultiplier;

  const cementVolumeCFT = FormulaRegistry.evaluate('mortar_breakdown', {
    dryVolume: dryVolumeCFT,
    proportion: proportionCement / proportionTotal
  });
  const cementBags = cementVolumeCFT / bagVolume;

  const sandCFT = FormulaRegistry.evaluate('mortar_breakdown', {
    dryVolume: dryVolumeCFT,
    proportion: (proportionTotal - proportionCement) / proportionTotal
  });

  return {
    areaSqFt: Math.round(areaSqFt * 100) / 100,
    cementBags: Math.round(cementBags),
    sandCFT: Math.round(sandCFT * 100) / 100,
  };
}

export function calculatePlaster(input: PlasterInput): PlasterOutput {
  const { builtUpAreaSqFt, totalWallLength, floorHeight, floors } = input;

  const totalHeight = floorHeight * floors;

  // 1. Ceiling Plaster: 12mm thickness, mix proportion 1:4 (total = 5)
  const ceilingPlaster = getPlasterDetail(builtUpAreaSqFt, 12, 1, 5);

  // 2. Internal Plaster: 15mm thickness, mix proportion 1:6 (total = 7)
  const internalPlasterArea = 2 * totalWallLength * totalHeight;
  const internalPlaster = getPlasterDetail(internalPlasterArea, 15, 1, 7);

  // 3. External Plaster: 20mm thickness, mix proportion 1:5 (total = 6)
  const externalPlasterArea = totalWallLength * 0.60 * totalHeight;
  const externalPlaster = getPlasterDetail(externalPlasterArea, 20, 1, 6);

  // Totals
  const totalCementBags = ceilingPlaster.cementBags + internalPlaster.cementBags + externalPlaster.cementBags;
  const totalSandCFT = ceilingPlaster.sandCFT + internalPlaster.sandCFT + externalPlaster.sandCFT;

  return {
    internalPlaster,
    externalPlaster,
    ceilingPlaster,
    totalCementBags,
    totalSandCFT: Math.round(totalSandCFT * 100) / 100
  };
}
