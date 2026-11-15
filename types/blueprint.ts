// Blueprint & Drawing Analysis Type Definitions
// These types power Modules 4–15 of the Buildora MVP

// ─────────────────────────────────────────────────────────────────
// MODULE 4 — Blueprint Upload
// ─────────────────────────────────────────────────────────────────

export type DrawingType =
  | 'architectural'
  | 'structural'
  | 'foundation'
  | 'column_layout'
  | 'beam_layout'
  | 'section'
  | 'elevation'
  | 'unknown';

export type DrawingFileType = 'pdf' | 'png' | 'jpg' | 'jpeg' | 'webp';

export type DrawingAnalysisStatus = 'pending' | 'analyzing' | 'complete' | 'failed';

export interface Drawing {
  id: string;
  projectId: string;
  fileName: string;
  fileType: DrawingFileType;
  drawingType: DrawingType;
  fileDataUrl?: string; // base64 data URL for localStorage mode
  fileUrl?: string; // Supabase Storage URL for production
  fileSizeBytes?: number;
  analysisStatus: DrawingAnalysisStatus;
  uploadedAt: string;
  analyzedAt?: string;
}

// ─────────────────────────────────────────────────────────────────
// MODULE 5 & 6 — Drawing Analysis + OCR
// ─────────────────────────────────────────────────────────────────

export interface DetectedElement {
  id: string;
  type:
    | 'room'
    | 'wall'
    | 'door'
    | 'window'
    | 'column'
    | 'beam'
    | 'slab'
    | 'staircase'
    | 'balcony'
    | 'parking'
    | 'opening';
  label?: string; // e.g. "Master Bedroom", "Column C1"
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    area?: number;
    unit?: 'ft' | 'm' | 'mm' | 'in';
  };
  confidence?: number; // 0.0 – 1.0
  sourceDrawingId?: string;
}

export interface ExtractedDimensions {
  // ── Universal ──────────────────────────────────────────────────
  totalLength?: number;
  totalWidth?: number;
  floorHeight?: number;
  slabThickness?: number;
  wallThickness?: number;
  columnWidth?: number;
  columnDepth?: number;
  beamWidth?: number;
  beamDepth?: number;
  foundationDepth?: number;
  unit?: 'ft' | 'm' | 'mm' | 'in';
  isAssumed?: boolean; // true if default was used (not extracted from drawing)

  // ── Foundation-Specific ────────────────────────────────────────
  foundationType?: 'isolated_footing' | 'combined_footing' | 'raft' | 'pile' | 'strip_footing' | 'well_foundation' | 'unknown';
  footingLengthFt?: number;
  footingWidthFt?: number;
  pileCount?: number;
  pileDiameterMm?: number;
  raftThicknessInch?: number;
  plinthBeamDepthInch?: number;
  totalFootingCount?: number;

  // ── Column-Specific ────────────────────────────────────────────
  columnGridSpacingFt?: number;
  columnCountX?: number;
  columnCountY?: number;
  columnLabels?: string[];     // e.g. ['C1', 'C2', 'A/1']
  buildingLengthFt?: number;
  buildingWidthFt?: number;

  // ── Beam-Specific ──────────────────────────────────────────────
  beamSpanFt?: number;
  plinthBeamPresent?: boolean;
  lintelCount?: number;

  // ── Section-Specific ──────────────────────────────────────────
  dpcLevelFt?: number;
  parapetHeightFt?: number;
  floorToCeilingFt?: number;
  externalWallThicknessIn?: number;
  internalWallThicknessIn?: number;

  // ── Elevation-Specific ────────────────────────────────────────
  buildingHeightFt?: number;
  facadeMaterial?: string;
  floorCount?: number;
  totalDoors?: number;
  totalWindows?: number;

  // ── Architectural-Specific ────────────────────────────────────
  buaPerFloorSqFt?: number;
  bedroomCount?: number;
  bathroomCount?: number;
  kitchenCount?: number;
  livingRoomCount?: number;
  balconyCount?: number;
  staircaseWidthFt?: number;

  // ── Meta ──────────────────────────────────────────────────────
  concreteGrade?: string;      // e.g. 'M20', 'M25'
  steelGrade?: string;         // e.g. 'Fe415', 'Fe500'
  drawingScale?: string;       // e.g. '1:50', '1:100'
  rawTextFound?: string;       // all OCR text extracted from drawing
}

export interface DrawingAnalysis {
  id: string;
  drawingId: string;
  projectId: string;
  detectedElements: DetectedElement[];
  extractedDimensions: ExtractedDimensions;
  rawOcrText?: string;
  analysisVersion: string;   // '1.0.0-mvp-simulation' | '2.0.0-gemini'
  analyzedAt: string;
  confidenceScore: number;   // 0.0 – 1.0 for this specific drawing
  usedRealAI?: boolean;      // true when Gemini Vision was used
  geminiRawData?: Record<string, unknown>; // raw Gemini JSON output
}

// ─────────────────────────────────────────────────────────────────
// MODULE 7 — Drawing Validation
// ─────────────────────────────────────────────────────────────────

export type ValidationSeverity = 'critical' | 'warning' | 'info';

