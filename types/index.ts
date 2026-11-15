export type UnitType = 'Feet' | 'Meter';
export type PlotType = 'Residential' | 'Commercial' | 'Mixed Use';
export type ConstructionQuality = 'Economy' | 'Standard' | 'Premium' | 'Luxury';
export type CurrencyType = 'USD' | 'INR';

export type WallType = 'Brick Masonry' | 'AAC Blocks' | 'Hollow Blocks';
export type ConcreteGradePCC = 'M5' | 'M7.5' | 'M10';
export type ConcreteGradeRCC = 'M20' | 'M25' | 'M30';
export type FlooringType = 'Ceramic' | 'Vitrified' | 'Marble' | 'Granite';
export type WastageOption = number;
export type IndianState = 'Maharashtra' | 'Karnataka' | 'Delhi' | 'Tamil Nadu' | 'Uttar Pradesh';
export type IndianCity = 'Mumbai' | 'Bangalore' | 'New Delhi' | 'Chennai' | 'Noida';

export interface PlotDetails {
  projectName: string;
  plotLength: number;
  plotWidth: number;
  unit: UnitType;
  plotType: PlotType;
  state?: IndianState;
  city?: IndianCity;
  country?: string;
}

export interface BuildingDetails {
  floors: number;
  quality: ConstructionQuality;
  bedrooms: number;
  bathrooms: number;
  kitchens: number;
  livingRooms: number;
  balconies: number;
  parkingRequired: boolean;
  floorHeight?: number;
  wallType?: WallType;
  pccGrade?: ConcreteGradePCC;
  rccGrade?: ConcreteGradeRCC;
  flooringType?: FlooringType;
  wastageOption?: WastageOption;
}

export interface Project extends PlotDetails, BuildingDetails {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialEstimateItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
  percentage: number;
  color: string; // for visual charts
  wastageQuantity?: number;
  baseQuantity?: number;
}

export interface MaterialEstimates {
  excavation: MaterialEstimateItem;
  pcc: MaterialEstimateItem;
  rcc: MaterialEstimateItem;
  cement: MaterialEstimateItem;
  steel: MaterialEstimateItem;
  sand: MaterialEstimateItem;
  aggregate: MaterialEstimateItem;
  bricks: MaterialEstimateItem;
  aacBlocks: MaterialEstimateItem;
  hollowBlocks: MaterialEstimateItem;
  plaster: MaterialEstimateItem;
  flooring: MaterialEstimateItem;
  tiles: MaterialEstimateItem;
  paint: MaterialEstimateItem;
  waterproofing: MaterialEstimateItem;
  doors: MaterialEstimateItem;
  windows: MaterialEstimateItem;
  plumbing: MaterialEstimateItem;
  electrical: MaterialEstimateItem;
  labour: MaterialEstimateItem;
}

import { QuantityEngineOutput } from './material';

export interface EstimationResult {
  builtUpAreaSqFt: number;
  builtUpAreaDisplay: number; // in selected unit (sqft or sqm)
  builtUpAreaSqGaj: number;
  quantities: QuantityEngineOutput;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Blueprint {
  id: string;
  projectId: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface AIBuildingModel {
  id: string;
  projectId: string;
  buildingJson: any;
  confidenceScore: number;
  createdAt: string;
}

export * from './material';
export * from './pricing';
export * from './estimate';
export * from './blueprint';


