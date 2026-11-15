import type { CalculationResult, RoomDetail, WallMaterial } from '@/src/types/shared';
import { round } from './utils';

export interface MasonryInput {
  rooms: RoomDetail[];
  wallThickness: number; // m
  wallMaterial: WallMaterial;
  floors: number;
  floorHeight: number;
}

const MASONRY_UNITS = {
  brick: { length: 0.19, height: 0.09, thickness: 0.09 },
  aacBlock: { length: 0.6, height: 0.2, thickness: 0.2 },
};

const WASTAGE_PERCENT = {
  brick: 0.05,
  aacBlock: 0.03,
};

function totalWallLength(rooms: RoomDetail[], totalFloorArea: number): number {
  const internal = rooms.reduce(
    (acc, r) => acc + 2 * (r.length + r.breadth),
    0
  );
  const external = 4 * Math.sqrt(totalFloorArea);
  return internal + external;
}

export function calcMasonry(input: MasonryInput): CalculationResult[] {
  const totalFloorArea = input.rooms.reduce(
    (a, r) => a + r.length * r.breadth,
    0
  );
  const wallLen = totalWallLength(input.rooms, totalFloorArea);
  const results: CalculationResult[] = [];

  if (input.wallMaterial === 'concrete') {
    results.push({
      item: 'Masonry (concrete wall)',
      quantity: 0,
      unit: 'nos',
      formulaUsed: 'Concrete walls are included in structural concrete volume.',
      inputs: { wallMaterial: input.wallMaterial },
      steps: ['Concrete wall selected — no brick/block quantity computed.'],
      category: 'masonry',
    });
    return results;
  }

  if (input.wallMaterial === 'brick') {
    const unit = MASONRY_UNITS.brick;
    const effThickness = input.wallThickness;
    const wallVol = wallLen * input.floorHeight * effThickness * input.floors;
    const brickVol = unit.length * unit.height * unit.thickness;
    const bricksGross = wallVol / brickVol;
    const bricksNet = bricksGross * (1 - WASTAGE_PERCENT.brick);
    results.push({
      item: 'Brick Quantity (gross)',
      quantity: round(bricksGross, 0),
      unit: 'nos',
      formulaUsed: 'Bricks = Wall Volume / Single Brick Volume',
      inputs: {
        wallLength_m: round(wallLen, 2),
        floorHeight_m: input.floorHeight,
        wallThickness_m: effThickness,
        floors: input.floors,
        brickSize_m: `${unit.length}×${unit.height}×${unit.thickness}`,
      },
      steps: [
        `Wall volume = ${round(wallLen, 2)} × ${input.floorHeight} × ${effThickness} × ${input.floors} = ${round(wallVol, 2)} m3`,
        `Single brick vol = ${unit.length}×${unit.height}×${unit.thickness} = ${round(brickVol, 5)} m3`,
        `Bricks (gross) = ${round(wallVol, 2)} / ${round(brickVol, 5)} = ${round(bricksGross, 0)} nos`,
      ],
      category: 'masonry',
    });
    results.push({
      item: 'Brick Quantity (net + wastage)',
      quantity: round(bricksNet, 0),
      unit: 'nos',
      formulaUsed: 'Net = Gross × (1 + Wastage%)',
      inputs: { gross: round(bricksGross, 0), wastage: WASTAGE_PERCENT.brick },
      steps: [
        `Net = ${round(bricksGross, 0)} × (1 + ${WASTAGE_PERCENT.brick}) = ${round(bricksNet, 0)} nos`,
      ],
      category: 'masonry',
    });
  } else {
    const unit = MASONRY_UNITS.aacBlock;
    const effThickness = input.wallThickness;
    const wallVol = wallLen * input.floorHeight * effThickness * input.floors;
    const blockVol = unit.length * unit.height * unit.thickness;
    const blocksGross = wallVol / blockVol;
    const blocksNet = blocksGross * (1 + WASTAGE_PERCENT.aacBlock);
    results.push({
      item: 'AAC Block Quantity (gross)',
      quantity: round(blocksGross, 0),
      unit: 'nos',
      formulaUsed: 'Blocks = Wall Volume / Single Block Volume',
      inputs: {
        wallLength_m: round(wallLen, 2),
        floorHeight_m: input.floorHeight,
        wallThickness_m: effThickness,
        floors: input.floors,
        blockSize_m: `${unit.length}×${unit.height}×${unit.thickness}`,
      },
      steps: [
        `Wall volume = ${round(wallLen, 2)} × ${input.floorHeight} × ${effThickness} × ${input.floors} = ${round(wallVol, 2)} m3`,
        `Single block vol = ${unit.length}×${unit.height}×${unit.thickness} = ${round(blockVol, 5)} m3`,
        `Blocks (gross) = ${round(wallVol, 2)} / ${round(blockVol, 5)} = ${round(blocksGross, 0)} nos`,
      ],
      category: 'masonry',
    });
    results.push({
      item: 'AAC Block Quantity (net + wastage)',
      quantity: round(blocksNet, 0),
      unit: 'nos',
      formulaUsed: 'Net = Gross × (1 + Wastage%)',
      inputs: { gross: round(blocksGross, 0), wastage: WASTAGE_PERCENT.aacBlock },
      steps: [
        `Net = ${round(blocksGross, 0)} × (1 + ${WASTAGE_PERCENT.aacBlock}) = ${round(blocksNet, 0)} nos`,
      ],
      category: 'masonry',
    });
  }
  return results;
}

export function calcMasonryMortar(input: MasonryInput): CalculationResult {
  const totalFloorArea = input.rooms.reduce((a, r) => a + r.length * r.breadth, 0);
  const wallLen = totalWallLength(input.rooms, totalFloorArea);
  const wallVol = wallLen * input.floorHeight * input.wallThickness * input.floors;
  const mortarVol = wallVol * 0.3;
  return {
    item: 'Masonry Mortar',
    quantity: round(mortarVol, 2),
    unit: 'm3',
    formulaUsed: 'Mortar = Wall Volume × 0.30 (empirical)',
    inputs: { wallVolume_m3: round(wallVol, 2) },
    steps: [`Mortar = ${round(wallVol, 2)} × 0.30 = ${round(mortarVol, 2)} m3`],
    category: 'cement',
  };
}
