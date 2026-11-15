import { ConstructionQuality, WallType, WastageOption } from '../../types';

export interface QuantityEngineInput {
  plotLength: number;
  plotWidth: number;
  unit: 'Feet' | 'Meter';
  floors: number;
  floorHeight: number;
  buildingType: 'Residential' | 'Commercial' | 'Mixed Use';
  constructionQuality: ConstructionQuality;
  wallType: WallType;
  concreteGrade: string; // e.g., 'M7.5', 'M20', etc.
  
  // Optional room counts for MEP & doors/windows calculation
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  livingRooms?: number;
  balconies?: number;
  wastageOption?: WastageOption;
}

export interface StructuralContext {
  builtUpAreaSqFt: number;
  numColumns: number;
  excavationVolumeCFT: number;
  pccVolumeCFT: number;
  pccDryVolumeCFT: number;
  footingRCC: number;
  columnsRCC: number;
  slabsRCC: number;
  beamsRCC: number;
  staircaseRCC: number;
  rccVolumeCFT: number;
  rccDryVolumeCFT: number;
  totalWallLength: number;
  extWallVol: number;
  intWallVol: number;
  netWallVolCFT: number;
  wallType?: WallType;
  ceilingPlasterArea: number;
  ceilingPlasterVolCFT: number;
  internalPlasterArea: number;
  internalPlasterVolCFT: number;
  externalPlasterArea: number;
  externalPlasterVolCFT: number;
  totalPlasterArea: number;
  baseFlooringArea: number;
  totalFlooringArea: number;
  paintArea: number;
  wastageOption: number;
  pccGrade: 'M5' | 'M7.5' | 'M10';
  rccGrade: 'M20' | 'M25' | 'M30';
  
  // Openings & Services
  doorsCount: number;
  windowsCount: number;
  plumbingPoints: number;
  electricalPoints: number;
  waterproofingArea: number;
}


// Helpers
export function convertToFeet(value: number, unit: 'Feet' | 'Meter'): number {
  return unit === 'Meter' ? value * 3.28084 : value;
}