export type ValidationCategory =
  | 'missing_drawing'
  | 'missing_dimensions'
  | 'unreadable_text'
  | 'duplicate_drawing'
  | 'wrong_type'
  | 'low_confidence'
  | 'assumed_value';

export interface ValidationWarning {
  id: string;
  severity: ValidationSeverity;
  category: ValidationCategory;
  title: string;
  message: string;
  recommendation: string;
  affectedDrawingId?: string;
  affectedElement?: string;
}

// ─────────────────────────────────────────────────────────────────
// MODULE 8 — Digital Building Model
// ─────────────────────────────────────────────────────────────────

export interface RoomModel {
  id: string;
  name: string;
  type: 'bedroom' | 'bathroom' | 'kitchen' | 'living' | 'dining' | 'balcony' | 'parking' | 'corridor' | 'other';
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  areaSqFt: number;
  floor: number;
  isAssumed: boolean;
}

export interface WallModel {
  id: string;
  label?: string;
  lengthFt: number;
  heightFt: number;
  thicknessInch: number;
  wallType: 'brick' | 'aac' | 'hollow_block' | 'rcc';
  floor: number;
  isExternal: boolean;
  isAssumed: boolean;
}

export interface ColumnModel {
  id: string;
  label?: string;
  widthInch: number;
  depthInch: number;
  heightFt: number;
  concreteGrade: string;
  isAssumed: boolean;
}

export interface BeamModel {
  id: string;
  label?: string;
  lengthFt: number;
  widthInch: number;
  depthInch: number;
  concreteGrade: string;
  isAssumed: boolean;
}

export interface SlabModel {
  id: string;
  label?: string;
  areaSqFt: number;
  thicknessInch: number;
  concreteGrade: string;
  floor: number;
  isAssumed: boolean;
}

export interface StaircaseModel {
  id: string;
  label?: string;
  flightsPerFloor: number;
  stepCount: number;
  riserHeightInch: number;
  treadDepthInch: number;
  widthFt: number;
  isAssumed: boolean;
}

export interface DigitalBuildingModel {
  id: string;
  projectId: string;
  version: number;

  // Structural elements
  rooms: RoomModel[];
  walls: WallModel[];
  columns: ColumnModel[];
  beams: BeamModel[];
  slabs: SlabModel[];
  staircases: StaircaseModel[];

  // Aggregates
  totalFloors: number;
  totalColumns: number;
  totalBUA_SqFt: number;
  totalWallArea_SqFt: number;
  floorHeight_Ft: number;
  wallType: 'brick' | 'aac' | 'hollow_block' | 'rcc';
  concreteGrade: string;

  // Meta
  drawingIds: string[]; // drawings used to generate this model
  assumptions: string[]; // human-readable assumption statements
  generatedAt: string;
  lastEditedAt?: string;
  overallConfidence: number; // 0.0 – 1.0
}

// ─────────────────────────────────────────────────────────────────
// MODULE 13 — BOQ
// ─────────────────────────────────────────────────────────────────

export type BOQCategory =
  | 'Earthwork & Foundation'
  | 'Concrete Work'
  | 'Structural Steel'
  | 'Masonry'
  | 'Plastering & Finishes'
  | 'Flooring'
  | 'Painting'
  | 'MEP (Estimate)'
  | 'Labour';

export interface BOQLineItem {
  slNo: number;
  id: string;
  category: BOQCategory;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
  amount: number;
  notes?: string;
  sourceElementId?: string; // traceability back to building model element
}

export interface BOQReport {
  projectId: string;
  projectName: string;
  country: string;
  constructionQuality: string;
  currency: string;
  currencySymbol: string;
  items: BOQLineItem[];
  subtotals: Record<BOQCategory, number>;
  grandTotal: number;
  contingency: number; // e.g. 5% contingency
  finalTotal: number;
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────────
// MODULE 15 — Confidence Scores
// ─────────────────────────────────────────────────────────────────

export interface ConfidenceBreakdown {
  blueprintQuality: number;       // 0–100
  wallDetection: number;          // 0–100
  dimensionDetection: number;     // 0–100
  columnDetection: number;        // 0–100
  beamDetection: number;          // 0–100
  slabDetection: number;          // 0–100
  steelEstimate: number;          // 0–100
  foundationAnalysis: number;     // 0–100
  overallConfidence: number;      // 0–100 — weighted average
}

export interface ConfidenceReport {
  projectId: string;
  scores: ConfidenceBreakdown;
  warnings: ValidationWarning[];
  missingDrawings: DrawingType[];
  hasStructuralDrawing: boolean;
  hasFoundationDrawing: boolean;
  hasArchitecturalDrawing: boolean;
  generatedAt: string;
}

// ─────────────────────────────────────────────────────────────────
// Combined Analysis State (used in UI to track full analysis flow)
// ─────────────────────────────────────────────────────────────────

export interface BlueprintAnalysisState {
  projectId: string;
  drawings: Drawing[];
  analyses: DrawingAnalysis[];
  buildingModel: DigitalBuildingModel | null;
  boqReport: BOQReport | null;
  confidenceReport: ConfidenceReport | null;
  validationWarnings: ValidationWarning[];
  status: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  error?: string;
}
