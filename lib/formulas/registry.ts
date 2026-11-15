// Formula Registry
// Stores calculations coefficients and expression evaluations dynamically

export interface Formula {
  id: string;
  name: string;
  category: string;
  description: string;
  expressionString: string;
  defaultCoefficients: Record<string, number>;
}

export const FORMULA_REGISTRY: Record<string, Formula> = {
  plot_area: {
    id: 'plot_area',
    name: 'Plot Area Calculator',
    category: 'Area',
    description: 'Calculates plot area and applies unit conversions between Feet and Meters.',
    expressionString: 'length * width',
    defaultCoefficients: {
      feet_to_meter_factor: 10.7639
    }
  },
  excavation_vol: {
    id: 'excavation_vol',
    name: 'Footing Excavation Volume',
    category: 'Excavation',
    description: 'Computes total soil excavation volume for foundation column pits.',
    expressionString: 'numColumns * width * width * depth',
    defaultCoefficients: {
      default_footing_width: 5.0,
      default_footing_depth: 5.0,
      columns_per_sqft_bua: 120 // 1 column per 120 sqft BUA
    }
  },
  pcc_vol: {
    id: 'pcc_vol',
    name: 'PCC Bedding Concrete Volume',
    category: 'PCC',
    description: 'Calculates Plain Cement Concrete bedding volume under column foundations.',
    expressionString: 'numColumns * width * width * thickness',
    defaultCoefficients: {
      default_pcc_thickness: 0.25, // 3 inches = 0.25 ft
      dry_volume_multiplier: 1.54
    }
  },
  rcc_slab_vol: {
    id: 'rcc_slab_vol',
    name: 'RCC Slab Concrete Volume',
    category: 'RCC',
    description: 'Calculates concrete volume for horizontal slabs.',
    expressionString: 'builtUpArea * thickness',
    defaultCoefficients: {
      default_slab_thickness: 0.4167 // 5 inches = 5/12 ft
    }
  },
  rcc_beams_vol: {
    id: 'rcc_beams_vol',
    name: 'RCC Beams Concrete Volume',
    category: 'RCC',
    description: 'Estimates beam concrete volume as a ratio of slab volume.',
    expressionString: 'slabVolume * factor',
    defaultCoefficients: {
      beam_ratio_to_slab: 0.30 // Beams are ~30% of slab volume
    }
  },
  rcc_columns_vol: {
    id: 'rcc_columns_vol',
    name: 'RCC Columns Concrete Volume',
    category: 'RCC',
    description: 'Calculates concrete volume for all vertical columns.',
    expressionString: 'numColumns * area * floorHeight * floors',
    defaultCoefficients: {
      column_cross_section_area: 0.75, // 9" x 12" = 0.75 sqft
    }
  },
  rcc_staircase_vol: {
    id: 'rcc_staircase_vol',
    name: 'RCC Staircase Concrete Volume',
    category: 'RCC',
    description: 'Estimates concrete volume for steps and waist slab.',
    expressionString: 'floors * volumePerFloor',
    defaultCoefficients: {
      staircase_vol_cft_per_floor: 40
    }
  },
  masonry_brick_count: {
    id: 'masonry_brick_count',
    name: 'Red Brick Quantity',
    category: 'Masonry',
    description: 'Calculates the brick count in Red Clay Brick masonry.',
    expressionString: 'wallVolume * bricks_per_cft * (1 + wastage / 100)',
    defaultCoefficients: {
      bricks_per_cft: 13.5, // Red bricks per CFT including mortar joint
      mortar_volume_ratio: 0.30 // Mortar occupies ~30% of wall volume
    }
  },
  masonry_aac_count: {
    id: 'masonry_aac_count',
    name: 'AAC Block Quantity',
    category: 'Masonry',
    description: 'Calculates the block count in AAC Block masonry.',
    expressionString: 'wallVolume / single_block_volume * (1 + wastage / 100)',
    defaultCoefficients: {
      block_length: 2.0, // 24" = 2.0 ft
      block_height: 0.667, // 8" = 0.667 ft
      default_block_thickness: 0.5, // 6" = 0.5 ft
      adhesive_bags_per_m3: 1.2
    }
  },
  mortar_breakdown: {
    id: 'mortar_breakdown',
    name: 'Mortar Materials Calculator',
    category: 'Materials',
    description: 'Breaks down a mortar dry volume into cement bags and sand CFT.',
    expressionString: 'dryVolume * proportion',
    defaultCoefficients: {
      cement_bag_volume_cft: 1.226, // 1 bag (50kg) is approx 1.226 CFT
      dry_mortar_multiplier: 1.33,
      brick_mortar_ratio_cement: 1,
      brick_mortar_ratio_sand: 6, // 1:6 mix ratio
      plaster_mortar_ratio_cement: 1,
      plaster_mortar_ratio_sand_internal: 6, // 1:6 mix ratio
      plaster_mortar_ratio_sand_external: 4 // 1:4 mix ratio for ceiling/external
    }
  },
  paint_liters: {
    id: 'paint_liters',
    name: 'Paint & Putty Requirements',
    category: 'Finishes',
    description: 'Calculates putty, primer, and paint quantities.',
    expressionString: 'area * coverage_factor',
    defaultCoefficients: {
      putty_kg_per_sqft: 0.12,
      primer_liters_per_sqft: 0.07,
      paint_liters_per_sqft_interior: 0.12,
      paint_liters_per_sqft_exterior: 0.15
    }
  },
  tiles_sqft: {
    id: 'tiles_sqft',
    name: 'Flooring Tiles Requirements',
    category: 'Finishes',
    description: 'Calculates tiles square footage and counts.',
    expressionString: 'floorArea * (1 + wastage / 100)',
    defaultCoefficients: {
      tile_size_sqft: 4.0, // 2x2 ft tiles
      net_flooring_ratio: 0.90 // 90% of BUA is tiled
    }
  },
  steel_weight: {
    id: 'steel_weight',
    name: 'RCC Steel Reinforcement',
    category: 'Steel',
    description: 'Calculates steel reinforcement weight based on RCC volume and density multipliers.',
    expressionString: 'rccVolume * steelRatio',
    defaultCoefficients: {
      footing_steel_kg_per_cft: 1.8,
      column_steel_kg_per_cft: 4.5,
      beam_steel_kg_per_cft: 3.4,
      slab_steel_kg_per_cft: 2.2,
      staircase_steel_kg_per_cft: 2.7
    }
  }
};