export function generateStructuralContext(input: QuantityEngineInput): StructuralContext {
  const {
    plotLength,
    plotWidth,
    unit,
    floors,
    floorHeight,
    buildingType,
    constructionQuality,
    wallType,
    concreteGrade
  } = input;

  const lengthFt = convertToFeet(plotLength, unit);
  const widthFt = convertToFeet(plotWidth, unit);
  const plotAreaSqFt = lengthFt * widthFt;

  // Coverage factor based on building/plot type
  let coverageFactor = 0.70; // Residential default
  if (buildingType === 'Commercial') {
    coverageFactor = 0.85;
  } else if (buildingType === 'Mixed Use') {
    coverageFactor = 0.75;
  }

  const builtUpAreaSqFt = plotAreaSqFt * floors * coverageFactor;
  const numColumns = Math.ceil(builtUpAreaSqFt / 120);

  // Excavation size for column footing: 5ft x 5ft x 5ft depth
  const excavationVolumeCFT = numColumns * 125;

  // PCC (Plain Cement Concrete) laying: 5ft x 5ft x 3 inches (0.25 ft) under columns footing
  const pccVolumeCFT = numColumns * 5 * 5 * 0.25;
  const pccDryVolumeCFT = pccVolumeCFT * 1.54;

  // Structural RCC members volume
  const footingRCC = numColumns * 4.5 * 4.5 * 1.0; // Footing volume
  const columnsRCC = numColumns * (0.75 * 1.0) * floorHeight * floors; // Column size: 9"x12"
  const slabsRCC = builtUpAreaSqFt * (5 / 12); // Slab thickness: 5 inches
  const beamsRCC = slabsRCC * 0.30; // Beams estimated at 30% of slabs
  const staircaseRCC = floors * 40;

  const rccVolumeCFT = footingRCC + columnsRCC + slabsRCC + beamsRCC + staircaseRCC;
  const rccDryVolumeCFT = rccVolumeCFT * 1.54;

  // Masonry Walls (Brick vs AAC vs Hollow)
  const totalWallLength = 4 * Math.sqrt(builtUpAreaSqFt) * floors;
  // External walls (60% length, 9" thick = 0.75 ft)
  const extWallVol = (totalWallLength * 0.60) * floorHeight * 0.75;
  // Internal partition walls (40% length, 4.5" thick = 0.375 ft)
  const intWallVol = (totalWallLength * 0.40) * floorHeight * 0.375;
  // Net volume after deducting 15% for doors & window openings
  const netWallVolCFT = (extWallVol + intWallVol) * 0.85;

  // Plastering areas (Internal, External, Ceiling)
  const ceilingPlasterArea = builtUpAreaSqFt;
  const ceilingPlasterVolCFT = ceilingPlasterArea * (12 / 304.8); // 12mm thick

  const internalPlasterArea = (2 * (totalWallLength * 0.40) * floorHeight) + ((totalWallLength * 0.60) * floorHeight);
  const internalPlasterVolCFT = internalPlasterArea * (15 / 304.8); // 15mm thick

  const externalPlasterArea = (totalWallLength * 0.60) * floorHeight;
  const externalPlasterVolCFT = externalPlasterArea * (20 / 304.8); // 20mm thick

  const totalPlasterArea = ceilingPlasterArea + internalPlasterArea + externalPlasterArea;

  // Flooring
  const baseFlooringArea = builtUpAreaSqFt * 0.90;

  // Wastage options based on quality tier (Economy/Basic = 5%, Standard = 10%, Premium = 15%)
  let wastageOption = 5;
  if (constructionQuality === 'Standard') {
    wastageOption = 10;
  } else if (constructionQuality === 'Premium') {
    wastageOption = 15;
  }

  const totalFlooringArea = baseFlooringArea * (1 + wastageOption / 100);

  // Map concrete grades
  let pccGrade: 'M5' | 'M7.5' | 'M10' = 'M7.5';
  let rccGrade: 'M20' | 'M25' | 'M30' = 'M20';

  if (concreteGrade === 'M5' || concreteGrade === 'M7.5' || concreteGrade === 'M10') {
    pccGrade = concreteGrade;
  } else if (concreteGrade === 'M20' || concreteGrade === 'M25' || concreteGrade === 'M30') {
    rccGrade = concreteGrade;
  }

  // Room count fallbacks based on BUA if not provided
  const rBedrooms = input.bedrooms !== undefined ? input.bedrooms : Math.max(1, Math.floor(builtUpAreaSqFt / 600));
  const rBathrooms = input.bathrooms !== undefined ? input.bathrooms : Math.max(1, Math.floor(builtUpAreaSqFt / 800));
  const rKitchens = input.kitchens !== undefined ? input.kitchens : Math.max(1, Math.floor(builtUpAreaSqFt / 1200));
  const rLivingRooms = input.livingRooms !== undefined ? input.livingRooms : Math.max(1, Math.floor(builtUpAreaSqFt / 1000));
  const rBalconies = input.balconies !== undefined ? input.balconies : Math.max(0, Math.floor(builtUpAreaSqFt / 1500));

  // Doors & Windows
  const doorsCount = rBedrooms + rBathrooms + 2;
  const windowsCount = rBedrooms * 2 + rLivingRooms * 2 + 1;

  // Plumbing points (bathrooms + kitchens)
  const plumbingPoints = (rBathrooms * 5) + (rKitchens * 3);

  // Electrical points (based on rooms and BUA)
  const numRooms = rBedrooms + rBathrooms + rKitchens + rLivingRooms + rBalconies + 2;
  const electricalPoints = numRooms * 8 + Math.ceil(builtUpAreaSqFt / 100) * 3;

  // Waterproofing (wet areas + balconies + roof slab)
  const roofArea = builtUpAreaSqFt / floors;
  const wetArea = (rBathrooms * 45) + (rKitchens * 45) + (rBalconies * 30);
  const waterproofingArea = roofArea + wetArea;

  return {
    builtUpAreaSqFt,
    numColumns,
    excavationVolumeCFT,
    pccVolumeCFT,
    pccDryVolumeCFT,
    footingRCC,
    columnsRCC,
    slabsRCC,
    beamsRCC,
    staircaseRCC,
    rccVolumeCFT,
    rccDryVolumeCFT,
    totalWallLength,
    extWallVol,
    intWallVol,
    netWallVolCFT,
    ceilingPlasterArea,
    ceilingPlasterVolCFT,
    internalPlasterArea,
    internalPlasterVolCFT,
    externalPlasterArea,
    externalPlasterVolCFT,
    totalPlasterArea,
    baseFlooringArea,
    totalFlooringArea,
    paintArea: totalPlasterArea,
    wastageOption,
    pccGrade,
    rccGrade,
    
    // Openings & Services
    doorsCount,
    windowsCount,
    plumbingPoints,
    electricalPoints,
    waterproofingArea
  };
}

