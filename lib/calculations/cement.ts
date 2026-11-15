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

export function calculateCement(ctx: StructuralContext): number {
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

  // 1. PCC Cement
  const pccMix = MIX_PROPORTIONS.PCC[pccGrade] || MIX_PROPORTIONS.PCC['M7.5'];
  const pccCementVolume = (pccMix.cement / pccMix.total) * pccDryVolumeCFT;
  const pccCementBags = pccCementVolume / 1.226;

  // 2. RCC Cement
  const rccMix = MIX_PROPORTIONS.RCC[rccGrade] || MIX_PROPORTIONS.RCC['M20'];
  const rccCementVolume = (rccMix.cement / rccMix.total) * rccDryVolumeCFT;
  const rccCementBags = rccCementVolume / 1.226;

  // 3. Masonry Mortar / Adhesive
  let masonryCementBags = 0;
  let masonryAdhesiveBags = 0;

  if (wallType === 'Brick Masonry') {
    const wetMortarVolume = netWallVolCFT * 0.30;
    const masonryMortarDryCFT = wetMortarVolume * 1.33;
    masonryCementBags = ((1 / 7) * masonryMortarDryCFT) / 1.226;
  } else if (wallType === 'Hollow Blocks') {
    const wetMortarVolume = netWallVolCFT * 0.12;
    const masonryMortarDryCFT = wetMortarVolume * 1.33;
    masonryCementBags = ((1 / 7) * masonryMortarDryCFT) / 1.226;
  } else if (wallType === 'AAC Blocks') {
    const netWallVolM3 = netWallVolCFT / 35.3147;
    masonryAdhesiveBags = netWallVolM3 * 1.2;
  }

  // 4. Plaster Cement
  const ceilingDryMortar = ceilingPlasterVolCFT * 1.33;
  const ceilingCementBags = ((1 / 5) * ceilingDryMortar) / 1.226;

  const internalDryMortar = internalPlasterVolCFT * 1.33;
  const internalCementBags = ((1 / 7) * internalDryMortar) / 1.226;

  const externalDryMortar = externalPlasterVolCFT * 1.33;
  const externalCementBags = ((1 / 5) * externalDryMortar) / 1.226;

  const totalPlasterCementBags = ceilingCementBags + internalCementBags + externalCementBags;

  // Total
  const totalBags = pccCementBags + rccCementBags + masonryCementBags + masonryAdhesiveBags + totalPlasterCementBags;
  return Math.round(totalBags);
}
