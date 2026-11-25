'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Vérification en cours...');

  useEffect(() => {
    const verify = async () => {
      const supabase = createClient();
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Error case
      if (error) {
        setStatus('error');
        setMessage(errorDescription || 'Lien de vérification invalide.');
        return;
      }

      // Verify the code
      if (code) {
        try {
          await supabase.auth.verifyOtp({
            email: searchParams.get('email') || '',
            token: code,
            type: 'email',
          });
          setStatus('success');
          setMessage('Compte vérifié avec succès ! Redirection...');
          setTimeout(() => router.push('/login'), 2000);
        } catch (err) {
          setStatus('error');
          setMessage('Lien expiré ou invalide. Veuillez vous reconnecter.');
        }
        return;
      }

      // No code params — just show info page
      setStatus('success');
      setMessage('Vérifiez votre email pour activer votre compte.');
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-6 space-y-4 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
              <h1 className="text-xl font-semibold">Vérification...</h1>
              <p className="text-sm text-muted-foreground">
                Nous vérifions votre lien, veuillez patienter.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Email vérifié !
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-3 w-3" />
                Aller à la connexion
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                Erreur de vérification
              </h1>
              <p className="text-sm text-muted-foreground">{message}</p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          © 2026 Stocky. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
