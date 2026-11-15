'use client';

import Link from 'next/link';
import Image from 'next/image';
import * as React from 'react';
import { Reveal } from '@/components/reveal';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/Button';
import { Tilt } from '@/components/tilt';
import { BlueprintGrid, ScanLine, Crosshair } from '@/components/engineering';
import {
  StructuralFrame,
  SurveyScope,
  RebarSection,
  BlueprintStack,
} from '@/components/motifs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const NAV = [
  { label: 'Platform', href: '#platform' },
  { label: 'Modules', href: '#modules' },
  { label: 'Engineering', href: '#engineering' },
  { label: 'Pricing', href: '#pricing' },
];

const MARQUEE = [
  'Material Estimation', 'BOQ Generation', 'Cost per sq.ft', 'Blueprint Intelligence',
  'GST & Wastage', 'Project Tracking', 'AI Explanations', 'Material Marketplace',
];

const FEATURES = [
  {
    k: '01', title: 'Formula Engine',
    body: 'Every quantity is computed by transparent, deterministic civil-engineering formulas — never by a model guessing numbers.',
    points: ['Residential · Commercial · Industrial', 'Wastage & GST built in', 'Full step-by-step audit trail'],
  },
  {
    k: '02', title: 'BOQ & Costing',
    body: 'Generate bill-of-quantities, cost-per-square-foot and procurement sheets in minutes, with the rigour of a senior quantity surveyor.',
    points: ['Auto BOQ from inputs', 'Live rate cards', 'Export-ready reports'],
  },
  {
    k: '03', title: 'AI, in its place',
    body: 'AI explains, summarises and answers — the engine calculates. A deliberate boundary that keeps your estimates defensible.',
    points: ['Plain-language summaries', 'Concept tutoring', 'Zero calculation risk'],
  },
];

const MODULES = [
  { name: 'Estimator', desc: 'Civil material take-offs with the formula engine.', tag: 'Core' },
  { name: 'BOQ Studio', desc: 'Build, edit and export professional BOQs.', tag: 'Core' },
  { name: 'Blueprint IQ', desc: 'Upload drawings; get structured insights.', tag: 'Intelligence' },
  { name: 'Cost Tracker', desc: 'Actual vs estimated, per stage and trade.', tag: 'Operations' },
  { name: 'Marketplace', desc: 'Source materials with live local pricing.', tag: 'Procurement' },
  { name: 'Assistant', desc: 'Ask anything; get explained, not invented.', tag: 'AI' },
];

const STATS = [
  { v: '99.4%', l: 'Estimate reproducibility' },
  { v: '₹0', l: 'AI-calculated figures' },
  { v: '3', l: 'Building typologies' },
  { v: '100%', l: 'Transparent formula audit' },
];

