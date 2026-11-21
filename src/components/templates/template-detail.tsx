'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Copy, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { formatDate } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { Template, TemplateWithFields, TemplateField } from '@/types/template';

interface TemplateDetailProps {
  templateId: string;
  onBack: () => void;
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Texte',
  number: 'Nombre',
  currency: 'Devise',
  date: 'Date',
  select: 'Liste',
  checkbox: 'Case',
  textarea: 'Zone de texte',
};

const FIELD_TYPE_COLORS: Record<string, string> = {
  text: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  number: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  currency: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  date: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  select: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  checkbox: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  textarea: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300',
};

export function TemplateDetail({ templateId, onBack }: TemplateDetailProps) {
  const [template, setTemplate] = useState<TemplateWithFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data: tpl, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();
      if (error) throw error;

      const { data: fields, error: fieldError } = await supabase
        .from('fields')
        .select('*')
        .eq('template_id', templateId)
        .order('order');
      if (fieldError) throw fieldError;

      setTemplate({
        ...tpl,
        fields: (fields || []) as TemplateField[],
      });
    } catch (err) {
      console.error('Failed to fetch template:', err);
      toast({ title: 'Erreur', description: 'Impossible de charger le template.' });
    } finally {
      setLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleDelete = async () => {
    try {
      const supabase = createClient();
      await supabase.from('templates').delete().eq('id', templateId);
      toast({ title: 'Template supprimé', description: `${template?.name} a été supprimé.` });
      onBack();
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast({ title: 'Erreur', description: err.message ?? 'Suppression échouée.' });
    }
  };

  const handleDuplicate = async () => {
    if (!template) return;
    try {
      const supabase = createClient();

      // Create new template
      const { data: newTpl, error: tplError } = await supabase
        .from('templates')
        .insert({
          name: `${template.name} (copie)`,
          description: template.description,
          icon: template.icon,
        })
        .select()
        .single();
      if (tplError) throw tplError;

      // Duplicate fields
      if (template.fields.length > 0) {
        const newFields = template.fields.map((f) => ({
          template_id: newTpl.id,
          name: f.name,
          type: f.type,
          label: f.label,
          required: f.required,
          options: f.options,
          order: f.order,
        }));
        const { error: fieldError } = await supabase.from('fields').insert(newFields);
        if (fieldError) throw fieldError;
      }

      toast({ title: 'Template dupliqué', description: `${template.name} a été copié.` });
      fetchTemplate();
    } catch (err: any) {
      console.error('Duplicate failed:', err);
      toast({ title: 'Erreur', description: err.message ?? 'Duplication échouée.' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">Template introuvable</p>
        <Button variant="link" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{template.icon || '📦'}</span>
            <div>
              <h1 className="text-2xl font-bold">{template.name}</h1>
              {template.description && (
                <p className="text-sm text-muted-foreground">{template.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
          >
            <Copy className="mr-2 h-4 w-4" />
            Dupliquer
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <Separator />

      {/* Template Info */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Champs personnalisés</p>
          <p className="mt-1 text-2xl font-bold font-mono">{template.fields.length}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Créé le</p>
          <p className="mt-1 text-sm font-medium">{formatDate(template.created_at)}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Modifié le</p>
          <p className="mt-1 text-sm font-medium">{formatDate(template.updated_at)}</p>
        </div>
      </div>

      <Separator />

      {/* Fields Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Champs du template</h2>
          <Badge variant="outline" className="text-sm flex items-center gap-1">
            <Globe className="h-3.5 w-3.5" />
            Utilisé par les produits
          </Badge>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Ordre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Libellé</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Nom</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Type</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground">Requis</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Options</th>
              </tr>
            </thead>
            <tbody>
              {template.fields.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun champ dans ce template. Ajoutez des champs personnalisés.
                  </td>
                </tr>
              ) : (
                template.fields.map((field, idx) => (
                  <tr key={field.id} className="border-b last:border-b-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs">{idx + 1}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{field.label}</td>
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{field.name}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className={`${FIELD_TYPE_COLORS[field.type] || ''} text-xs font-normal`}
                      >
                        {FIELD_TYPE_LABELS[field.type] || field.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {field.required ? (
                        <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Optionnel</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {field.options && field.options.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {field.options.slice(0, 3).map((opt: any, oi: number) => (
                            <Badge key={oi} variant="outline" className="text-xs">
                              {opt.label || opt.value || '…'}
                            </Badge>
                          ))}
                          {field.options.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{field.options.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products using this template */}
      <div className="rounded-lg border p-4">
        <h3 className="font-semibold mb-2">Produits utilisant ce template</h3>
        <TemplateProductCount templateId={templateId} />
      </div>

      {/* Delete Confirmation */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Êtes-vous sûr de vouloir supprimer "{template.name}" et tous ses champs ?
            Cette action est irréversible.
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

function TemplateProductCount({ templateId }: { templateId: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const supabase = createClient();
        const { count, error } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('template_id', templateId);
        if (error) throw error;
        setCount(count || 0);
      } catch (err) {
        console.error('Failed to fetch product count:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, [templateId]);

  if (loading) {
    return <span className="text-sm text-muted-foreground">Chargement...</span>;
  }

  if (!count || count === 0) {
    return <span className="text-sm text-muted-foreground">Aucun produit n&apos;utilise ce template.</span>;
  }

  return (
    <span className="text-sm">
      <span className="font-semibold text-foreground">{count}</span> produit{count > 1 ? 's' : ''} utilise(nt) ce template.
    </span>
  );
}
