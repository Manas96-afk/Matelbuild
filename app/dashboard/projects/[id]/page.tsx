'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth';
import { db } from '../../../../lib/db';
import { runEstimationEngine } from '../../../../lib/estimation/calculations';
import { PricingEngine } from '../../../../lib/pricing/pricingEngine';
import { CostEngine } from '../../../../lib/cost/costEngine';
import { CurrencyConfig } from '../../../../lib/pricing/countryRates';
import { BOQEngine } from '../../../../lib/boq/boqEngine';
import { analyzeDrawing, generateConfidenceReport } from '../../../../lib/ai/blueprintAnalyzer';
import { parseToBuildingModel } from '../../../../lib/ai/parser/buildingModelParser';
import { Project, PricingMode } from '../../../../types';
import { Drawing, DrawingAnalysis, DigitalBuildingModel, BOQReport, ConfidenceReport, ValidationWarning } from '../../../../types/blueprint';
import { DrawingWithPreviews, BlueprintAnalyzer } from '../../../../components/projects/BlueprintAnalyzer';
import { EstimationResults } from '../../../../components/projects/EstimationResults';
import { PDFReportGenerator } from '../../../../components/projects/PDFReportGenerator';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/Card';
import { Button } from '../../../../components/ui/Button';
import {
  ArrowLeft, Loader2, AlertCircle, LayoutDashboard, FileText, CheckCircle, UploadCloud, Sparkles, ScanLine
} from 'lucide-react';

// ─── Tab definitions ──────────────────────────────────────────────────────────
type TabId = 'overview' | 'report';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  { id: 'report', label: 'Report / PDF', icon: <FileText className="h-3.5 w-3.5" /> },
];

function generateId(): string {
  return 'id-' + Math.random().toString(36).substring(2, 11);
}

