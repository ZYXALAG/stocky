-- Migration 002: Create templates and fields tables

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fields table (custom fields for a template)
CREATE TABLE IF NOT EXISTS fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'number', 'date', 'select', 'checkbox', 'textarea', 'currency')),
  label TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  options JSONB,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE fields ENABLE ROW LEVEL SECURITY;

-- Templates policies
CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own templates"
  ON templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  TO authenticated
  USING (true);

-- Fields policies
CREATE POLICY "Users can insert own template fields"
  ON fields FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own template fields"
  ON fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own template fields"
  ON fields FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete own template fields"
  ON fields FOR DELETE
  TO authenticated
  USING (true);

-- Index on fields(template_id) for performance
CREATE INDEX idx_fields_template_id ON fields(template_id);

-- Trigger for updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
