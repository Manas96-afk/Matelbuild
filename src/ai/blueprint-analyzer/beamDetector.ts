export interface BeamDetection {
  id: string;
  length: number; // in feet
  width: number;  // in feet (e.g. 0.75 for 9")
  depth: number;  // in feet (e.g. 1.0 for 12")
  concreteGrade: 'M20' | 'M25' | 'M30';
  floor: number;
  coordinates: {
    x1: number; // percentage from left
    y1: number; // percentage from top
    x2: number;
    y2: number;
  };
  confidence: number;
}

export const BeamDetector = {
  detectBeams(templateName: string = 'default', concreteGrade: 'M20' | 'M25' | 'M30' = 'M20'): BeamDetection[] {
    const beamWidth = 0.75;
    const beamDepth = 1.0;

    if (templateName === '2bhk') {
      return [
        { id: 'beam-1', length: 50, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 5, y1: 5, x2: 95, y2: 5 }, confidence: 0.94 },
        { id: 'beam-2', length: 50, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 5, y1: 40, x2: 95, y2: 40 }, confidence: 0.93 },
        { id: 'beam-3', length: 50, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 5, y1: 75, x2: 95, y2: 75 }, confidence: 0.95 },
        { id: 'beam-4', length: 50, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 5, y1: 95, x2: 95, y2: 95 }, confidence: 0.94 },
        { id: 'beam-5', length: 30, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 5, y1: 5, x2: 5, y2: 95 }, confidence: 0.95 },
        { id: 'beam-6', length: 30, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 45, y1: 5, x2: 45, y2: 95 }, confidence: 0.92 },
        { id: 'beam-7', length: 30, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 95, y1: 5, x2: 95, y2: 95 }, confidence: 0.94 }
      ];
    }

    // Default template: Standard 3BHK Villa
    return [
      { id: 'beam-1', length: 60, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 8, y1: 8, x2: 92, y2: 8 }, confidence: 0.94 },
      { id: 'beam-2', length: 60, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 8, y1: 40, x2: 92, y2: 40 }, confidence: 0.93 },
      { id: 'beam-3', length: 60, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 8, y1: 68, x2: 92, y2: 68 }, confidence: 0.95 },
      { id: 'beam-4', length: 60, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 8, y1: 92, x2: 92, y2: 92 }, confidence: 0.94 },
      { id: 'beam-5', length: 40, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 8, y1: 8, x2: 8, y2: 92 }, confidence: 0.96 },
      { id: 'beam-6', length: 40, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 38, y1: 8, x2: 38, y2: 92 }, confidence: 0.92 },
      { id: 'beam-7', length: 40, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 68, y1: 8, x2: 68, y2: 92 }, confidence: 0.93 },
      { id: 'beam-8', length: 40, width: beamWidth, depth: beamDepth, concreteGrade, floor: 1, coordinates: { x1: 92, y1: 8, x2: 92, y2: 92 }, confidence: 0.94 }
    ];
  }
};
