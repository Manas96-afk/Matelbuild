import { RoomDetector, RoomDetection } from './roomDetector';
import { WallDetector, WallDetection } from './wallDetector';
import { ColumnDetector, ColumnDetection } from './columnDetector';
import { BeamDetector, BeamDetection } from './beamDetector';
import { DimensionExtractor, OpeningDetection } from './dimensionExtractor';

export interface BIMLiteBuildingModel {
  projectId: string;
  templateName: string;
  rooms: RoomDetection[];
  walls: WallDetection[];
  columns: ColumnDetection[];
  beams: BeamDetection[];
  openings: OpeningDetection[];
  slabs: Array<{
    id: string;
    length: number;    // in feet
    width: number;     // in feet
    thickness: number; // in feet (e.g. 0.416 for 5 inches)
    concreteGrade: 'M20' | 'M25' | 'M30';
    floor: number;
    bounds: { x: number; y: number; w: number; h: number };
    confidence: number;
  }>;
  stairs: Array<{
    id: string;
    volume: number;     // in cubic feet
    concreteGrade: 'M20' | 'M25' | 'M30';
    floor: number;
    bounds: { x: number; y: number; w: number; h: number };
    confidence: number;
  }>;
}

export const BuildingModelGenerator = {
  generateModel(
    projectId: string,
    templateName: string = 'default',
    projectParams: {
      wallType?: 'Brick Wall' | 'AAC Block Wall';
      concreteGrade?: 'M20' | 'M25' | 'M30';
    } = {}
  ): BIMLiteBuildingModel {
    const wallType = projectParams.wallType || 'Brick Wall';
    const concreteGrade = projectParams.concreteGrade || 'M20';

    const rooms = RoomDetector.detectRooms(templateName);
    const walls = WallDetector.detectWalls(templateName, wallType);
    const columns = ColumnDetector.detectColumns(templateName, concreteGrade);
    const beams = BeamDetector.detectBeams(templateName, concreteGrade);
    const openings = DimensionExtractor.detectOpenings(templateName);

    // Generate Slab(s) based on total drawing boundaries
    // G+0 Slab covers the builtup envelope
    const layoutWidth = templateName === '2bhk' ? 50 : 60;
    const layoutLength = templateName === '2bhk' ? 30 : 40;
    
    const slabs = [
      {
        id: 'slab-1',
        length: layoutWidth,
        width: layoutLength,
        thickness: 0.416, // 5 inches slab thickness
        concreteGrade: concreteGrade,
        floor: 1,
        bounds: templateName === '2bhk' ? { x: 5, y: 5, w: 90, h: 90 } : { x: 8, y: 8, w: 84, h: 84 },
        confidence: 0.98
      }
    ];

    // Generate staircase
    const stairs = [
      {
        id: 'staircase-1',
        volume: 40.0, // Standard dry concrete volume context
        concreteGrade: concreteGrade,
        floor: 1,
        bounds: templateName === '2bhk' ? { x: 45, y: 40, w: 10, h: 15 } : { x: 38, y: 40, w: 10, h: 16 },
        confidence: 0.94
      }
    ];

    return {
      projectId,
      templateName,
      rooms,
      walls,
      columns,
      beams,
      openings,
      slabs,
      stairs
    };
  }
};
