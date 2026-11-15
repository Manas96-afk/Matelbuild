import { BlueprintService } from '../../src/services/blueprintService';
import { EstimateService } from '../services/estimateService';
import { QuantityValidationService } from '../../src/services/quantityValidationService';
import { runEstimationEngine } from './calculations';
import { Project } from '../../types';

// Mock browser localStorage environment for node script testing
if (typeof window === 'undefined') {
  const mockStorage: Record<string, string> = {};
  (global as any).window = {};
  (global as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { for (const k in mockStorage) delete mockStorage[k]; }
  };
}

const mockProject: Project = {
  id: 'test-proj-override-101',
  userId: 'mock-user-123',
  projectName: 'Test Overrides Mansion',
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
  wallType: 'Brick Masonry',
  rccGrade: 'M20',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

async function runBlueprintSuite() {
  console.log('--- STARTING BLUEPRINT PLATFORM INTEGRATION TESTS ---');

  // 1. Analyze mock drawing
  console.log('\n[TEST 1] Uploading and parsing floor plan drawing...');
  const { blueprint, model, confidence } = await BlueprintService.uploadAndAnalyze(
    mockProject.id,
    'villa_blueprint_rev2.pdf',
    'application/pdf',
    'default', // Use standard 3BHK template
    { wallType: 'Brick Wall', concreteGrade: 'M20' }
  );

  console.log(`- Registered Blueprint ID: ${blueprint.id}`);
  console.log(`- Parsed Building Model Rooms Count: ${model.buildingJson.rooms.length}`);
  console.log(`- Parsed Building Model Columns Count: ${model.buildingJson.columns.length}`);
  console.log(`- Overall AI Confidence Trust Score: ${Math.round(confidence.overallConfidence * 100)}%`);
  
  if (model.buildingJson.rooms.length > 0 && model.buildingJson.columns.length > 0) {
    console.log('✅ TEST 1 PASSED: Drawing successfully parsed into BIM-Lite JSON object.');
  } else {
    throw new Error('❌ TEST 1 FAILED: Model elements not created.');
  }

  // 2. Validate warnings for mismatch
  console.log('\n[TEST 2] Running configuration validation check...');
  const warnings = QuantityValidationService.validate(mockProject, model.buildingJson);
  console.log(`- Total Warnings Detected: ${warnings.length}`);
  warnings.forEach(w => {
    console.log(`  [${w.severity.toUpperCase()}] ${w.title}: ${w.message}`);
  });

  const missingRoomsWarning = warnings.find(w => w.type === 'missing_rooms');
  const floorMismatchWarning = warnings.find(w => w.type === 'floor_mismatch');

  if (warnings.length > 0) {
    console.log('✅ TEST 2 PASSED: Mismatches between project settings and blueprint successfully identified.');
  } else {
    throw new Error('❌ TEST 2 FAILED: Validation warning check returned empty.');
  }

  // 3. Run estimate calculations with overrides
  console.log('\n[TEST 3] Generating estimate and checking blueprint overrides...');
  // Standard estimate (fallback with no blueprint)
  const fallbackEstimate = runEstimationEngine(mockProject, mockProject, null);
  // Override estimate (uses blueprint model)
  const overrideEstimate = await EstimateService.generateFullEstimate(mockProject);

  console.log(`- Fallback Area: ${fallbackEstimate.builtUpAreaSqFt} sqft | Blueprint Area: ${overrideEstimate.builtUpAreaSqFt} sqft`);
  console.log(`- Fallback Cement bags: ${fallbackEstimate.quantities.summary.cementBags} bags | Blueprint Cement bags: ${overrideEstimate.quantities.summary.cementBags} bags`);
  console.log(`- Fallback Steel: ${fallbackEstimate.quantities.summary.steelMT} MT | Blueprint Steel: ${overrideEstimate.quantities.summary.steelMT} MT`);
  console.log(`- Fallback Bricks: ${fallbackEstimate.quantities.summary.bricksCount} pcs | Blueprint Bricks: ${overrideEstimate.quantities.summary.bricksCount} pcs`);

  if (overrideEstimate.builtUpAreaSqFt !== fallbackEstimate.builtUpAreaSqFt && overrideEstimate.quantities.summary.cementBags !== fallbackEstimate.quantities.summary.cementBags) {
    console.log('✅ TEST 3 PASSED: Blueprint override calculations successfully diverted from thumb-rules.');
  } else {
    throw new Error('❌ TEST 3 FAILED: Override calculation results matched standard fallbacks.');
  }

  // 4. Test manual correction and automatic recalculation
  console.log('\n[TEST 4] Simulating manual corrections and checking automatic quantity updates...');
  const previousCement = overrideEstimate.quantities.summary.cementBags;
  const previousSteel = overrideEstimate.quantities.summary.steelMT;

  // Let's modify the columns size in our BIM-Lite model (simulating user editing a column size)
  const updatedModel = { ...model.buildingJson };
  updatedModel.columns = updatedModel.columns.map((c: any) => ({
    ...c,
    width: 1.5, // Change column width from 9" (0.75 ft) to 18" (1.5 ft)
    depth: 1.5  // Change column depth from 12" (1.0 ft) to 18" (1.5 ft)
  }));

  // Save updated model
  await BlueprintService.saveBuildingModel(mockProject.id, updatedModel, confidence.overallConfidence);

  // Recalculate
  const recalculatedEstimate = await EstimateService.generateFullEstimate(mockProject);
  console.log(`- Updated Column Dimensions: 1.5ft x 1.5ft`);
  console.log(`- Previous Cement: ${previousCement} bags | Recalculated Cement: ${recalculatedEstimate.quantities.summary.cementBags} bags`);
  console.log(`- Previous Steel: ${previousSteel} MT | Recalculated Steel: ${recalculatedEstimate.quantities.summary.steelMT} MT`);

  if (recalculatedEstimate.quantities.summary.cementBags > previousCement && recalculatedEstimate.quantities.summary.steelMT > previousSteel) {
    console.log('✅ TEST 4 PASSED: Manual overrides correctly triggered quantity recalculation.');
  } else {
    throw new Error('❌ TEST 4 FAILED: Quantities did not increase after column sizing was enlarged.');
  }

  console.log('\n--- ALL BLUEPRINT PLATFORM INTEGRATION TESTS PASSED ---');
}

runBlueprintSuite().catch(err => {
  console.error('\n❌ TEST SUITE FAILED ENCOUNTERING ERROR:', err);
  process.exit(1);
});
