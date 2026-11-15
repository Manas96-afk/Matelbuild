'use client';

import React, { useRef } from 'react';
import { Project } from '../../types';
import { DigitalBuildingModel, BOQReport, ConfidenceReport, Drawing, ValidationWarning } from '../../types/blueprint';
import { QuantityEngineOutput } from '../../types/material';
import { PricingRateCard } from '../../types';
import { FileText, Printer, Download } from 'lucide-react';

interface PDFReportGeneratorProps {
  project: Project;
  drawings: Drawing[];
  buildingModel: DigitalBuildingModel | null;
  boqReport: BOQReport | null;
  confidenceReport: ConfidenceReport | null;
  quantities: QuantityEngineOutput | null;
  totalCost: number;
  currencySymbol: string;
  country: string;
}

function fmt(n: number, d = 0): string {
  return n.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });
}

function fmtAmt(n: number, sym: string): string {
  if (n >= 10_000_000) return `${sym}${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000)    return `${sym}${(n / 100_000).toFixed(2)} L`;
  if (n >= 1_000)      return `${sym}${(n / 1_000).toFixed(1)}K`;
  return `${sym}${n.toFixed(0)}`;
}

export function PDFReportGenerator({
  project,
  drawings,
  buildingModel,
  boqReport,
  confidenceReport,
  quantities,
  totalCost,
  currencySymbol,
  country,
}: PDFReportGeneratorProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!reportRef.current) return;
    const printContents = reportRef.current.innerHTML;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MatelBuild Report — ${project.projectName}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 11px; color: #1e293b; background: #fff; }
            .report-page { max-width: 900px; margin: 0 auto; padding: 32px; }
            h1 { font-size: 24px; font-weight: 900; color: #0f172a; }
            h2 { font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 24px; margin-bottom: 10px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; }
            h3 { font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 6px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 16px; }
            th { background: #0f172a; color: white; padding: 6px 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
            td { padding: 5px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            tr:hover td { background: #f8fafc; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; }
            .badge-amber { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .badge-green { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
            .badge-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
            .header-block { background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 28px 32px; border-radius: 12px; margin-bottom: 24px; }
            .logo { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
            .logo span { color: #f59e0b; }
            .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .meta-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; }
            .meta-label { font-size: 9px; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
            .meta-value { font-size: 14px; font-weight: 900; color: #0f172a; margin-top: 2px; }
            .confidence-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px; }
            .conf-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; text-align: center; }
            .warning-box { border-left: 3px solid #f59e0b; background: #fffbeb; padding: 8px 12px; margin-bottom: 8px; border-radius: 0 8px 8px 0; }
            .total-row td { background: #0f172a; color: white; font-weight: 900; font-size: 11px; }
            .section-header td { background: #f8fafc; font-weight: 800; color: #0f172a; border-top: 2px solid #e2e8f0; }
            .footer { margin-top: 32px; border-top: 2px solid #f1f5f9; padding-top: 16px; font-size: 9px; color: #94a3b8; text-align: center; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body><div class="report-page">${printContents}</div></body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
      win.close();
    }, 500);
  };

  const drawingTypeLabel: Record<string, string> = {
    architectural: 'Architectural Plan', structural: 'Structural Drawing',
    foundation: 'Foundation Plan', column_layout: 'Column Layout',
    beam_layout: 'Beam Layout', section: 'Section Drawing',
    elevation: 'Elevation Drawing', unknown: 'Unknown'
  };

  const statusLabel: Record<string, string> = {
    pending: 'Pending', analyzing: 'Analyzing', complete: 'Analyzed', failed: 'Failed'
  };

  const now = new Date();

  const [showPreview, setShowPreview] = React.useState(false);

  return (
    <div className="space-y-4">
      {/* Primary Action Card when Report is hidden */}
      <div className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-white shadow-sm text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600">
          <FileText className="h-7 w-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">Engineering Cost & Quantity Report</h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            To view or download the complete building material and cost estimation report, click the button below to generate and print your PDF document.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto flex items-center justify-center space-x-2.5 px-6 py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md"
          >
            <Printer className="h-4.5 w-4.5 text-amber-400" />
            <span>Print PDF Report</span>
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            className="w-full sm:w-auto text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            {showPreview ? 'Hide Report Preview' : 'Show Report Preview'}
          </button>
        </div>
      </div>

      {/* Report Preview - Visible only when toggled */}
      {showPreview && (
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700">Report Preview</span>
            </div>
            <span className="text-[10px] text-slate-400">A4 Print Format</span>
          </div>

          <div className="p-8 text-xs text-slate-800 max-h-[600px] overflow-y-auto">

          {/* Header */}
          <div className="header-block" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', padding: '28px 32px', borderRadius: '12px', marginBottom: '24px' }}>
            <div className="logo" style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '-0.5px' }}>Build<span style={{ color: '#f59e0b' }}>ora</span></div>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '2px' }}>AI Blueprint Analysis & Construction Estimation Report</div>
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '20px', fontWeight: 900 }}>{project.projectName}</div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                {project.plotType} · {country} · {project.quality} Quality · Generated {now.toLocaleDateString()} {now.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Section 1: Project Summary */}
          <h2>1. Project Summary</h2>
          <div className="meta-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'Plot Size', value: `${project.plotLength}×${project.plotWidth} ${project.unit}` },
              { label: 'Floors', value: project.floors.toString() },
              { label: 'Building Type', value: project.plotType },
              { label: 'Quality', value: project.quality },
              { label: 'Country', value: country },
              { label: 'Wall Type', value: project.wallType || 'Brick Masonry' },
              { label: 'Concrete Grade', value: project.rccGrade || 'M25' },
              { label: 'Drawings', value: drawings.length.toString() },
            ].map(m => (
              <div key={m.label} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</div>
                <div style={{ fontSize: '13px', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Section 2: Detected Drawings */}
          <h2>2. Detected Drawings</h2>
          {drawings.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '16px' }}>No drawings uploaded for this project.</p>
          ) : (
            <table>
              <thead><tr><th>Sl.</th><th>File Name</th><th>Type</th><th>Format</th><th>Status</th></tr></thead>
              <tbody>
                {drawings.map((d, i) => (
                  <tr key={d.id}>
                    <td>{i + 1}</td>
                    <td>{d.fileName}</td>
                    <td>{drawingTypeLabel[d.drawingType] || 'Unknown'}</td>
                    <td style={{ textTransform: 'uppercase' }}>{d.fileType}</td>
                    <td><span className={`badge ${d.analysisStatus === 'complete' ? 'badge-green' : d.analysisStatus === 'failed' ? 'badge-red' : 'badge-amber'}`}>
                      {statusLabel[d.analysisStatus]}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Section 3: Confidence Scores */}
          {confidenceReport && (
            <>
              <h2>3. Estimate Confidence Scores</h2>
              <table>
                <thead><tr><th>Metric</th><th>Score</th><th>Assessment</th></tr></thead>
                <tbody>
                  {[
                    ['Overall Confidence', confidenceReport.scores.overallConfidence],
                    ['Blueprint Quality', confidenceReport.scores.blueprintQuality],
                    ['Wall Detection', confidenceReport.scores.wallDetection],
                    ['Dimension Extraction', confidenceReport.scores.dimensionDetection],
                    ['Column Detection', confidenceReport.scores.columnDetection],
                    ['Beam Detection', confidenceReport.scores.beamDetection],
                    ['Steel Estimate', confidenceReport.scores.steelEstimate],
                    ['Foundation Analysis', confidenceReport.scores.foundationAnalysis],
                  ].map(([label, score]) => (
                    <tr key={label as string}>
                      <td>{label}</td>
                      <td><strong>{score}%</strong></td>
                      <td>
                        <span className={`badge ${(score as number) >= 90 ? 'badge-green' : (score as number) >= 75 ? 'badge-amber' : 'badge-red'}`}>
                          {(score as number) >= 90 ? 'High' : (score as number) >= 75 ? 'Medium' : 'Low'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Section 4: Detected Building Elements */}
          {buildingModel && (
            <>
              <h2>4. Detected Structural Elements</h2>
              <table>
                <thead><tr><th>Element</th><th>Count / Quantity</th><th>Key Dimension</th><th>Source</th></tr></thead>
                <tbody>
                  <tr><td>Rooms</td><td>{buildingModel.rooms.length}</td><td>Total BUA: {fmt(buildingModel.totalBUA_SqFt)} Sq.Ft</td><td>{buildingModel.rooms.some(r => !r.isAssumed) ? 'From Drawing' : 'Assumed'}</td></tr>
                  <tr><td>Walls</td><td>{buildingModel.walls.length} members</td><td>Total Wall Area: {fmt(buildingModel.totalWallArea_SqFt)} Sq.Ft</td><td>{buildingModel.walls.some(w => !w.isAssumed) ? 'From Drawing' : 'Assumed'}</td></tr>
                  <tr><td>Columns</td><td>{buildingModel.columns.length}</td><td>{buildingModel.columns[0]?.widthInch}"×{buildingModel.columns[0]?.depthInch}" ({buildingModel.concreteGrade})</td><td>{buildingModel.columns.some(c => !c.isAssumed) ? 'From Drawing' : 'Standard Grid'}</td></tr>
                  <tr><td>Beams</td><td>{buildingModel.beams.length}</td><td>{buildingModel.beams[0]?.widthInch}"×{buildingModel.beams[0]?.depthInch}" ({buildingModel.concreteGrade})</td><td>{buildingModel.beams.some(b => !b.isAssumed) ? 'From Drawing' : 'Assumed'}</td></tr>
                  <tr><td>Slabs</td><td>{buildingModel.slabs.length}</td><td>{buildingModel.slabs[0]?.thicknessInch}" thick ({buildingModel.concreteGrade})</td><td>{buildingModel.slabs.some(s => !s.isAssumed) ? 'From Drawing' : 'Standard'}</td></tr>
                  <tr><td>Staircases</td><td>{buildingModel.staircases.length}</td><td>{buildingModel.staircases[0] ? `${buildingModel.staircases[0].stepCount} steps, ${buildingModel.staircases[0].widthFt}ft wide` : 'N/A'}</td><td>Assumed</td></tr>
                </tbody>
              </table>
            </>
          )}

          {/* Section 5: Material Summary */}
          {quantities && (
            <>
              <h2>5. Material Quantity Summary</h2>
              <table>
                <thead><tr><th>Material</th><th>Quantity</th><th>Unit</th></tr></thead>
                <tbody>
                  <tr><td>Cement (Total)</td><td><strong>{fmt(quantities.summary.cementBags)}</strong></td><td>50kg Bags</td></tr>
                  <tr><td>Steel (TMT)</td><td><strong>{quantities.summary.steelMT.toFixed(2)}</strong></td><td>Metric Tonnes</td></tr>
                  <tr><td>Sand</td><td><strong>{fmt(quantities.summary.sandCFT)}</strong></td><td>CFT</td></tr>
                  <tr><td>Aggregate</td><td><strong>{fmt(quantities.summary.aggregateCFT)}</strong></td><td>CFT</td></tr>
                  <tr><td>{quantities.bricks ? 'Red Bricks' : 'AAC Blocks'}</td><td><strong>{fmt(quantities.summary.bricksCount || quantities.summary.blocksCount)}</strong></td><td>Nos</td></tr>
                  <tr><td>Paint (Total)</td><td><strong>{fmt(quantities.summary.paintLiters)}</strong></td><td>Liters</td></tr>
                  <tr><td>Tiles (Flooring)</td><td><strong>{fmt(quantities.summary.tilesSqFt)}</strong></td><td>Sq.Ft</td></tr>
                  <tr><td>Excavation</td><td><strong>{fmt(quantities.excavation.excavationVolumeCFT)}</strong></td><td>CFT</td></tr>
                </tbody>
              </table>
            </>
          )}

          {/* Section 6: BOQ Summary */}
          {boqReport && (
            <>
              <h2>6. Bill of Quantities — Summary</h2>
              <table>
                <thead><tr><th>Category</th><th style={{ textAlign: 'right' }}>Amount ({boqReport.currencySymbol})</th></tr></thead>
                <tbody>
                  {Object.entries(boqReport.subtotals).filter(([, v]) => v > 0).map(([cat, amount]) => (
                    <tr key={cat}>
                      <td>{cat}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{fmtAmt(amount, boqReport.currencySymbol)}</td>
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td style={{ background: '#0f172a', color: 'white', fontWeight: 900 }}>Grand Total</td>
                    <td style={{ background: '#0f172a', color: 'white', fontWeight: 900, textAlign: 'right' }}>{fmtAmt(boqReport.grandTotal, boqReport.currencySymbol)}</td>
                  </tr>
                  <tr>
                    <td>Contingency Allowance (5%)</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{fmtAmt(boqReport.contingency, boqReport.currencySymbol)}</td>
                  </tr>
                  <tr className="total-row">
                    <td style={{ background: '#0f172a', color: '#fbbf24', fontWeight: 900, fontSize: '12px' }}>FINAL TOTAL ESTIMATE</td>
                    <td style={{ background: '#0f172a', color: '#fbbf24', fontWeight: 900, textAlign: 'right', fontSize: '13px' }}>{fmtAmt(boqReport.finalTotal, boqReport.currencySymbol)}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}

          {/* Section 7: Warnings */}
          {confidenceReport && confidenceReport.warnings.length > 0 && (
            <>
              <h2>7. Validation Warnings</h2>
              {confidenceReport.warnings.map(w => (
                <div key={w.id} className="warning-box" style={{ borderLeft: '3px solid #f59e0b', background: '#fffbeb', padding: '8px 12px', marginBottom: '8px', borderRadius: '0 8px 8px 0' }}>
                  <strong style={{ fontSize: '11px', color: '#92400e' }}>{w.title}</strong>
                  <p style={{ fontSize: '10px', color: '#78350f', marginTop: '2px' }}>{w.message}</p>
                  <p style={{ fontSize: '10px', color: '#92400e', marginTop: '4px' }}><strong>Recommendation:</strong> {w.recommendation}</p>
                </div>
              ))}
            </>
          )}

          {/* Section 8: Engineering Assumptions */}
          {buildingModel && buildingModel.assumptions.length > 0 && (
            <>
              <h2>8. Engineering Assumptions</h2>
              <table>
                <thead><tr><th>Sl.</th><th>Assumption</th></tr></thead>
                <tbody>
                  {buildingModel.assumptions.map((a, i) => (
                    <tr key={i}><td style={{ width: '40px' }}>{i + 1}</td><td>{a}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Footer */}
          <div className="footer" style={{ marginTop: '32px', borderTop: '2px solid #f1f5f9', paddingTop: '16px', fontSize: '9px', color: '#94a3b8', textAlign: 'center' }}>
            <p><strong>MatelBuild</strong> · AI Blueprint Analysis & Construction Estimation Platform</p>
            <p style={{ marginTop: '4px' }}>This report is generated by AI analysis and engineering heuristics. Always verify with a qualified Structural Engineer before construction.</p>
            <p style={{ marginTop: '4px' }}>Generated: {now.toISOString()} · Report Version 1.0.0-MVP</p>
          </div>

        </div>
      </div>
      )}
    </div>
  );
}
