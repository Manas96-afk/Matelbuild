export interface OpeningDetection {
  id: string;
  type: 'Door' | 'Window';
  width: number;  // in feet
  height: number; // in feet
  associatedWallId: string;
  floor: number;
  x: number;      // percentage coordinate along the wall / layout
  y: number;
  confidence: number;
}

export const DimensionExtractor = {
  detectOpenings(templateName: string = 'default'): OpeningDetection[] {
    if (templateName === '2bhk') {
      return [
        // Doors
        { id: 'op-door-1', type: 'Door', width: 3.28, height: 7.0, associatedWallId: 'wall-ext-4', floor: 1, x: 5, y: 70, confidence: 0.96 }, // Main entry
        { id: 'op-door-2', type: 'Door', width: 3.0, height: 7.0, associatedWallId: 'wall-int-1', floor: 1, x: 25, y: 40, confidence: 0.94 }, // Master bed entry
        { id: 'op-door-3', type: 'Door', width: 3.0, height: 7.0, associatedWallId: 'wall-int-2', floor: 1, x: 45, y: 15, confidence: 0.93 }, // Kids bed entry
        { id: 'op-door-4', type: 'Door', width: 2.5, height: 7.0, associatedWallId: 'wall-int-3', floor: 1, x: 50, y: 75, confidence: 0.91 }, // Bath 1 entry
        { id: 'op-door-5', type: 'Door', width: 2.5, height: 7.0, associatedWallId: 'wall-int-4', floor: 1, x: 70, y: 60, confidence: 0.92 }, // Bath 2 entry
        
        // Windows
        { id: 'op-win-1', type: 'Window', width: 4.0, height: 4.0, associatedWallId: 'wall-ext-1', floor: 1, x: 20, y: 5, confidence: 0.95 },
        { id: 'op-win-2', type: 'Window', width: 4.0, height: 4.0, associatedWallId: 'wall-ext-1', floor: 1, x: 75, y: 5, confidence: 0.94 },
        { id: 'op-win-3', type: 'Window', width: 5.0, height: 4.0, associatedWallId: 'wall-ext-3', floor: 1, x: 30, y: 95, confidence: 0.96 },
        { id: 'op-win-4', type: 'Window', width: 3.0, height: 3.0, associatedWallId: 'wall-ext-2', floor: 1, x: 95, y: 30, confidence: 0.91 }
      ];
    }

    // Default template: Standard 3BHK Villa
    return [
      // Doors
      { id: 'op-door-1', type: 'Door', width: 3.5, height: 7.5, associatedWallId: 'wall-ext-3', floor: 1, x: 70, y: 92, confidence: 0.97 }, // Main Entrance
      { id: 'op-door-2', type: 'Door', width: 3.0, height: 7.0, associatedWallId: 'wall-int-1', floor: 1, x: 20, y: 40, confidence: 0.95 }, // Master Bed
      { id: 'op-door-3', type: 'Door', width: 3.0, height: 7.0, associatedWallId: 'wall-int-2', floor: 1, x: 43, y: 20, confidence: 0.93 }, // Guest Bed
      { id: 'op-door-4', type: 'Door', width: 2.5, height: 7.0, associatedWallId: 'wall-int-3', floor: 1, x: 48, y: 50, confidence: 0.92 }, // Master Bath
      { id: 'op-door-5', type: 'Door', width: 2.5, height: 7.0, associatedWallId: 'wall-int-4', floor: 1, x: 72, y: 55, confidence: 0.90 }, // Powder Bath
      { id: 'op-door-6', type: 'Door', width: 3.0, height: 7.0, associatedWallId: 'wall-ext-2', floor: 1, x: 92, y: 60, confidence: 0.94 }, // Back Kitchen door

      // Windows
      { id: 'op-win-1', type: 'Window', width: 5.0, height: 4.5, associatedWallId: 'wall-ext-1', floor: 1, x: 20, y: 8, confidence: 0.96 },
      { id: 'op-win-2', type: 'Window', width: 5.0, height: 4.5, associatedWallId: 'wall-ext-1', floor: 1, x: 65, y: 8, confidence: 0.95 },
      { id: 'op-win-3', type: 'Window', width: 4.0, height: 4.0, associatedWallId: 'wall-ext-4', floor: 1, x: 8, y: 30, confidence: 0.93 },
      { id: 'op-win-4', type: 'Window', width: 4.0, height: 4.0, associatedWallId: 'wall-ext-4', floor: 1, x: 8, y: 60, confidence: 0.92 },
      { id: 'op-win-5', type: 'Window', width: 3.0, height: 3.0, associatedWallId: 'wall-ext-2', floor: 1, x: 92, y: 25, confidence: 0.94 }
    ];
  }
};