export default function ProjectDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // ── Project & tab state ───────────────────────────────────────────────────
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // ── Blueprint analysis state ───────────────────────────────────────────────
  const [drawings, setDrawings] = useState<DrawingWithPreviews[]>([]);
  const [analyses, setAnalyses] = useState<DrawingAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [buildingModel, setBuildingModel] = useState<DigitalBuildingModel | null>(null);
  const [boqReport, setBoqReport] = useState<BOQReport | null>(null);
  const [confidenceReport, setConfidenceReport] = useState<ConfidenceReport | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [modelConfirmed, setModelConfirmed] = useState(false);

  // ── Load project & persisted state ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      if (!user || !id) return;
      try {
        setLoading(true);
        const [proj, savedDrawings, savedAnalyses, savedModel] = await Promise.all([
          db.getProjectById(id, user.id),
          db.getDrawings(id),
          db.getDrawingAnalyses(id),
          db.getDigitalBuildingModel(id),
        ]);

        if (!proj) {
          setError('Project not found or you do not have access to it.');
          return;
        }

        setProject(proj);
        // Restore drawings from DB — previewImages are client-only so we re-build
        // them from fileDataUrl on load (single-page only; multi-page re-conversion
        // would require re-uploading the original PDF, which is expected UX)
        const drawingsWithPreviews: DrawingWithPreviews[] = savedDrawings.map(d => ({
          ...d,
          previewImages: d.fileDataUrl ? [d.fileDataUrl] : [],
        }));
        setDrawings(drawingsWithPreviews);
        setAnalyses(savedAnalyses);
        if (savedModel) {
          setBuildingModel(savedModel);
          setAnalysisComplete(true);
          // Default confirmed to true if it exists, unless explicitly set to false
          const confirmed = localStorage.getItem(`buildora_model_confirmed_${id}`) !== 'false';
          setModelConfirmed(confirmed);
          // Regenerate BOQ and confidence from saved model
          await regenerateDerivedReports(proj, savedDrawings, savedAnalyses, savedModel);
        }
      } catch (err) {
        console.error('Failed to load project:', err);
        setError('An error occurred while loading project data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, user]);

  // ── Persist drawings when changed (strip previewImages — client-only) ──────
  useEffect(() => {
    if (!id || drawings.length === 0) return;
    // Strip previewImages before saving to DB (they're large and client-only)
    const toSave: Drawing[] = drawings.map(({ previewImages: _p, ...d }) => d as Drawing);
    db.saveAllDrawings(id, toSave);
  }, [drawings, id]);

  // ── Regenerate BOQ + Confidence from existing data ────────────────────────
  const regenerateDerivedReports = useCallback(async (
    proj: Project,
    drws: (Drawing & { previewImages?: string[] })[],
    anlys: DrawingAnalysis[],
    model: DigitalBuildingModel
  ) => {
    if (!proj) return;

    const country = proj.country || 'India';
    let mode: PricingMode = 'Standard';
    if (proj.quality === 'Economy') mode = 'Economy';
    else if (proj.quality === 'Premium') mode = 'Premium';
    else if (proj.quality === 'Luxury') mode = 'Luxury';

    const estimation = runEstimationEngine(proj, proj);
    const rates = PricingEngine.resolveRatesSync({ country }, mode);
    const wallTypeStr = proj.wallType?.includes('AAC') ? 'AAC' : 'Brick';

    const boq = BOQEngine.generateBOQReport(
      proj.id, proj.projectName, country, proj.quality,
      estimation.quantities, rates, wallTypeStr
    );
    setBoqReport(boq);

    // Collect warnings from model
    const warnings: ValidationWarning[] = [];
    const uploadedTypes = drws.map(d => d.drawingType);
    if (!uploadedTypes.includes('structural')) {
      warnings.push({
        id: 'w-no-struct', severity: 'warning', category: 'missing_drawing',
        title: 'Structural Drawing Missing',
        message: 'Steel estimates use engineering thumb rules (not actual reinforcement schedules).',
        recommendation: 'Upload a structural RCC drawing for accurate steel quantities.'
      });
    }
    if (!uploadedTypes.includes('foundation')) {
      warnings.push({
        id: 'w-no-fnd', severity: 'info', category: 'missing_drawing',
        title: 'Foundation Drawing Missing',
        message: 'Foundation quantities based on standard isolated footing assumptions.',
        recommendation: 'Upload a foundation plan for exact excavation and footing quantities.'
      });
    }
    if (!uploadedTypes.includes('architectural')) {
      warnings.push({
        id: 'w-no-arch', severity: 'warning', category: 'missing_drawing',
        title: 'Architectural Plan Missing',
        message: 'Room layout generated from project inputs, not an actual floor plan.',
        recommendation: 'Upload an architectural floor plan for room-by-room traceability.'
      });
    }

    const conf = generateConfidenceReport(proj.id, drws, anlys, warnings);
    setConfidenceReport(conf);
  }, []);

  // ── Analyze all pending drawings ──────────────────────────────────────────
  const handleAnalyzeAll = useCallback(async () => {
    if (!project || isAnalyzing) return;
    setIsAnalyzing(true);

    try {
      const pendingDrawings = drawings.filter(d => d.analysisStatus === 'pending');
      if (pendingDrawings.length === 0) { setIsAnalyzing(false); return; }

      // Mark all as analyzing
      const updatedDrawings = drawings.map(d =>
        d.analysisStatus === 'pending' ? { ...d, analysisStatus: 'analyzing' as const } : d
      );
      setDrawings(updatedDrawings);

      const plotLengthFt = project.unit === 'Meter' ? project.plotLength * 3.281 : project.plotLength;
      const plotWidthFt  = project.unit === 'Meter' ? project.plotWidth  * 3.281 : project.plotWidth;

      // Analyze each drawing sequentially
      const newAnalyses: DrawingAnalysis[] = [...analyses];
      const finalDrawings = [...updatedDrawings];

      for (const drawing of pendingDrawings) {
        try {
          // Extract base64 and mimeType from fileDataUrl (page 1, used for single-image path)
          let imageBase64: string | undefined;
          let imageMimeType: 'image/png' | 'image/jpeg' | 'image/jpg' | 'image/webp' | undefined;
          if (drawing.fileDataUrl) {
            const match = drawing.fileDataUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (match) {
              const rawMime = match[1] as string;
              imageBase64 = match[2];
              if (rawMime === 'image/png') imageMimeType = 'image/png';
              else if (rawMime === 'image/jpeg' || rawMime === 'image/jpg') imageMimeType = 'image/jpeg';
              else if (rawMime === 'image/webp') imageMimeType = 'image/webp';
              else imageMimeType = 'image/png';
            }
          }

          // For multi-page PDFs: extract raw base64 (no data:… prefix) from every preview image
          let allPageBase64: string[] | undefined;
          if (drawing.previewImages && drawing.previewImages.length > 1) {
            allPageBase64 = drawing.previewImages
              .map(dataUrl => {
                const m = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
                return m ? m[1] : '';
              })
              .filter(Boolean);
          }

          const analysis = await analyzeDrawing({
            projectId: project.id,
            drawing,
            plotLengthFt,
            plotWidthFt,
            floors: project.floors,
            buildingType: project.plotType,
            imageBase64,
            imageMimeType,
            allPageBase64,
          });
          newAnalyses.push(analysis);
          await db.saveDrawingAnalysis(analysis);

          // Mark drawing as complete
          const idx = finalDrawings.findIndex(d => d.id === drawing.id);
          if (idx !== -1) {
            finalDrawings[idx] = { ...finalDrawings[idx], analysisStatus: 'complete', analyzedAt: new Date().toISOString() };
          }
          setDrawings([...finalDrawings]);
          setAnalyses([...newAnalyses]);
        } catch (err) {
          const idx = finalDrawings.findIndex(d => d.id === drawing.id);
          if (idx !== -1) {
            finalDrawings[idx] = { ...finalDrawings[idx], analysisStatus: 'failed' };
          }
          setDrawings([...finalDrawings]);
        }
      }

      // Save final drawings state (strip client-only previewImages)
      const finalDrawingsForDB = finalDrawings.map(({ previewImages: _p, ...d }) => d as Drawing);
      await db.saveAllDrawings(project.id, finalDrawingsForDB);

      // Parse to building model
      const wallType = project.wallType?.includes('AAC') ? 'aac' : 'brick';
      const { model, warnings } = parseToBuildingModel({
        projectId: project.id,
        projectName: project.projectName,
        plotLengthFt,
        plotWidthFt,
        floors: project.floors,
        floorHeightFt: project.floorHeight || 10,
        wallType,
        concreteGrade: project.rccGrade || 'M25',
        buildingType: project.plotType as 'Residential' | 'Commercial' | 'Mixed Use',
        constructionQuality: project.quality as 'Economy' | 'Standard' | 'Premium' | 'Luxury',
        bedrooms: project.bedrooms,
        bathrooms: project.bathrooms,
        kitchens: project.kitchens,
        livingRooms: project.livingRooms,
        balconies: project.balconies,
        parkingRequired: project.parkingRequired,
        drawings: finalDrawings as Drawing[],
        analyses: newAnalyses,
      });

      await db.saveDigitalBuildingModel(model);
      setBuildingModel(model);
      setAnalysisComplete(true);

      await regenerateDerivedReports(project, finalDrawings, newAnalyses, model);

      // Switch to overview after analysis
      setActiveTab('overview');
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [project, drawings, analyses, isAnalyzing, regenerateDerivedReports]);

  // ── Handle building model update ──────────────────────────────────────────
  const handleModelUpdate = useCallback(async (updated: DigitalBuildingModel) => {
    setBuildingModel(updated);
    await db.saveDigitalBuildingModel(updated);
    if (project) {
      await regenerateDerivedReports(project, drawings, analyses, updated);
    }
  }, [project, drawings, analyses, regenerateDerivedReports]);

  // ── Compute cost for display ──────────────────────────────────────────────
  const { estimation, costEst, currencyInfo } = React.useMemo(() => {
    if (!project) return { estimation: null, costEst: null, currencyInfo: null };
    const country = project.country || 'India';
    let mode: PricingMode = 'Standard';
    if (project.quality === 'Economy') mode = 'Economy';
    else if (project.quality === 'Premium') mode = 'Premium';
    else if (project.quality === 'Luxury') mode = 'Luxury';
    const est = runEstimationEngine(project, project);
    const rates = PricingEngine.resolveRatesSync({ country }, mode);
    const cost = CostEngine.calculateCost(est.quantities, rates, est.builtUpAreaSqFt, { country }, mode);
    const ci = (CurrencyConfig as any)[country] || { code: 'INR', symbol: '₹' };
    return { estimation: est, costEst: cost, currencyInfo: ci };
  }, [project]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3.5">
        <Loader2 className="h-8 w-8 text-slate-900 animate-spin" />
        <p className="text-xs font-bold text-slate-500 tracking-wider uppercase animate-pulse">Loading Project...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <Card className="max-w-md mx-auto mt-12">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-slate-800 text-lg">Project Not Found</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-xs text-slate-500">{error || 'The requested project could not be found.'}</p>
          <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-slate-950 hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard
          </Link>
        </CardContent>
      </Card>
    );
  }

  const country = project.country || 'India';
  const currSym = currencyInfo?.symbol || '₹';

  return (
    <div className="space-y-5">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
        <div className="space-y-1">
          <Link href="/dashboard" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{project.projectName}</h1>
          <p className="text-xs text-slate-500">
            {project.plotLength}×{project.plotWidth} {project.unit} · {project.floors} Floor{project.floors > 1 ? 's' : ''} · {project.quality} Quality · {country}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Analysis status badge */}
          {analysisComplete ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>AI Analyzed</span>
            </span>
          ) : drawings.length > 0 ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{drawings.length} Drawing{drawings.length > 1 ? 's' : ''} Ready to Analyze</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>No Blueprints</span>
            </span>
          )}
        </div>
      </div>

      {/* ── Tab Bar ────────────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto print:hidden">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            <span className={activeTab === tab.id ? 'text-amber-500' : ''}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      <div className="min-h-[400px]">
        {/* TAB 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <EstimationResults project={project} onEdit={() => {}} />
          </div>
        )}



        {/* TAB 3: Report / PDF */}
        {activeTab === 'report' && (
          <div>
            <PDFReportGenerator
              project={project}
              drawings={drawings}
              buildingModel={buildingModel}
              boqReport={boqReport}
              confidenceReport={confidenceReport}
              quantities={estimation?.quantities || null}
              totalCost={costEst?.totalCost || 0}
              currencySymbol={currSym}
              country={country}
            />
          </div>
        )}
      </div>
    </div>
  );
}
