export interface RoomDetection {
  id: string;
  name: string;
  type: 'Bedroom' | 'Living Room' | 'Kitchen' | 'Bathroom' | 'Dining Room' | 'Office Room' | 'Store Room' | 'Parking' | 'Balcony' | 'Terrace';
  length: number; // in feet
  width: number;  // in feet
  area: number;   // in sqft
  floor: number;
  bounds: {
    x: number;   // percentage offset from left
    y: number;   // percentage offset from top
    w: number;   // percentage width
    h: number;   // percentage height
  };
  confidence: number; // 0 to 1
}

export const RoomDetector = {
  detectRooms(templateName: string = 'default'): RoomDetection[] {
    if (templateName === '2bhk') {
      return [
        {
          id: 'room-1',
          name: 'Master Bedroom',
          type: 'Bedroom',
          length: 14,
          width: 12,
          area: 168,
          floor: 1,
          bounds: { x: 5, y: 5, w: 40, h: 35 },
          confidence: 0.96
        },
        {
          id: 'room-2',
          name: 'Kids Bedroom',
          type: 'Bedroom',
          length: 12,
          width: 11,
          area: 132,
          floor: 1,
          bounds: { x: 5, y: 45, w: 35, h: 30 },
          confidence: 0.94
        },
        {
          id: 'room-3',
          name: 'Living Room',
          type: 'Living Room',
          length: 22,
          width: 14,
          area: 308,
          floor: 1,
          bounds: { x: 50, y: 5, w: 45, h: 40 },
          confidence: 0.97
        },
        {
          id: 'room-4',
          name: 'Kitchen',
          type: 'Kitchen',
          length: 10,
          width: 9,
          area: 90,
          floor: 1,
          bounds: { x: 45, y: 50, w: 25, h: 25 },
          confidence: 0.95
        },
        {
          id: 'room-5',
          name: 'Master Bath',
          type: 'Bathroom',
          length: 8,
          width: 6,
          area: 48,
          floor: 1,
          bounds: { x: 5, y: 80, w: 15, h: 15 },
          confidence: 0.92
        },
        {
          id: 'room-6',
          name: 'Common Bath',
          type: 'Bathroom',
          length: 7,
          width: 5,
          area: 35,
          floor: 1,
          bounds: { x: 25, y: 80, w: 15, h: 15 },
          confidence: 0.91
        },
        {
          id: 'room-7',
          name: 'Balcony',
          type: 'Balcony',
          length: 12,
          width: 4,
          area: 48,
          floor: 1,
          bounds: { x: 75, y: 50, w: 20, h: 10 },
          confidence: 0.89
        },
        {
          id: 'room-8',
          name: 'Car Port',
          type: 'Parking',
          length: 16,
          width: 10,
          area: 160,
          floor: 1,
          bounds: { x: 50, y: 80, w: 45, h: 15 },
          confidence: 0.93
        }
      ];
    }

    // Default template (Standard 3BHK Villa)
    return [
      {
        id: 'room-1',
        name: 'Master Bedroom',
        type: 'Bedroom',
        length: 16,
        width: 14,
        area: 224,
        floor: 1,
        bounds: { x: 8, y: 8, w: 35, h: 32 },
        confidence: 0.97
      },
      {
        id: 'room-2',
        name: 'Guest Bedroom',
        type: 'Bedroom',
        length: 12,
        width: 12,
        area: 144,
        floor: 1,
        bounds: { x: 8, y: 44, w: 30, h: 28 },
        confidence: 0.94
      },
      {
        id: 'room-3',
        name: 'Living Room',
        type: 'Living Room',
        length: 24,
        width: 16,
        area: 384,
        floor: 1,
        bounds: { x: 48, y: 8, w: 44, h: 36 },
        confidence: 0.98
      },
      {
        id: 'room-4',
        name: 'Kitchen',
        type: 'Kitchen',
        length: 12,
        width: 10,
        area: 120,
        floor: 1,
        bounds: { x: 48, y: 48, w: 24, h: 24 },
        confidence: 0.95
      },
      {
        id: 'room-5',
        name: 'Dining Room',
        type: 'Dining Room',
        length: 12,
        width: 10,
        area: 120,
        floor: 1,
        bounds: { x: 74, y: 48, w: 18, h: 24 },
        confidence: 0.93
      },
      {
        id: 'room-6',
        name: 'Master Bath',
        type: 'Bathroom',
        length: 8,
        width: 6,
        area: 48,
        floor: 1,
        bounds: { x: 8, y: 76, w: 18, h: 16 },
        confidence: 0.91
      },
      {
        id: 'room-7',
        name: 'Powder Room',
        type: 'Bathroom',
        length: 6,
        width: 5,
        area: 30,
        floor: 1,
        bounds: { x: 30, y: 76, w: 12, h: 16 },
        confidence: 0.88
      },
      {
        id: 'room-8',
        name: 'Verandah',
        type: 'Balcony',
        length: 14,
        width: 6,
        area: 84,
        floor: 1,
        bounds: { x: 48, y: 76, w: 44, h: 16 },
        confidence: 0.92
      }
    ];
  }
};
