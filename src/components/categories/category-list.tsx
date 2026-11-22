'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { type Category } from '@/types/category';

interface CategoryListProps {
  onEdit: (category: Category) => void;
  onDetail: (category: Category) => void;
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

function expandId(parentId: string | null, all: Category[]): Set<string> {
  const ids = new Set<string>();
  if (!parentId) return ids;
  ids.add(parentId);
  const children = all.filter((c) => c.parent_id === parentId);
  for (const child of children) {
    expandId(child.id, all).forEach((id) => ids.add(id));
  }
  return ids;
}

export function CategoryList({ onEdit, onDetail }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedParents, setExpandedParents] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const PAGE_SIZE = 50;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch categories with product counts
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name, slug, description, parent_id, icon, color, created_at, updated_at');

      // Fetch product counts
      const { data: prods } = await supabase
        .from('products')
        .select('category_id, id');

      const countMap: Record<string, number> = {};
      (prods || []).forEach((p: any) => {
        if (p.category_id) {
          countMap[p.category_id] = (countMap[p.category_id] || 0) + 1;
        }
      });

      // Also count products in subcategories
      const catData = (cats || []) as Category[];
      const withCounts = catData.map((c) => {
        let count = countMap[c.id] || 0;
        // Add children product counts
        const getChildrenIds = (parentId: string): string[] => {
          const direct = catData.filter((x) => x.parent_id === parentId);
          const ids = direct.map((d) => d.id);
          for (const d of direct) {
            ids.push(...getChildrenIds(d.id));
          }
          return ids;
        };
        if (c.parent_id) {
          // This is a child; it gets its own count + grandchildren counts
          const grandchildren = catData.filter((x) => x.parent_id === c.id);
          for (const gc of grandchildren) {
            count += countMap[gc.id] || 0;
          }
        }
        return { ...c, product_count: count } as Category & { product_count: number };
      });

      setCategories(withCounts);
      setTotal(withCounts.length);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const supabase = createClient();
      await supabase.from('categories').delete().eq('id', deleteId);
      setCategories((prev) => prev.filter((c) => c.id !== deleteId));
      setTotal((t) => t - 1);
    } catch (err: any) {
      console.error('Delete failed:', err);
    } finally {
      setDeleteId(null);
      setConfirmDelete(false);
    }
  };

  const toggleExpand = useCallback((parentId: string) => {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }, []);

  // Filter categories
  const filtered = useMemo(() => {
    if (!search) return categories;
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    );
  }, [categories, search]);

  // Build hierarchy: root categories
  const roots = useMemo(
    () => filtered.filter((c) => !c.parent_id),
    [filtered]
  );

  const getChildren = useCallback(
    (parentId: string): Category[] => {
      return filtered.filter((c) => c.parent_id === parentId);
    },
    [filtered]
  );

  // Pagination for roots
  const totalPages = Math.ceil(roots.length / PAGE_SIZE);
  const paginatedRoots = roots.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const renderCategoryRow = (
    cat: Category & { product_count: number },
    depth: number = 0
  ) => {
    const children = getChildren(cat.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedParents.has(cat.id);
    const color = cat.color || '#0D6EFD';

    return (
      <div key={cat.id}>
        <div
          className={`flex items-center gap-2 rounded-lg border border-border px-4 py-3 hover:bg-accent/50 cursor-pointer transition-colors ${
            depth > 0 ? 'ml-4 sm:ml-8 border-l-2' : ''
          }`}
          style={depth > 0 ? { borderLeftColor: color, borderLeftWidth: '2px' } : undefined}
          onClick={() => onDetail(cat)}
        >
          {/* Expand/Collapse */}
          <div className="w-6 flex-shrink-0">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(cat.id);
                }}
                className="p-0.5 hover:bg-muted rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="w-4" />
            )}
          </div>

          {/* Icon */}
          <span className="text-xl" title={cat.icon || undefined}>
            {categoryIcon(cat.icon)}
          </span>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{cat.name}</span>
              {cat.color && (
                <span
                  className="inline-block h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
            </div>
            {cat.description && (
              <p className="text-sm text-muted-foreground truncate">{cat.description}</p>
            )}
          </div>

          {/* Product count */}
          <Badge variant="secondary" className="flex-shrink-0">
            {(cat as any).product_count} produit{(cat as any).product_count !== 1 ? 's' : ''}
          </Badge>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(cat)}
              className="h-7 px-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setDeleteId(cat.id); setConfirmDelete(true); }}
              className="h-7 px-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Render children */}
        {isExpanded &&
          children.map((child) => renderCategoryRow(child as Category & { product_count: number }, depth + 1))}
      </div>
    );
  };

  return (
    <div>
      {/* Search + Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une catégorie..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">
          {total} catégorie{total !== 1 ? 's' : ''}
        </Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Aucune catégorie trouvée</p>
          <p className="text-sm">Ajoutez votre première catégorie pour commencer.</p>
        </div>
      ) : (
        <>
          <div className="space-y-1 mt-4">
            {paginatedRoots.map((root) =>
              renderCategoryRow(root as Category & { product_count: number })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between py-4">
              <p className="text-sm text-muted-foreground">
                Page {page} sur {totalPages} ({total} résultats)
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer cette catégorie ? Les sous-catégories seront également supprimées.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Need to import Dialog for the delete confirmation
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