// Evaluator Service
export const FormulaRegistry = {
  // Retrieve a coefficient, allowing dynamic override (e.g. from state or DB in the future)
  getCoefficient(formulaId: string, coeffKey: string, overrides?: Record<string, number>): number {
    if (overrides && overrides[coeffKey] !== undefined) {
      return overrides[coeffKey];
    }
    const formula = FORMULA_REGISTRY[formulaId];
    if (formula && formula.defaultCoefficients[coeffKey] !== undefined) {
      return formula.defaultCoefficients[coeffKey];
    }
    return 0;
  },

  // Dynamic formula evaluation
  evaluate(formulaId: string, variables: Record<string, number>, overrides?: Record<string, number>): number {
    const formula = FORMULA_REGISTRY[formulaId];
    if (!formula) {
      throw new Error(`Formula with ID '${formulaId}' not found in registry.`);
    }

    // Merge default coefficients, database overrides, and runtime variables
    const params = {
      ...formula.defaultCoefficients,
      ...overrides,
      ...variables
    };

    switch (formulaId) {
      case 'plot_area':
        return params.length * params.width;

      case 'excavation_vol':
        return params.numColumns * params.width * params.width * params.depth;

      case 'pcc_vol':
        return params.numColumns * params.width * params.width * params.thickness;

      case 'rcc_slab_vol':
        return params.builtUpArea * params.thickness;

      case 'rcc_beams_vol':
        return params.slabVolume * params.factor;

      case 'rcc_columns_vol':
        return params.numColumns * params.area * params.floorHeight * params.floors;

      case 'rcc_staircase_vol':
        return params.floors * params.volumePerFloor;

      case 'masonry_brick_count':
        return params.wallVolume * params.bricks_per_cft * (1 + params.wastage / 100);

      case 'masonry_aac_count':
        const blockVol = params.block_length * params.block_height * params.default_block_thickness;
        return (params.wallVolume / blockVol) * (1 + params.wastage / 100);

      case 'mortar_breakdown':
        return params.dryVolume * params.proportion;

      case 'paint_liters':
        return params.area * params.coverage_factor;

      case 'tiles_sqft':
        return params.floorArea * (1 + params.wastage / 100);

      case 'steel_weight':
        return params.rccVolume * params.steelRatio;

      default:
        throw new Error(`Evaluation logic for formula '${formulaId}' not implemented in registry resolver.`);
    }
  }
};
