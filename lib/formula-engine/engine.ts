import type {
  CalculationResult,
  ProjectDetailsInput,
  ProjectType,
} from '@/src/types/shared';
import { calcAllConcrete } from './concrete';
import { calcMasonry, calcMasonryMortar } from './masonry';
import { calcSteel, calcConcreteMaterials } from './steel';
import {
  calcPlaster,
  calcPaint,
  calcFlooring,
  calcWaterproofing,
  calcDoorsWindows,
} from './finishes';
import { round } from './utils';

export function calcMEP(input: ProjectDetailsInput): CalculationResult[] {
  const area = input.totalBuiltUpArea;
  const results: CalculationResult[] = [];

  const points = round((area / 10) * 1.2, 0);
  results.push({
    item: 'Electrical Points',
    quantity: points,
    unit: 'nos',
    formulaUsed: 'Points = (BuiltUpArea / 10) × 1.2',
    inputs: { builtUpArea_m2: area },
    steps: [`Points = (${area} / 10) × 1.2 = ${points} nos`],
    category: 'electrical',
  });

  const wiring = round(area * 1.5, 0);
  results.push({
    item: 'Electrical Wiring',
    quantity: wiring,
    unit: 'm',
    formulaUsed: 'Wiring = BuiltUpArea × 1.5',
    inputs: { builtUpArea_m2: area },
    steps: [`Wiring = ${area} × 1.5 = ${wiring} m`],
    category: 'electrical',
  });

  results.push({
    item: 'PVC Conduit',
    quantity: wiring,
    unit: 'm',
    formulaUsed: 'PVC Conduit = Wiring Length',
    inputs: { wiring_m: wiring },
    steps: [`PVC conduit = ${wiring} m`],
    category: 'electrical',
  });

  const cpvc = round((area / 10) * 0.8, 0);
  results.push({
    item: 'CPVC Plumbing Pipe',
    quantity: cpvc,
    unit: 'm',
    formulaUsed: 'CPVC = (BuiltUpArea / 10) × 0.8',
    inputs: { builtUpArea_m2: area },
    steps: [`CPVC = (${area} / 10) × 0.8 = ${cpvc} m`],
    category: 'plumbing',
  });

  const pvcDrain = round((area / 10) * 0.5, 0);
  results.push({
    item: 'PVC Drainage Pipe',
    quantity: pvcDrain,
    unit: 'm',
    formulaUsed: 'PVC Drainage = (BuiltUpArea / 10) × 0.5',
    inputs: { builtUpArea_m2: area },
    steps: [`PVC drainage = (${area} / 10) × 0.5 = ${pvcDrain} m`],
    category: 'plumbing',
  });

  return results;
}

export function calcHardware(steelKg: number): CalculationResult[] {
  const bindingWire = round(steelKg * 0.01, 1);
  const fasteners = round(steelKg / 5, 0);
  return [
    {
      item: 'Binding Wire',
      quantity: bindingWire,
      unit: 'kg',
      formulaUsed: 'Binding Wire = Steel Weight × 0.01',
      inputs: { steelKg },
      steps: [`Binding wire = ${steelKg} × 0.01 = ${bindingWire} kg`],
      category: 'hardware',
    },
    {
      item: 'Fasteners',
      quantity: fasteners,
      unit: 'nos',
      formulaUsed: 'Fasteners = Steel Weight / 5',
      inputs: { steelKg },
      steps: [`Fasteners = ${steelKg} / 5 = ${fasteners} nos`],
      category: 'hardware',
    },
  ];
}

export function calcWater(concreteM3: number): CalculationResult {
  const litres = round(concreteM3 * 3.5 * 14, 0);
  return {
    item: 'Curing Water',
    quantity: litres,
    unit: 'litres',
    formulaUsed: 'Water = Concrete Vol × 3.5 L/m3/day × 14 days',
    inputs: { concreteM3 },
    steps: [`Water = ${concreteM3} × 3.5 × 14 = ${litres} L`],
    category: 'misc',
  };
}

