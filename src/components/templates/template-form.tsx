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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import {
  type Template,
  type TemplateField,
  type TemplateFormData,
  type FieldFormData,
  TEMPLATE_ICONS,
} from '@/types/template';

// ─── Template Form (name, description, icon) ──────────────────────────

const templateFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  description: z.string().min(0),
  icon: z.string().min(0),
});

export type TemplateFormValues = z.infer<typeof templateFormSchema>;

interface TemplateFormProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

// Wrapper Select for react-hook-form
function FormSelect({
  value,
  onValueChange,
  placeholder,
  children,
}: {
  value: string | undefined;
  onValueChange: (v: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

export function TemplateForm({ template, open, onOpenChange, onSave }: TemplateFormProps) {
  const [loading, setLoading] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: '',
      description: '',
      icon: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (template) {
        setValue('name', template.name);
        setValue('description', template.description ?? '');
        setValue('icon', template.icon ?? '');
      } else {
        reset({ name: '', description: '', icon: '' });
      }
    }
  }, [open, template, setValue, reset]);

  const onSubmit = async (data: TemplateFormValues) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const payload: Record<string, any> = {
        name: data.name,
        description: data.description || null,
        icon: data.icon || null,
      };

      if (template) {
        await supabase.from('templates').update(payload).eq('id', template.id);
        toast({ title: 'Template modifié', description: `${data.name} a été mis à jour.` });
      } else {
        const { data: inserted, error } = await supabase
          .from('templates')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        // Save the newly created template id for field operations
        (window as any).__lastCreatedTemplateId = inserted?.id;
        toast({ title: 'Template créé', description: `${data.name} a été ajouté.` });
      }
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message ?? 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Modifier le template' : 'Nouveau template'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Icon picker */}
          <div className="space-y-2">
            <Label>Icône</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted p-2 flex-1 cursor-pointer"
                   onClick={() => setIconPickerOpen(true)}>
                <span className="text-2xl">{template?.icon || '📦'}</span>
                <span className="text-sm text-muted-foreground">Choisir une icône</span>
              </div>
            </div>
          </div>

          {/* Icon Picker Dialog */}
          <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Choisir une icône</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-4 gap-3 py-4">
                {TEMPLATE_ICONS.map((ic) => (
                  <button
                    key={ic.value}
                    type="button"
                    onClick={() => {
                      setValue('icon', ic.value);
                      setIconPickerOpen(false);
                    }}
                    className={`
                      flex flex-col items-center gap-1 rounded-lg border p-3 transition-colors
                      ${(template?.icon ?? '') === ic.value
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-accent'}
                    `}
                  >
                    <span className="text-3xl">{ic.value}</span>
                    <span className="text-xs text-muted-foreground">{ic.label}</span>
                  </button>
                ))}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIconPickerOpen(false)}>
                  Fermer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du template *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Électronique"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
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

          <DialogFooter className="sm:justify-between">
            {template && (
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (!template || !confirm(`Supprimer "${template.name}" ?`)) return;
                  try {
                    const supabase = createClient();
                    await supabase.from('templates').delete().eq('id', template.id);
                    toast({ title: 'Template supprimé', description: `${template.name} a été supprimé.` });
                    onSave();
                    onOpenChange(false);
                  } catch (err: any) {
                    toast({ title: 'Erreur', description: err.message ?? 'Suppression échouée.' });
                  }
                }}
                disabled={isSubmitting}
              >
                Supprimer
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Sauvegarde...' : template ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Field Form (create/edit field within a template) ─────────────────

const fieldFormSchema = z.object({
  name: z.string().min(1, 'Le nom du champ est requis'),
  type: z.enum(['text', 'number', 'date', 'select', 'checkbox', 'textarea', 'currency']),
  label: z.string().min(1, 'Le libellé est requis'),
  required: z.boolean(),
  options: z.string().optional(), // JSON string for options
  order: z.number(),
});

export type FieldFormValues = z.infer<typeof fieldFormSchema>;

