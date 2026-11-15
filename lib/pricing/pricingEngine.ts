import { LocationContext, PricingMode, PricingRateCard, MaterialRateRow } from '../../types';
import { DEFAULT_COUNTRY_RATES } from './countryRates';
import { db } from '../db';

export interface RateResolver {
  resolve(context: LocationContext): Promise<MaterialRateRow[] | null>;
}

// Phase 1 Resolver: Resolves rates based on the project's country
export class CountryRateResolver implements RateResolver {
  async resolve(context: LocationContext): Promise<MaterialRateRow[] | null> {
    const country = context.country || 'India';
    
    // Try fetching from the database (if Supabase or local storage has rates)
    try {
      if (db.getCountryRates) {
        const dbRates = await db.getCountryRates(country);
        if (dbRates && dbRates.length > 0) {
          // Adapt the returned rows to match luxury rate standard
          return dbRates.map(row => ({
            ...row,
            luxuryRate: row.luxuryRate || row.premiumRate * 1.2 // fallback if luxury rate is missing in DB
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch country rates from DB, using fallback catalog:', err);
    }

    // Fall back to default catalog
    return DEFAULT_COUNTRY_RATES[country] || DEFAULT_COUNTRY_RATES['India'];
  }
}

// Future Expansion Resolvers (clean architectural scalability)
export class StateRateResolver implements RateResolver {
  async resolve(context: LocationContext): Promise<MaterialRateRow[] | null> {
    return null;
  }
}

export class CityRateResolver implements RateResolver {
  async resolve(context: LocationContext): Promise<MaterialRateRow[] | null> {
    return null;
  }
}

export class SupplierRateResolver implements RateResolver {
  async resolve(context: LocationContext): Promise<MaterialRateRow[] | null> {
    return null;
  }
}

export class LiveMarketRateResolver implements RateResolver {
  async resolve(context: LocationContext): Promise<MaterialRateRow[] | null> {
    return null;
  }
}

export const PricingEngine = {
  // Chain of Resolvers to get pricing
  resolvers: [
    new LiveMarketRateResolver(),
    new SupplierRateResolver(),
    new CityRateResolver(),
    new StateRateResolver(),
    new CountryRateResolver() // Fallback to country
  ] as RateResolver[],

  async resolveRates(context: LocationContext, mode: PricingMode): Promise<PricingRateCard> {
    let resolvedRows: MaterialRateRow[] | null = null;

    // Run through the resolvers in order of specificity
    for (const resolver of this.resolvers) {
      try {
        const rates = await resolver.resolve(context);
        if (rates && rates.length > 0) {
          resolvedRows = rates;
          break;
        }
      } catch (err) {
        console.error('Error resolving rates in resolver chain:', err);
      }
    }

    if (!resolvedRows) {
      // absolute safety fallback
      resolvedRows = DEFAULT_COUNTRY_RATES['India'];
    }

    const getRateByMode = (row: MaterialRateRow): number => {
      if (mode === 'Economy') return row.economyRate;
      if (mode === 'Premium') return row.premiumRate;
      if (mode === 'Luxury') return row.luxuryRate;
      return row.standardRate; // Standard
    };

    const findRate = (materialId: string, defaultRate: number): number => {
      const row = resolvedRows?.find(r => r.materialId === materialId);
      return row ? getRateByMode(row) : defaultRate;
    };

    return {
      cement: findRate('cement', mode === 'Economy' ? 350 : mode === 'Premium' ? 500 : mode === 'Luxury' ? 650 : 400),
      sand: findRate('sand', mode === 'Economy' ? 50 : mode === 'Premium' ? 75 : mode === 'Luxury' ? 95 : 60),
      aggregate: findRate('aggregate', mode === 'Economy' ? 55 : mode === 'Premium' ? 75 : mode === 'Luxury' ? 90 : 65),
      steel: findRate('steel', mode === 'Economy' ? 55000 : mode === 'Premium' ? 75000 : mode === 'Luxury' ? 90000 : 65000),
      bricks: findRate('bricks', mode === 'Economy' ? 7 : mode === 'Premium' ? 9 : mode === 'Luxury' ? 12 : 8),
      aacBlocks: findRate('aacBlocks', mode === 'Economy' ? 50 : mode === 'Premium' ? 70 : mode === 'Luxury' ? 85 : 60),
      paint: findRate('paint', mode === 'Economy' ? 250 : mode === 'Premium' ? 400 : mode === 'Luxury' ? 600 : 300),
      tiles: findRate('tiles', mode === 'Economy' ? 70 : mode === 'Premium' ? 105 : mode === 'Luxury' ? 150 : 85),
      plaster: findRate('plaster', mode === 'Economy' ? 20 : mode === 'Premium' ? 30 : mode === 'Luxury' ? 45 : 25),
      labour: findRate('labour', mode === 'Economy' ? 300 : mode === 'Premium' ? 500 : mode === 'Luxury' ? 700 : 400)
    };
  },

  resolveRatesSync(context: LocationContext, mode: PricingMode): PricingRateCard {
    const country = context.country || 'India';
    const resolvedRows = DEFAULT_COUNTRY_RATES[country] || DEFAULT_COUNTRY_RATES['India'];

    const getRateByMode = (row: MaterialRateRow): number => {
      if (mode === 'Economy') return row.economyRate;
      if (mode === 'Premium') return row.premiumRate;
      if (mode === 'Luxury') return row.luxuryRate;
      return row.standardRate; // Standard
    };

    const findRate = (materialId: string, defaultRate: number): number => {
      const row = resolvedRows?.find(r => r.materialId === materialId);
      return row ? getRateByMode(row) : defaultRate;
    };

    return {
      cement: findRate('cement', mode === 'Economy' ? 350 : mode === 'Premium' ? 500 : mode === 'Luxury' ? 650 : 400),
      sand: findRate('sand', mode === 'Economy' ? 50 : mode === 'Premium' ? 75 : mode === 'Luxury' ? 95 : 60),
      aggregate: findRate('aggregate', mode === 'Economy' ? 55 : mode === 'Premium' ? 75 : mode === 'Luxury' ? 90 : 65),
      steel: findRate('steel', mode === 'Economy' ? 55000 : mode === 'Premium' ? 75000 : mode === 'Luxury' ? 90000 : 65000),
      bricks: findRate('bricks', mode === 'Economy' ? 7 : mode === 'Premium' ? 9 : mode === 'Luxury' ? 12 : 8),
      aacBlocks: findRate('aacBlocks', mode === 'Economy' ? 50 : mode === 'Premium' ? 70 : mode === 'Luxury' ? 85 : 60),
      paint: findRate('paint', mode === 'Economy' ? 250 : mode === 'Premium' ? 400 : mode === 'Luxury' ? 600 : 300),
      tiles: findRate('tiles', mode === 'Economy' ? 70 : mode === 'Premium' ? 105 : mode === 'Luxury' ? 150 : 85),
      plaster: findRate('plaster', mode === 'Economy' ? 20 : mode === 'Premium' ? 30 : mode === 'Luxury' ? 45 : 25),
      labour: findRate('labour', mode === 'Economy' ? 300 : mode === 'Premium' ? 500 : mode === 'Luxury' ? 700 : 400)
    };
  }
};
