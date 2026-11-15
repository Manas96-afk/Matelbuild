// Module 9: Tile Calculation
import { FormulaRegistry } from '../formulas/registry';

export interface TilesInput {
  builtUpAreaSqFt: number;
  wastageOption: number;
}

export interface TilesOutput {
  floorAreaSqFt: number;
  tileQuantitySqFt: number;
  tileWastageSqFt: number;
  tilesCount: number;
}

export function calculateTiles(input: TilesInput): TilesOutput {
  const { builtUpAreaSqFt, wastageOption } = input;

  const floorRatio = FormulaRegistry.getCoefficient('tiles_sqft', 'net_flooring_ratio');
  const tileSize = FormulaRegistry.getCoefficient('tiles_sqft', 'tile_size_sqft');

  const floorAreaSqFt = builtUpAreaSqFt * floorRatio;

  const tileQuantitySqFt = FormulaRegistry.evaluate('tiles_sqft', {
    floorArea: floorAreaSqFt,
    wastage: wastageOption
  });

  const tileWastageSqFt = tileQuantitySqFt - floorAreaSqFt;
  const tilesCount = Math.ceil(tileQuantitySqFt / tileSize);

  return {
    floorAreaSqFt: Math.round(floorAreaSqFt * 100) / 100,
    tileQuantitySqFt: Math.round(tileQuantitySqFt * 100) / 100,
    tileWastageSqFt: Math.round(tileWastageSqFt * 100) / 100,
    tilesCount
  };
}
