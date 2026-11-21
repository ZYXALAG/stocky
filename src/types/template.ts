// Field types supported by templates
export type TemplateFieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox' | 'textarea' | 'currency';

export interface TemplateField {
  id: string;
  template_id: string;
  name: string;
  type: TemplateFieldType;
  label: string;
  required: boolean;
  options: Record<string, string>[] | null; // For select type: [{ value: 'a', label: 'A' }, ...]
  order: number;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateWithFields extends Template {
  fields: TemplateField[];
}

// Zod schemas
import { z } from 'zod';

export const templateSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(0),
  icon: z.string().min(0),
});

export type TemplateFormData = z.infer<typeof templateSchema>;

export const fieldSchema = z.object({
  name: z.string().min(1, 'Le nom du champ est requis'),
  type: z.enum(['text', 'number', 'date', 'select', 'checkbox', 'textarea', 'currency']),
  label: z.string().min(1, 'Le libellé est requis'),
  required: z.boolean().default(false),
  options: z.any().optional(),
  order: z.number().min(0).default(0),
});

export type FieldFormData = z.infer<typeof fieldSchema>;

// Common icon options for templates
export const TEMPLATE_ICONS = [
  { name: '📱', value: '📱', label: 'Électronique' },
  { name: '👕', value: '👕', label: 'Vêtements' },
  { name: '🍎', value: '🍎', label: 'Alimentaire' },
  { name: '🔧', value: '🔧', label: 'Quincaillerie' },
  { name: '🏠', value: '🏠', label: 'Personnel' },
  { name: '📦', value: '📦', label: 'Emballage' },
  { name: '📚', value: '📚', label: 'Livres' },
  { name: '🎮', value: '🎮', label: 'Jeux' },
  { name: '🏷️', value: '🏷️', label: 'Étiquettes' },
  { name: '🛠️', value: '🛠️', label: 'Outils' },
  { name: '📊', value: '📊', label: 'Rapports' },
  { name: '💼', value: '💼', label: 'Professionnel' },
];

// Default templates
export const DEFAULT_TEMPLATES = [
  {
    name: 'Électronique',
    description: 'Produits électroniques et informatiques',
    icon: '📱',
  },
  {
    name: 'Vêtements',
    description: 'Vêtements et accessoires mode',
    icon: '👕',
  },
  {
    name: 'Alimentaire',
    description: 'Produits alimentaires et boissons',
    icon: '🍎',
  },
  {
    name: 'Quincaillerie',
    description: 'Outils, visserie et quincaillerie',
    icon: '🔧',
  },
  {
    name: 'Personnel',
    description: 'Articles personnels divers',
    icon: '🏠',
  },
];

export const DEFAULT_TEMPLATE_FIELDS: Record<string, Omit<TemplateField, 'id' | 'template_id' | 'created_at'>[]> = {
  'Électronique': [
    { name: 'marque', type: 'text', label: 'Marque', required: true, options: null, order: 0 },
    { name: 'modele', type: 'text', label: 'Modèle', required: true, options: null, order: 1 },
    { name: 'garantie', type: 'date', label: 'Date de garantie', required: false, options: null, order: 2 },
    { name: 'etat', type: 'select', label: 'État', required: true, options: [
      { value: 'neuf', label: 'Neuf' },
      { value: 'occasion', label: 'Occasion' },
      { value: 'reconditionne', label: 'Reconditionné' },
    ], order: 3 },
  ],
  'Vêtements': [
    { name: 'taille', type: 'select', label: 'Taille', required: true, options: [
      { value: 'XS', label: 'XS' },
      { value: 'S', label: 'S' },
      { value: 'M', label: 'M' },
      { value: 'L', label: 'L' },
      { value: 'XL', label: 'XL' },
      { value: 'XXL', label: 'XXL' },
    ], order: 0 },
    { name: 'couleur', type: 'text', label: 'Couleur', required: true, options: null, order: 1 },
    { name: 'materiel', type: 'text', label: 'Matière', required: false, options: null, order: 2 },
    { name: 'saison', type: 'select', label: 'Saison', required: false, options: [
      { value: 'ete', label: 'Été' },
      { value: 'hiver', label: 'Hiver' },
      { value: 'printemps', label: 'Printemps' },
      { value: 'automne', label: 'Automne' },
    ], order: 3 },
  ],
  'Alimentaire': [
    { name: 'date_peremption', type: 'date', label: 'Date de péremption', required: true, options: null, order: 0 },
    { name: 'conditions_stockage', type: 'select', label: 'Conditions de stockage', required: true, options: [
      { value: 'normal', label: 'Normal' },
      { value: 'refrigerer', label: 'Réfrigéré' },
      { value: 'congele', label: 'Congelé' },
      { value: 'au_sec', label: 'Au sec' },
    ], order: 1 },
    { name: 'origine', type: 'text', label: 'Origine', required: false, options: null, order: 2 },
    { name: 'ingrediants_allergenes', type: 'textarea', label: 'Allergènes', required: false, options: null, order: 3 },
  ],
  'Quincaillerie': [
    { name: 'dimension', type: 'text', label: 'Dimension', required: true, options: null, order: 0 },
    { name: 'materiau', type: 'select', label: 'Matériau', required: true, options: [
      { value: 'acier', label: 'Acier' },
      { value: 'bois', label: 'Bois' },
      { value: 'plastique', label: 'Plastique' },
      { value: 'metal', label: 'Métal' },
      { value: 'cuivre', label: 'Cuivre' },
    ], order: 1 },
    { name: 'fini', type: 'text', label: 'Finition', required: false, options: null, order: 2 },
    { name: 'quantite_lot', type: 'number', label: 'Quantité par lot', required: false, options: null, order: 3 },
  ],
  'Personnel': [
    { name: 'lieu', type: 'text', label: 'Emplacement', required: true, options: null, order: 0 },
    { name: 'usage', type: 'select', label: 'Usage', required: false, options: [
      { value: 'quotidien', label: 'Quotidien' },
      { value: 'exception', label: 'Exceptionnel' },
      { value: 'collection', label: 'Collection' },
    ], order: 1 },
    { name: 'importance', type: 'select', label: 'Importance', required: false, options: [
      { value: 'haute', label: 'Haute' },
      { value: 'moyenne', label: 'Moyenne' },
      { value: 'faible', label: 'Faible' },
    ], order: 2 },
  ],
};
