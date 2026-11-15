export interface WallDetection {
  id: string;
  length: number;    // in feet
  height: number;    // in feet
  thickness: number; // in feet (e.g. 0.75 for 9", 0.375 for 4.5")
  material: 'Brick Wall' | 'AAC Block Wall';
  floor: number;
  coordinates: {
    x1: number; // percentage from left
    y1: number; // percentage from top
    x2: number;
    y2: number;
  };
  isExternal: boolean;
  confidence: number;
}

export const WallDetector = {
  detectWalls(templateName: string = 'default', wallType: 'Brick Wall' | 'AAC Block Wall' = 'Brick Wall'): WallDetection[] {
    const extThickness = 0.75; // 9 inch
    const intThickness = 0.375; // 4.5 inch

    if (templateName === '2bhk') {
      return [
        // External Boundaries
        { id: 'wall-ext-1', length: 50, height: 10, thickness: extThickness, material: wallType, floor: 1, coordinates: { x1: 5, y1: 5, x2: 95, y2: 5 }, isExternal: true, confidence: 0.98 },
        { id: 'wall-ext-2', length: 30, height: 10, thickness: extThickness, material: wallType, floor: 1, coordinates: { x1: 95, y1: 5, x2: 95, y2: 95 }, isExternal: true, confidence: 0.97 },
        { id: 'wall-ext-3', length: 50, height: 10, thickness: extThickness, material: wallType, floor: 1, coordinates: { x1: 95, y1: 95, x2: 5, y2: 95 }, isExternal: true, confidence: 0.98 },
        { id: 'wall-ext-4', length: 30, height: 10, thickness: extThickness, material: wallType, floor: 1, coordinates: { x1: 5, y1: 95, x2: 5, y2: 5 }, isExternal: true, confidence: 0.98 },
        
        // Internal Partitions
        { id: 'wall-int-1', length: 20, height: 10, thickness: intThickness, material: wallType, floor: 1, coordinates: { x1: 5, y1: 40, x2: 45, y2: 40 }, isExternal: false, confidence: 0.94 },
        { id: 'wall-int-2', length: 15, height: 10, thickness: intThickness, material: wallType, floor: 1, coordinates: { x1: 45, y1: 5, x2: 45, y2: 50 }, isExternal: false, confidence: 0.95 },
        { id: 'wall-int-3', length: 25, height: 10, thickness: intThickness, material: wallType, floor: 1, coordinates: { x1: 45, y1: 75, x2: 70, y2: 75 }, isExternal: false, confidence: 0.93 },
        { id: 'wall-int-4', length: 15, height: 10, thickness: intThickness, material: wallType, floor: 1, coordinates: { x1: 70, y1: 50, x2: 70, y2: 95 }, isExternal: false, confidence: 0.92 }
      ];
    }

    // Default template (Standard 3BHK Villa)
    return [
      // External walls (G+0)
      { id: 'wall-ext-1', length: 60, height: 10, thickness: extThickness, material: wallType, floor: 1, coordinates: { x1: 8, y1: 8, x2: 92, y2: 8 }, isExternal: true, confidence: 0.98 },
      { id: 'wall-ext-2', length: 40, height: 10, thickness: extThickness, material: wallType, floor: 1, coordinates: { x1: 92, y1: 8, x2: 92, y2: 92 }, isExternal: true, confidence: 0.97 },
      { id: 'wall-ext-3', length: 60, height: 10, thickness: extThickness, material: wallType, floor: 1, coordinates: { x1: 92, y1: 92, x2: 8, y2: 92 }, isExternal: true, confidence: 0.99 },
      { id: 'wall-ext-4', length: 40, height: 10, thickness: extThickness, material: wallType, floor: 1, coordinates: { x1: 8, y1: 92, x2: 8, y2: 8 }, isExternal: true, confidence: 0.97 },
      
      // Internal partition walls
      { id: 'wall-int-1', length: 22, height: 10, thickness: intThickness, material: wallType, floor: 1, coordinates: { x1: 8, y1: 40, x2: 43, y2: 40 }, isExternal: false, confidence: 0.95 },
      { id: 'wall-int-2', length: 18, height: 10, thickness: intThickness, material: wallType, floor: 1, coordinates: { x1: 43, y1: 8, x2: 43, y2: 48 }, isExternal: false, confidence: 0.94 },
      { id: 'wall-int-3', length: 14, height: 10, thickness: intThickness, material: wallType, floor: 1, coordinates: { x1: 48, y1: 44, x2: 48, y2: 76 }, isExternal: false, confidence: 0.93 },
      { id: 'wall-int-4', length: 16, height: 10, thickness: intThickness, material: wallType, floor: 1, coordinates: { x1: 72, y1: 48, x2: 72, y2: 76 }, isExternal: false, confidence: 0.92 }
    ];
  }
};
