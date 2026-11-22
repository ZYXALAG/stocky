// Category type definitions for the Stocky inventory system (with hierarchy support)

import { z } from 'zod';

export interface Category {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  color: string | null;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  parent_id: string | null;
  icon: string;
  color: string;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
}

export const CATEGORY_COLORS = [
  '#0D6EFD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#E11D48', '#A855F7', '#0EA5E9', '#86EFAC',
] as const;

export const CATEGORY_ICONS = [
  'Box', 'Package', 'ShoppingCart', 'Tag', 'TagIcon',
  'Store', 'Layers', 'Cube', 'Grid3x3', 'LayoutGrid',
  'Folder', 'FolderOpen', 'FileText', 'Globe', 'Hammer',
  'Monitor', 'Smartphone', 'Shirt', 'UtensilsCrossed', 'Dumbbell',
  'BookOpen', 'Camera', 'Music', 'Palette', 'Scissors',
] as const;

export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1, 'Le slug est requis'),
  description: z.string().min(0),
  parent_id: z.string().nullable(),
  icon: z.string().min(1, 'L\'icône est requise'),
  color: z.string().min(1, 'La couleur est requise'),
});

export type CategoryFormSchema = z.infer<typeof categorySchema>;
