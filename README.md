<div align="center">

# 🏗️ Matelbuild

**Next-Generation Civil Engineering Quantity Estimation & AI Blueprint Analysis Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

<br />

<p align="center">
  <img src="public/hero_construction.png" alt="Matelbuild Banner" width="90%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

<p align="center">
  <b>Eliminate estimation guesswork. Accelerate architectural workflows. Built for civil engineers, estimators, and contractors.</b>
</p>

[Explore Features](#-key-features) •
[Tech Stack](#-tech-stack) •
[Quickstart](#-getting-started) •
[Project Structure](#-project-structure)

</div>

---

## 🌟 Overview

**Matelbuild** is an enterprise-ready civil engineering estimation suite and architectural drawing analyzer. By bridging standard civil engineering coefficients with computer vision algorithms, Matelbuild enables instant material takeoffs (concrete, reinforcement steel, masonry, excavation, and finishes) directly from user specifications and floor plans.

---

## 🚀 Key Features

### 📐 1. Unified Quantity Estimation Engine
Calculates exact material volumes, weights, and costs adhering to standard civil construction benchmarks:

* **Site Excavation & Earthwork**: Computes footing pit depths, slope factors, and soil excavation volumes based on soil bearing capacity and floor requirements.
* **Plain Cement Concrete (PCC)**: High-accuracy foundation mud-mat volume calculations.
* **Reinforced Cement Concrete (RCC)**: Comprehensive structural element engine covering isolated footings, columns, grade beams, roof slabs, and staircases. Dynamically outputs cement bags, fine aggregate (sand), coarse aggregate, and steel reinforcement tonnage.
* **Masonry Systems**: Flexible estimation for traditional **Brickwork** (9" external / 4.5" internal) and modern **AAC Lightweight Blocks** (6") with customizable mortar ratios and wastage factors.
* **Architectural Finishes**: Surface area estimation for wall plastering (internal & external), primer/paint coverage, and flooring tile counts.

<p align="center">
  <img src="public/materials_site.png" alt="Materials and Estimation" width="85%" style="border-radius: 8px;" />
</p>

---

### 🤖 2. AI-Powered Blueprint & Floor Plan Analyzer
Parses architectural drawings to digitize manual takeoff procedures:

* **Automated Component Detection**: Computer vision models detect walls, column positions, room partitions, and door/window openings.
* **Spatial Dimension Extractor**: Reads labeled dimension strings and computes wall thicknesses and room clearances.
* **Confidence Engine**: Flags unverified or low-confidence boundaries for human-in-the-loop validation.
* **Interactive Canvas Editor**: Modify detected bounding boxes, adjust room labels, and tune material schedules visually.
* **Civil AI Assistant**: Conversational assistant to query material requirements, structural tips, and layout optimizations.

<p align="center">
  <img src="public/blueprint_workspace.png" alt="AI Blueprint Workspace" width="85%" style="border-radius: 8px;" />
</p>

---

### 📊 3. Construction Progress Tracker & Variance Audit
Prevent project cost overruns with real-time site tracking:

* **Milestone Timelines**: Track progression across stages: *Excavation &rarr; Substructure &rarr; Superstructure &rarr; Finishes*.
* **Material Variance Engine**: Flags alerts whenever site material consumption exceeds theoretical calculations (e.g., steel overconsumption or mortar wastage warnings).

---

### 💼 4. Vendor Marketplace & Bill of Quantities (BOQ)
* **Automated BOQ Generation**: Instant generation of standardized tender sheets for client presentation.
* **Marketplace Dispatch**: Dispatch generated BOQ packets directly to local contractors and verified suppliers for competitive bids.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), PostCSS |
| **Icons & UI** | [Lucide React](https://lucide.dev/), Custom Engineering Motifs & Canvas Overlays |
| **Database & Auth**| [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security) |
| **Document Processing**| [PDF.js](https://mozilla.github.io/pdf.js/) for CAD and PDF architectural sheet rendering |

---

## 📦 Project Structure

```bash
Matelbuild/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── (auth)/           # Authentication (Login, Signup, Password Recovery)
│   ├── ai-floor-plan/    # Interactive AI drawing parser and canvas editor
│   ├── dashboard/        # Central projects hub and analytics metrics
│   ├── marketplace/      # Supplier and contractor bidding board
│   └── progress-tracker/ # Milestone tracking and variance audit log
├── components/           # Reusable UI component library
│   ├── ai/               # AI Assistant dialogue and blueprint modals
│   ├── dashboard/        # Metric cards, SVG charts, headers, and sidebars
│   ├── projects/         # BOQ generators, calculators, and export tools
│   └── ui/               # Buttons, form controls, cards, and modal dialogs
├── lib/                  # Civil engineering logic & calculations
│   ├── ai/               # Vision prompts, symbol knowledge bases, classifiers
│   ├── calculations/     # Civil formulas (excavation, RCC, PCC, masonry, finishes)
│   ├── cost/             # Labor tariffs and project budgeting engines
│   ├── db/               # Supabase database clients, schema, and queries
│   ├── estimation/       # Consolidated estimation orchestrators
│   └── pricing/          # Regional material rates database
├── public/               # Static visual media, blueprints, and diagrams
└── types/                # Strict TypeScript interfaces for projects, estimates & BOQs
```

---

## ⚡ Getting Started

### Prerequisites

* **Node.js**: `v18.0.0` or higher
* **Package Manager**: `npm` (or `pnpm` / `yarn`)
* **Supabase Account**: A free Supabase project for database and authentication

### 1. Clone the Repository

```bash
git clone https://github.com/Manas96-afk/Matelbuild.git
cd Matelbuild
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Database

Apply the SQL schema found in [`lib/db/schema.sql`](lib/db/schema.sql) in your **Supabase SQL Editor** to initialize the required tables and security policies.

### 4. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Launch the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License

This project is licensed under the MIT License - feel free to use and adapt for your civil and architectural engineering workflows.
