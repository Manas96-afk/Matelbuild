// Consolidated Quantity Engine Entry Point

import { calculateArea, AreaInput, AreaOutput } from './area';
import { calculateExcavation, ExcavationInput, ExcavationOutput } from './excavation';
import { calculatePCC, PCCInput, PCCOutput } from './pcc';
import { calculateRCC, RCCInput, RCCOutput } from './rcc';
import { calculateBricks, BricksInput, BricksOutput } from './bricks';
import { calculateAAC, AACInput, AACTypeOutput } from './aac';
import { calculatePlaster, PlasterInput, PlasterOutput } from './plaster';
import { calculatePaint, PaintInput, PaintOutput } from './paint';
import { calculateTiles, TilesInput, TilesOutput } from './tiles';
import { calculateSteel, SteelInput, SteelOutput } from './steel';

export interface QuantityEngineInput {
  plotLength: number;
  plotWidth: number;
  unit: 'Feet' | 'Meter';
  floors: number;
  floorHeight: number;
  buildingType: 'Residential' | 'Commercial' | 'Mixed Use';
  constructionQuality: 'Economy' | 'Standard' | 'Premium' | 'Luxury';
  wallType: string;
  wastageOption?: number; // e.g. 5, 10, 15
  pccGrade?: string;
  rccGrade?: string;
  
  // Room specs
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  livingRooms?: number;
  balconies?: number;
}

export interface QuantityEngineOutput {
  area: AreaOutput;
  excavation: ExcavationOutput;
  pcc: PCCOutput;
  rcc: RCCOutput;
  bricks?: BricksOutput;
  aac?: AACTypeOutput;
  plaster: PlasterOutput;
  paint: PaintOutput;
  tiles: TilesOutput;
  steel: SteelOutput;
  
  // High-level consolidated summaries
  summary: {
    builtUpAreaSqFt: number;
    plotAreaSqFt: number;
    totalConstructionAreaSqFt: number;
    cementBags: number;
    sandCFT: number;
    aggregateCFT: number;
    steelMT: number;
    bricksCount: number;
    blocksCount: number;
    paintLiters: number;
    tilesSqFt: number;
  };
}

export const QuantityEngine = {
  calculateQuantities(input: QuantityEngineInput): QuantityEngineOutput {
    // 1. Area
    const area = calculateArea({
      plotLength: input.plotLength,
      plotWidth: input.plotWidth,
      unit: input.unit,
      floors: input.floors,
      buildingType: input.buildingType
    });

    // 2. Excavation
    const excavation = calculateExcavation({
      plotAreaSqFt: area.plotAreaSqFt,
      floors: input.floors,
      quality: input.constructionQuality
    });

    // 3. PCC
    const pcc = calculatePCC({
      numColumns: excavation.numColumns,
      footingWidthFt: excavation.footingWidthFt,
      grade: input.pccGrade
    });

    // 4. RCC
    const rcc = calculateRCC({
      builtUpAreaSqFt: area.builtUpAreaSqFt,
      numColumns: excavation.numColumns,
      floors: input.floors,
      floorHeight: input.floorHeight,
      quality: input.constructionQuality,
      grade: input.rccGrade
    });

    // 5. Masonry (Bricks vs AAC)
    const totalWallLength = 4 * Math.sqrt(area.builtUpAreaSqFt) * input.floors;

    let bricksResult: BricksOutput | undefined;
    let aacResult: AACTypeOutput | undefined;

    const isAAC = input.wallType.includes('AAC');

    const wastage = input.wastageOption ?? 5;

    if (!isAAC) {
      bricksResult = calculateBricks({
        totalWallLength,
        floorHeight: input.floorHeight,
        floors: input.floors,
        wallThicknessOption: '9 Inch', // default standard external walls
        wastageOption: wastage
      });
    } else {
      aacResult = calculateAAC({
        totalWallLength,
        floorHeight: input.floorHeight,
        floors: input.floors,
        blockThicknessOption: '6 Inch', // standard block size
        wastageOption: wastage
      });
    }

    // 6. Plaster
    const plaster = calculatePlaster({
      builtUpAreaSqFt: area.builtUpAreaSqFt,
      totalWallLength,
      floorHeight: input.floorHeight,
      floors: input.floors
    });

    // 7. Paint
    const paint = calculatePaint({
      internalPlasterArea: plaster.internalPlaster.areaSqFt,
      externalPlasterArea: plaster.externalPlaster.areaSqFt
    });

    // 8. Tiles
    const tiles = calculateTiles({
      builtUpAreaSqFt: area.builtUpAreaSqFt,
      wastageOption: wastage
    });

    // 9. Steel
    const steel = calculateSteel({
      builtUpAreaSqFt: area.builtUpAreaSqFt,
      numColumns: excavation.numColumns,
      floors: input.floors,
      floorHeight: input.floorHeight,
      quality: input.constructionQuality
    });

    // Consolidate high-level Material Summary
    let totalCementBags = pcc.cementBags + rcc.totalCementBags + plaster.totalCementBags;
    let totalSandCFT = pcc.sandCFT + rcc.totalSandCFT + plaster.totalSandCFT;
    let totalAggregateCFT = pcc.aggregateCFT + rcc.totalAggregateCFT;
    let totalBricks = 0;
    let totalBlocks = 0;

    if (bricksResult) {
      totalCementBags += bricksResult.cementBags;
      totalSandCFT += bricksResult.sandCFT;
      totalBricks = bricksResult.brickQuantity;
    }

    if (aacResult) {
      totalBlocks = aacResult.blockQuantity;
    }

    return {
      area,
      excavation,
      pcc,
      rcc,
      bricks: bricksResult,
      aac: aacResult,
      plaster,
      paint,
      tiles,
      steel,
      summary: {
        builtUpAreaSqFt: area.builtUpAreaSqFt,
        plotAreaSqFt: area.plotAreaSqFt,
        totalConstructionAreaSqFt: area.totalConstructionAreaSqFt,
        cementBags: Math.round(totalCementBags),
        sandCFT: Math.round(totalSandCFT),
        aggregateCFT: Math.round(totalAggregateCFT),
        steelMT: steel.totalSteelMT,
        bricksCount: totalBricks,
        blocksCount: totalBlocks,
        paintLiters: paint.totalPaintLiters,
        tilesSqFt: tiles.tileQuantitySqFt
      }
    };
  }
};

export * from './area';
export * from './excavation';
export * from './pcc';
export * from './rcc';
export * from './bricks';
export * from './aac';
export * from './plaster';
export * from './paint';
export * from './tiles';
export * from './steel';
export { generateStructuralContext } from './shared';
