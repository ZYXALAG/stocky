// Supplier type definitions for the Stocky inventory system

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierFormData {
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  website: string;
  notes: string;
}

export interface SupplierWithProducts {
  supplier: Supplier;
  products_count: number;
}

export const COUNTRIES = [
  'France', 'Belgique', 'Suisse', 'Canada', 'Luxembourg', 'Allemagne',
  'Espagne', 'Italie', 'Portugal', 'Royaume-Uni', 'États-Unis', 'Maroc',
  'Algérie', 'Tunisie', 'Sénégal', 'Côte d\'Ivoire', 'Chine', 'Japon',
  'Brésil', 'Australie', 'Pays-Bas', 'Belgique', 'Autriche', 'Pologne',
  'Turquie', 'Roumanie', 'République tchèque', 'Suède', 'Norvège', 'Danemark',
  'Finlande', 'Grèce', 'Irlande', 'Mexique', 'Argentine', 'Colombie',
] as const;

/**
 * Generate an SVG avatar data URL from initials.
 */
export function getSupplierAvatar(initials: string): string {
  const colors = ['#0D6EFD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  const color = colors[Math.abs(hashStr(initials)) % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="60" fill="${color}"/>
    <text x="60" y="72" font-family="system-ui" font-size="48" font-weight="bold" fill="white" text-anchor="middle">${initials.toUpperCase()}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h;
}
