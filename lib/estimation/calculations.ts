// Pure Quantity-only calculations wrapper

import { PlotDetails, BuildingDetails, EstimationResult } from '../../types';
import { QuantityEngine, QuantityEngineInput } from '../calculations';
import { BIMLiteBuildingModel } from '../../src/ai/blueprint-analyzer/buildingModelGenerator';

// Master Calculation Engine wrapper
export function runEstimationEngine(
  plot: PlotDetails,
  building: BuildingDetails,
  aiModel?: BIMLiteBuildingModel | null
): EstimationResult {
  if (aiModel) {
    return runBlueprintEstimation(plot, building, aiModel);
  }

  let constructionQuality: 'Economy' | 'Standard' | 'Premium' | 'Luxury' = 'Standard';
  if ((building.quality as string) === 'Basic' || (building.quality as string) === 'Economy') {
    constructionQuality = 'Economy';
  } else if (building.quality === 'Premium') {
    constructionQuality = 'Premium';
  } else if ((building.quality as string) === 'Luxury') {
    constructionQuality = 'Luxury';
  } else {
    constructionQuality = 'Standard';
  }

  let wallType: 'Brick Wall' | 'AAC Block Wall' = 'Brick Wall';
  if (
    (building.wallType as string) === 'AAC Block Wall' || 
    (building.wallType as string) === 'AAC Blocks'
  ) {
    wallType = 'AAC Block Wall';
  }

  const quantityInput: QuantityEngineInput = {
    plotLength: Number(plot.plotLength),
    plotWidth: Number(plot.plotWidth),
    unit: plot.unit as 'Feet' | 'Meter',
    floors: Number(building.floors),
    floorHeight: Number(building.floorHeight || 10),
    buildingType: plot.plotType as 'Residential' | 'Commercial' | 'Mixed Use',
    constructionQuality,
    wallType,
    wastageOption: Number(building.wastageOption || 5),
    bedrooms: Number(building.bedrooms || 0),
    bathrooms: Number(building.bathrooms || 0),
    kitchens: Number(building.kitchens || 0),
    livingRooms: Number(building.livingRooms || 0),
    balconies: Number(building.balconies || 0)
  };

  const quantities = QuantityEngine.calculateQuantities(quantityInput);

  const builtUpAreaDisplay = plot.unit === 'Meter' 
    ? quantities.area.builtUpAreaSqM
    : quantities.area.builtUpAreaSqFt;
  const builtUpAreaSqGaj = quantities.area.builtUpAreaSqFt / 9;

  return {
    builtUpAreaSqFt: quantities.area.builtUpAreaSqFt,
    builtUpAreaDisplay,
    builtUpAreaSqGaj,
    quantities
  };
}

