// Module outputs & Material summary types

export interface AreaOutput {
  plotAreaSqFt: number;
  plotAreaSqM: number;
  builtUpAreaSqFt: number;
  builtUpAreaSqM: number;
  totalConstructionAreaSqFt: number;
  totalConstructionAreaSqM: number;
}

export interface ExcavationOutput {
  numColumns: number;
  excavationVolumeCFT: number;
  excavationVolumeM3: number;
  footingWidthFt: number;
  footingDepthFt: number;
}

export interface PCCOutput {
  pccVolumeCFT: number;
  pccVolumeM3: number;
  cementBags: number;
  sandCFT: number;
  aggregateCFT: number;
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

export interface BricksOutput {
  wallAreaSqFt: number;
  wallVolumeCFT: number;
  brickQuantity: number;
  mortarVolumeCFT: number;
  cementBags: number;
  sandCFT: number;
}

export interface AACTypeOutput {
  wallAreaSqFt: number;
  wallVolumeCFT: number;
  blockQuantity: number;
  adhesiveBags: number;
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

export interface PaintOutput {
  puttyKg: number;
  primerLiters: number;
  interiorPaintLiters: number;
  exteriorPaintLiters: number;
  totalPaintLiters: number;
  coverageAreaSqFt: number;
}

export interface TilesOutput {
  floorAreaSqFt: number;
  tileQuantitySqFt: number;
  tileWastageSqFt: number;
  tilesCount: number;
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

export interface QuantitySummary {
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
  summary: QuantitySummary;
}
