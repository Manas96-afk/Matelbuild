import { LocationContext, PricingMode } from '../../types';
import { DEFAULT_COUNTRY_RATES } from '../pricing/countryRates';

export const LabourEngine = {
  resolveLabourRate(context: LocationContext, mode: PricingMode): number {
    const country = context.country || 'India';
    const rates = DEFAULT_COUNTRY_RATES[country] || DEFAULT_COUNTRY_RATES['India'];
    const labourRow = rates.find(r => r.materialId === 'labour');
    
    if (labourRow) {
      if (mode === 'Economy') return labourRow.economyRate;
      if (mode === 'Premium') return labourRow.premiumRate;
      if (mode === 'Luxury') return labourRow.luxuryRate;
      return labourRow.standardRate;
    }
    
    // Hardcoded absolute fallbacks
    const fallbacks: Record<PricingMode, number> = {
      Economy: 300,
      Standard: 400,
      Premium: 500,
      Luxury: 700
    };
    return fallbacks[mode];
  },

  calculateLabourCost(builtUpAreaSqFt: number, context: LocationContext, mode: PricingMode): number {
    const rate = this.resolveLabourRate(context, mode);
    return Math.round(builtUpAreaSqFt * rate);
  }
};
