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
import { type Supplier, type SupplierFormData, COUNTRIES } from '@/types/supplier';

const supplierSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  contact_person: z.string().min(0),
  email: z.string().email('Email invalide').or(z.literal('')),
  phone: z.string().min(0),
  address: z.string().min(0),
  city: z.string().min(0),
  postal_code: z.string().min(0),
  country: z.string().min(0),
  website: z.string().url('URL invalide').or(z.literal('')),
  notes: z.string().min(0),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function SupplierForm({ supplier, open, onOpenChange, onSave }: SupplierFormProps) {
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'France',
      website: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (supplier) {
        setValue('name', supplier.name);
        setValue('contact_person', supplier.contact_person ?? '');
        setValue('email', supplier.email ?? '');
        setValue('phone', supplier.phone ?? '');
        setValue('address', supplier.address ?? '');
        setValue('city', supplier.city ?? '');
        setValue('postal_code', supplier.postal_code ?? '');
        setValue('country', supplier.country ?? '');
        setValue('website', supplier.website ?? '');
        setValue('notes', supplier.notes ?? '');
      } else {
        reset({
          name: '',
          contact_person: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postal_code: '',
          country: 'France',
          website: '',
          notes: '',
        });
      }
    }
  }, [open, supplier, setValue, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    try {
      const supabase = createClient();
      const payload = {
        name: data.name,
        contact_person: data.contact_person || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        postal_code: data.postal_code || null,
        country: data.country || null,
        website: data.website || null,
        notes: data.notes || null,
      };

      if (supplier) {
        await supabase.from('suppliers').update(payload).eq('id', supplier.id);
        toast({ title: 'Fournisseur modifié', description: `${data.name} a été mis à jour.` });
      } else {
        await supabase.from('suppliers').insert(payload);
        toast({ title: 'Fournisseur créé', description: `${data.name} a été ajouté.` });
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
            {supplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name">Nom du fournisseur *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: TechSupplies SAS"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* Contact + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Personne de contact</Label>
              <Input
                id="contact_person"
                {...register('contact_person')}
                placeholder="Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="contact@example.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>

          {/* Phone + Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+33 1 23 45 67 89"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                type="url"
                {...register('website')}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Address + City + Postal */}
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              {...register('address')}
              placeholder="123 Rue de la Paix"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                {...register('postal_code')}
                placeholder="75001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Select
                value={supplier ? (supplier.country ?? 'France') : undefined}
                onValueChange={(v) => setValue('country', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Notes optionnelles..."
              rows={3}
            />
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
              {isSubmitting ? 'Sauvegarde...' : supplier ? 'Modifier' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