interface FieldFormProps {
  templateId: string;
  field: TemplateField | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function FieldForm({ templateId, field, open, onOpenChange, onSave }: FieldFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FieldFormValues>({
    resolver: zodResolver(fieldFormSchema),
    defaultValues: {
      name: '',
      type: 'text' as const,
      label: '',
      required: false,
      options: '',
      order: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (field) {
        setValue('name', field.name);
        setValue('type', field.type);
        setValue('label', field.label);
        setValue('required', field.required);
        setValue('order', field.order);
        setValue('options', field.options ? JSON.stringify(field.options, null, 2) : '');
      } else {
        reset({
          name: '',
          type: 'text' as const,
          label: '',
          required: false,
          options: '',
          order: 0,
        });
      }
    }
  }, [open, field, setValue, reset]);

  const onSubmit = async (data: FieldFormValues) => {
    setLoading(true);
    try {
      const supabase = createClient();
      let options = null;
      if (data.options) {
        try {
          options = JSON.parse(data.options);
        } catch {
          toast({ title: 'Erreur', description: 'Format JSON invalide pour les options.' });
          return;
        }
      }

      const payload: Record<string, any> = {
        name: data.name,
        type: data.type,
        label: data.label,
        required: data.required,
        options,
        order: data.order,
        template_id: templateId,
      };

      if (field) {
        await supabase.from('fields').update(payload).eq('id', field.id);
        toast({ title: 'Champ modifié', description: `${data.label} a été mis à jour.` });
      } else {
        await supabase.from('fields').insert(payload);
        toast({ title: 'Champ créé', description: `${data.label} a été ajouté.` });
      }
      onSave();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message ?? 'Une erreur est survenue.' });
    } finally {
      setLoading(false);
    }
  };

  const fieldTypes: { value: FieldFormValues['type']; label: string }[] = [
    { value: 'text', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'currency', label: 'Devise' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'checkbox', label: 'Case à cocher' },
    { value: 'textarea', label: 'Zone de texte' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {field ? 'Modifier le champ' : 'Nouveau champ'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="field-name">Nom technique *</Label>
            <Input
              id="field-name"
              {...register('name')}
              placeholder="Ex: marque, modele, prix..."
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="field-label">Libellé affiché *</Label>
            <Input
              id="field-label"
              {...register('label')}
              placeholder="Ex: Marque du produit"
              className={errors.label ? 'border-destructive' : ''}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label.message}</p>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="field-type">Type</Label>
            <FormSelect
              value={field ? field.type : undefined}
              onValueChange={(v) => setValue('type', v as FieldFormValues['type'])}
              placeholder="Sélectionner un type..."
            >
              {fieldTypes.map((ft) => (
                <SelectItem key={ft.value} value={ft.value}>{ft.label}</SelectItem>
              ))}
            </FormSelect>
          </div>

          {/* Options (only for select type) */}
          {(field?.type || 'text') === 'select' && (
            <div className="space-y-2">
              <Label htmlFor="field-options">Options (JSON)</Label>
              <Textarea
                id="field-options"
                {...register('options')}
                placeholder='[{"value":"option1","label":"Option 1"},{"value":"option2","label":"Option 2"}]'
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Liste d&apos;objets JSON avec &apos;value&apos; et &apos;label&apos;
              </p>
            </div>
          )}

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="field-order">Ordre d&apos;affichage</Label>
            <Input
              id="field-order"
              type="number"
              min={0}
              {...register('order')}
            />
          </div>

          {/* Required checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="field-required"
              checked={field?.required ?? false}
              onCheckedChange={(checked) => setValue('required', !!checked)}
            />
            <Label htmlFor="field-required" className="cursor-pointer">
              Champ obligatoire
            </Label>
          </div>

          <DialogFooter className="sm:justify-between">
            {field && (
              <Button
                type="button"
                variant="destructive"
                onClick={async () => {
                  if (!field || !confirm(`Supprimer le champ "${field.label}" ?`)) return;
                  try {
                    const supabase = createClient();
                    await supabase.from('fields').delete().eq('id', field.id);
                    toast({ title: 'Champ supprimé', description: `${field.label} a été supprimé.` });
                    onSave();
                    onOpenChange(false);
                  } catch (err: any) {
                    toast({ title: 'Erreur', description: err.message ?? 'Suppression échouée.' });
                  }
                }}
                disabled={isSubmitting}
              >
                Supprimer
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting || loading}>
                {isSubmitting || loading ? 'Sauvegarde...' : field ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
