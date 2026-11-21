'use client';

import { useAuth } from '@/context/AuthContext';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SignOutButton({ className }: { className?: string }) {
  const { signOut } = useAuth();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={signOut}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Se déconnecter
    </Button>
  );
}
