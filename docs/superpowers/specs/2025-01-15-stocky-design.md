# Stocky - Design Doc

## Introduction
Application de gestion de stock universelle, accessible web/mobile/desktop, gratuite (Vercel + Supabase), au design moderne épuré avec bleu électrique comme couleur principale.

## Vision
Permettre à n'importe qui de gérer son stock efficacement : un particulier, un petit commerce, un atelier. La flexibilité des templates et des champs configurables est la différenciation principale.

## Objectifs
- Gestion de stock de tout type (objets, produits, matériel)
- Photos de produits possibles ou optionnelles
- Champs de produits entièrement configurables
- Templates pré-construits (électronique, vêtements, alimentaire, bricolage, personnel)
- Interface responsive 3 plateformes : web, mobile (Capacitor), desktop (Capacitor)
- Zéro coût d'hébergement

## Fonctionnalités
1. **Dashboard** : KPIs (valeur stock, produits critiques, mouvements récents, graphiques)
2. **Gestion Produits** : CRUD complet, photo, champs personnalisables, templates
3. **Templates** : 5 templates prédéfinis + création personnalisable
4. **Mouvements** : Entrées/Sorties avec historique, justification
5. **Alertes Stock Bas** : seuils configurables + notifications email
6. **Recherche & Filtres** : avancés, multi-critères
7. **Export CSV** : données complètes ou filtrées
8. **Code-barres/QR** : scan caméra mobile, génération QR pour étiquettes
9. **Fournisseurs** : gestion des contacts fournisseurs
10. **Catégories** : hiérarchie personnalisable
11. **Authentification** : email + mot de passe (Supabase Auth)

## Contraintes
- Stack 100% gratuite (Vercel free + Supabase free)
- Capacitor pour iOS, Android, Windows, macOS, Linux
- Design moderne épuré, bleu électrique (#0D6EFD) comme couleur principale
- Application responsive et PWA
- Supabase free plan : 500MB DB, 1GB storage, 50k MAU

## Architecture
```
┌─────────────────────────────────────────────┐
│                  Capacitor                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  iOS     │  │ Android  │  │ Desktop  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │             │         │
└───────┼──────────────┼─────────────┼─────────┘
        │              │             │
        └──────────────┴─────────────┘
                      │
              ┌───────┴────────┐
              │  Web (Vercel)   │
              │  Next.js 14+    │
              │  TypeScript     │
              │  Tailwind CSS   │
              │  Shadcn/ui      │
              └───────┬─────────┘
                      │
              ┌───────┴─────────┐
              │   Supabase      │
              │  PostgreSQL     │
              │  Auth + Storage │
              │  Realtime       │
              └─────────────────┘
```

## Schéma de base de données (Supabase)

### Tables principales :
- `profiles` — données utilisateur (rattaché à auth.users)
- `templates` — templates de champs de produits
- `fields` — champs personnalisables liés à un template
- `products` — produits avec données dynamiques (JSONB)
- `categories` — catégories hiérarchiques
- `suppliers` — fournisseurs
- `stock_movements` — historique entrées/sorties
- `alerts` — alertes configurées
- `settings` — paramètres utilisateur

## Décisions d'implémentation
- **Framework** : Next.js 14 App Router (SSR + API routes)
- **UI** : Shadcn/ui + Tailwind CSS (design moderne, bleu électrique)
- **Backend** : Supabase client JS direct depuis le frontend
- **Mobile/Desktop** : Capacitor (projet web unique, compilation native)
- **PWA** : manifest.json + service worker (installable)
- **Bleu électrique** : #0D6EFD (primary), #3399FF (light), #0052CC (dark)
