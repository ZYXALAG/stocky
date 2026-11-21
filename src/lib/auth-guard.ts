import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Profile } from '@/types/database';

export async function requireAuth(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect('/login');
    return null;
  }
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (profileError || !profile) {
    redirect('/login');
    return null;
  }
  return profile as Profile;
}
