import { LocationContext, PricingMode, PricingRateCard, SingleModeEstimate, CostComparisonMatrix } from '../../types';
import { LabourEngine } from './labourEngine';
import { PricingEngine } from '../pricing/pricingEngine';

export const CostEngine = {
  calculateCost(
    quantities: any,
    rates: PricingRateCard,
    builtUpAreaSqFt: number,
    context: LocationContext,
    mode: PricingMode
  ): SingleModeEstimate {
    // Extract summary metrics (handle nested QuantityEngineOutput or flat summary)
    const summary = quantities.summary || quantities;
    
    const plasterSqFt = quantities.plaster
      ? ((quantities.plaster.internalPlaster?.areaSqFt || 0) + 
         (quantities.plaster.externalPlaster?.areaSqFt || 0) + 
         (quantities.plaster.ceilingPlaster?.areaSqFt || 0))
      : 0;

    // 1. Material Costs based on actual resolved rate cards
    const materialCosts = {
      cement: Math.round((summary.cementBags || 0) * rates.cement),
      sand: Math.round((summary.sandCFT || 0) * rates.sand),
      aggregate: Math.round((summary.aggregateCFT || 0) * rates.aggregate),
      steel: Math.round((summary.steelMT || 0) * rates.steel),
      bricks: Math.round((summary.bricksCount || 0) * rates.bricks),
      aacBlocks: Math.round((summary.blocksCount || 0) * rates.aacBlocks),
      paint: Math.round((summary.paintLiters || 0) * rates.paint),
      tiles: Math.round((summary.tilesSqFt || 0) * rates.tiles),
      plaster: Math.round(plasterSqFt * rates.plaster)
    };

    const totalMaterialCost = Object.values(materialCosts).reduce((sum, cost) => sum + cost, 0);

    // 2. Labour Cost (using LabourEngine)
    const labourCost = LabourEngine.calculateLabourCost(builtUpAreaSqFt, context, mode);

    // 3. Contingency (typically 5% of material + labour cost)
    const baseCost = totalMaterialCost + labourCost;
    const contingency = Math.round(baseCost * 0.05);

    // 4. Total Cost
    const totalCost = baseCost + contingency;

    return {
      mode,
      materialCosts,
      totalMaterialCost,
      labourCost,
      contingency,
      totalCost
    };
  },

  // Calculate comparison matrix for all 4 construction qualities
  async calculateComparisonMatrix(
    quantities: any,
    builtUpAreaSqFt: number,
    context: LocationContext
  ): Promise<CostComparisonMatrix> {
    const modes: PricingMode[] = ['Economy', 'Standard', 'Premium', 'Luxury'];
    const matrix: Partial<CostComparisonMatrix> = {};

    for (const mode of modes) {
      const rates = await PricingEngine.resolveRates(context, mode);
      matrix[mode] = this.calculateCost(quantities, rates, builtUpAreaSqFt, context, mode);
    }

    return matrix as CostComparisonMatrix;
  },

  // Sync version for server-components / fast renders
  calculateComparisonMatrixSync(
    quantities: any,
    builtUpAreaSqFt: number,
    context: LocationContext
  ): CostComparisonMatrix {
    const modes: PricingMode[] = ['Economy', 'Standard', 'Premium', 'Luxury'];
    const matrix: Partial<CostComparisonMatrix> = {};

    for (const mode of modes) {
      const rates = PricingEngine.resolveRatesSync(context, mode);
      matrix[mode] = this.calculateCost(quantities, rates, builtUpAreaSqFt, context, mode);
    }

    return matrix as CostComparisonMatrix;
  }
};