// Blueprint Override Estimator
function runBlueprintEstimation(
  plot: PlotDetails,
  building: BuildingDetails,
  model: BIMLiteBuildingModel
): EstimationResult {
  const wastage = Number(building.wastageOption || 5);
  const concreteGrade = (building.rccGrade || 'M20') as 'M20' | 'M25' | 'M30';
  const pccGrade = (building.pccGrade || 'M7.5') as 'M5' | 'M7.5' | 'M10';

  // 1. Area Output
  const slabArea = model.slabs.reduce((acc, s) => acc + s.length * s.width, 0);
  const builtUpAreaSqFt = slabArea;
  const plotAreaSqFt = plot.unit === 'Meter' 
    ? (plot.plotLength * plot.plotWidth) * 10.7639 
    : (plot.plotLength * plot.plotWidth);

  const area = {
    plotAreaSqFt,
    plotAreaSqM: plotAreaSqFt / 10.7639,
    builtUpAreaSqFt,
    builtUpAreaSqM: builtUpAreaSqFt / 10.7639,
    totalConstructionAreaSqFt: builtUpAreaSqFt,
    totalConstructionAreaSqM: builtUpAreaSqFt / 10.7639
  };

  // 2. Excavation
  const numColumns = model.columns.length;
  const footingWidthFt = 5.0;
  const footingDepthFt = 5.0;
  const excavationVolumeCFT = numColumns * footingWidthFt * footingWidthFt * footingDepthFt;
  
  const excavation = {
    numColumns,
    excavationVolumeCFT,
    excavationVolumeM3: excavationVolumeCFT / 35.3147,
    footingWidthFt,
    footingDepthFt
  };

  // 3. PCC Bedding
  const pccVolumeCFT = numColumns * 5 * 5 * 0.25; // 3 inches bedding
  const pccDryVolumeCFT = pccVolumeCFT * 1.54;
  
  // PCC Mix Proportions (cement:sand:aggregate:total)
  const PCC_PROPORTIONS = {
    M5: { cement: 1, sand: 5, aggregate: 10, total: 16 },
    'M7.5': { cement: 1, sand: 4, aggregate: 8, total: 13 },
    M10: { cement: 1, sand: 3, aggregate: 6, total: 10 }
  };
  const pccMix = PCC_PROPORTIONS[pccGrade] || PCC_PROPORTIONS['M7.5'];
  const pccCementVolume = (pccMix.cement / pccMix.total) * pccDryVolumeCFT;
  const pccCementBags = pccCementVolume / 1.226;
  const pccSandCFT = (pccMix.sand / pccMix.total) * pccDryVolumeCFT;
  const pccAggregateCFT = (pccMix.aggregate / pccMix.total) * pccDryVolumeCFT;

  const pcc = {
    pccVolumeCFT,
    pccVolumeM3: pccVolumeCFT / 35.3147,
    cementBags: Math.round(pccCementBags),
    sandCFT: Math.round(pccSandCFT),
    aggregateCFT: Math.round(pccAggregateCFT)
  };

  // 4. RCC & Steel
  // Mix Proportions RCC
  const RCC_PROPORTIONS = {
    M20: { cement: 1, sand: 1.5, aggregate: 3, total: 5.5 },
    M25: { cement: 1, sand: 1, aggregate: 2, total: 4 },
    M30: { cement: 1, sand: 0.75, aggregate: 1.5, total: 3.25 }
  };
  const rccMix = RCC_PROPORTIONS[concreteGrade] || RCC_PROPORTIONS['M20'];

  const calculateRCCMember = (volumeCFT: number, steelRatioKgPerCFT: number) => {
    const dryVol = volumeCFT * 1.54;
    const cementBags = ((rccMix.cement / rccMix.total) * dryVol) / 1.226;
    const sandCFT = (rccMix.sand / rccMix.total) * dryVol;
    const aggregateCFT = (rccMix.aggregate / rccMix.total) * dryVol;
    const steelKg = volumeCFT * steelRatioKgPerCFT;
    return { volumeCFT, cementBags, sandCFT, aggregateCFT, steelKg };
  };

  // RCC footings (approx 4.5x4.5x1 per column footing)
  const footingVol = numColumns * 4.5 * 4.5 * 1.0;
  const footings = calculateRCCMember(footingVol, 1.8);

  // RCC columns (actual dimensions)
  const columnVol = model.columns.reduce((acc, c) => acc + (c.width * c.depth * c.height), 0);
  const columns = calculateRCCMember(columnVol, 4.5);

  // RCC beams (actual dimensions)
  const beamVol = model.beams.reduce((acc, b) => acc + (b.length * b.width * b.depth), 0);
  const beams = calculateRCCMember(beamVol, 3.4);

  // RCC slabs (actual dimensions)
  const slabVol = model.slabs.reduce((acc, s) => acc + (s.length * s.width * s.thickness), 0);
  const slabs = calculateRCCMember(slabVol, 2.2);

  // Staircase concrete
  const stairVol = model.stairs.reduce((acc, s) => acc + s.volume, 0);
  const staircases = calculateRCCMember(stairVol, 2.7);

  const totalRCCVolumeCFT = footingVol + columnVol + beamVol + slabVol + stairVol;
  const totalRCCCementBags = footings.cementBags + columns.cementBags + beams.cementBags + slabs.cementBags + staircases.cementBags;
  const totalRCCSandCFT = footings.sandCFT + columns.sandCFT + beams.sandCFT + slabs.sandCFT + staircases.sandCFT;
  const totalRCCAggregateCFT = footings.aggregateCFT + columns.aggregateCFT + beams.aggregateCFT + slabs.aggregateCFT + staircases.aggregateCFT;
  const totalSteelKg = footings.steelKg + columns.steelKg + beams.steelKg + slabs.steelKg + staircases.steelKg;

  const rcc = {
    footings,
    columns,
    beams,
    slabs,
    staircases,
    totalVolumeCFT: totalRCCVolumeCFT,
    totalVolumeM3: totalRCCVolumeCFT / 35.3147,
    totalCementBags: Math.round(totalRCCCementBags),
    totalSandCFT: Math.round(totalRCCSandCFT),
    totalAggregateCFT: Math.round(totalRCCAggregateCFT),
    totalSteelKg: Math.round(totalSteelKg),
    totalSteelMT: totalSteelKg / 1000
  };

  const steel = {
    foundationSteelKg: Math.round(footings.steelKg),
    columnSteelKg: Math.round(columns.steelKg),
    beamSteelKg: Math.round(beams.steelKg),
    slabSteelKg: Math.round(slabs.steelKg),
    staircaseSteelKg: Math.round(staircases.steelKg),
    totalSteelKg: Math.round(totalSteelKg),
    totalSteelMT: totalSteelKg / 1000
  };

  // 5. Masonry Deductions
  const wallType = building.wallType || 'Brick Wall';
  const grossWallVolumeCFT = model.walls.reduce((acc, w) => acc + (w.length * w.height * w.thickness), 0);
  
  const openingsDeductionVolume = model.openings.reduce((acc, op) => {
    const wall = model.walls.find(w => w.id === op.associatedWallId);
    const thickness = wall ? wall.thickness : 0.75;
    return acc + (op.width * op.height * thickness);
  }, 0);
  
  const netWallVolumeCFT = Math.max(0, grossWallVolumeCFT - openingsDeductionVolume);
  const wallAreaSqFt = model.walls.reduce((acc, w) => acc + (w.length * w.height), 0);

  let bricksResult: any = undefined;
  let aacResult: any = undefined;
  let masonryCementBags = 0;
  let masonrySandCFT = 0;
  let totalBricksCount = 0;
  let totalBlocksCount = 0;

  if (wallType === 'Brick Wall' || wallType === 'Brick Masonry') {
    const brickVol = 0.086; // standard brick with mortar CFT
    const brickQuantity = Math.round((netWallVolumeCFT / brickVol) * (1 + wastage / 100));
    const mortarVolumeCFT = netWallVolumeCFT * 0.30;
    const mortarDry = mortarVolumeCFT * 1.33;
    const cementBags = ((1 / 7) * mortarDry) / 1.226; // 1:6 mix
    const sandCFT = (6 / 7) * mortarDry;

    masonryCementBags = cementBags;
    masonrySandCFT = sandCFT;
    totalBricksCount = brickQuantity;

    bricksResult = {
      wallAreaSqFt,
      wallVolumeCFT: netWallVolumeCFT,
      brickQuantity,
      mortarVolumeCFT,
      cementBags: Math.round(cementBags),
      sandCFT: Math.round(sandCFT)
    };
  } else {
    // AAC Blocks
    const blockVol = 0.67; // standard 24"x8"x6" block CFT
    const blockQuantity = Math.round((netWallVolumeCFT / blockVol) * (1 + wastage / 100));
    const adhesiveBags = (netWallVolumeCFT / 35.3147) * 1.2; // 1.2 bags per m3

    totalBlocksCount = blockQuantity;

    aacResult = {
      wallAreaSqFt,
      wallVolumeCFT: netWallVolumeCFT,
      blockQuantity,
      adhesiveBags: Math.round(adhesiveBags)
    };
  }

  // 6. Plastering
  const ceilingArea = slabArea;
  const ceilingPlasterVolCFT = ceilingArea * (12 / 304.8); // 12mm thick

  // Count internal faces (2 for internal, 1 for external)
  let internalPlasterArea = 0;
  model.walls.forEach(w => {
    internalPlasterArea += w.isExternal ? (w.length * w.height) : (2 * w.length * w.height);
  });
  model.openings.forEach(op => {
    const wall = model.walls.find(w => w.id === op.associatedWallId);
    const factor = (wall && wall.isExternal) ? 1 : 2;
    internalPlasterArea -= factor * op.width * op.height;
  });
  internalPlasterArea = Math.max(0, internalPlasterArea);
  const internalPlasterVolCFT = internalPlasterArea * (15 / 304.8); // 15mm thick

  // Count external faces (1 for external)
  let externalPlasterArea = model.walls.filter(w => w.isExternal).reduce((acc, w) => acc + (w.length * w.height), 0);
  model.openings.forEach(op => {
    const wall = model.walls.find(w => w.id === op.associatedWallId);
    if (wall && wall.isExternal) {
      externalPlasterArea -= op.width * op.height;
    }
  });
  externalPlasterArea = Math.max(0, externalPlasterArea);
  const externalPlasterVolCFT = externalPlasterArea * (20 / 304.8); // 20mm thick

  // Plaster Mix cement/sand
  const ceilingCement = ((1 / 5) * ceilingPlasterVolCFT * 1.33) / 1.226;
  const ceilingSand = (4 / 5) * ceilingPlasterVolCFT * 1.33;

  const internalCement = ((1 / 7) * internalPlasterVolCFT * 1.33) / 1.226;
  const internalSand = (6 / 7) * internalPlasterVolCFT * 1.33;

  const externalCement = ((1 / 5) * externalPlasterVolCFT * 1.33) / 1.226;
  const externalSand = (4 / 5) * externalPlasterVolCFT * 1.33;

  const plasterCementTotal = ceilingCement + internalCement + externalCement;
  const plasterSandTotal = ceilingSand + internalSand + externalSand;

  const plaster = {
    internalPlaster: {
      areaSqFt: Math.round(internalPlasterArea),
      cementBags: Math.round(internalCement),
      sandCFT: Math.round(internalSand)
    },
    externalPlaster: {
      areaSqFt: Math.round(externalPlasterArea),
      cementBags: Math.round(externalCement),
      sandCFT: Math.round(externalSand)
    },
    ceilingPlaster: {
      areaSqFt: Math.round(ceilingArea),
      cementBags: Math.round(ceilingCement),
      sandCFT: Math.round(ceilingSand)
    },
    totalCementBags: Math.round(plasterCementTotal),
    totalSandCFT: Math.round(plasterSandTotal)
  };

  // 7. Paint (Putty, Primer, Paint)
  const coverageAreaSqFt = ceilingArea + internalPlasterArea + externalPlasterArea;
  const paint = {
    puttyKg: Math.round((ceilingArea + internalPlasterArea) * 0.12),
    primerLiters: Math.round(coverageAreaSqFt * 0.07),
    interiorPaintLiters: Math.round((ceilingArea + internalPlasterArea) * 0.12),
    exteriorPaintLiters: Math.round(externalPlasterArea * 0.15),
    totalPaintLiters: Math.round((ceilingArea + internalPlasterArea) * 0.12 + externalPlasterArea * 0.15),
    coverageAreaSqFt: Math.round(coverageAreaSqFt)
  };

  // 8. Tiles
  const tiledRooms = model.rooms.filter(r => r.type !== 'Parking' && r.type !== 'Balcony' && r.type !== 'Terrace');
  const floorAreaSqFt = tiledRooms.reduce((acc, r) => acc + r.area, 0);
  const tileQuantitySqFt = floorAreaSqFt * (1 + wastage / 100);

  const tiles = {
    floorAreaSqFt: Math.round(floorAreaSqFt),
    tileQuantitySqFt: Math.round(tileQuantitySqFt),
    tileWastageSqFt: tileQuantitySqFt - floorAreaSqFt,
    tilesCount: Math.ceil(tileQuantitySqFt / 4) // assuming 2x2 ft tiles
  };

  // Consolidated Summary
  const cementBags = Math.round(pcc.cementBags + rcc.totalCementBags + plaster.totalCementBags + masonryCementBags);
  const sandCFT = Math.round(pcc.sandCFT + rcc.totalSandCFT + plaster.totalSandCFT + masonrySandCFT);
  const aggregateCFT = Math.round(pcc.aggregateCFT + rcc.totalAggregateCFT);

  const summary = {
    builtUpAreaSqFt,
    plotAreaSqFt,
    totalConstructionAreaSqFt: builtUpAreaSqFt,
    cementBags,
    sandCFT,
    aggregateCFT,
    steelMT: steel.totalSteelMT,
    bricksCount: totalBricksCount,
    blocksCount: totalBlocksCount,
    paintLiters: paint.totalPaintLiters,
    tilesSqFt: tiles.tileQuantitySqFt
  };

  const quantities = {
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
    summary
  };

  const builtUpAreaDisplay = plot.unit === 'Meter' 
    ? area.builtUpAreaSqM
    : area.builtUpAreaSqFt;
  const builtUpAreaSqGaj = area.builtUpAreaSqFt / 9;

  return {
    builtUpAreaSqFt,
    builtUpAreaDisplay,
    builtUpAreaSqGaj,
    quantities
  };
}

