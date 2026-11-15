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

export function calculateAggregate(ctx: StructuralContext): number {
  const { pccDryVolumeCFT, pccGrade, rccDryVolumeCFT, rccGrade } = ctx;

  // 1. PCC Aggregates
  const pccMix = MIX_PROPORTIONS.PCC[pccGrade] || MIX_PROPORTIONS.PCC['M7.5'];
  const pccAggregateVolume = (pccMix.aggregate / pccMix.total) * pccDryVolumeCFT;

  // 2. RCC Aggregates
  const rccMix = MIX_PROPORTIONS.RCC[rccGrade] || MIX_PROPORTIONS.RCC['M20'];
  const rccAggregateVolume = (rccMix.aggregate / rccMix.total) * rccDryVolumeCFT;

  // Total coarse aggregates in CFT
  return Math.round(pccAggregateVolume + rccAggregateVolume);
}
