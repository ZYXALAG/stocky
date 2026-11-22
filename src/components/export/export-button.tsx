'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Download,
  Loader2,
  FileSpreadsheet,
  FileJson,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToCSV, exportToJSON, exportToExcelCSV } from '@/lib/export';
import toast from 'react-hot-toast';

export interface ExportButtonProps {
  data: Record<string, any>[];
  filename?: string;
  selectedCount?: number;
  onExportSelected?: () => void;
}

export function ExportButton({
  data,
  filename = 'export',
  selectedCount = 0,
  onExportSelected,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const doExport = useCallback(
    (format: 'csv' | 'json' | 'excel') => {
      setExporting(format);
      try {
        if (format === 'csv') {
          exportToCSV(data, filename);
        } else if (format === 'json') {
          exportToJSON(data, filename);
        } else {
          exportToExcelCSV(data, filename);
        }
        toast.success(`Export ${format.toUpperCase()} lancé (${data.length} lignes)`);
      } catch (err: any) {
        console.error('Export failed:', err);
        toast.error(`Erreur lors de l'export ${format.toUpperCase()}`);
      } finally {
        setExporting(null);
      }
    },
    [data, filename]
  );

  const handleExportSelected = useCallback(() => {
    if (onExportSelected) {
      setExporting('csv');
      try {
        onExportSelected();
      } catch (err: any) {
        console.error('Export selected failed:', err);
        toast.error('Erreur lors de l\'export des éléments sélectionnés');
      } finally {
        setExporting(null);
      }
    }
  }, [onExportSelected]);

  const spinner = exporting ? (
    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
  ) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={data.length === 0}>
          <Download className="h-4 w-4" />
          Exporter
          {selectedCount > 0 && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {selectedCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Exporter sous</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => doExport('csv')} disabled={!!exporting}>
          {exporting === 'csv' ? spinner : <FileSpreadsheet className="mr-2 h-4 w-4" />}
          CSV
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => doExport('json')} disabled={!!exporting}>
          {exporting === 'json' ? spinner : <FileJson className="mr-2 h-4 w-4" />}
          JSON
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => doExport('excel')} disabled={!!exporting}>
          {exporting === 'excel' ? spinner : <FileText className="mr-2 h-4 w-4" />}
          Excel (.xlsx)
        </DropdownMenuItem>

        {selectedCount > 0 && onExportSelected && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportSelected} disabled={!!exporting}>
              {exporting ? spinner : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Exporter la sélection ({selectedCount})
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
