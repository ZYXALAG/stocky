export const COLORS = {
  primary: '#0D6EFD',
  primaryLight: '#3399FF',
  primaryDark: '#0052CC',
} as const;

export const SUPABASE = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;
