// Module 10: Steel Calculation

import { calculateRCC } from './rcc';

export interface SteelInput {
  builtUpAreaSqFt: number;
  numColumns: number;
  floors: number;
  floorHeight: number;
  quality: 'Economy' | 'Standard' | 'Premium' | 'Luxury';
}

export interface SteelOutput {
  foundationSteelKg: number;
  columnSteelKg: number;
  beamSteelKg: number;
  slabSteelKg: number;
  staircaseSteelKg: number;
  totalSteelKg: number;
  totalSteelMT: number;
}

export function calculateSteel(input: SteelInput): SteelOutput {
  const rccResult = calculateRCC({
    builtUpAreaSqFt: input.builtUpAreaSqFt,
    numColumns: input.numColumns,
    floors: input.floors,
    floorHeight: input.floorHeight,
    quality: input.quality
  });

  return {
    foundationSteelKg: rccResult.footings.steelKg,
    columnSteelKg: rccResult.columns.steelKg,
    beamSteelKg: rccResult.beams.steelKg,
    slabSteelKg: rccResult.slabs.steelKg,
    staircaseSteelKg: rccResult.staircases.steelKg,
    totalSteelKg: rccResult.totalSteelKg,
    totalSteelMT: rccResult.totalSteelMT
  };
}
