// Module 3: PCC Calculation
import { FormulaRegistry } from '../formulas/registry';
import { ConcreteRules } from '../rules/ruleEngine';

export interface PCCInput {
  numColumns: number;
  footingWidthFt: number;
  grade?: string; // PCC Grade (M5, M7.5, M10)
}

export interface PCCOutput {
  pccVolumeCFT: number;
  pccVolumeM3: number;
  cementBags: number;
  sandCFT: number;
  aggregateCFT: number;
}

export function calculatePCC(input: PCCInput): PCCOutput {
  const { numColumns, footingWidthFt, grade = 'M7.5' } = input;

  const thicknessFt = FormulaRegistry.getCoefficient('pcc_vol', 'default_pcc_thickness');
  const dryMultiplier = FormulaRegistry.getCoefficient('pcc_vol', 'dry_volume_multiplier');
  const bagVolume = FormulaRegistry.getCoefficient('mortar_breakdown', 'cement_bag_volume_cft');

  const pccVolumeCFT = FormulaRegistry.evaluate('pcc_vol', {
    numColumns,
    width: footingWidthFt,
    thickness: thicknessFt
  });

  const pccVolumeM3 = pccVolumeCFT / 35.3147;
  const dryVolumeCFT = pccVolumeCFT * dryMultiplier;

  // PCC mix ratio proportions via Rule Engine
  const mix = ConcreteRules.getPccProportion(grade);

  const cementVolumeCFT = FormulaRegistry.evaluate('mortar_breakdown', {
    dryVolume: dryVolumeCFT,
    proportion: mix.cement / mix.total
  });
  const cementBags = cementVolumeCFT / bagVolume;

  const sandCFT = FormulaRegistry.evaluate('mortar_breakdown', {
    dryVolume: dryVolumeCFT,
    proportion: mix.sand / mix.total
  });

  const aggregateCFT = FormulaRegistry.evaluate('mortar_breakdown', {
    dryVolume: dryVolumeCFT,
    proportion: mix.aggregate / mix.total
  });

  return {
    pccVolumeCFT: Math.round(pccVolumeCFT * 100) / 100,
    pccVolumeM3: Math.round(pccVolumeM3 * 100) / 100,
    cementBags: Math.round(cementBags),
    sandCFT: Math.round(sandCFT * 100) / 100,
    aggregateCFT: Math.round(aggregateCFT * 100) / 100,
  };
}
