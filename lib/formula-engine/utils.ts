// Pure math + rounding helpers. No AI, no side effects.

export function round(value: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}

export function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

const CONCRETE_MIX_REF: Record<string, { cement: number; sand: number; aggregate: number }> = {
  M15: { cement: 1, sand: 2, aggregate: 4 },
  M20: { cement: 1, sand: 1.5, aggregate: 3 },
  M25: { cement: 1, sand: 1, aggregate: 2 },
  M30: { cement: 1, sand: 0.75, aggregate: 1.5 },
};

export function concreteVolToMaterials(
  wetVolumeM3: number,
  grade: string
) {
  const DRY_FACTOR = 1.54;
  const dryVolume = wetVolumeM3 * DRY_FACTOR;
  const key = grade.toUpperCase().replace(/^M-?/, 'M');
  const ratios = CONCRETE_MIX_REF[key] || CONCRETE_MIX_REF.M20;
  const totalParts = ratios.cement + ratios.sand + ratios.aggregate;
  const cementVol = (dryVolume * ratios.cement) / totalParts;
  const sandVol = (dryVolume * ratios.sand) / totalParts;
  const aggVol = (dryVolume * ratios.aggregate) / totalParts;
  return { dryVolume, cementVol, sandVol, aggVol, ratios, totalParts };
}

export function cementVolToBags(cementVolM3: number): number {
  const kg = cementVolM3 * 1440;
  return kg / 50;
}
