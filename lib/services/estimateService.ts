import { Project, FullEstimationReport, PricingMode } from '../../types';
import { db } from '../db';
import { runEstimationEngine } from '../estimation/calculations';
import { PricingEngine } from '../pricing/pricingEngine';
import { CostEngine } from '../cost/costEngine';
import { CurrencyConfig } from '../pricing/countryRates';

export const EstimateService = {
  async generateFullEstimate(project: Project): Promise<FullEstimationReport> {
    // 1. Check if there is an AI building model associated with the project
    const aiModel = await db.getAIBuildingModel(project.id);
    
    // 2. Run the quantity estimation engine (uses overrides if aiModel exists)
    const result = runEstimationEngine(project, project, aiModel ? aiModel.buildingJson : null);

    // 3. Resolve country context and currencies
    const country = project.country || 'India';
    const currencyInfo = CurrencyConfig[country] || CurrencyConfig['India'];
    const currency = currencyInfo.code;
    const currencySymbol = currencyInfo.symbol;

    // 4. Resolve quality finish pricing mode
    let pricingMode: PricingMode = 'Standard';
    if (project.quality === 'Economy' || (project.quality as string) === 'Basic') {
      pricingMode = 'Economy';
    } else if (project.quality === 'Premium') {
      pricingMode = 'Premium';
    } else if (project.quality === 'Luxury') {
      pricingMode = 'Luxury';
    }

    const rates = await PricingEngine.resolveRates({ country }, pricingMode);

    // 5. Calculate cost estimate for the selected mode
    const costEstimate = CostEngine.calculateCost(
      result.quantities,
      rates,
      result.builtUpAreaSqFt,
      { country },
      pricingMode
    );

    // 6. Calculate full comparative matrix across Economy, Standard, Premium, and Luxury
    const comparisonMatrix = await CostEngine.calculateComparisonMatrix(
      result.quantities,
      result.builtUpAreaSqFt,
      { country }
    );

    return {
      projectName: project.projectName,
      projectId: project.id,
      country,
      currency,
      currencySymbol,
      builtUpAreaSqFt: result.builtUpAreaSqFt,
      quantities: result.quantities,
      costEstimate,
      comparisonMatrix
    };
  },

  // Save the calculated estimate to the DB
  async saveProjectEstimate(projectId: string, report: FullEstimationReport): Promise<boolean> {
    try {
      if (db.saveEstimate) {
        return await db.saveEstimate(projectId, report);
      }
      return false;
    } catch (err) {
      console.error('Failed to save estimate:', err);
      return false;
    }
  },

  // Fetch a saved estimate from the DB
  async getProjectEstimate(projectId: string): Promise<FullEstimationReport | null> {
    try {
      if (db.getEstimateByProjectId) {
        return await db.getEstimateByProjectId(projectId);
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch estimate:', err);
      return null;
    }
  }
};
