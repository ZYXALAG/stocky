'use client';

import { useState, useCallback } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TemplateList } from '@/components/templates/template-list';
import { TemplateDetail } from '@/components/templates/template-detail';
import { TemplateForm } from '@/components/templates/template-form';
import type { TemplateWithFields } from '@/types/template';

type View = 'list' | 'detail';

export default function TemplatesPage() {
  const [view, setView] = useState<View>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateWithFields | null>(null);

  // Template form
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateWithFields | null>(null);

  const handleEdit = (template: TemplateWithFields) => {
    setEditingTemplate(template);
    setTemplateFormOpen(true);
  };

  const handleDelete = (template: TemplateWithFields) => {
    // Delete handled inline in TemplateList confirmation
  };

  const handleViewDetail = (template: TemplateWithFields) => {
    setSelectedTemplate(template);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedTemplate(null);
  };

  const handleSave = () => {
    setView('list');
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Templates</h1>
            <p className="text-muted-foreground">
              Créez et gérez vos templates de champs personnalisés
            </p>
          </div>
        </div>
        <Button onClick={() => {
          setEditingTemplate(null);
          setTemplateFormOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau template
        </Button>
      </div>

      {/* View */}
      {view === 'list' && (
        <TemplateList
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {view === 'detail' && selectedTemplate && (
        <TemplateDetail
          templateId={selectedTemplate.id}
          onBack={handleBack}
        />
      )}

      {/* Template Create/Edit Dialog */}
      <TemplateForm
        template={editingTemplate}
        open={templateFormOpen}
        onOpenChange={(open) => {
          if (!open) setEditingTemplate(null);
          setTemplateFormOpen(open);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
