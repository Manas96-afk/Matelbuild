  'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';
import { db } from '../../lib/db';
import { runEstimationEngine } from '../../lib/estimation/calculations';
import { PricingEngine } from '../../lib/pricing/pricingEngine';
import { CostEngine } from '../../lib/cost/costEngine';
import { CurrencyConfig } from '../../lib/pricing/countryRates';
import { Project, PricingMode } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatNumber, formatCurrency } from '../../lib/utils';
import { Tilt } from '../../components/tilt';
import { Reveal } from '../../components/reveal';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Calculator,
  HardHat,
  Ruler,
  Boxes,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  Banknote,
  Building2,
  Sparkles
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Deletion Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch recent projects
  useEffect(() => {
    async function loadProjects() {
      if (!user) return;
      try {
        setLoading(true);
        console.log('DEBUG: calling getProjects with user:', user);
        const data = await db.getProjects(user.id);
        setProjects(data);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [user]);

  const totalProjects = projects.length;
  
  // Calculate BUA in Sq.Ft. and other aggregates
  const totalBUASqFt = projects.reduce((acc, proj) => {
    const estimation = runEstimationEngine(proj, proj);
    return acc + estimation.builtUpAreaSqFt;
  }, 0);

  const totalCementBags = projects.reduce((acc, proj) => {
    const estimation = runEstimationEngine(proj, proj);
    return acc + estimation.quantities.summary.cementBags;
  }, 0);

  const totalSteelMT = projects.reduce((acc, proj) => {
    const estimation = runEstimationEngine(proj, proj);
    return acc + estimation.quantities.summary.steelMT;
  }, 0);

  const totalSandCFT = projects.reduce((acc, proj) => {
    const estimation = runEstimationEngine(proj, proj);
    return acc + estimation.quantities.summary.sandCFT;
  }, 0);

  const totalAggregateCFT = projects.reduce((acc, proj) => {
    const estimation = runEstimationEngine(proj, proj);
    return acc + estimation.quantities.summary.aggregateCFT;
  }, 0);

  // Calculate sum of budgets (converted roughly to INR for metric summary comparison)
  const totalEstimatedCostINR = projects.reduce((acc, proj) => {
    const estimation = runEstimationEngine(proj, proj);
    const country = proj.country || 'India';
    let mode: PricingMode = 'Standard';
    if (proj.quality === 'Economy' || (proj.quality as any) === 'Basic') mode = 'Economy';
    else if (proj.quality === 'Premium') mode = 'Premium';
    else if (proj.quality === 'Luxury') mode = 'Luxury';

    const rates = PricingEngine.resolveRatesSync({ country }, mode);
    const costEst = CostEngine.calculateCost(
      estimation.quantities,
      rates,
      estimation.builtUpAreaSqFt,
      { country },
      mode
    );

    let multiplier = 1.0;
    if (country === 'USA') multiplier = 83.5;
    else if (country === 'UK') multiplier = 106.0;
    else if (country === 'UAE') multiplier = 22.7;
    else if (country === 'Australia') multiplier = 55.4;
    else if (country === 'Canada') multiplier = 61.2;

    return acc + (costEst.totalCost * multiplier);
  }, 0);

  const triggerDeleteConfirm = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!user || !projectToDelete) return;
    setDeleteLoading(true);
    try {
      const success = await db.deleteProject(projectToDelete.id, user.id);
      if (success) {
        setProjects(projects.filter((p) => p.id !== projectToDelete.id));
        setDeleteModalOpen(false);
        setProjectToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome header section */}
      <Reveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              Executive Workspace
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tightest text-gradient sm:text-4xl">
              Welcome, {user?.name || 'Builder'}
            </h1>
            <p className="mt-1.5 text-sm text-[var(--ink-soft)]">
              Review civil engineering estimates, material takeoffs, and project budgets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard/projects/new">
              <Button size="md" variant="glow" className="rounded-full px-6 shadow-glow">
                <Plus className="mr-1.5 h-4 w-4" />
                <span>New Project</span>
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Reveal delay={60}>
          <Tilt max={6} className="h-full">
            <div className="surface spotlight h-full p-6">
              <div className="tilt-layer">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest2 text-[var(--ink-soft)]">Active Projects</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Calculator className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 font-display text-3xl font-semibold text-[var(--ink)]">
                  {totalProjects}
                </div>
                <p className="mt-1.5 text-xs text-[var(--ink-soft)]">Active project specifications</p>
              </div>
            </div>
          </Tilt>
        </Reveal>

        <Reveal delay={120}>
          <Tilt max={6} className="h-full">
            <div className="surface spotlight h-full p-6">
              <div className="tilt-layer">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest2 text-[var(--ink-soft)]">Total Built-up Area</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <Ruler className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 font-display text-3xl font-semibold text-[var(--ink)]">
                  {formatNumber(totalBUASqFt, 0)} <span className="text-base font-normal text-[var(--ink-soft)]">sq.ft</span>
                </div>
                <p className="mt-1.5 text-xs text-[var(--ink-soft)]">≈ {formatNumber(totalBUASqFt / 9, 1)} sq.gaj combined</p>
              </div>
            </div>
          </Tilt>
        </Reveal>

        <Reveal delay={180}>
          <Tilt max={6} className="h-full">
            <div className="surface spotlight h-full p-6">
              <div className="tilt-layer">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest2 text-[var(--ink-soft)]">Cement Required</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Boxes className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 font-display text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatNumber(totalCementBags, 0)} <span className="text-base font-normal text-[var(--ink-soft)]">bags</span>
                </div>
                <p className="mt-1.5 text-xs text-[var(--ink-soft)]">Across all structural designs</p>
              </div>
            </div>
          </Tilt>
        </Reveal>

        <Reveal delay={240}>
          <Tilt max={6} className="h-full">
            <div className="surface spotlight h-full p-6">
              <div className="tilt-layer">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest2 text-[var(--ink-soft)]">Estimated Budget</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Banknote className="h-4.5 w-4.5" />
                  </div>
                </div>
                <div className="mt-4 font-display text-3xl font-semibold text-brand-600 dark:text-brand-400">
                  {formatCurrency(totalEstimatedCostINR, 'INR')}
                </div>
                <p className="mt-1.5 text-xs text-[var(--ink-soft)]">Unified valuation (INR basis)</p>
              </div>
            </div>
          </Tilt>
        </Reveal>
      </div>

      {/* Notice Banner */}
      <Reveal delay={280}>
        <div className="surface spotlight flex items-center space-x-3.5 p-4 text-xs">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-500 flex-shrink-0" />
          <p className="text-[var(--ink-soft)]">
            <strong className="text-[var(--ink)]">Engineering Notice:</strong> Quantities are computed using deterministic civil engineering formulas (IS 456 / IS 1200). Actual site wastage & local vendor rates can be adjusted per project.
          </p>
        </div>
      </Reveal>

      {/* Main Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Projects List (2 cols) */}
        <Reveal className="lg:col-span-2">
          <div className="surface h-full p-6">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-[var(--ink)]">Project Estimates</h3>
                <p className="mt-0.5 text-xs text-[var(--ink-soft)]">Click a project card for BOQ & quantity breakdown</p>
              </div>
              <span className="eyebrow">History</span>
            </div>

            <div className="mt-4 divide-y divide-[var(--line)]">
              {loading ? (
                <div className="py-12 text-center text-xs uppercase tracking-widest2 text-[var(--ink-soft)] animate-pulse">
                  Loading estimates…
                </div>
              ) : projects.length === 0 ? (
                <div className="py-16 text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--paper)]">
                    <HardHat className="h-6 w-6 text-[var(--ink-soft)]" />
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-[var(--ink)]">No Projects Found</h4>
                    <p className="mt-1 text-xs text-[var(--ink-soft)] max-w-xs mx-auto">
                      Create your first project specification to generate a full material BOQ report.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link href="/dashboard/projects/new">
                      <Button variant="glow" size="sm" className="rounded-full px-6">Create New Project</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                projects.map((proj) => {
                  const estimation = runEstimationEngine(proj, proj);
                  const country = proj.country || 'India';
                  let mode: PricingMode = 'Standard';
                  if (proj.quality === 'Economy' || (proj.quality as any) === 'Basic') mode = 'Economy';
                  else if (proj.quality === 'Premium') mode = 'Premium';
                  else if (proj.quality === 'Luxury') mode = 'Luxury';

                  const rates = PricingEngine.resolveRatesSync({ country }, mode);
                  const costEst = CostEngine.calculateCost(
                    estimation.quantities,
                    rates,
                    estimation.builtUpAreaSqFt,
                    { country },
                    mode
                  );
                  const currencyInfo = CurrencyConfig[country] || CurrencyConfig['India'];

                  return (
                    <Link
                      key={proj.id}
                      href={`/dashboard/projects/${proj.id}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between py-4 transition-all duration-200 hover:px-2 rounded-xl"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center space-x-2.5">
                          <h4 className="font-display text-base font-semibold text-[var(--ink)] group-hover:text-brand-600 transition-colors truncate">
                            {proj.projectName}
                          </h4>
                          <span className="rounded-full border border-[var(--line)] bg-[var(--cream-2)] px-2 py-0.5 font-mono text-[10px] uppercase text-[var(--ink-soft)]">
                            {country}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--ink-soft)]">
                          {proj.plotLength}×{proj.plotWidth} {proj.unit} &bull; {proj.floors} Floor{proj.floors > 1 ? 's' : ''} &bull; {mode} finish
                        </p>
                      </div>

                      <div className="mt-3 sm:mt-0 flex items-center justify-between sm:justify-end gap-5 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-display text-base font-semibold text-brand-600 dark:text-brand-400">
                            {formatCurrency(costEst.totalCost, currencyInfo.code as any)}
                          </span>
                          <p className="text-[11px] text-[var(--ink-soft)]">
                            BUA: {formatNumber(estimation.builtUpAreaDisplay, 1)} Sq.{proj.unit === 'Meter' ? 'm' : 'ft'}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--paper)] text-[var(--ink-soft)] group-hover:border-brand-500 group-hover:text-brand-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </div>
                          <button
                            onClick={(e) => triggerDeleteConfirm(proj, e)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </Reveal>

        {/* Combined Inventory Side Panel */}
        <Reveal delay={120} className="lg:col-span-1">
          <div className="surface h-full p-6">
            <div className="border-b border-[var(--line)] pb-4">
              <h3 className="font-display text-xl font-semibold text-[var(--ink)]">Inventory Summary</h3>
              <p className="mt-0.5 text-xs text-[var(--ink-soft)]">Aggregate quantities across all active designs</p>
            </div>

            <div className="mt-5 space-y-3">
              {/* Cement */}
              <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] p-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="h-2 w-2 rounded-full bg-brand-500" />
                  <span className="text-xs font-medium text-[var(--ink)]">Total Cement</span>
                </div>
                <span className="font-display text-sm font-semibold text-[var(--ink)]">{formatNumber(totalCementBags, 0)} Bags</span>
              </div>

              {/* Steel */}
              <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] p-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-[var(--ink)]">Total Steel</span>
                </div>
                <span className="font-display text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatNumber(totalSteelMT, 2)} MT</span>
              </div>

              {/* Sand */}
              <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] p-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="h-2 w-2 rounded-full bg-gold" />
                  <span className="text-xs font-medium text-[var(--ink)]">Total Sand</span>
                </div>
                <span className="font-display text-sm font-semibold text-[var(--ink)]">{formatNumber(totalSandCFT, 0)} CFT</span>
              </div>

              {/* Aggregate */}
              <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_80%,transparent)] p-3.5">
                <div className="flex items-center space-x-2.5">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-xs font-medium text-[var(--ink)]">Total Aggregates</span>
                </div>
                <span className="font-display text-sm font-semibold text-[var(--ink)]">{formatNumber(totalAggregateCFT, 0)} CFT</span>
              </div>

              <div className="mt-4 rounded-xl border border-[var(--line)] bg-[var(--cream-2)] p-3.5 flex items-start space-x-3">
                <Layers className="h-4 w-4 text-[var(--ink-soft)] flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
                  Use the individual project cards to view and print official itemized BOQs with live rate cards.
                </p>
              </div>
            </div>
          </div>
        </Reveal>

      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          if (!deleteLoading) {
            setDeleteModalOpen(false);
            setProjectToDelete(null);
          }
        }}
        title="Delete Project Estimate"
        footer={
          <>
            <Button
              variant="outline"
              disabled={deleteLoading}
              onClick={() => {
                setDeleteModalOpen(false);
                setProjectToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteLoading}
              onClick={handleDelete}
            >
              Delete Project
            </Button>
          </>
        }
      >
        <div className="flex items-start space-x-3.5 p-2">
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-[var(--ink)]">Are you sure you want to delete this project?</p>
            <p className="text-xs text-[var(--ink-soft)]">
              Deleting <span className="font-semibold text-[var(--ink)]">{projectToDelete?.projectName}</span> will permanently wipe its structural parameters and material estimates. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