export function calcSiteAndUtilities(
  input: ProjectDetailsInput,
  cementBags: number
): CalculationResult[] {
  const results: CalculationResult[] = [];
  
  const fsi = round(input.totalBuiltUpArea / input.plotSize, 2);
  results.push({
    item: 'Floor Space Index (FSI)',
    quantity: fsi,
    unit: 'ratio',
    formulaUsed: 'FSI = Total Built-up Area ÷ Plot Area',
    inputs: { totalBuiltUpArea: input.totalBuiltUpArea, plotSize: input.plotSize },
    steps: [`FSI = ${input.totalBuiltUpArea} ÷ ${input.plotSize} = ${fsi}`],
    category: 'misc',
  });

  const groundFloorArea = round(input.totalBuiltUpArea / input.floors, 2);
  const groundCoverage = round((groundFloorArea / input.plotSize) * 100, 1);
  results.push({
    item: 'Ground Coverage',
    quantity: groundCoverage,
    unit: '%',
    formulaUsed: 'Ground Coverage % = (Ground Floor Area ÷ Plot Area) × 100',
    inputs: { groundFloorArea, plotSize: input.plotSize },
    steps: [
      `Ground Floor Area = ${input.totalBuiltUpArea} ÷ ${input.floors} = ${groundFloorArea} m2`,
      `Ground Coverage = (${groundFloorArea} ÷ ${input.plotSize}) × 100 = ${groundCoverage}%`,
    ],
    category: 'misc',
  });

  const excavationVol = round(input.plotSize * 1.5, 2);
  results.push({
    item: 'Foundation Excavation Volume',
    quantity: excavationVol,
    unit: 'm3',
    formulaUsed: 'Excavation Volume = Plot Area × Typical Depth (1.5m)',
    inputs: { plotArea_m2: input.plotSize, typicalDepth_m: 1.5 },
    steps: [`Excavation = ${input.plotSize} × 1.5 = ${excavationVol} m3`],
    category: 'misc',
  });

  const occupants = Math.max(4, Math.round(input.totalBuiltUpArea / 30));
  const tankCapacity = round(occupants * 135 * 1, 0);
  results.push({
    item: 'Overhead Water Tank Capacity',
    quantity: tankCapacity,
    unit: 'litres',
    formulaUsed: 'Tank Capacity = Occupants × 135 L/day × 1 Day',
    inputs: { estimatedOccupants: occupants, dailyConsumption_L: 135 },
    steps: [
      `Estimated occupants (1 per 30m2 built-up, min 4) = ${occupants}`,
      `Capacity = ${occupants} × 135 × 1 = ${tankCapacity} L`,
    ],
    category: 'plumbing',
  });

  const septicCapacity = round(occupants * 70 * 1.5, 0);
  results.push({
    item: 'Septic Tank Capacity',
    quantity: septicCapacity,
    unit: 'litres',
    formulaUsed: 'Septic Capacity = Users × 70 L/day × 1.5 Days Retention',
    inputs: { users: occupants, consumptionPerUser_L: 70, retentionDays: 1.5 },
    steps: [`Capacity = ${occupants} × 70 × 1.5 = ${septicCapacity} L (excludes sludge storage)`],
    category: 'plumbing',
  });

  const cementKg = cementBags * 50;
  const mixWater = round(0.45 * cementKg, 0);
  results.push({
    item: 'Concrete Mixing Water',
    quantity: mixWater,
    unit: 'litres',
    formulaUsed: 'Water Required = W/C Ratio (0.45) × Weight of Cement',
    inputs: { cementBags, cementWeight_kg: cementKg, waterCementRatio: 0.45 },
    steps: [
      `Total Cement Weight = ${cementBags} bags × 50 kg = ${cementKg} kg`,
      `Mixing Water = 0.45 × ${cementKg} = ${mixWater} L`,
    ],
    category: 'concrete',
  });

  return results;
}

export function runFullEstimation(
  input: ProjectDetailsInput,
  projectType: ProjectType = 'residential'
): CalculationResult[] {
  const concreteInput = {
    foundationType: input.foundationType,
    plotSize: input.plotSize,
    floors: input.floors,
    columnSize: input.columnSize,
    beamSize: input.beamSize,
    slabThickness: input.slabThickness,
    wallThickness: input.wallThickness,
    totalBuiltUpArea: input.totalBuiltUpArea,
    floorHeight: input.floorHeight,
    projectType,
  };
  const concrete = calcAllConcrete(concreteInput);
  const foundationC = concrete[0].quantity;
  const columnC = concrete[1].quantity;
  const beamC = concrete[2].quantity;
  const slabC = concrete[3].quantity;
  const totalConcrete = foundationC + columnC + beamC + slabC;

  const masonryInput = {
    rooms: input.rooms,
    wallThickness: input.wallThickness,
    wallMaterial: input.wallMaterial,
    floors: input.floors,
    floorHeight: input.floorHeight,
  };
  const masonry = calcMasonry(masonryInput);
  const mortar = calcMasonryMortar(masonryInput);

  const steel = calcSteel({
    foundationConcrete: foundationC,
    columnConcrete: columnC,
    beamConcrete: beamC,
    slabConcrete: slabC,
    projectType,
  });

  const concreteMaterials = calcConcreteMaterials(input.constructionGrade, concrete);
  const cementBags = concreteMaterials[0]?.quantity || 0;

  const finishesInput = {
    rooms: input.rooms,
    floors: input.floors,
    floorHeight: input.floorHeight,
    wallMaterial: input.wallMaterial,
    roofType: input.roofType,
    totalBuiltUpArea: input.totalBuiltUpArea,
  };
  const finishes = [
    calcPlaster(finishesInput),
    calcPaint(finishesInput),
    calcFlooring(finishesInput),
    calcWaterproofing(finishesInput),
    ...calcDoorsWindows(input.rooms),
  ];

  const mep = calcMEP(input);
  const hardware = calcHardware(steel.quantity);
  const water = calcWater(totalConcrete);
  const siteUtilities = calcSiteAndUtilities(input, cementBags);

  return [
    ...concrete,
    ...masonry,
    ...[mortar],
    ...[steel],
    ...concreteMaterials,
    ...finishes,
    ...mep,
    ...hardware,
    ...[water],
    ...siteUtilities,
  ];
}
