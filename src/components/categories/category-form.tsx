'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import {
  type Category,
  type CategoryFormData,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  categorySchema,
} from '@/types/category';
import { cn } from '@/lib/utils';

interface CategoryFormProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

// Map lucide icon names to actual components
const ICON_COMPONENTS: Record<string, string> = {
  Box: '📦',
  Package: '📦',
  ShoppingCart: '🛒',
  Tag: '🏷️',
  Store: '🏪',
  Layers: '🗂️',
  Cube: '🧊',
  Grid3x3: '⊞',
  LayoutGrid: '⊞',
  Folder: '📁',
  FolderOpen: '📂',
  FileText: '📄',
  Globe: '🌍',
  Hammer: '🔨',
  Monitor: '🖥️',
  Smartphone: '📱',
  Shirt: '👕',
  UtensilsCrossed: '🍴',
  Dumbbell: '💪',
  BookOpen: '📖',
  Camera: '📷',
  Music: '🎵',
  Palette: '🎨',
  Scissors: '✂️',
};

export function CategoryForm({ category: editCat, open, onOpenChange, onSave }: CategoryFormProps) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [slugAuto, setSlugAuto] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parent_id: null,
      icon: 'Box',
      color: '#0D6EFD',
    },
  });

  const nameValue = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (slugAuto && nameValue) {
      const slug = nameValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-');
      setValue('slug', slug, { shouldValidate: false });
    }
  }, [nameValue, slugAuto, setValue]);

  // Fetch categories for parent select
  useEffect(() => {
    if (open) {
      const fetchCats = async () => {
        const supabase = createClient();
        const { data } = await supabase
          .from('categories')
          .select('id, name, parent_id')
          .order('name');
        setAllCategories((data || []) as Category[]);
      };
      fetchCats();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (editCat) {
        setValue('name', editCat.name);
        setValue('slug', editCat.slug ?? '');
        setValue('description', editCat.description ?? '');
        setValue('parent_id', editCat.parent_id);
        setValue('icon', editCat.icon ?? 'Box');
        setValue('color', editCat.color ?? '#0D6EFD');
        setSlugAuto(false);
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          parent_id: null,
          icon: 'Box',
          color: '#0D6EFD',
        });
        setSlugAuto(true);
      }
    }
  }, [open, editCat, setValue, reset]);

  // Build exclude list for parent (exclude self and all descendants)
  const getDescendants = (catId: string, cats: Category[]): string[] => {
    let descendants: string[] = [];
    const directChildren = cats.filter((c) => c.parent_id === catId);
    for (const child of directChildren) {
      descendants.push(child.id);
      descendants = [...descendants, ...getDescendants(child.id, cats)];
    }
    return descendants;
  };

  const filteredParentOptions = editCat
    ? allCategories.filter(
        (c) => c.id !== editCat.id && !getDescendants(editCat.id, allCategories).includes(c.id)
      )
    : allCategories;

  const onSubmit = async (data: CategoryFormData) => {
    try {
      const supabase = createClient();
      const payload = {
        name: data.name,
        slug: data.slug || null,
        description: data.description || null,
        parent_id: data.parent_id || null,
        icon: data.icon || null,
        color: data.color || null,
      };

      if (editCat) {
        await supabase.from('categories').update(payload).eq('id', editCat.id);
        toast({ title: 'Catégorie modifiée', description: `${data.name} a été mise à jour.` });
      } else {
        await supabase.from('categories').insert(payload);
        toast({ title: 'Catégorie créée', description: `${data.name} a été ajoutée.` });
      }
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message ?? 'Une erreur est survenue.' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editCat ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la catégorie *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Électronique"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="slug">Slug</Label>
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={slugAuto}
                  onChange={(e) => setSlugAuto(e.target.checked)}
                />
                Auto-générer
              </label>
            </div>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="electronique"
              className={errors.slug ? 'border-destructive' : ''}
            />
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Description optionnelle..."
              rows={3}
            />
          </div>

          {/* Parent category */}
          <div className="space-y-2">
            <Label htmlFor="parent_id">Catégorie parent</Label>
            <Select
              value={editCat ? (editCat.parent_id ?? '__none__') : '__none__'}
              onValueChange={(v) => setValue('parent_id', v === '__none__' ? null : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucune (racine)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Aucune (racine)</SelectItem>
                {filteredParentOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.parent_id ? '→ ' : ''}{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Icon picker */}
          <div className="space-y-2">
            <Label>Icône</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((iconName) => {
                const emoji = ICON_COMPONENTS[iconName] || '📦';
                const isSelected = watch('icon') === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setValue('icon', iconName)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                        : 'border-border hover:bg-accent'
                    )}
                    title={iconName}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
            {errors.icon && <p className="text-sm text-destructive">{errors.icon.message}</p>}
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    watch('color') === color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              <div className="relative">
                <Input
                  type="color"
                  value={watch('color')}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="h-8 w-8 rounded-full border-2 p-0.5"
                />
              </div>
            </div>
            {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sauvegarde...' : editCat ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