// Standalone estimators exported as wrappers for compatibility
export function estimateCement(builtUpAreaSqFt: number, quality: string): number {
  const tempProj: any = { plotLength: 50, plotWidth: 30, unit: 'Feet', plotType: 'Residential', floors: 1, quality };
  const res = runEstimationEngine(tempProj, tempProj);
  return res.quantities.summary.cementBags;
}

export function estimateSteel(builtUpAreaSqFt: number, quality: string): number {
  const tempProj: any = { plotLength: 50, plotWidth: 30, unit: 'Feet', plotType: 'Residential', floors: 1, quality };
  const res = runEstimationEngine(tempProj, tempProj);
  return res.quantities.summary.steelMT;
}

export function estimateSand(builtUpAreaSqFt: number, quality: string): number {
  const tempProj: any = { plotLength: 50, plotWidth: 30, unit: 'Feet', plotType: 'Residential', floors: 1, quality };
  const res = runEstimationEngine(tempProj, tempProj);
  return res.quantities.summary.sandCFT;
}

export function estimateAggregate(builtUpAreaSqFt: number, quality: string): number {
  const tempProj: any = { plotLength: 50, plotWidth: 30, unit: 'Feet', plotType: 'Residential', floors: 1, quality };
  const res = runEstimationEngine(tempProj, tempProj);
  return res.quantities.summary.aggregateCFT;
}

export function estimateBricks(builtUpAreaSqFt: number, quality: string): number {
  const tempProj: any = { plotLength: 50, plotWidth: 30, unit: 'Feet', plotType: 'Residential', floors: 1, quality };
  const res = runEstimationEngine(tempProj, tempProj);
  return res.quantities.summary.bricksCount;
}

export function estimatePaint(builtUpAreaSqFt: number, quality: string): number {
  const tempProj: any = { plotLength: 50, plotWidth: 30, unit: 'Feet', plotType: 'Residential', floors: 1, quality };
  const res = runEstimationEngine(tempProj, tempProj);
  return res.quantities.summary.paintLiters;
}

export function estimateTiles(builtUpAreaSqFt: number, quality: string): number {
  const tempProj: any = { plotLength: 50, plotWidth: 30, unit: 'Feet', plotType: 'Residential', floors: 1, quality };
  const res = runEstimationEngine(tempProj, tempProj);
  return res.quantities.summary.tilesSqFt;
}
