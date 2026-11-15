import type { CalculationResult, RoomDetail, WallMaterial } from '@/src/types/shared';
import { round } from './utils';

export interface FinishesInput {
  rooms: RoomDetail[];
  floors: number;
  floorHeight: number;
  wallMaterial: WallMaterial;
  roofType: string;
  totalBuiltUpArea: number;
}

function wallSurfaceArea(rooms: RoomDetail[], floors: number, floorHeight: number): number {
  const perim = rooms.reduce((a, r) => a + 2 * (r.length + r.breadth), 0);
  return perim * floorHeight * floors;
}

export function calcPlaster(input: FinishesInput): CalculationResult {
  const area = wallSurfaceArea(input.rooms, input.floors, input.floorHeight);
  return {
    item: 'Plaster Area',
    quantity: round(area, 2),
    unit: 'm2',
    formulaUsed: 'Plaster Area = Σ Room Perimeter × Floor Height × Floors',
    inputs: { floors: input.floors, floorHeight_m: input.floorHeight },
    steps: [`Plaster area = perimeter × ${input.floorHeight} × ${input.floors} = ${round(area, 2)} m2`],
    category: 'finishes',
  };
}

export function calcPaint(input: FinishesInput): CalculationResult {
  const area = wallSurfaceArea(input.rooms, input.floors, input.floorHeight);
  return {
    item: 'Paint Area',
    quantity: round(area, 2),
    unit: 'm2',
    formulaUsed: 'Paint Area = Plaster Area (2 coats assumed)',
    inputs: { plasterArea_m2: round(area, 2) },
    steps: [`Paint area = ${round(area, 2)} m2`],
    category: 'finishes',
  };
}

export function calcFlooring(input: FinishesInput): CalculationResult {
  const floorArea = input.totalBuiltUpArea;
  return {
    item: 'Flooring Area',
    quantity: round(floorArea, 2),
    unit: 'm2',
    formulaUsed: 'Flooring Area = Total Built-up Area',
    inputs: { totalBuiltUpArea_m2: input.totalBuiltUpArea },
    steps: [`Flooring = ${round(floorArea, 2)} m2`],
    category: 'finishes',
  };
}

export function calcWaterproofing(input: FinishesInput): CalculationResult {
  const terraceArea = input.totalBuiltUpArea / input.floors;
  return {
    item: 'Waterproofing Area',
    quantity: round(terraceArea, 2),
    unit: 'm2',
    formulaUsed: 'Waterproofing = Slab Area of Top Floor',
    inputs: { topFloorArea_m2: round(terraceArea, 2) },
    steps: [`Waterproofing = ${round(terraceArea, 2)} m2`],
    category: 'waterproofing',
  };
}

export function calcDoorsWindows(rooms: RoomDetail[]): CalculationResult[] {
  const doors = rooms.length * 1;
  const windows = rooms.length;
  return [
    {
      item: 'Doors',
      quantity: doors,
      unit: 'nos',
      formulaUsed: 'Doors = Number of Rooms (1 per room)',
      inputs: { rooms: rooms.length },
      steps: [`Doors = ${rooms.length} nos`],
      category: 'doors_windows',
    },
    {
      item: 'Windows',
      quantity: windows,
      unit: 'nos',
      formulaUsed: 'Windows = Number of Rooms (1 per room)',
      inputs: { rooms: rooms.length },
      steps: [`Windows = ${rooms.length} nos`],
      category: 'doors_windows',
    },
  ];
}
