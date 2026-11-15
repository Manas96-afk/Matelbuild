# Metalbuild 🏗️

Metalbuild is a modern web application designed for professional building estimators, architects, developers, and contractors. It facilitates accurate, real-time civil engineering material quantity estimation, cost budgeting, and AI-powered architectural blueprint analysis.

---

## 🚀 Key Features

### 1. Unified Quantity Estimation Engine
Calculates precise material requirements and cost assessments using standard civil construction coefficients. The logic resides in:
* **Area & Footing Excavation**: Processes plot dimensions in feet/meters and soil excavation depths depending on the floors and soil bearing capacity ([lib/calculations/excavation.ts](file:///d:/Creation/Buildora/lib/calculations/excavation.ts)).
* **Plain Cement Concrete (PCC)**: Computes mud-mat concrete foundation volumes ([lib/calculations/pcc.ts](file:///d:/Creation/Buildora/lib/calculations/pcc.ts)).
* **Reinforced Cement Concrete (RCC)**: Comprehensive suite for structural elements including footings, columns, beams, slabs, and staircases. It calculates cement bags, sand volume, aggregate volume, and steel weight ([lib/calculations/rcc.ts](file:///d:/Creation/Buildora/lib/calculations/rcc.ts)).
* **Masonry Walls**: Supports options for standard **Brick Walls** (9" external, 4.5" internal) and **AAC Block Walls** (6" blocks) with customizable wastage coefficients ([lib/calculations/bricks.ts](file:///d:/Creation/Buildora/lib/calculations/bricks.ts), [lib/calculations/aac.ts](file:///d:/Creation/Buildora/lib/calculations/aac.ts)).
* **Finishes**: Estimates area requirements for plastering, interior/exterior painting, and flooring tiles ([lib/calculations/plaster.ts](file:///d:/Creation/Buildora/lib/calculations/plaster.ts), [lib/calculations/paint.ts](file:///d:/Creation/Buildora/lib/calculations/paint.ts), [lib/calculations/tiles.ts](file:///d:/Creation/Buildora/lib/calculations/tiles.ts)).
* **Consolidated Calculator**: Unified interface executing calculations sequentially ([lib/calculations/index.ts](file:///d:/Creation/Buildora/lib/calculations/index.ts)).

### 2. AI-Powered Blueprint & Floor Plan Analyzer
Parses architectural drawing blueprints to generate digital models:
* **Automated Object Detection**: AI detects walls, rooms, columns, beams, and door/window openings from drawing templates ([src/ai/blueprint-analyzer/roomDetector.ts](file:///d:/Creation/Buildora/src/ai/blueprint-analyzer/roomDetector.ts)).
* **Dimension Extractor**: Extract spatial dimensions and wall thickness ([src/ai/blueprint-analyzer/dimensionExtractor.ts](file:///d:/Creation/Buildora/src/ai/blueprint-analyzer/dimensionExtractor.ts)).
* **Confidence Engine & Auditing**: Highlights components requiring human verification ([src/ai/blueprint-analyzer/confidenceEngine.ts](file:///d:/Creation/Buildora/src/ai/blueprint-analyzer/confidenceEngine.ts)).
* **Interactive Canvas Editor**: Visually overlays bounding boxes of detected rooms on the drawing. Users can modify boundaries, re-classify rooms, and edit material parameters ([app/ai-floor-plan/page.tsx](file:///d:/Creation/Buildora/app/ai-floor-plan/page.tsx)).
* **AI Chat Assistant**: Interactive QA interface about the blueprint (e.g. brick counts, layout optimizations).

### 3. Interactive 3D Visualizer
WebGL-based structural visualizer allowing interactive inspection of estimated framing models ([app/visualizer-3d/page.tsx](file:///d:/Creation/Buildora/app/visualizer-3d/page.tsx)):
* **Render Modes**: Wireframe, Solid, and Textured model modes.
* **Spatial Controls**: Rotate and shift camera viewpoints in real-time.
* **Material Inspection**: Highlights foundation footing and reinforced framing layers.

### 4. Construction Progress Tracker & Audit Log
Allows comparing actual material utilization on-site against baseline calculations ([app/progress-tracker/page.tsx](file:///d:/Creation/Buildora/app/progress-tracker/page.tsx)):
* **Multi-phase Timelines**: Track milestones (Excavation, Concrete Casting, Brickwork, Finishes).
* **Material Variance Audit**: Visualizes warnings when material consumption exceeds estimated allowances (e.g., +50 cft of sand).

### 5. Contractor & Vendor Marketplace
Enables direct dispatching of BOQ (Bill of Quantities) to local suppliers and general contractors for bidding ([app/marketplace/page.tsx](file:///d:/Creation/Buildora/app/marketplace/page.tsx)):
* Compare ratings, verified status, and pricing levels.
* Send BOQ details directly for local market quotations.

---

## 🛠️ Tech Stack & Architecture

### Frontend
* **Core**: Next.js 16 (App Router) & React 19.
* **Styling**: Tailwind CSS v4.
* **Iconography**: Lucide React.
* **Typographics**: Inter / Geists.

### Backend & Database
* **Database & Auth**: [Supabase](https://supabase.com/) with Row Level Security (RLS) policies.
* **Database Schema**: Managed in [lib/db/schema.sql](file:///d:/Creation/Buildora/lib/db/schema.sql).
  * `profiles`: Linked to Supabase Auth users.
  * `projects`: Configures plot details, floor heights, room counts, and design quality tier.
  * `materials` & `country_rates`: Handles region-based pricing (Economy, Standard, Premium) ([types/pricing.ts](file:///d:/Creation/Buildora/types/pricing.ts)).
  * `estimates`: Persists computed JSON summaries of material quantities and costs.
  * `blueprints`: Tracks uploaded plans and drawings.
  * `ai_building_models`: Stores the parsed BIM-Lite JSON schema and confidence metrics.

---

## 📦 Project Structure

```bash
Buildora/
├── app/                  # Next.js pages (dashboard, AI floor plans, 3D visualizer, progress tracker, marketplace, auth)
│   ├── (auth)/           # Authentication layout and login/signup flows
│   ├── ai-floor-plan/    # Interactive AI drawing parser and editor
│   ├── dashboard/        # Estimator dashboard with project overview and aggregates
│   ├── marketplace/      # Contractor and vendor rates biddings
│   ├── progress-tracker/ # Timeline and material audit log page
│   └── visualizer-3d/    # WebGL visualizer mockup interface
├── components/           # Reusable UI primitives (Cards, Buttons, Modals) and layouts
├── lib/                  # Civil calculations engines and db scripts
│   ├── calculations/     # Independent material quantity calculations
│   ├── cost/             # Labor and general budgeting engines
│   ├── db/               # Supabase query API and SQL initialization script
│   ├── estimation/       # Consolidated calculation runner
│   └── pricing/          # Local rate resolvers
├── src/                  # Core algorithmic and service modules
│   ├── ai/               # AI Floor plan parsing scripts (detectors, confidence engines)
│   └── services/         # Client-side services (upload wrappers, validators)
└── types/                # Project and pricing TypeScript interface typings
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### Setup and Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Buildora
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Configuration:**
   Apply the setup queries from [schema.sql](file:///d:/Creation/Buildora/lib/db/schema.sql) in your Supabase SQL editor.

4. **Environment Setup:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_api_key
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
