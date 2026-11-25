-- ============================================
-- Script de création des tables templates & fields
-- À exécuter dans Supabase Dashboard → SQL Editor
-- ============================================

-- Table templates
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📦',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table fields
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text',
  required BOOLEAN DEFAULT false,
  order INTEGER DEFAULT 0,
  placeholder TEXT,
  options TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- Policies for templates
CREATE POLICY "Users can view templates"
  ON public.templates FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update templates"
  ON public.templates FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete templates"
  ON public.templates FOR DELETE
  USING (auth.role() = 'authenticated');

-- Policies for fields
CREATE POLICY "Users can view fields"
  ON public.fields FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert fields"
  ON public.fields FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update fields"
  ON public.fields FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete fields"
  ON public.fields FOR DELETE
  USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fields_template_id ON public.fields(template_id);

-- Trigger for updated_at on templates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_templates_updated_at ON public.templates;
CREATE TRIGGER handle_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_fields_updated_at ON public.fields;
CREATE TRIGGER handle_fields_updated_at
  BEFORE UPDATE ON public.fields
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
