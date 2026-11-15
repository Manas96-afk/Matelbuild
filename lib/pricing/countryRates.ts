import { MaterialRateRow } from '../../types';

export const DEFAULT_COUNTRY_RATES: Record<string, MaterialRateRow[]> = {
  India: [
    { materialId: 'cement', materialName: 'Cement', unit: '50kg Bag', economyRate: 350, standardRate: 400, premiumRate: 500, luxuryRate: 650, updatedAt: new Date().toISOString() },
    { materialId: 'sand', materialName: 'Sand', unit: 'CFT', economyRate: 50, standardRate: 60, premiumRate: 75, luxuryRate: 95, updatedAt: new Date().toISOString() },
    { materialId: 'aggregate', materialName: 'Aggregate', unit: 'CFT', economyRate: 55, standardRate: 65, premiumRate: 75, luxuryRate: 90, updatedAt: new Date().toISOString() },
    { materialId: 'steel', materialName: 'Steel', unit: 'MT', economyRate: 55000, standardRate: 65000, premiumRate: 75000, luxuryRate: 90000, updatedAt: new Date().toISOString() },
    { materialId: 'bricks', materialName: 'Red Bricks', unit: 'Nos', economyRate: 7, standardRate: 8, premiumRate: 9, luxuryRate: 12, updatedAt: new Date().toISOString() },
    { materialId: 'aacBlocks', materialName: 'AAC Blocks', unit: 'Nos', economyRate: 50, standardRate: 60, premiumRate: 70, luxuryRate: 85, updatedAt: new Date().toISOString() },
    { materialId: 'paint', materialName: 'Paint', unit: 'Liters', economyRate: 250, standardRate: 300, premiumRate: 400, luxuryRate: 600, updatedAt: new Date().toISOString() },
    { materialId: 'tiles', materialName: 'Tiles', unit: 'Sq.Ft', economyRate: 70, standardRate: 85, premiumRate: 105, luxuryRate: 150, updatedAt: new Date().toISOString() },
    { materialId: 'plaster', materialName: 'Plaster', unit: 'Sq.Ft', economyRate: 20, standardRate: 25, premiumRate: 30, luxuryRate: 45, updatedAt: new Date().toISOString() },
    { materialId: 'labour', materialName: 'Labour Cost', unit: 'Sq.Ft BUA', economyRate: 300, standardRate: 400, premiumRate: 500, luxuryRate: 700, updatedAt: new Date().toISOString() }
  ],
  USA: [
    { materialId: 'cement', materialName: 'Cement', unit: '50kg Bag', economyRate: 12, standardRate: 15, premiumRate: 20, luxuryRate: 28, updatedAt: new Date().toISOString() },
    { materialId: 'sand', materialName: 'Sand', unit: 'CFT', economyRate: 2.0, standardRate: 2.5, premiumRate: 3.5, luxuryRate: 5.0, updatedAt: new Date().toISOString() },
    { materialId: 'aggregate', materialName: 'Aggregate', unit: 'CFT', economyRate: 2.2, standardRate: 2.8, premiumRate: 3.8, luxuryRate: 5.2, updatedAt: new Date().toISOString() },
    { materialId: 'steel', materialName: 'Steel', unit: 'MT', economyRate: 800, standardRate: 950, premiumRate: 1200, luxuryRate: 1600, updatedAt: new Date().toISOString() },
    { materialId: 'bricks', materialName: 'Red Bricks', unit: 'Nos', economyRate: 0.60, standardRate: 0.75, premiumRate: 1.00, luxuryRate: 1.40, updatedAt: new Date().toISOString() },
    { materialId: 'aacBlocks', materialName: 'AAC Blocks', unit: 'Nos', economyRate: 3.5, standardRate: 4.5, premiumRate: 6.0, luxuryRate: 8.5, updatedAt: new Date().toISOString() },
    { materialId: 'paint', materialName: 'Paint', unit: 'Liters', economyRate: 8, standardRate: 12, premiumRate: 18, luxuryRate: 28, updatedAt: new Date().toISOString() },
    { materialId: 'tiles', materialName: 'Tiles', unit: 'Sq.Ft', economyRate: 3.5, standardRate: 5.0, premiumRate: 8.0, luxuryRate: 14.0, updatedAt: new Date().toISOString() },
    { materialId: 'plaster', materialName: 'Plaster', unit: 'Sq.Ft', economyRate: 1.5, standardRate: 2.2, premiumRate: 3.5, luxuryRate: 5.5, updatedAt: new Date().toISOString() },
    { materialId: 'labour', materialName: 'Labour Cost', unit: 'Sq.Ft BUA', economyRate: 25, standardRate: 35, premiumRate: 48, luxuryRate: 70, updatedAt: new Date().toISOString() }
  ],
  UK: [
    { materialId: 'cement', materialName: 'Cement', unit: '50kg Bag', economyRate: 9, standardRate: 11, premiumRate: 15, luxuryRate: 21, updatedAt: new Date().toISOString() },
    { materialId: 'sand', materialName: 'Sand', unit: 'CFT', economyRate: 1.5, standardRate: 2.0, premiumRate: 2.8, luxuryRate: 4.0, updatedAt: new Date().toISOString() },
    { materialId: 'aggregate', materialName: 'Aggregate', unit: 'CFT', economyRate: 1.7, standardRate: 2.2, premiumRate: 3.0, luxuryRate: 4.2, updatedAt: new Date().toISOString() },
    { materialId: 'steel', materialName: 'Steel', unit: 'MT', economyRate: 650, standardRate: 780, premiumRate: 980, luxuryRate: 1300, updatedAt: new Date().toISOString() },
    { materialId: 'bricks', materialName: 'Red Bricks', unit: 'Nos', economyRate: 0.45, standardRate: 0.55, premiumRate: 0.75, luxuryRate: 1.10, updatedAt: new Date().toISOString() },
    { materialId: 'aacBlocks', materialName: 'AAC Blocks', unit: 'Nos', economyRate: 2.8, standardRate: 3.6, premiumRate: 4.8, luxuryRate: 6.8, updatedAt: new Date().toISOString() },
    { materialId: 'paint', materialName: 'Paint', unit: 'Liters', economyRate: 6, standardRate: 9, premiumRate: 14, luxuryRate: 22, updatedAt: new Date().toISOString() },
    { materialId: 'tiles', materialName: 'Tiles', unit: 'Sq.Ft', economyRate: 2.8, standardRate: 4.0, premiumRate: 6.5, luxuryRate: 11.0, updatedAt: new Date().toISOString() },
    { materialId: 'plaster', materialName: 'Plaster', unit: 'Sq.Ft', economyRate: 1.2, standardRate: 1.8, premiumRate: 2.8, luxuryRate: 4.4, updatedAt: new Date().toISOString() },
    { materialId: 'labour', materialName: 'Labour Cost', unit: 'Sq.Ft BUA', economyRate: 20, standardRate: 28, premiumRate: 38, luxuryRate: 55, updatedAt: new Date().toISOString() }
  ],
  UAE: [
    { materialId: 'cement', materialName: 'Cement', unit: '50kg Bag', economyRate: 18, standardRate: 22, premiumRate: 28, luxuryRate: 38, updatedAt: new Date().toISOString() },
    { materialId: 'sand', materialName: 'Sand', unit: 'CFT', economyRate: 3.5, standardRate: 4.5, premiumRate: 6.0, luxuryRate: 8.5, updatedAt: new Date().toISOString() },
    { materialId: 'aggregate', materialName: 'Aggregate', unit: 'CFT', economyRate: 3.8, standardRate: 4.8, premiumRate: 6.5, luxuryRate: 9.0, updatedAt: new Date().toISOString() },
    { materialId: 'steel', materialName: 'Steel', unit: 'MT', economyRate: 2200, standardRate: 2600, premiumRate: 3200, luxuryRate: 4200, updatedAt: new Date().toISOString() },
    { materialId: 'bricks', materialName: 'Red Bricks', unit: 'Nos', economyRate: 0.50, standardRate: 0.65, premiumRate: 0.90, luxuryRate: 1.30, updatedAt: new Date().toISOString() },
    { materialId: 'aacBlocks', materialName: 'AAC Blocks', unit: 'Nos', economyRate: 4.0, standardRate: 5.0, premiumRate: 6.5, luxuryRate: 9.0, updatedAt: new Date().toISOString() },
    { materialId: 'paint', materialName: 'Paint', unit: 'Liters', economyRate: 12, standardRate: 16, premiumRate: 24, luxuryRate: 36, updatedAt: new Date().toISOString() },
    { materialId: 'tiles', materialName: 'Tiles', unit: 'Sq.Ft', economyRate: 6, standardRate: 9, premiumRate: 14, luxuryRate: 22, updatedAt: new Date().toISOString() },
    { materialId: 'plaster', materialName: 'Plaster', unit: 'Sq.Ft', economyRate: 2.5, standardRate: 3.5, premiumRate: 5.0, luxuryRate: 7.5, updatedAt: new Date().toISOString() },
    { materialId: 'labour', materialName: 'Labour Cost', unit: 'Sq.Ft BUA', economyRate: 18, standardRate: 25, premiumRate: 35, luxuryRate: 50, updatedAt: new Date().toISOString() }
  ],
  Australia: [
    { materialId: 'cement', materialName: 'Cement', unit: '50kg Bag', economyRate: 16, standardRate: 20, premiumRate: 26, luxuryRate: 36, updatedAt: new Date().toISOString() },
    { materialId: 'sand', materialName: 'Sand', unit: 'CFT', economyRate: 3.0, standardRate: 3.8, premiumRate: 5.0, luxuryRate: 7.2, updatedAt: new Date().toISOString() },
    { materialId: 'aggregate', materialName: 'Aggregate', unit: 'CFT', economyRate: 3.2, standardRate: 4.0, premiumRate: 5.5, luxuryRate: 7.8, updatedAt: new Date().toISOString() },
    { materialId: 'steel', materialName: 'Steel', unit: 'MT', economyRate: 1100, standardRate: 1300, premiumRate: 1600, luxuryRate: 2200, updatedAt: new Date().toISOString() },
    { materialId: 'bricks', materialName: 'Red Bricks', unit: 'Nos', economyRate: 0.90, standardRate: 1.10, premiumRate: 1.50, luxuryRate: 2.10, updatedAt: new Date().toISOString() },
    { materialId: 'aacBlocks', materialName: 'AAC Blocks', unit: 'Nos', economyRate: 5.5, standardRate: 7.0, premiumRate: 9.5, luxuryRate: 13.0, updatedAt: new Date().toISOString() },
    { materialId: 'paint', materialName: 'Paint', unit: 'Liters', economyRate: 12, standardRate: 18, premiumRate: 26, luxuryRate: 40, updatedAt: new Date().toISOString() },
    { materialId: 'tiles', materialName: 'Tiles', unit: 'Sq.Ft', economyRate: 5.5, standardRate: 8.0, premiumRate: 12.0, luxuryRate: 20.0, updatedAt: new Date().toISOString() },
    { materialId: 'plaster', materialName: 'Plaster', unit: 'Sq.Ft', economyRate: 2.5, standardRate: 3.8, premiumRate: 5.5, luxuryRate: 8.5, updatedAt: new Date().toISOString() },
    { materialId: 'labour', materialName: 'Labour Cost', unit: 'Sq.Ft BUA', economyRate: 35, standardRate: 48, premiumRate: 65, luxuryRate: 90, updatedAt: new Date().toISOString() }
  ],
  Canada: [
    { materialId: 'cement', materialName: 'Cement', unit: '50kg Bag', economyRate: 14, standardRate: 18, premiumRate: 24, luxuryRate: 32, updatedAt: new Date().toISOString() },
    { materialId: 'sand', materialName: 'Sand', unit: 'CFT', economyRate: 2.5, standardRate: 3.2, premiumRate: 4.5, luxuryRate: 6.2, updatedAt: new Date().toISOString() },
    { materialId: 'aggregate', materialName: 'Aggregate', unit: 'CFT', economyRate: 2.8, standardRate: 3.5, premiumRate: 4.8, luxuryRate: 6.8, updatedAt: new Date().toISOString() },
    { materialId: 'steel', materialName: 'Steel', unit: 'MT', economyRate: 950, standardRate: 1150, premiumRate: 1450, luxuryRate: 1950, updatedAt: new Date().toISOString() },
    { materialId: 'bricks', materialName: 'Red Bricks', unit: 'Nos', economyRate: 0.75, standardRate: 0.95, premiumRate: 1.30, luxuryRate: 1.80, updatedAt: new Date().toISOString() },
    { materialId: 'aacBlocks', materialName: 'AAC Blocks', unit: 'Nos', economyRate: 4.8, standardRate: 6.0, premiumRate: 8.0, luxuryRate: 11.5, updatedAt: new Date().toISOString() },
    { materialId: 'paint', materialName: 'Paint', unit: 'Liters', economyRate: 10, standardRate: 15, premiumRate: 22, luxuryRate: 34, updatedAt: new Date().toISOString() },
    { materialId: 'tiles', materialName: 'Tiles', unit: 'Sq.Ft', economyRate: 4.8, standardRate: 7.0, premiumRate: 10.5, luxuryRate: 17.5, updatedAt: new Date().toISOString() },
    { materialId: 'plaster', materialName: 'Plaster', unit: 'Sq.Ft', economyRate: 2.0, standardRate: 3.0, premiumRate: 4.5, luxuryRate: 7.0, updatedAt: new Date().toISOString() },
    { materialId: 'labour', materialName: 'Labour Cost', unit: 'Sq.Ft BUA', economyRate: 30, standardRate: 40, premiumRate: 55, luxuryRate: 80, updatedAt: new Date().toISOString() }
  ]
};

export const CurrencyConfig: Record<string, { symbol: string; code: string }> = {
  India: { symbol: '₹', code: 'INR' },
  USA: { symbol: '$', code: 'USD' },
  UK: { symbol: '£', code: 'GBP' },
  UAE: { symbol: 'د.إ', code: 'AED' },
  Australia: { symbol: '$', code: 'AUD' },
  Canada: { symbol: '$', code: 'CAD' }
};
