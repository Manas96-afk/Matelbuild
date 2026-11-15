// Module 8: Paint Calculation
import { FormulaRegistry } from '../formulas/registry';

export interface PaintInput {
  internalPlasterArea: number;
  externalPlasterArea: number;
}

export interface PaintOutput {
  puttyKg: number;
  primerLiters: number;
  interiorPaintLiters: number;
  exteriorPaintLiters: number;
  totalPaintLiters: number;
  coverageAreaSqFt: number;
}

export function calculatePaint(input: PaintInput): PaintOutput {
  const { internalPlasterArea, externalPlasterArea } = input;

  const totalArea = internalPlasterArea + externalPlasterArea;

  const puttyCoeff = FormulaRegistry.getCoefficient('paint_liters', 'putty_kg_per_sqft');
  const primerCoeff = FormulaRegistry.getCoefficient('paint_liters', 'primer_liters_per_sqft');
  const intPaintCoeff = FormulaRegistry.getCoefficient('paint_liters', 'paint_liters_per_sqft_interior');
  const extPaintCoeff = FormulaRegistry.getCoefficient('paint_liters', 'paint_liters_per_sqft_exterior');

  const puttyKg = FormulaRegistry.evaluate('paint_liters', {
    area: internalPlasterArea,
    coverage_factor: puttyCoeff
  });

  const primerLiters = FormulaRegistry.evaluate('paint_liters', {
    area: totalArea,
    coverage_factor: primerCoeff
  });

  const interiorPaintLiters = FormulaRegistry.evaluate('paint_liters', {
    area: internalPlasterArea,
    coverage_factor: intPaintCoeff
  });

  const exteriorPaintLiters = FormulaRegistry.evaluate('paint_liters', {
    area: externalPlasterArea,
    coverage_factor: extPaintCoeff
  });

  const totalPaintLiters = interiorPaintLiters + exteriorPaintLiters;

  return {
    puttyKg: Math.round(puttyKg),
    primerLiters: Math.round(primerLiters),
    interiorPaintLiters: Math.round(interiorPaintLiters),
    exteriorPaintLiters: Math.round(exteriorPaintLiters),
    totalPaintLiters: Math.round(totalPaintLiters),
    coverageAreaSqFt: Math.round(totalArea * 100) / 100
  };
}
