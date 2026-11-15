// Module 4: RCC Calculation
import { FormulaRegistry } from '../formulas/registry';
import { ConcreteRules } from '../rules/ruleEngine';

export interface RCCInput {
  builtUpAreaSqFt: number;
  numColumns: number;
  floors: number;
  floorHeight: number;
  quality: 'Economy' | 'Standard' | 'Premium' | 'Luxury';
  grade?: string; // RCC Concrete Grade (M20, M25, M30)
}

export interface RCCMemberOutput {
  volumeCFT: number;
  cementBags: number;
  sandCFT: number;
  aggregateCFT: number;
  steelKg: number;
}

export interface RCCOutput {
  footings: RCCMemberOutput;
  columns: RCCMemberOutput;
  beams: RCCMemberOutput;
  slabs: RCCMemberOutput;
  staircases: RCCMemberOutput;
  totalVolumeCFT: number;
  totalVolumeM3: number;
  totalCementBags: number;
  totalSandCFT: number;
  totalAggregateCFT: number;
  totalSteelKg: number;
  totalSteelMT: number;
}

function getRCCMemberConcrete(volumeCFT: number, steelPercent: number, grade: string): RCCMemberOutput {
  const mix = ConcreteRules.getRccProportion(grade);
  const dryMultiplier = FormulaRegistry.getCoefficient('pcc_vol', 'dry_volume_multiplier');
  const bagVolume = FormulaRegistry.getCoefficient('mortar_breakdown', 'cement_bag_volume_cft');

  const dryVolumeCFT = volumeCFT * dryMultiplier;

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

  // Rebar weight calculation from Formula Registry
  // steelKg = rccVolume * steelRatio (which is based on steelPercent / 100 * steelDensityCFT)
  // standard steelDensityCFT is 222.27 kg/CFT (7850 kg/m3)
  const steelRatio = (steelPercent / 100) * 222.27;
  const steelKg = FormulaRegistry.evaluate('steel_weight', {
    rccVolume: volumeCFT,
    steelRatio
  });

  return {
    volumeCFT: Math.round(volumeCFT * 100) / 100,
    cementBags: Math.round(cementBags),
    sandCFT: Math.round(sandCFT * 100) / 100,
    aggregateCFT: Math.round(aggregateCFT * 100) / 100,
    steelKg: Math.round(steelKg * 100) / 100
  };
}

export function calculateRCC(input: RCCInput): RCCOutput {
  const { builtUpAreaSqFt, numColumns, floors, floorHeight, quality, grade = 'M20' } = input;

  // 1. Footings
  const footingVolPerColumn = (quality === 'Premium' || quality === 'Luxury') 
    ? 4.5 * 4.5 * 1.2 
    : 3.5 * 3.5 * 1.0;
  const footingVolume = numColumns * footingVolPerColumn;
  const footings = getRCCMemberConcrete(footingVolume, 0.8, grade);

  // 2. Columns
  const columnAreaSqFt = (quality === 'Premium' || quality === 'Luxury') ? 1.0 : 0.75;
  const columnVolume = FormulaRegistry.evaluate('rcc_columns_vol', {
    numColumns,
    area: columnAreaSqFt,
    floorHeight,
    floors
  });
  const columns = getRCCMemberConcrete(columnVolume, 2.0, grade);

  // 3. Slabs
  const slabThicknessFt = (quality === 'Premium' || quality === 'Luxury') 
    ? FormulaRegistry.getCoefficient('rcc_slab_vol', 'default_slab_thickness') 
    : (4.5 / 12);
  const slabVolume = FormulaRegistry.evaluate('rcc_slab_vol', {
    builtUpArea: builtUpAreaSqFt,
    thickness: slabThicknessFt
  });
  const slabs = getRCCMemberConcrete(slabVolume, 1.0, grade);

  // 4. Beams
  const beamFactor = FormulaRegistry.getCoefficient('rcc_beams_vol', 'beam_ratio_to_slab');
  const beamVolume = FormulaRegistry.evaluate('rcc_beams_vol', {
    slabVolume,
    factor: beamFactor
  });
  const beams = getRCCMemberConcrete(beamVolume, 1.5, grade);

  // 5. Staircases
  const staircaseVolPerFloor = FormulaRegistry.getCoefficient('rcc_staircase_vol', 'staircase_vol_cft_per_floor');
  const staircaseVolume = FormulaRegistry.evaluate('rcc_staircase_vol', {
    floors,
    volumePerFloor: staircaseVolPerFloor
  });
  const staircases = getRCCMemberConcrete(staircaseVolume, 1.2, grade);

  // Totals
  const totalVolumeCFT = footings.volumeCFT + columns.volumeCFT + beams.volumeCFT + slabs.volumeCFT + staircases.volumeCFT;
  const totalVolumeM3 = totalVolumeCFT / 35.3147;
  
  const totalCementBags = footings.cementBags + columns.cementBags + beams.cementBags + slabs.cementBags + staircases.cementBags;
  const totalSandCFT = footings.sandCFT + columns.sandCFT + beams.sandCFT + slabs.sandCFT + staircases.sandCFT;
  const totalAggregateCFT = footings.aggregateCFT + columns.aggregateCFT + beams.aggregateCFT + slabs.aggregateCFT + staircases.aggregateCFT;
  const totalSteelKg = footings.steelKg + columns.steelKg + beams.steelKg + slabs.steelKg + staircases.steelKg;
  const totalSteelMT = totalSteelKg / 1000;

  return {
    footings,
    columns,
    beams,
    slabs,
    staircases,
    totalVolumeCFT: Math.round(totalVolumeCFT * 100) / 100,
    totalVolumeM3: Math.round(totalVolumeM3 * 100) / 100,
    totalCementBags,
    totalSandCFT: Math.round(totalSandCFT * 100) / 100,
    totalAggregateCFT: Math.round(totalAggregateCFT * 100) / 100,
    totalSteelKg: Math.round(totalSteelKg * 100) / 100,
    totalSteelMT: Math.round(totalSteelMT * 100) / 100
  };
}
