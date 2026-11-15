import { QuantityEngineOutput } from './material';
import { PricingMode } from './pricing';

export interface MaterialQuantities {
  cementBags: number;
  sandCFT: number;
  aggregateCFT: number;
  steelMT: number;
  bricksCount: number;
  blocksCount: number;
  paintLiters: number;
  tilesSqFt: number;
  plasterSqFt: number;
}

export interface SingleModeEstimate {
  mode: PricingMode;
  materialCosts: Record<string, number>;
  totalMaterialCost: number;
  labourCost: number;
  contingency: number;
  totalCost: number;
}

export interface CostComparisonMatrix {
  Economy: SingleModeEstimate;
  Standard: SingleModeEstimate;
  Premium: SingleModeEstimate;
  Luxury: SingleModeEstimate;
}

export interface FullEstimationReport {
  projectName: string;
  projectId: string;
  country: string;
  currency: string;
  currencySymbol: string;
  builtUpAreaSqFt: number;
  quantities: QuantityEngineOutput;
  costEstimate: SingleModeEstimate; // Resolved estimate based on selected project quality
  comparisonMatrix: CostComparisonMatrix; // Full Economy/Standard/Premium/Luxury comparison
}
