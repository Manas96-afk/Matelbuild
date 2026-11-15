import type { CalculationResult } from '@/src/types/shared';
import { round, concreteVolToMaterials, cementVolToBags } from './utils';

export interface SteelInput {
  foundationConcrete: number; // m3
  columnConcrete: number; // m3
  beamConcrete: number; // m3
  slabConcrete: number; // m3
  projectType?: string;
}

const STEEL_PERCENT_RESIDENTIAL: Record<string, number> = {
  foundation: 0.008, // 0.8%
  column: 0.018,    // 1.8%
  beam: 0.015,      // 1.5%
  slab: 0.008,      // 0.8%
};

const STEEL_PERCENT_COMMERCIAL: Record<string, number> = {
  foundation: 0.015, // 1.5%
  column: 0.030,    // 3.0%
  beam: 0.022,      // 2.2%
  slab: 0.012,      // 1.2%
};

export function calcSteel(input: SteelInput): CalculationResult {
  const isCommercial = input.projectType && ['commercial', 'industrial', 'warehouse', 'factory', 'hospital', 'school', 'apartment'].includes(input.projectType);
  const ratios = isCommercial ? STEEL_PERCENT_COMMERCIAL : STEEL_PERCENT_RESIDENTIAL;

  const foundationSteel = input.foundationConcrete * ratios.foundation * 7850;
  const columnSteel = input.columnConcrete * ratios.column * 7850;
  const beamSteel = input.beamConcrete * ratios.beam * 7850;
  const slabSteel = input.slabConcrete * ratios.slab * 7850;
  const totalKg = foundationSteel + columnSteel + beamSteel + slabSteel;

  return {
    item: 'Steel Reinforcement',
    quantity: round(totalKg, 1),
    unit: 'kg',
    formulaUsed: isCommercial
      ? 'Steel (kg) = Σ(Element Concrete Vol × Commercial Reinforcement% [F: 1.5%, C: 3.0%, B: 2.2%, S: 1.2%] × 7850 kg/m3)'
      : 'Steel (kg) = Σ(Element Concrete Vol × Residential Reinforcement% [F: 0.8%, C: 1.8%, B: 1.5%, S: 0.8%] × 7850 kg/m3)',
    inputs: {
      foundationConcrete_m3: input.foundationConcrete,
      columnConcrete_m3: input.columnConcrete,
      beamConcrete_m3: input.beamConcrete,
      slabConcrete_m3: input.slabConcrete,
      foundationPct: ratios.foundation,
      columnPct: ratios.column,
      beamPct: ratios.beam,
      slabPct: ratios.slab,
      steelDensity: 7850,
      projectType: input.projectType || 'residential',
    },
    steps: [
      `Select reinforcement rates for ${input.projectType || 'residential'} configuration`,
      `Foundation steel = ${input.foundationConcrete} m3 × ${round(ratios.foundation * 100, 2)}% × 7850 = ${round(foundationSteel, 1)} kg`,
      `Column steel = ${input.columnConcrete} m3 × ${round(ratios.column * 100, 2)}% × 7850 = ${round(columnSteel, 1)} kg`,
      `Beam steel = ${input.beamConcrete} m3 × ${round(ratios.beam * 100, 2)}% × 7850 = ${round(beamSteel, 1)} kg`,
      `Slab steel = ${input.slabConcrete} m3 × ${round(ratios.slab * 100, 2)}% × 7850 = ${round(slabSteel, 1)} kg`,
      `Total steel weight = ${round(totalKg, 1)} kg`,
    ],
    category: 'steel',
  };
}

export function calcConcreteMaterials(
  grade: string,
  concreteResults: { item: string; quantity: number }[]
): CalculationResult[] {
  const total = concreteResults.reduce((a, c) => a + c.quantity, 0);
  const m = concreteVolToMaterials(total, grade);
  const bags = cementVolToBags(m.cementVol);
  const results: CalculationResult[] = [
    {
      item: 'Cement (from concrete)',
      quantity: round(bags, 0),
      unit: 'bags',
      formulaUsed:
        'Cement Bags = Dry Vol × (Cement Parts/Total Parts) × 1.54 × 1440 / 50',
      inputs: {
        totalConcrete_m3: round(total, 2),
        dryVolume_m3: round(m.dryVolume, 2),
        mix: `M-${grade} (1:${m.ratios.sand}:${m.ratios.aggregate})`,
        cementDensity: 1440,
        bagKg: 50,
      },
      steps: [
        `Dry volume = ${round(total, 2)} × 1.54 = ${round(m.dryVolume, 2)} m3`,
        `Cement vol = ${round(m.dryVolume, 2)} × (${m.ratios.cement}/${m.totalParts}) = ${round(m.cementVol, 3)} m3`,
        `Cement bags = ${round(m.cementVol, 3)} × 1440 / 50 = ${round(bags, 0)} bags`,
      ],
      category: 'cement',
    },
    {
      item: 'Sand (from concrete)',
      quantity: round(m.sandVol, 2),
      unit: 'm3',
      formulaUsed: 'Sand = Dry Vol × (Sand Parts/Total Parts)',
      inputs: { dryVolume_m3: round(m.dryVolume, 2), sandParts: m.ratios.sand, totalParts: m.totalParts },
      steps: [
        `Sand vol = ${round(m.dryVolume, 2)} × (${m.ratios.sand}/${m.totalParts}) = ${round(m.sandVol, 2)} m3`,
      ],
      category: 'sand',
    },
    {
      item: 'Aggregate (from concrete)',
      quantity: round(m.aggVol, 2),
      unit: 'm3',
      formulaUsed: 'Aggregate = Dry Vol × (Aggregate Parts/Total Parts)',
      inputs: { dryVolume_m3: round(m.dryVolume, 2), aggParts: m.ratios.aggregate, totalParts: m.totalParts },
      steps: [
        `Aggregate vol = ${round(m.dryVolume, 2)} × (${m.ratios.aggregate}/${m.totalParts}) = ${round(m.aggVol, 2)} m3`,
      ],
      category: 'aggregate',
    },
  ];
  return results;
}
