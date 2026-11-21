'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Edit, Copy, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Template, TemplateWithFields } from '@/types/template';

interface TemplateListProps {
  onEdit: (template: TemplateWithFields) => void;
  onDelete: (template: TemplateWithFields) => void;
}

const PAGE_SIZE = 12;

export function TemplateList({ onEdit, onDelete }: TemplateListProps) {
  const [templates, setTemplates] = useState<TemplateWithFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<TemplateWithFields | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      let query = supabase
        .from('templates')
        .select('*', { count: 'exact' })
        .order('name')
        .range(start, end);

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      // Fetch fields for each template
      const ids = (data || []).map((t: Template) => t.id);
      let fieldsData: TemplateWithFields[] = [];
      if (ids.length > 0) {
        const { data: fields, error: fieldError } = await supabase
          .from('fields')
          .select('*')
          .in('template_id', ids)
          .order('order');
        if (fieldError) throw fieldError;

        fieldsData = (data || []).map((t: Template) => ({
          ...t,
          fields: (fields || []).filter((f: any) => f.template_id === t.id),
        }));
      } else {
        fieldsData = (data || []).map((t: Template) => ({ ...t, fields: [] }));
      }

      setTemplates(fieldsData);
      setTotal(count || 0);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const supabase = createClient();
      await supabase.from('templates').delete().eq('id', confirmDelete.id);
      toast({ title: 'Template supprimé', description: `${confirmDelete.name} a été supprimé.` });
      fetchTemplates();
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast({ title: 'Erreur', description: 'La suppression a échoué.' });
    } finally {
      setConfirmDelete(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un template..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">
              {total} template{total !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <svg
            className="mb-4 h-12 w-12 opacity-30"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          <p className="text-lg font-medium">Aucun template trouvé</p>
          <p className="text-sm">
            {search ? 'Essayez avec un autre terme de recherche.' : 'Créez votre premier template pour commencer.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{t.icon || '📦'}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{t.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {t.description || 'Pas de description'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className="text-xs">
                    {t.fields.length} champ{t.fields.length !== 1 ? 's' : ''}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Créé le {formatDate(t.created_at)}
                  </span>
                </div>

                {/* Field list preview */}
                {t.fields.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {t.fields.slice(0, 4).map((f) => (
                      <div key={f.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="truncate">{f.label}</span>
                        {f.required && <span className="text-destructive">*</span>}
                      </div>
                    ))}
                    {t.fields.length > 4 && (
                      <p className="text-xs text-muted-foreground italic">
                        +{t.fields.length - 4} autre{t.fields.length - 4 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(t)}
                    className="text-xs h-7"
                  >
                    <Edit className="mr-1 h-3.5 w-3.5" />
                    Modifier
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setConfirmDelete(t);
                      }}
                      className="text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
                  Précédent
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          {confirmDelete && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{confirmDelete.icon || '📦'}</span>
                <div>
                  <p className="font-medium">{confirmDelete.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {confirmDelete.fields.length} champ{confirmDelete.fields.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer ce template et tous ses champs ?
                Cette action est irréversible.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
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
