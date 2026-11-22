/**
 * Product SKU generation and QR code data utilities.
 */

export interface QRData {
  productId: string;
  templateId: string | null;
  name?: string;
}

/**
 * Generate a unique SKU like SKU-{template}-{4-digit}.
 * If no templateId provided, uses 'GEN' prefix.
 */
export function generateSKU(templateId?: string | null): string {
  const prefix = templateId || 'GEN';
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `SKU-${prefix}-${rand}`;
}

/**
 * Format product data for QR code encoding.
 * Returns a JSON string with productId and templateId.
 */
export function generateQRData(productId: string, templateId?: string | null, name?: string): string {
  const data: QRData = { productId, templateId: templateId ?? null, name };
  return JSON.stringify(data);
}

/**
 * Parse QR code data back into structured format.
 * Returns null if the data is not valid QR JSON.
 */
export function parseQRData(data: string): QRData | null {
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed.productId === 'string') {
      return parsed as QRData;
    }
  } catch {
    // Not valid JSON — could be a direct product ID
    if (data && data.length > 0) {
      return { productId: data, templateId: null };
    }
  }
  return null;
}
