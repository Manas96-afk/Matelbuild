-- Buildora Database Schema
-- Supabase Setup Script

-- 1. Profiles Table (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-access to profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Allow individual write-access to profiles"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow individual update-access to profiles"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  projectName TEXT NOT NULL,
  plotLength NUMERIC NOT NULL,
  plotWidth NUMERIC NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('Feet', 'Meter')),
  plotType TEXT NOT NULL CHECK (plotType IN ('Residential', 'Commercial', 'Mixed Use')),
  floors NUMERIC NOT NULL DEFAULT 1,
  quality TEXT NOT NULL CHECK (quality IN ('Economy', 'Standard', 'Premium', 'Luxury')),
  bedrooms NUMERIC NOT NULL DEFAULT 0,
  bathrooms NUMERIC NOT NULL DEFAULT 0,
  kitchens NUMERIC NOT NULL DEFAULT 0,
  livingRooms NUMERIC NOT NULL DEFAULT 0,
  balconies NUMERIC NOT NULL DEFAULT 0,
  parkingRequired BOOLEAN NOT NULL DEFAULT false,
  country TEXT NOT NULL DEFAULT 'India',
  floorHeight NUMERIC NOT NULL DEFAULT 10,
  wallType TEXT NOT NULL DEFAULT 'Brick',
  pccGrade TEXT NOT NULL DEFAULT 'M7.5',
  rccGrade TEXT NOT NULL DEFAULT 'M20',
  flooringType TEXT NOT NULL DEFAULT 'Vitrified',
  wastageOption NUMERIC NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
  ON public.projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- 3. Automatic profiles creation trigger when auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Materials Table (Material Knowledge Base)
CREATE TABLE IF NOT EXISTS public.materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  density NUMERIC,
  coverage NUMERIC,
  waste_percent NUMERIC,
  standard_size TEXT,
  description TEXT
);

-- Enable RLS for Materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-access to materials"
  ON public.materials FOR SELECT USING (true);

-- 5. Country Rates Table
CREATE TABLE IF NOT EXISTS public.country_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  country TEXT NOT NULL,
  material_id TEXT REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
  economy_rate NUMERIC NOT NULL,
  standard_rate NUMERIC NOT NULL,
  premium_rate NUMERIC NOT NULL,
  luxury_rate NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(country, material_id)
);

-- Enable RLS for Country Rates
ALTER TABLE public.country_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-access to country rates"
  ON public.country_rates FOR SELECT USING (true);

-- 6. Formula Registry Table
CREATE TABLE IF NOT EXISTS public.formula_registry (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  expression TEXT NOT NULL,
  coefficients JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Formula Registry
ALTER TABLE public.formula_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-access to formulas"
  ON public.formula_registry FOR SELECT USING (true);

-- 7. Engineering Rules Table
CREATE TABLE IF NOT EXISTS public.engineering_rules (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  action_formula_id TEXT NOT NULL REFERENCES public.formula_registry(id) ON DELETE CASCADE,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Engineering Rules
ALTER TABLE public.engineering_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-access to rules"
  ON public.engineering_rules FOR SELECT USING (true);

-- 8. Estimates Table
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  material_summary JSONB NOT NULL,
  cost_summary JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(project_id)
);

-- Enable RLS for Estimates
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own project estimates"
  ON public.estimates FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = estimates.project_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own project estimates"
  ON public.estimates FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own project estimates"
  ON public.estimates FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own project estimates"
  ON public.estimates FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

-- 9. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  report_name TEXT NOT NULL,
  summary_data JSONB NOT NULL,
  boq_data JSONB NOT NULL,
  cost_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for Reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reports of their own projects"
  ON public.reports FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = reports.project_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reports for their own projects"
  ON public.reports FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete reports of their own projects"
  ON public.reports FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = reports.project_id AND p.user_id = auth.uid()
    )
  );
