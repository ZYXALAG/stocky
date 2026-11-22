/**
 * Export utilities — CSV and JSON download helpers.
 */

/** Escape a value for CSV: wraps in quotes if it contains comma, quote, or newline. */
export function sanitizeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert a data array to a CSV blob and trigger download.
 * @param data Array of objects with stringifiable values
 * @param filename Download filename (will add .csv extension)
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) return;

  const headers = Array.from(
    new Set(data.flatMap((row) => Object.keys(row)))
  );

  const csvRows = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((h) => sanitizeCSV(row[h]))
        .join(',')
    ),
  ];

  const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM for Excel UTF-8
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

/**
 * Convert a data array to a JSON blob and trigger download.
 * @param data Array of objects
 * @param filename Download filename (will add .json extension)
 */
export function exportToJSON(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) return;

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  triggerDownload(blob, `${filename}.json`);
}

/**
 * Extract an HTML table by ID and convert it to a CSV blob.
 * @param tableId DOM id of the table element
 * @param filename Download filename
 */
export function exportTableToCSV(tableId: string, filename: string): void {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tr'));
  const csvRows: string[] = [];

  for (const row of rows) {
    const cells = Array.from(row.querySelectorAll('th, td'));
    const rowData = cells.map((cell) => sanitizeCSV(cell.textContent?.trim() || ''));
    csvRows.push(rowData.join(','));
  }

  const csvContent = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.csv`);
}

/**
 * Internal helper: creates a download link and clicks it.
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Build a header row and data rows from objects for CSV.
 * Useful for custom CSV generation.
 */
export function buildCSVString(data: Record<string, any>[], headerOrder?: string[]): string {
  if (!data || data.length === 0) return '';

  const headers = headerOrder || Array.from(
    new Set(data.flatMap((row) => Object.keys(row)))
  );

  const lines: string[] = [headers.join(',')];

  for (const row of data) {
    lines.push(headers.map((h) => sanitizeCSV(row[h])).join(','));
  }

  return lines.join('\n');
}

/**
 * Convert data to Excel-compatible CSV (semicolon-separated for French locale).
 */
export function exportToExcelCSV(data: Record<string, any>[], filename: string): void {
  if (!data || data.length === 0) return;

  const headers = Array.from(
    new Set(data.flatMap((row) => Object.keys(row)))
  );

  const csvRows = [
    headers.join(';'),
    ...data.map((row) =>
      headers
        .map((h) => sanitizeCSV(row[h]))
        .join(';')
    ),
  ];

  const csvContent = '\uFEFF' + csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${filename}.xlsx`);
}
