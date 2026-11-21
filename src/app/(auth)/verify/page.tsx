import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vérifier votre email — Stocky',
  description: 'Vérifiez votre adresse email pour activer votre compte.',
};

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à la connexion
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vérifiez votre email</h1>
              <p className="text-sm text-gray-500 mt-2">
                Nous vous avons envoyé un email de vérification. Veuillez cliquer sur le lien dans l&apos;email pour activer votre compte.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg p-4">
              <p className="font-medium">Vous ne recevez pas l&apos;email ?</p>
              <p className="mt-1">Vérifiez votre dossier spam ou essayez de demander un nouvel email.</p>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Stocky. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
