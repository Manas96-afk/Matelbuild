export interface ColumnDetection {
  id: string;
  width: number;         // in feet (e.g. 0.75 for 9")
  depth: number;         // in feet (e.g. 1.0 for 12")
  height: number;        // in feet (e.g. 10.0)
  concreteGrade: 'M20' | 'M25' | 'M30';
  floor: number;
  x: number;             // percentage coordinate from left
  y: number;             // percentage coordinate from top
  confidence: number;
}

export const ColumnDetector = {
  detectColumns(templateName: string = 'default', concreteGrade: 'M20' | 'M25' | 'M30' = 'M20'): ColumnDetection[] {
    const defaultCols: Omit<ColumnDetection, 'concreteGrade'>[] = [];
    
    if (templateName === '2bhk') {
      // 12 columns for a 2BHK layout
      const grid = [
        { id: 'col-1', x: 5, y: 5 }, { id: 'col-2', x: 50, y: 5 }, { id: 'col-3', x: 95, y: 5 },
        { id: 'col-4', x: 5, y: 40 }, { id: 'col-5', x: 45, y: 40 }, { id: 'col-6', x: 95, y: 40 },
        { id: 'col-7', x: 5, y: 75 }, { id: 'col-8', x: 45, y: 75 }, { id: 'col-9', x: 95, y: 75 },
        { id: 'col-10', x: 5, y: 95 }, { id: 'col-11', x: 45, y: 95 }, { id: 'col-12', x: 95, y: 95 }
      ];

      return grid.map(cell => ({
        ...cell,
        width: 0.75, // 9 inches
        depth: 1.0,  // 12 inches
        height: 10,
        concreteGrade,
        floor: 1,
        confidence: 0.90 + Math.random() * 0.08
      }));
    }

    // Default template: Standard 3BHK Villa (16 columns)
    const grid = [
      { id: 'col-1', x: 8, y: 8 }, { id: 'col-2', x: 38, y: 8 }, { id: 'col-3', x: 68, y: 8 }, { id: 'col-4', x: 92, y: 8 },
      { id: 'col-5', x: 8, y: 40 }, { id: 'col-6', x: 38, y: 40 }, { id: 'col-7', x: 68, y: 40 }, { id: 'col-8', x: 92, y: 40 },
      { id: 'col-9', x: 8, y: 68 }, { id: 'col-10', x: 38, y: 68 }, { id: 'col-11', x: 68, y: 68 }, { id: 'col-12', x: 92, y: 68 },
      { id: 'col-13', x: 8, y: 92 }, { id: 'col-14', x: 38, y: 92 }, { id: 'col-15', x: 68, y: 92 }, { id: 'col-16', x: 92, y: 92 }
    ];

    return grid.map(cell => ({
      ...cell,
      width: 0.75, // 9 inches
      depth: 1.25, // 15 inches
      height: 10,
      concreteGrade,
      floor: 1,
      confidence: 0.91 + Math.random() * 0.07
    }));
  }
};
