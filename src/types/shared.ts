// Shared domain types for Buildora

export type ProjectType =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'apartment'
  | 'villa'
  | 'school'
  | 'hospital'
  | 'warehouse'
  | 'factory';

export type FoundationType =
  | 'isolated_footing'
  | 'combined_footing'
  | 'raft'
  | 'pile'
  | 'strip';

export type WallMaterial = 'brick' | 'aac_block' | 'concrete';

export type RoofType = 'flat_rc' | 'sloped_rc' | 'ttile' | 'metal';

export type ConstructionGrade = 'M15' | 'M20' | 'M25' | 'M30';

export type SoilType =
  | 'soft'
  | 'medium'
  | 'hard'
  | 'rock';

export type PlotShape = 'rectangular' | 'square' | 'l_shaped' | 'irregular';

export interface RoomDetail {
  id: string;
  name: string;
  length: number; // m
  breadth: number; // m
  height: number; // m
  floorIndex: number;
}

export interface ProjectDetailsInput {
  projectName: string;
  location: string;
  plotSize: number; // sq.m
  plotShape: PlotShape;
  floors: number;
  rooms: RoomDetail[];
  foundationType: FoundationType;
  wallMaterial: WallMaterial;
  wallThickness: number; // m (e.g. 0.23 for 9")
  roofType: RoofType;
  beamSize: { width: number; depth: number }; // m
  columnSize: { width: number; depth: number }; // m
  slabThickness: number; // m
  floorHeight: number; // m
  constructionGrade: ConstructionGrade;
  soilType: SoilType;
  additionalNotes?: string;
  totalBuiltUpArea: number; // sq.m (sum of all floors' area)
}

export type MaterialCategory =
  | 'concrete'
  | 'cement'
  | 'sand'
  | 'aggregate'
  | 'steel'
  | 'masonry'
  | 'finishes'
  | 'doors_windows'
  | 'electrical'
  | 'plumbing'
  | 'waterproofing'
  | 'roofing'
  | 'hardware'
  | 'misc';

// A single transparent calculation result.
export interface CalculationResult {
  item: string;
  quantity: number;
  unit: string;
  formulaUsed: string;
  inputs: Record<string, number | string>;
  steps: string[];
  category: MaterialCategory;
}

export interface BOQLineItem {
  item: string;
  category: MaterialCategory;
  quantity: number;
  unit: string;
  rate: number; // per unit, INR
  amount: number; // INR
}

export interface CostBreakdown {
  materialCost: number;
  labourCost: number;
  transportation: number;
  equipmentCost: number;
  miscellaneous: number;
  gst: number;
  waste: number;
  totalCost: number;
  costPerSqFt: number;
  costPerFloor: number;
  costPerRoom: number;
}

export interface SupabaseUser {
  id: string;
  email: string;
  fullName?: string;
  role: 'user' | 'admin';
}
