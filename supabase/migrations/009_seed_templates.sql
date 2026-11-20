-- Migration 009: Seed default templates and their fields

-- Seed 5 default templates
INSERT INTO templates (id, name, description, icon) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Electronics', 'Template for electronic devices with serial numbers, brands, and warranty info', 'Monitor'),
  ('00000000-0000-0000-0000-000000000002', 'Clothing', 'Template for clothing items with sizes, colors, materials, and seasons', 'Shirt'),
  ('00000000-0000-0000-0000-000000000003', 'Food', 'Template for food items with expiry dates, units, storage temperature, and batch numbers', 'Food'),
  ('00000000-0000-0000-0000-000000000004', 'Hardware', 'Template for hardware/tools with SKUs, weights, dimensions, and minimum stock', 'Hammer'),
  ('00000000-0000-0000-0000-000000000005', 'Personal', 'Template for personal items with notes, purchase date, value, and location', 'User')
ON CONFLICT (id) DO NOTHING;

-- Seed fields for Electronics template
INSERT INTO fields (template_id, name, type, label, required, options, "order") VALUES
  ('00000000-0000-0000-0000-000000000001', 'serial_number', 'text', 'Serial Number', true, NULL, 1),
  ('00000000-0000-0000-0000-000000000001', 'brand', 'text', 'Brand', false, NULL, 2),
  ('00000000-0000-0000-0000-000000000001', 'warranty_months', 'number', 'Warranty (months)', false, NULL, 3),
  ('00000000-0000-0000-0000-000000000001', 'purchase_date', 'date', 'Purchase Date', false, NULL, 4);

-- Seed fields for Clothing template
INSERT INTO fields (template_id, name, type, label, required, options, "order") VALUES
  ('00000000-0000-0000-0000-000000000002', 'size', 'select', 'Size', true, '["XS","S","M","L","XL"]', 1),
  ('00000000-0000-0000-0000-000000000002', 'color', 'text', 'Color', false, NULL, 2),
  ('00000000-0000-0000-0000-000000000002', 'material', 'text', 'Material', false, NULL, 3),
  ('00000000-0000-0000-0000-000000000002', 'season', 'select', 'Season', false, '["Spring","Summer","Autumn","Winter"]', 4);

-- Seed fields for Food template
INSERT INTO fields (template_id, name, type, label, required, options, "order") VALUES
  ('00000000-0000-0000-0000-000000000003', 'expiry_date', 'date', 'Expiry Date', true, NULL, 1),
  ('00000000-0000-0000-0000-000000000003', 'quantity_unit', 'select', 'Quantity Unit', true, '["kg","g","L","ml","units"]', 2),
  ('00000000-0000-0000-0000-000000000003', 'storage_temp', 'text', 'Storage Temperature', false, NULL, 3),
  ('00000000-0000-0000-0000-000000000003', 'batch_number', 'text', 'Batch Number', false, NULL, 4);

-- Seed fields for Hardware template
INSERT INTO fields (template_id, name, type, label, required, options, "order") VALUES
  ('00000000-0000-0000-0000-000000000004', 'sku', 'text', 'SKU', true, NULL, 1),
  ('00000000-0000-0000-0000-000000000004', 'weight_kg', 'number', 'Weight (kg)', false, NULL, 2),
  ('00000000-0000-0000-0000-000000000004', 'dimensions', 'text', 'Dimensions', false, NULL, 3),
  ('00000000-0000-0000-0000-000000000004', 'min_stock', 'number', 'Minimum Stock', false, NULL, 4);

-- Seed fields for Personal template
INSERT INTO fields (template_id, name, type, label, required, options, "order") VALUES
  ('00000000-0000-0000-0000-000000000005', 'notes', 'textarea', 'Notes', false, NULL, 1),
  ('00000000-0000-0000-0000-000000000005', 'purchase_date', 'date', 'Purchase Date', false, NULL, 2),
  ('00000000-0000-0000-0000-000000000005', 'value', 'currency', 'Value', false, NULL, 3),
  ('00000000-0000-0000-0000-000000000005', 'location', 'text', 'Location', false, NULL, 4);
