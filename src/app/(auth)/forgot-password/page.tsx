'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Adresse email invalide'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError('');
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Vérifiez votre boîte mail</h2>
        <p className="text-sm text-gray-500">
          Nous vous avons envoyé un lien de réinitialisation. Vérifiez votre boîte de réception.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Mot de passe oublié ?</h2>
        <p className="text-sm text-gray-500 mt-1">
          Entrez votre adresse email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Adresse email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="nom@exemple.com"
            className="pl-10"
            {...register('email')}
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Envoyer le lien
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
