// Module 1: Area Calculation
import { FormulaRegistry } from '../formulas/registry';
import { QualityRules } from '../rules/ruleEngine';

export interface AreaInput {
  plotLength: number;
  plotWidth: number;
  unit: 'Feet' | 'Meter';
  floors: number;
  buildingType: 'Residential' | 'Commercial' | 'Mixed Use';
}

export interface AreaOutput {
  plotAreaSqFt: number;
  plotAreaSqM: number;
  builtUpAreaSqFt: number;
  builtUpAreaSqM: number;
  totalConstructionAreaSqFt: number;
  totalConstructionAreaSqM: number;
}

export function calculateArea(input: AreaInput): AreaOutput {
  const { plotLength, plotWidth, unit, floors, buildingType } = input;

  const rawPlotArea = FormulaRegistry.evaluate('plot_area', {
    length: plotLength,
    width: plotWidth
  });

  const ftToMeter = FormulaRegistry.getCoefficient('plot_area', 'feet_to_meter_factor');

  let plotAreaSqFt = 0;
  let plotAreaSqM = 0;

  if (unit === 'Feet') {
    plotAreaSqFt = rawPlotArea;
    plotAreaSqM = plotAreaSqFt / ftToMeter;
  } else {
    plotAreaSqM = rawPlotArea;
    plotAreaSqFt = plotAreaSqM * ftToMeter;
  }

  // Coverage factor resolved via Rule Engine
  const coverageFactor = QualityRules.getCoverageFactor(buildingType);

  const builtUpAreaSqFt = plotAreaSqFt * coverageFactor;
  const builtUpAreaSqM = plotAreaSqM * coverageFactor;

  const totalConstructionAreaSqFt = builtUpAreaSqFt * floors;
  const totalConstructionAreaSqM = builtUpAreaSqM * floors;

  return {
    plotAreaSqFt: Math.round(plotAreaSqFt * 100) / 100,
    plotAreaSqM: Math.round(plotAreaSqM * 100) / 100,
    builtUpAreaSqFt: Math.round(builtUpAreaSqFt * 100) / 100,
    builtUpAreaSqM: Math.round(builtUpAreaSqM * 100) / 100,
    totalConstructionAreaSqFt: Math.round(totalConstructionAreaSqFt * 100) / 100,
    totalConstructionAreaSqM: Math.round(totalConstructionAreaSqM * 100) / 100,
  };
}
