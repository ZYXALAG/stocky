'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [checking, setChecking] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError('Le lien de réinitialisation est invalide ou expiré.');
      } else {
        setIsSessionValid(true);
      }
      setChecking(false);
    };
    checkSession();
  }, []);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (updateError) {
        setError(updateError.message);
      } else {
        router.push('/login');
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Réinitialiser le mot de passe</h2>
        <p className="text-sm text-gray-500 mt-1">
          Entrez votre nouveau mot de passe
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Nouveau mot de passe
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            {...register('password')}
            disabled={isLoading}
          />
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Confirmer le nouveau mot de passe
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            {...register('confirmPassword')}
            disabled={isLoading}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !isSessionValid || checking}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Réinitialiser
      </Button>

      <div className="text-center text-sm text-gray-500 mt-4">
        <Link href="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:underline">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordForm() {
  return (
    <Suspense>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
