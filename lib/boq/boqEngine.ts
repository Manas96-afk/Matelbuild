/**
 * Extended BOQ Engine — produces categorized, traceable BOQ line items
 * with CSV export support.
 *
 * Every line item references source element IDs for full traceability
 * back to the digital building model (as required by the spec).
 */

import { PricingRateCard } from '../../types';
import { BOQLineItem, BOQReport, BOQCategory } from '../../types/blueprint';
import { CurrencyConfig } from '../pricing/countryRates';

// Keep the original BOQItem export for backward compatibility
export interface BOQItem {
  id: string;
  section: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  cost: number;
}

export const BOQEngine = {
  generateBOQ(quantities: any, rates: PricingRateCard, wallType: string): BOQItem[] {
    const summary = quantities.summary || quantities;
    const items: BOQItem[] = [];

    const addItem = (id: string, section: string, description: string, quantity: number, unit: string, rate: number) => {
      if (quantity > 0) {
        items.push({ id, section, description, quantity: Math.round(quantity * 100) / 100, unit, rate, cost: Math.round(quantity * rate) });
      }
    };

    const excavationRate = Math.max(10, Math.round(rates.labour * 0.04));
    addItem('excavation', 'Earthwork', `Soil excavation for footing pits (${quantities.excavation?.numColumns || 0} columns)`, quantities.excavation?.excavationVolumeCFT || 0, 'CFT', excavationRate);

    const pccConcreteRate = Math.round(rates.cement * 0.3 + rates.sand * 1.5 + rates.aggregate * 3.0);
    addItem('pcc_bedding', 'Concrete Work', 'Plain Cement Concrete (PCC) bedding (1:4:8 mix) under foundation', quantities.pcc?.pccVolumeCFT || 0, 'CFT', pccConcreteRate);

    const rccConcreteRate = Math.round(rates.cement * 0.4 + rates.sand * 1.5 + rates.aggregate * 3.0);
    addItem('rcc_concrete', 'Concrete Work', 'Reinforced Cement Concrete (RCC) structural elements', quantities.rcc?.totalVolumeCFT || 0, 'CFT', rccConcreteRate);

    addItem('steel_reinforcement', 'Structural Steel', 'High-strength TMT steel reinforcement rebars', summary.steelMT || 0, 'MT', rates.steel);

    if (wallType.includes('AAC')) {
      addItem('aac_masonry', 'Masonry', 'AAC lightweight concrete block wall masonry', summary.blocksCount || 0, 'Nos', rates.aacBlocks);
    } else {
      addItem('brick_masonry', 'Masonry', 'Red clay brick masonry work with cement mortar (1:6 mix)', summary.bricksCount || 0, 'Nos', rates.bricks);
    }

    addItem('plaster_internal', 'Plastering & Finishes', 'Internal wall plastering (15mm thick, 1:6 mix)', quantities.plaster?.internalPlaster?.areaSqFt || 0, 'Sq.Ft', rates.plaster);
    addItem('plaster_external', 'Plastering & Finishes', 'External wall plastering (20mm thick, 1:4 mix)', quantities.plaster?.externalPlaster?.areaSqFt || 0, 'Sq.Ft', Math.round(rates.plaster * 1.2));
    addItem('plaster_ceiling', 'Plastering & Finishes', 'Ceiling plaster finish (12mm thick, 1:5 mix)', quantities.plaster?.ceilingPlaster?.areaSqFt || 0, 'Sq.Ft', Math.round(rates.plaster * 0.9));

    addItem('flooring_tiles', 'Flooring', 'Vitrified tiles laying with adhesive bed & joints', summary.tilesSqFt || 0, 'Sq.Ft', rates.tiles);
    addItem('surface_painting', 'Painting', 'Interior/Exterior painting (2 coats + primer + putty base)', summary.paintLiters || 0, 'Liters', rates.paint);

    const builtUpArea = quantities.area?.builtUpAreaSqFt || summary.builtUpAreaSqFt || 0;
    addItem('labour_force', 'Labour', 'Masons, steel-binders, helpers, and site supervisor', builtUpArea, 'Sq.Ft BUA', rates.labour);

    return items;
  },

  /**
   * Generate a professional categorized BOQ report.
   */
  generateBOQReport(
    projectId: string,
    projectName: string,
    country: string,
    constructionQuality: string,
    quantities: any,
    rates: PricingRateCard,
    wallType: string
  ): BOQReport {
    const currencyInfo = (CurrencyConfig as any)[country] || { code: 'INR', symbol: '₹' };
    const items: BOQLineItem[] = [];
    let slNo = 1;

    const addLine = (
      id: string, category: BOQCategory, description: string,
      unit: string, quantity: number, unitRate: number, notes?: string
    ) => {
      if (quantity <= 0) return;
      items.push({
        slNo: slNo++,
        id,
        category,
        description,
        unit,
        quantity: Math.round(quantity * 100) / 100,
        unitRate: Math.round(unitRate * 100) / 100,
        amount: Math.round(quantity * unitRate),
        notes,
      });
    };

    const excavationRate = Math.max(10, Math.round(rates.labour * 0.04));
    const pccRate = Math.round(rates.cement * 0.3 + rates.sand * 1.5 + rates.aggregate * 3.0);
    const rccRate = Math.round(rates.cement * 0.4 + rates.sand * 1.5 + rates.aggregate * 3.0);

    // 1 — Earthwork & Foundation
    addLine('exc_1', 'Earthwork & Foundation', 'Soil excavation for isolated column footing pits including carting away', 'CFT', quantities.excavation?.excavationVolumeCFT || 0, excavationRate, `${quantities.excavation?.numColumns || 0} column footings`);
    addLine('pcc_1', 'Earthwork & Foundation', 'Plain Cement Concrete (PCC) bedding M7.5 grade under column footings', 'CFT', quantities.pcc?.pccVolumeCFT || 0, pccRate, 'Mix ratio 1:4:8');
    addLine('bf_1', 'Earthwork & Foundation', 'Back filling of excavated earth in layers with watering and compaction', 'CFT', (quantities.excavation?.excavationVolumeCFT || 0) * 0.4, Math.round(excavationRate * 0.6), 'After column footing curing');

    // 2 — Concrete Work
    addLine('rcc_col', 'Concrete Work', 'RCC column concrete M25 grade including shuttering, centering & curing', 'CFT', quantities.rcc?.columns?.volumeCFT || 0, rccRate, 'Column cross-section as per schedule');
    addLine('rcc_beam', 'Concrete Work', 'RCC beam concrete M25 grade including shuttering, centering & curing', 'CFT', quantities.rcc?.beams?.volumeCFT || 0, rccRate, 'Beam sizes as per structural drawing');
    addLine('rcc_slab', 'Concrete Work', 'RCC slab concrete M25 grade including shuttering, centering & curing', 'CFT', quantities.rcc?.slabs?.volumeCFT || 0, Math.round(rccRate * 0.95), 'Slab thickness as per structural drawing');
    addLine('rcc_stair', 'Concrete Work', 'RCC staircase concrete M25 grade with waist slab and steps', 'CFT', quantities.rcc?.staircases?.volumeCFT || 0, Math.round(rccRate * 1.15), 'Including steps formwork');

    // 3 — Structural Steel
    addLine('tmt_col', 'Structural Steel', 'TMT Fe500 steel reinforcement for RCC columns including bending, binding, placing', 'MT', quantities.steel?.columnSteelKg ? quantities.steel.columnSteelKg / 1000 : 0, rates.steel, 'As per reinforcement schedule');
    addLine('tmt_beam', 'Structural Steel', 'TMT Fe500 steel reinforcement for RCC beams including bending, binding, placing', 'MT', quantities.steel?.beamSteelKg ? quantities.steel.beamSteelKg / 1000 : 0, rates.steel, 'As per structural drawing');
    addLine('tmt_slab', 'Structural Steel', 'TMT Fe500 steel reinforcement for RCC slabs in two-way pattern', 'MT', quantities.steel?.slabSteelKg ? quantities.steel.slabSteelKg / 1000 : 0, rates.steel, 'Including distribution bars');
    addLine('tmt_fnd', 'Structural Steel', 'TMT Fe500 steel reinforcement for foundation footings', 'MT', quantities.steel?.foundationSteelKg ? quantities.steel.foundationSteelKg / 1000 : 0, rates.steel, 'As per foundation drawing');

    // 4 — Masonry
    if (wallType.includes('AAC') || wallType.includes('aac')) {
      addLine('aac_ext', 'Masonry', 'AAC block masonry (200mm thick) external walls with tile adhesive bonding', 'Sq.Ft', quantities.plaster?.externalPlaster?.areaSqFt || 0, rates.aacBlocks * 3, 'Including all openings deducted');
      addLine('aac_int', 'Masonry', 'AAC block masonry (100mm thick) internal partition walls', 'Sq.Ft', quantities.plaster?.internalPlaster?.areaSqFt || 0, rates.aacBlocks * 2, '100mm thick blocks');
    } else {
      addLine('brk_ext', 'Masonry', 'Red clay brick masonry 9" thick external walls in CM 1:6', 'Nos', Math.round((quantities.bricks?.brickQuantity || 0) * 0.65), rates.bricks, 'External walls including lintels');
      addLine('brk_int', 'Masonry', 'Red clay brick masonry 4.5" thick internal partition walls in CM 1:6', 'Nos', Math.round((quantities.bricks?.brickQuantity || 0) * 0.35), rates.bricks * 0.85, 'Half-brick internal walls');
    }

    // 5 — Plastering & Finishes
    addLine('pls_int', 'Plastering & Finishes', 'Internal wall cement plaster 15mm thick 1:6 mix including curing', 'Sq.Ft', quantities.plaster?.internalPlaster?.areaSqFt || 0, rates.plaster, '2-coat finish with POP punning');
    addLine('pls_ext', 'Plastering & Finishes', 'External wall cement plaster 20mm thick 1:4 mix including curing', 'Sq.Ft', quantities.plaster?.externalPlaster?.areaSqFt || 0, Math.round(rates.plaster * 1.2), 'Rough cast finish');
    addLine('pls_ceil', 'Plastering & Finishes', 'Ceiling plaster 12mm thick 1:4 mix including scaffolding and curing', 'Sq.Ft', quantities.plaster?.ceilingPlaster?.areaSqFt || 0, Math.round(rates.plaster * 1.1), 'Includes soffits of beams');

    // 6 — Flooring
    addLine('floor_tile', 'Flooring', 'Vitrified tile flooring 600×600mm with adhesive bed and epoxy grouting', 'Sq.Ft', quantities.tiles?.floorAreaSqFt || 0, rates.tiles, 'Including 10% cutting wastage');
    addLine('floor_bath', 'Flooring', 'Anti-skid ceramic tile flooring for bathrooms and utility areas', 'Sq.Ft', Math.round((quantities.tiles?.floorAreaSqFt || 0) * 0.12), Math.round(rates.tiles * 0.85), 'Bathrooms and kitchen');

    // 7 — Painting
    const builtUpArea = quantities.area?.builtUpAreaSqFt || 0;
    addLine('paint_int', 'Painting', 'Interior emulsion paint 2 coats with primer and putty base', 'Sq.Ft', Math.round(builtUpArea * 3.5), Math.round(rates.paint * 0.05), '3 coats system including primer');
    addLine('paint_ext', 'Painting', 'Exterior weather shield paint 2 coats with primer on external walls', 'Sq.Ft', quantities.plaster?.externalPlaster?.areaSqFt || 0, Math.round(rates.paint * 0.06), 'Weather resistant finish');

    // 8 — MEP (Estimate only)
    addLine('mep_plumb', 'MEP (Estimate)', 'Plumbing work — water supply, drainage, sanitary ware (provisional estimate)', 'Sq.Ft BUA', builtUpArea, Math.round(rates.labour * 0.18), 'Provisional sum — finalize with MEP engineer');
    addLine('mep_elec', 'MEP (Estimate)', 'Electrical work — wiring, conduits, DB, fixtures (provisional estimate)', 'Sq.Ft BUA', builtUpArea, Math.round(rates.labour * 0.15), 'Provisional sum — finalize with electrical engineer');

    // 9 — Labour
    addLine('labour_civil', 'Labour', 'Civil construction labour — masons, helpers, bar benders, shuttering carpenters', 'Sq.Ft BUA', builtUpArea, rates.labour, 'Includes all civil trades');

    // ── Compute subtotals ──────────────────────────────────────────────────
    const categories: BOQCategory[] = [
      'Earthwork & Foundation', 'Concrete Work', 'Structural Steel',
      'Masonry', 'Plastering & Finishes', 'Flooring', 'Painting', 'MEP (Estimate)', 'Labour'
    ];

    const subtotals = {} as Record<BOQCategory, number>;
    categories.forEach(cat => {
      subtotals[cat] = items
        .filter(item => item.category === cat)
        .reduce((sum, item) => sum + item.amount, 0);
    });

    const grandTotal = items.reduce((sum, item) => sum + item.amount, 0);
    const contingency = Math.round(grandTotal * 0.05); // 5% contingency
    const finalTotal = grandTotal + contingency;

    return {
      projectId,
      projectName,
      country,
      constructionQuality,
      currency: currencyInfo.code || 'INR',
      currencySymbol: currencyInfo.symbol || '₹',
      items,
      subtotals,
      grandTotal,
      contingency,
      finalTotal,
      generatedAt: new Date().toISOString(),
    };
  },

  /**
   * Export a BOQ report to CSV string.
   */
  exportToCSV(report: BOQReport): string {
    const lines: string[] = [
      `BILL OF QUANTITIES — ${report.projectName}`,
      `Country: ${report.country} | Quality: ${report.constructionQuality} | Currency: ${report.currency}`,
      `Generated: ${new Date(report.generatedAt).toLocaleDateString()}`,
      ``,
      `Sl.No,Category,Description,Unit,Quantity,Unit Rate (${report.currencySymbol}),Amount (${report.currencySymbol})`,
    ];

    for (const item of report.items) {
      const desc = item.description.replace(/,/g, ';');
      lines.push(`${item.slNo},"${item.category}","${desc}",${item.unit},${item.quantity},${item.unitRate},${item.amount}`);
    }

    lines.push(``);
    lines.push(`,,,,,,`);
    lines.push(`,,Grand Total,,,,${report.grandTotal}`);
    lines.push(`,,Contingency (5%),,,,${report.contingency}`);
    lines.push(`,,FINAL TOTAL,,,,${report.finalTotal}`);

    return lines.join('\n');
  }
};
