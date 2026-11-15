import { runEstimationEngine } from './calculations';
import { QuantityEngine } from '../calculations';
import { PricingEngine } from '../pricing/pricingEngine';
import { CostEngine } from '../cost/costEngine';
import { Project } from '../../types';

const mockProject: Project = {
  id: 'mock-proj-1',
  userId: 'mock-user-id',
  projectName: 'Villa Vista',
  plotLength: 50,
  plotWidth: 30,
  unit: 'Feet',
  plotType: 'Residential',
  floors: 2,
  quality: 'Standard',
  bedrooms: 3,
  bathrooms: 3,
  kitchens: 1,
  livingRooms: 1,
  balconies: 2,
  parkingRequired: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

async function runTests() {
  console.log('--- STARTING ARCHITECTURE VERIFICATION TESTS ---');

  // 1. Run legacy engine
  const legacyResult = runEstimationEngine(mockProject, mockProject);

  // 2. Run Quantity Engine
  const quantitiesInput = {
    plotLength: mockProject.plotLength,
    plotWidth: mockProject.plotWidth,
    unit: mockProject.unit,
    floors: mockProject.floors,
    floorHeight: mockProject.floorHeight || 10,
    buildingType: mockProject.plotType,
    constructionQuality: mockProject.quality,
    wallType: mockProject.wallType || 'Brick Masonry',
    concreteGrade: mockProject.rccGrade || 'M20'
  };

  const newQuantities = QuantityEngine.calculateQuantities(quantitiesInput);
  
  // 3. Resolve pricing rates
  const resolvedRates = await PricingEngine.resolveRates(
    { country: 'India', state: mockProject.state, city: mockProject.city },
    'Standard'
  );

  // 4. Calculate cost using Cost Engine
  const newCostEstimate = CostEngine.calculateCost(
    newQuantities,
    resolvedRates,
    legacyResult.builtUpAreaSqFt,
    { country: 'India' },
    'Standard'
  );

  console.log('\n--- QUANTITY ENGINE VERIFICATION ---');
  console.log(`Cement Bags: ${legacyResult.quantities.summary.cementBags} | New: ${newQuantities.summary.cementBags}`);
  console.log(`Steel: ${legacyResult.quantities.summary.steelMT} MT | New: ${newQuantities.summary.steelMT} MT`);

  console.log('\n--- COST ENGINE VERIFICATION ---');
  console.log(`Total Cost (Standard): ₹${newCostEstimate.totalCost}`);

  console.log('\nVerification complete.');
}

runTests().catch(console.error);
