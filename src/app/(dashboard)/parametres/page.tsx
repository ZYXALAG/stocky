'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone,
  WifiOff,
  Trash2,
  Moon,
  Sun,
  Monitor,
  LogOut,
  User,
  Key,
  Shield,
  Database,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { clearAllOfflineData } from '@/lib/storage-offline';
import { isNative } from '@/lib/camera-native';
import { useTheme } from '@/components/layout/theme-provider';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const themes: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ];

  return (
    <div className="flex gap-2">
      {themes.map((t) => {
        const Icon = t.icon;
        return (
          <Button
            key={t.value}
            variant={theme === t.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme(t.value)}
            className="gap-2"
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

export default function ParametresPage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [clearing, setClearing] = useState(false);

  const handleClearOffline = async () => {
    setClearing(true);
    try {
      await clearAllOfflineData();
    } finally {
      setClearing(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="space-y-6 p-4 pb-20 lg:pb-4">
      <InstallPrompt />

      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Gestion de l&apos;application, offline et compte
        </p>
      </div>

      {/* App Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            À propos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Version</span>
            <Badge variant="secondary">{APP_VERSION}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="flex items-center gap-1">
              {isNative() ? (
                <>
                  <Smartphone className="h-3 w-3 text-primary" />
                  <span>App native (Capacitor)</span>
                </>
              ) : (
                <>
                  <Monitor className="h-3 w-3 text-muted-foreground" />
                  <span>Web</span>
                </>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Connectivité</span>
            <span className="flex items-center gap-1">
              {typeof navigator !== 'undefined' && navigator.onLine ? (
                <>
                  <WifiOff className="h-3 w-3 text-green-500 rotate-45" />
                  <span className="text-green-500">En ligne</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">Hors ligne</span>
                </>
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sun className="h-4 w-4 text-primary" />
            Apparence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      {/* Offline Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <WifiOff className="h-4 w-4 text-primary" />
            Données hors ligne
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Supprimez les données mises en cache et les opérations en attente.
          </p>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearOffline}
            disabled={clearing}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {clearing ? 'Suppression…' : 'Effacer les données offline'}
          </Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" />
            Compte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {user?.email || 'Utilisateur'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              Profil
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Key className="h-4 w-4" />
              Mot de passe
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Shield className="h-4 w-4" />
              Sécurité
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="gap-2 text-red-500 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