const SHOWCASE = [
  {
    title: 'Structural modelling',
    desc: 'Columns, beams and load paths visualised the way a drafter thinks — with live dimensions.',
    Art: StructuralFrame,
    tone: 'from-cream-100 to-cream-300',
  },
  {
    title: 'Survey & setting-out',
    desc: 'Total-station workflows, station control and grid setting-out, modelled as motion.',
    Art: SurveyScope,
    tone: 'from-cream-50 to-cream-200',
  },
  {
    title: 'RCC detailing',
    desc: 'RCC detailing cover and spacing — the details that make an estimate real.',
    Art: RebarSection,
    tone: 'from-cream-100 to-cream-300',
  },
  {
    title: 'Drawing management',
    desc: 'Blueprints, revisions and title blocks, organised like a project folder.',
    Art: BlueprintStack,
    tone: 'from-cream-50 to-cream-200',
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="grain relative min-h-screen overflow-x-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-radial-fade" />
        <div className="absolute inset-0 bg-grid-faint [background-size:46px_46px] [mask-image:radial-gradient(120%_80%_at_50%_0%,#000,transparent_70%)]" />
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--cream)_72%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="MatelBuild home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="link-underline text-sm font-medium text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="rounded-full px-5 shadow-soft">Go to Dashboard →</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] sm:block">
                  Sign in
                </Link>
                <Link href="/login">
                  <Button size="sm" className="rounded-full px-5 shadow-soft">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 pb-10 pt-20 md:pt-28">
        <Reveal className="flex justify-center">
          <span className="eyebrow animate-fade-up">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            AI-Assisted Construction OS
          </span>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="mx-auto mt-7 max-w-4xl text-center font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tightest text-gradient sm:text-6xl md:text-7xl">
            Engineering accuracy,
            <br className="hidden sm:block" /> not algorithmic guesswork.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mx-auto mt-7 max-w-2xl text-center text-lg leading-relaxed text-[var(--ink-soft)]">
            MatelBuild is the construction operating system that estimates materials, generates BOQs,
            prices projects and sources supplies — with a formula engine doing the maths and AI
            confined to explanation.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={user ? "/dashboard" : "/login"}>
              <Button size="lg" variant="glow" className="rounded-full px-7">Start estimating →</Button>
            </Link>
            <Link href="#modules">
              <Button size="lg" variant="outline" className="rounded-full border-[var(--line-strong)] px-7 text-[var(--ink)] hover:bg-[var(--cream-200)]">
                Explore the platform
              </Button>
            </Link>
          </div>
        </Reveal>

        <Reveal delay={320}>
          <p className="mt-6 text-center text-xs uppercase tracking-widest2 text-[var(--ink-soft)]">
            Trusted methodology · Transparent by design
          </p>
        </Reveal>

        {/* Hero visual — 3D tilt estimate card with construction image background */}
        <Reveal delay={380} className="mt-16">
          <div className="mx-auto max-w-4xl">
            <Tilt className="surface overflow-hidden p-2" max={6}>
              <div className="tilt-layer relative overflow-hidden rounded-xl border border-[var(--line)] bg-gradient-to-b from-[var(--paper)] to-[var(--cream-100)] p-6 md:p-8">
                {/* Background image covering extra space */}
                <div className="absolute inset-0 -z-0 opacity-50">
                  <Image
                    src="/hero_construction.png"
                    alt="MatelBuild Construction Site"
                    fill
                    className="object-cover object-center"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--paper)] via-transparent to-[var(--paper)]" />
                </div>

                <div className="relative z-10 grid gap-4 md:grid-cols-3">
                  {[
                    { label: 'Project type', value: 'RCC Residential', sub: '2,150 sq.ft · Ground+2' },
                    { label: 'Cement required', value: '1,284 bags', sub: '≈ 64.2 MT · 4% wastage' },
                    { label: 'Estimated cost', value: '₹ 41.2 L', sub: '₹ 1,917 / sq.ft' },
                  ].map((c) => (
                    <div key={c.label} className="rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-md p-5 transition-transform hover:scale-[1.02]">
                      <div className="text-xs uppercase tracking-widest2 text-[var(--ink-soft)]">{c.label}</div>
                      <div className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">{c.value}</div>
                      <div className="mt-1 text-sm text-[var(--ink-soft)]">{c.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl bg-[var(--ink)] px-5 py-3 text-[var(--paper)] shadow-lg">
                  <span className="font-mono text-xs opacity-80">formula_engine.estimate()</span>
                  <span className="text-xs opacity-60">transparent · deterministic · auditable</span>
                </div>
              </div>
            </Tilt>
          </div>
        </Reveal>
      </section>

      {/* Marquee */}
      <div className="marquee-mask relative my-16 border-y border-[var(--line)] py-5">
        <div className="marquee-track gap-10 pr-10">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap text-sm font-medium uppercase tracking-widest2 text-[var(--ink-soft)]">
              {m}
              <span className="text-brand-500">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* Platform / Features */}
      <section id="platform" className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <div className="max-w-2xl">
            <span className="eyebrow">The platform</span>
            <h2 className="mt-5 font-display text-4xl font-semibold tracking-tightest text-gradient sm:text-5xl">
              One operating system for the build.
            </h2>
            <p className="mt-4 text-lg text-[var(--ink-soft)]">
              From the first estimate to the final procurement, MatelBuild keeps every number tied to a
              formula you can inspect.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.k} delay={i * 90}>
              <Tilt className="h-full" max={6}>
                <div className="surface spotlight h-full p-7">
                  <div className="tilt-layer">
                    <div className="font-mono text-sm text-brand-600 dark:text-brand-400">{f.k}</div>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-[var(--ink)]">{f.title}</h3>
                    <p className="mt-3 text-[var(--ink-soft)]">{f.body}</p>
                    <ul className="mt-5 space-y-2 text-sm text-[var(--ink)] opacity-80">
                      {f.points.map((p) => (
                        <li key={p} className="flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-brand-500" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Engineering showcase */}
      <section id="engineering" className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="pointer-events-none absolute inset-x-0 top-10 bottom-10 -z-10 overflow-hidden rounded-3xl opacity-30">
          <Image
            src="/blueprint_workspace.png"
            alt="Architectural Blueprint Workspace"
            fill
            className="object-cover object-center"
          />
        </div>

        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="eyebrow">
                <Crosshair className="h-3.5 w-3.5 text-brand-500" /> Built like an engineer draws
              </span>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-tightest text-gradient sm:text-5xl">
                The discipline, visualised.
              </h2>
              <p className="mt-4 text-[var(--ink-soft)]">
                Structural frames, survey control, RCC detailing and drawing management — rendered as
                living motion graphics, not stock icons.
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {SHOWCASE.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <Tilt className="h-full" max={9} scale={1.015}>
                <div className={cn('surface spotlight relative h-full overflow-hidden p-7', 'bg-gradient-to-br', s.tone)}>
                  <BlueprintGrid className="opacity-40" />
                  <div className="relative flex h-52 items-center justify-center">
                    <s.Art className="max-h-full w-auto drop-shadow-[0_20px_40px_rgba(42,38,32,0.18)]" />
                  </div>
                  <div className="relative mt-5">
                    <h3 className="font-display text-xl font-semibold text-[var(--ink)]">{s.title}</h3>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">{s.desc}</p>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_55%,transparent)] py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.l} delay={i * 80} className="text-center">
              <div className="font-display text-4xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">{s.v}</div>
              <div className="mt-2 text-sm text-[var(--ink-soft)]">{s.l}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <span className="eyebrow">Modules</span>
              <h2 className="mt-5 font-display text-4xl font-semibold tracking-tightest text-gradient sm:text-5xl">
                Built for every seat on site.
              </h2>
            </div>
            <p className="max-w-sm text-[var(--ink-soft)]">
              Homeowners, engineers, contractors and architects — each with the tools their role
              demands.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <Reveal key={m.name} delay={i * 70}>
              <Tilt className="h-full" max={8}>
                <div className="surface group h-full p-6">
                  <div className="tilt-layer flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold text-[var(--ink)]">{m.name}</h3>
                    <span className="rounded-full border border-[var(--line-strong)] px-2.5 py-0.5 text-[11px] uppercase tracking-widest2 text-[var(--ink-soft)]">{m.tag}</span>
                  </div>
                  <p className="tilt-layer mt-3 text-sm text-[var(--ink-soft)]">{m.desc}</p>
                  <Link href="/dashboard" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-brand-400">
                    Open module →
                  </Link>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <Reveal>
          <div className="surface spotlight relative overflow-hidden rounded-2xl border border-[var(--line)] px-8 py-16 text-center sm:px-16">
            <div className="pointer-events-none absolute inset-0 -z-0 opacity-95">
              <Image
                src="/materials_site.png"
                alt="Construction materials site"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--paper)] via-[color-mix(in_srgb,var(--paper)_70%,transparent)] to-[var(--paper)]" />
            </div>

            <ScanLine className="absolute inset-x-0 top-0 h-px" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
            <h2 className="relative z-10 mx-auto max-w-2xl font-display text-4xl font-semibold tracking-tightest text-gradient sm:text-5xl">
              Estimate your first project today.
            </h2>
            <p className="relative z-10 mx-auto mt-4 max-w-xl text-[var(--ink-soft)]">
              No spreadsheets, no guesswork. Open MatelBuild and let the formula engine do the maths.
            </p>
            <div className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={user ? "/dashboard" : "/login"}>
                <Button size="lg" variant="glow" className="rounded-full px-8">Get started free</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="rounded-full border-[var(--line-strong)] px-8 text-[var(--ink)] hover:bg-[var(--cream-200)]">Book a demo</Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-4 text-sm text-[var(--ink-soft)]">
                The AI-assisted construction operating system. Engineering accuracy over
                algorithmic guesswork.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              {[
                { h: 'Product', items: ['Estimator', 'BOQ Studio', 'Blueprint IQ', 'Marketplace'] },
                { h: 'Company', items: ['About', 'Methodology', 'Careers', 'Contact'] },
                { h: 'Resources', items: ['Docs', 'Formula Engine', 'Changelog', 'Status'] },
              ].map((col) => (
                <div key={col.h}>
                  <div className="text-xs uppercase tracking-widest2 text-[var(--ink-soft)]">{col.h}</div>
                  <ul className="mt-4 space-y-2 text-sm text-[var(--ink-soft)]">
                    {col.items.map((it) => (
                      <li key={it}>
                        <a href="#" className="link-underline hover:text-[var(--ink)]">{it}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="hairline my-10" />
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-[var(--ink-soft)] sm:flex-row">
            <span>© {new Date().getFullYear()} MatelBuild. All rights reserved.</span>
            <span className="font-mono">Engineering accuracy · AI in its place</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
