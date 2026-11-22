'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Supplier } from '@/types/supplier';
import { SupplierForm } from '@/components/suppliers/supplier-form';
import { SupplierList } from '@/components/suppliers/supplier-list';
import { SupplierDetail } from '@/components/suppliers/supplier-detail';
import { createClient } from '@/lib/supabase/client';
import { toast } from '@/hooks/use-toast';

type Tab = 'list' | 'detail';

export default function FournisseursPage() {
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const handleNew = () => {
    setEditingSupplier(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormOpen(true);
  };

  const handleDetail = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setActiveTab('detail');
  };

  const handleSave = async () => {
    // Force re-render
    setActiveTab('list');
    setSelectedSupplier(null);
    toast({ title: 'Sauvegardé', description: 'Les modifications ont été appliquées.' });
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'list', label: 'Liste' },
    { key: 'detail', label: 'Détail' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fournisseurs</h1>
            <p className="text-muted-foreground">
              Gérez vos fournisseurs et leurs informations
            </p>
          </div>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau fournisseur
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              if (tab.key === 'list') {
                setSelectedSupplier(null);
              }
            }}
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <Separator />

      {activeTab === 'list' && (
        <SupplierList
          onEdit={handleEdit}
          onDetail={handleDetail}
        />
      )}

      {activeTab === 'detail' && selectedSupplier && (
        <SupplierDetail
          supplier={selectedSupplier}
          onEdit={handleEdit}
          onDelete={(id) => {
            // Delete handled by list component
            setActiveTab('list');
            setSelectedSupplier(null);
            toast({ title: 'Fournisseur supprimé', description: 'Le fournisseur a été supprimé.' });
          }}
          onBack={() => { setActiveTab('list'); setSelectedSupplier(null); }}
        />
      )}

      {activeTab === 'detail' && !selectedSupplier && (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Aucun fournisseur sélectionné</p>
          <p className="text-sm">Sélectionnez un fournisseur dans la liste.</p>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <SupplierForm
        supplier={editingSupplier}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
      />
    </div>
  );
}
