-- Migration 010: Seed suppliers and categories

-- ============================================================
-- Seed Suppliers
-- ============================================================
INSERT INTO suppliers (id, name, contact_person, email, phone, address, city, postal_code, country, website, notes) VALUES
  ('00000000-0000-0000-0000-000000000101',
   'TechSupply France',
   'Jean Dupont',
   'contact@techsupply.fr',
   '+33 1 42 68 53 00',
   '15 Rue de la Paix',
   'Paris',
   '75002',
   'France',
   'https://www.techsupply.fr',
   'Fournisseur spécialisé en matériel informatique et électronique depuis 2005.'),

  ('00000000-0000-0000-0000-000000000102',
   'Boulanger Pro',
   'Marie Laurent',
   'pro@boulanger.com',
   '+33 1 55 75 00 00',
   'Rue Guy Moquet',
   'Bondy',
   '93140',
   'France',
   'https://www.boulanger.com/pro',
   'Grand distributeur de produits électroménagers et high-tech.'),

  ('00000000-0000-0000-0000-000000000103',
   'Conrad Electronic',
   'Hans Mueller',
   'info@conrad.fr',
   '+49 9731 567-0',
   'Max-Conrad-Straße 1',
   'Hildesheim',
   '31137',
   'Allemagne',
   'https://www.conrad.fr',
   'Distributeur européen de composants électroniques et outils.'),

  ('00000000-0000-0000-0000-000000000104',
   'Amazon Business',
   'Service Client',
   'business@amazon.fr',
   '0800 100 200',
   NULL,
   NULL,
   NULL,
   NULL,
   'https://www.amazon.fr/business',
   'Plateforme B2B dAmazon avec tarifs négociés.'),

  ('00000000-0000-0000-0000-000000000105',
   'Rexel France',
   'Pierre Martin',
   'contact@rexel.fr',
   '+33 4 72 84 41 00',
   '36 Avenue Raymond Poincaré',
   'Villeurbanne',
   '69100',
   'France',
   'https://www.rexel.fr',
   'Distributeur leader en électricité, câble et consommables professionnels.');

-- ============================================================
-- Seed Categories (with hierarchy)
-- ============================================================

-- Root categories
INSERT INTO categories (id, name, slug, description, parent_id, icon, color, product_count) VALUES
  ('00000000-0000-0000-0000-000000000201', 'Électronique', 'electronique',
   'Composants, appareils et gadgets électroniques', NULL, 'Monitor', '#0D6EFD', 0),

  ('00000000-0000-0000-0000-000000000202', 'Quincaillerie', 'quincaillerie',
   'Outils, visserie, matériaux de construction', NULL, 'Hammer', '#F59E0B', 0),

  ('00000000-0000-0000-0000-000000000203', 'Fournitures de bureau', 'fournitures-bureau',
   'Papeterie, matériel de bureau et accessoires', NULL, 'Folder', '#10B981', 0),

  ('00000000-0000-0000-0000-000000000204', 'Textile & Vêtements', 'textilevetements',
   'Vêtements professionnels, EPI et textile industriel', NULL, 'Shirt', '#8B5CF6', 0);

-- Subcategories for Électronique
INSERT INTO categories (id, name, slug, description, parent_id, icon, color, product_count) VALUES
  ('00000000-0000-0000-0000-000000000211', 'Composants', 'composants',
   'Résistances, condensateurs, circuits intégrés',
   '00000000-0000-0000-0000-000000000201', 'Cube', '#0052CC', 0),

  ('00000000-0000-0000-0000-000000000212', 'Câbles & Connecteurs', 'cables-connecteurs',
   'Câbles USB, HDMI, RJ45 et adaptateurs',
   '00000000-0000-0000-0000-000000000201', 'Package', '#0052CC', 0),

  ('00000000-0000-0000-0000-000000000213', 'Périphériques', 'peripheriques',
   'Claviers, souris, écrans et imprimantes',
   '00000000-0000-0000-0000-000000000201', 'Monitor', '#0052CC', 0);

-- Subcategories for Quincaillerie
INSERT INTO categories (id, name, slug, description, parent_id, icon, color, product_count) VALUES
  ('00000000-0000-0000-0000-000000000221', 'Visserie', 'visserie',
   'Vis, boulons, écrous, rondelles et chevilles',
   '00000000-0000-0000-0000-000000000202', 'Layers', '#D97706', 0),

  ('00000000-0000-0000-0000-000000000222', 'Outils', 'outils',
   'Outils à main et électroportatifs',
   '00000000-0000-0000-0000-000000000202', 'Hammer', '#D97706', 0);
