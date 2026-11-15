import { StructuralContext } from './shared';

const MIX_PROPORTIONS = {
  PCC: {
    M5: { cement: 1, sand: 5, aggregate: 10, total: 16 },
    'M7.5': { cement: 1, sand: 4, aggregate: 8, total: 13 },
    M10: { cement: 1, sand: 3, aggregate: 6, total: 10 },
  },
  RCC: {
    M20: { cement: 1, sand: 1.5, aggregate: 3, total: 5.5 },
    M25: { cement: 1, sand: 1, aggregate: 2, total: 4 },
    M30: { cement: 1, sand: 0.75, aggregate: 1.5, total: 3.25 },
  }
};

export function calculateSand(ctx: StructuralContext): number {
  const {
    pccDryVolumeCFT,
    pccGrade,
    rccDryVolumeCFT,
    rccGrade,
    wallType,
    netWallVolCFT,
    ceilingPlasterVolCFT,
    internalPlasterVolCFT,
    externalPlasterVolCFT
  } = ctx;

  // 1. PCC Sand
  const pccMix = MIX_PROPORTIONS.PCC[pccGrade] || MIX_PROPORTIONS.PCC['M7.5'];
  const pccSandVolume = (pccMix.sand / pccMix.total) * pccDryVolumeCFT;

  // 2. RCC Sand
  const rccMix = MIX_PROPORTIONS.RCC[rccGrade] || MIX_PROPORTIONS.RCC['M20'];
  const rccSandVolume = (rccMix.sand / rccMix.total) * rccDryVolumeCFT;

  // 3. Masonry Sand
  let masonrySandVolume = 0;
  if (wallType === 'Brick Masonry') {
    const wetMortarVolume = netWallVolCFT * 0.30;
    const masonryMortarDryCFT = wetMortarVolume * 1.33;
    masonrySandVolume = (6 / 7) * masonryMortarDryCFT;
  } else if (wallType === 'Hollow Blocks') {
    const wetMortarVolume = netWallVolCFT * 0.12;
    const masonryMortarDryCFT = wetMortarVolume * 1.33;
    masonrySandVolume = (6 / 7) * masonryMortarDryCFT;
  }

  // 4. Plaster Sand
  const ceilingDryMortar = ceilingPlasterVolCFT * 1.33;
  const ceilingSandVolume = (4 / 5) * ceilingDryMortar;

  const internalDryMortar = internalPlasterVolCFT * 1.33;
  const internalSandVolume = (6 / 7) * internalDryMortar;

  const externalDryMortar = externalPlasterVolCFT * 1.33;
  const externalSandVolume = (4 / 5) * externalDryMortar;

  const totalPlasterSandVolume = ceilingSandVolume + internalSandVolume + externalSandVolume;

  // Total sand volume in CFT
  return Math.round(pccSandVolume + rccSandVolume + masonrySandVolume + totalPlasterSandVolume);
}
