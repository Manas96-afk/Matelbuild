// Engineering Rule Engine
// Decouples calculation rules from execution logic

import { FormulaRegistry } from '../formulas/registry';

export interface ConcreteMixProportion {
  cement: number;
  sand: number;
  aggregate: number;
  total: number;
}

export const ConcreteRules = {
  // M5, M7.5, M10 PCC mix proportions
  getPccProportion(grade: string): ConcreteMixProportion {
    const rules: Record<string, ConcreteMixProportion> = {
      M5: { cement: 1, sand: 5, aggregate: 10, total: 16 },
      'M7.5': { cement: 1, sand: 4, aggregate: 8, total: 13 },
      M10: { cement: 1, sand: 3, aggregate: 6, total: 10 }
    };
    return rules[grade] || rules['M7.5'];
  },

  // M20, M25, M30 RCC mix proportions
  getRccProportion(grade: string): ConcreteMixProportion {
    const rules: Record<string, ConcreteMixProportion> = {
      M20: { cement: 1, sand: 1.5, aggregate: 3, total: 5.5 },
      M25: { cement: 1, sand: 1, aggregate: 2, total: 4 },
      M30: { cement: 1, sand: 0.75, aggregate: 1.5, total: 3.25 }
    };
    return rules[grade] || rules['M20'];
  }
};

export const QualityRules = {
  // Wastage multiplier rules
  getWastageMargin(quality: string): number {
    const rules: Record<string, number> = {
      Economy: 5,
      Standard: 10,
      Premium: 15,
      Luxury: 15
    };
    return rules[quality] !== undefined ? rules[quality] : 10;
  },

  // Structural sizes or standard quality overrides
  getCoverageFactor(buildingType: string): number {
    const rules: Record<string, number> = {
      Residential: 0.70,
      Commercial: 0.85,
      'Mixed Use': 0.75
    };
    return rules[buildingType] !== undefined ? rules[buildingType] : 0.70;
  }
};

export const WallRules = {
  // Returns appropriate calculation parameters for brick vs AAC block
  getWallThickness(wallType: string): number {
    // Standard external walls thick, internal partition thin.
    // Normalized wall thickness for calculations (in feet)
    const thicknessMap: Record<string, number> = {
      'Brick': 0.75, // 9 inch brickwork
      'Brick Masonry': 0.75,
      'AAC': 0.50, // 6 inch blockwork
      'AAC Blocks': 0.50,
      'AAC Block Wall': 0.50,
      'Hollow Blocks': 0.50
    };
    return thicknessMap[wallType] || 0.75; // fallback to 9" Brick
  },

  getMortarRatio(wallType: string): number {
    const ratioMap: Record<string, number> = {
      'Brick': 0.30, // mortar is 30% of brick wall volume
      'Brick Masonry': 0.30,
      'Hollow Blocks': 0.12, // hollow blocks use less mortar (12% volume)
      'AAC': 0.05, // AAC blocks use thin-bed adhesive (not standard sand mortar)
      'AAC Blocks': 0.05,
      'AAC Block Wall': 0.05
    };
    return ratioMap[wallType] !== undefined ? ratioMap[wallType] : 0.30;
  }
};

export const EngineeringRuleEngine = {
  // Resolve wall masonry calculations
  resolveMasonry(
    wallType: string,
    wallVolumeCFT: number,
    wastage: number
  ): {
    bricksCount: number;
    blocksCount: number;
    mortarCementBags: number;
    mortarSandCFT: number;
    adhesiveBags: number;
  } {
    let bricksCount = 0;
    let blocksCount = 0;
    let mortarCementBags = 0;
    let mortarSandCFT = 0;
    let adhesiveBags = 0;

    const isAAC = wallType.includes('AAC');

    if (isAAC) {
      blocksCount = FormulaRegistry.evaluate('masonry_aac_count', {
        wallVolume: wallVolumeCFT,
        wastage: wastage
      });

      // Jointing adhesive formula
      const wallVolumeM3 = wallVolumeCFT / 35.3147;
      const adhesiveFactor = FormulaRegistry.getCoefficient('masonry_aac_count', 'adhesive_bags_per_m3');
      adhesiveBags = Math.round(wallVolumeM3 * adhesiveFactor);
    } else {
      bricksCount = FormulaRegistry.evaluate('masonry_brick_count', {
        wallVolume: wallVolumeCFT,
        wastage: wastage
      });

      // Calculate mortar breakdown
      const mortarVolCFT = wallVolumeCFT * WallRules.getMortarRatio(wallType);
      const dryMortarVolCFT = mortarVolCFT * FormulaRegistry.getCoefficient('mortar_breakdown', 'dry_mortar_multiplier');
      
      const cementVolCFT = FormulaRegistry.evaluate('mortar_breakdown', {
        dryVolume: dryMortarVolCFT,
        proportion: 1 / 7 // 1:6 mix ratio
      });
      mortarCementBags = Math.round(cementVolCFT / FormulaRegistry.getCoefficient('mortar_breakdown', 'cement_bag_volume_cft'));
      
      mortarSandCFT = FormulaRegistry.evaluate('mortar_breakdown', {
        dryVolume: dryMortarVolCFT,
        proportion: 6 / 7
      });
    }

    return {
      bricksCount,
      blocksCount,
      mortarCementBags,
      mortarSandCFT,
      adhesiveBags
    };
  }
};
