// Material Knowledge Base (MKB)
// Store details about construction materials, units, density, coverage, waste %, standard size, description.

export interface MaterialInfo {
  id: string;
  name: string;
  unit: string;
  density?: number; // in kg/m3 or as relevant
  coverage?: number; // in sqft per unit
  wastePercent: number; // standard industry wastage %
  standardSize?: string; // size string
  description: string;
}

export const MATERIALS_KNOWLEDGE_BASE: Record<string, MaterialInfo> = {
  cement: {
    id: 'cement',
    name: 'Cement (OPC/PPC)',
    unit: '50kg Bag',
    density: 1440, // kg/m3
    coverage: 0.4, // BUA multiplier: bags per sqft BUA
    wastePercent: 2,
    standardSize: '50 kg Bag',
    description: 'Ordinary Portland Cement (OPC) or Portland Pozzolana Cement (PPC) used for concrete mixing, masonry mortar, and plastering.'
  },
  sand: {
    id: 'sand',
    name: 'River/Manufactured Sand',
    unit: 'CFT',
    density: 1600, // kg/m3
    coverage: 1.8, // cft per sqft BUA
    wastePercent: 10,
    standardSize: 'Fine to Coarse grains',
    description: 'Fine aggregate used for masonry mortar, wall plaster, and concrete structural members.'
  },
  aggregate: {
    id: 'aggregate',
    name: 'Crushed Stone Aggregate (20mm)',
    unit: 'CFT',
    density: 1560, // kg/m3
    coverage: 1.35, // cft per sqft BUA
    wastePercent: 5,
    standardSize: '10mm - 20mm',
    description: 'Coarse gravel aggregate used in PCC and RCC concrete mixes to provide compressive strength.'
  },
  steel: {
    id: 'steel',
    name: 'TMT Reinforcement Steel',
    unit: 'MT',
    density: 7850, // kg/m3
    coverage: 4.0, // kg per sqft BUA
    wastePercent: 5,
    standardSize: '8mm - 25mm diameter bars',
    description: 'High-strength thermo-mechanically treated steel rebars for RCC structural elements.'
  },
  bricks: {
    id: 'bricks',
    name: 'Red Clay Bricks',
    unit: 'Nos',
    density: 1800, // kg/m3
    coverage: 13.5, // bricks per CFT of brickwork
    wastePercent: 7,
    standardSize: '9" x 4.5" x 3"',
    description: 'Standard kiln-burnt clay bricks for general partition walls.'
  },
  aacBlocks: {
    id: 'aacBlocks',
    name: 'AAC Blocks',
    unit: 'Nos',
    density: 650, // kg/m3
    coverage: 1.2917, // area of face in sqft
    wastePercent: 5,
    standardSize: '24" x 8" x 6"',
    description: 'Autoclaved Aerated Concrete blocks, lightweight and thermally insulating wall panels.'
  },
  paint: {
    id: 'paint',
    name: 'Acrylic Emulsion Paint',
    unit: 'Liters',
    density: 1200, // kg/m3
    coverage: 100, // sqft per liter (double coat)
    wastePercent: 5,
    standardSize: '20L Bucket',
    description: 'Premium interior and exterior grade weather-resistant acrylic emulsion paints.'
  },
  tiles: {
    id: 'tiles',
    name: 'Vitrified Flooring Tiles',
    unit: 'Sq.Ft',
    density: 2200, // kg/m3
    coverage: 1, // 1 sqft per sqft floor
    wastePercent: 10,
    standardSize: '24" x 24" (2ft x 2ft)',
    description: 'Vitrified high-gloss ceramic composite tiles for standard flooring finishes.'
  },
  plaster: {
    id: 'plaster',
    name: 'Cement Plaster Finish',
    unit: 'Sq.Ft',
    density: 2000,
    coverage: 1,
    wastePercent: 8,
    standardSize: '12mm - 20mm thickness',
    description: 'Cement and fine sand mix applied over masonry walls to provide a smooth, flat paintable surface.'
  },
  labour: {
    id: 'labour',
    name: 'Construction Labour Force',
    unit: 'Sq.Ft BUA',
    wastePercent: 0,
    description: 'Combined skilled masons, steel-fitters, concrete-mixers, painters, helpers, and supervisors.'
  }
};
