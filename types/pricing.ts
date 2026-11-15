export type PricingMode = 'Economy' | 'Standard' | 'Premium' | 'Luxury';

export interface LocationContext {
  country: string;
  state?: string;
  city?: string;
  supplierId?: string;
}

export interface MaterialRateRow {
  materialId: string;
  materialName: string;
  unit: string;
  economyRate: number;
  standardRate: number;
  premiumRate: number;
  luxuryRate: number;
  updatedAt: string;
}

export interface CountryRates {
  country: string;
  rates: MaterialRateRow[];
}

// Flat resolved rate card for a project cost estimation
export interface PricingRateCard {
  cement: number;
  sand: number;
  aggregate: number;
  steel: number;
  bricks: number;
  aacBlocks: number;
  paint: number;
  tiles: number;
  plaster: number;
  labour: number;
}
