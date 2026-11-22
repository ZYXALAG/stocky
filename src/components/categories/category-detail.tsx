'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Edit,
  ArrowLeft,
  Package,
  ArrowRightLeft,
  Folder,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatDate, formatDateRelative } from '@/lib/utils';
import { type Category } from '@/types/category';

interface CategoryDetailProps {
  category: Category;
  onEdit: (category: Category) => void;
  onBack: () => void;
}

function categoryIcon(iconName: string | null): string {
  const icons: Record<string, string> = {
    Box: '📦', Package: '📦', ShoppingCart: '🛒', Tag: '🏷️', Store: '🏪',
    Layers: '🗂️', Cube: '🧊', Grid3x3: '⊞', LayoutGrid: '⊞', Folder: '📁',
    FolderOpen: '📂', FileText: '📄', Globe: '🌍', Hammer: '🔨',
    Monitor: '🖥️', Smartphone: '📱', Shirt: '👕', UtensilsCrossed: '🍴',
    Dumbbell: '💪', BookOpen: '📖', Camera: '📷', Music: '🎵',
    Palette: '🎨', Scissors: '✂️',
  };
  return icons[iconName || 'Box'] || '📦';
}

export function CategoryDetail({ category, onEdit, onBack }: CategoryDetailProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [children, setChildren] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const [{ data: prods }, { data: kids }] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('category_id', category.id)
          .order('name'),
        supabase
          .from('categories')
          .select('*')
          .eq('parent_id', category.id)
          .order('name'),
      ]);
      setProducts(prods || []);
      setChildren(kids || []);
    } catch (err) {
      console.error('Failed to fetch category details:', err);
    } finally {
      setLoading(false);
    }
  }, [category.id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const color = category.color || '#0D6EFD';
  const icon = categoryIcon(category.icon);

  // Build breadcrumb
  const breadcrumb = [category.name];
  let parent: Category | undefined;
  const fetchParent = async () => {
    if (category.parent_id) {
      const supabase = createClient();
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('id', category.parent_id)
        .single();
      if (data) {
        parent = data as Category;
        breadcrumb.unshift(parent.name);
      }
    }
  };
  fetchParent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumb.map((name, i) => (
          <span key={i}>
            {i > 0 && <span className="mx-1">/</span>}
            <span className={i === breadcrumb.length - 1 ? 'text-foreground font-medium' : ''}>
              {name}
            </span>
          </span>
        ))}
      </div>

      {/* Profile */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div
          className="h-16 w-16 flex items-center justify-center rounded-xl text-3xl"
          style={{ backgroundColor: color + '15' }}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{category.name}</h2>
            <Badge variant="secondary">Catégorie</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Ajouté le {formatDate(category.created_at)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
          <Edit className="h-4 w-4 mr-1" />
          Modifier
        </Button>
      </div>

      {/* Info */}
      {category.description && (
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm">{category.description}</p>
        </div>
      )}

      {/* Children categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Folder className="h-5 w-5 text-muted-foreground" />
            Sous-catégories ({children.length})
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : children.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Aucune sous-catégorie.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-accent/50"
              >
                <span className="text-xl">{categoryIcon(child.icon)}</span>
                <div>
                  <p className="font-medium text-sm">{child.name}</p>
                  {child.color && (
                    <span
                      className="inline-block h-2 w-2 rounded-full mt-1"
                      style={{ backgroundColor: child.color }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Products */}
      <Separator />
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            Produits ({products.length})
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-3 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Aucun produit dans cette catégorie.</p>
        ) : (
          <div className="rounded-md border">
            <div className="divide-y divide-border">
              {products.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {p.base_quantity} · Seuils: {p.alert_threshold}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={p.base_quantity <= p.alert_threshold ? 'text-destructive' : ''}
                  >
                    {p.base_quantity} en stock
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
