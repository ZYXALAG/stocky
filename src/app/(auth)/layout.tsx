'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Stocky</h1>
            <p className="text-sm text-gray-500 mt-1">Gestion d&apos;inventaire universelle</p>
          </div>
          {children}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Stocky. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
