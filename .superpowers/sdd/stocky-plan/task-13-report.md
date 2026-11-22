# Task 13 Report — PWA & Capacitor

## What was done

All 14 steps from the brief were completed:

### 1. PWA Manifest (`public/manifest.json`)
- Full manifest.json with name, short_name, description, start_url `/`, display `standalone`, orientation `any-any`
- Icon references pointing to `/icons/icon-192.png` and `/icons/icon-512.png`
- `theme_color`, `background_color`, `lang` configured

### 2. Service Worker (`src/app/sw.ts`)
- Uses Workbox v6: precaching, stale-while-revalidate for API routes, cache-first for images
- Registration route with background sync support
- ClientsClaim + skipWaiting

### 3. Next.js Config (`next.config.js`)
- Switched from `next.config.mjs` (ESM) to `next.config.js` (CJS) with `next-pwa` integration
- PWA disabled in development, precaches all static assets
- Routes configured for dashboard pages

### 4. Offline Banner (`src/components/pwa/offline-banner.tsx`)
- Uses `navigator.onLine` + `online`/`offline` events
- Shows `WifiOff` warning bar when offline
- Shows pending movement count from queue when offline
- Auto-hides when connection restored

### 5. Capacitor Config (`capacitor.config.ts`)
- `appId: com.stocky.app`, `appName: Stocky`
- `webDir: .next`, server pointing to `localhost:3000`
- Plugins: Camera, Preferences configured

### 6. Camera-Native Wrapper (`src/lib/camera-native.ts`)
- `capturePhoto()`: uses `@capacitor/camera` on native, browser getUserMedia fallback on web
- `scanBarcode()`: uses `@capacitor-mlkit/barcode-scanning` on native, null fallback on web
- Supports QR, EAN13, EAN8, Code128, Code39, Code93, Codabar, ITF, UPC-A, UPC-E, DataMatrix, PDF417, Aztec

### 7. Offline Storage (`src/lib/storage-offline.ts`)
- FIFO queue for pending stock movements
- Uses `@capacitor/preferences` on native, localStorage fallback on web
- `syncPendingMovements()` sends queued movements to Supabase

### 8. Splash Screens & Icons
- `gen-assets.js` generates 4 splash sizes (320x480, 640x960, 768x1024, 1024x1024) and 2 icons (192x192, 512x512)
- All PNGs with #0D6EFD electric blue theme
- Files: `public/icon-192.png`, `public/icon-512.png`, `public/splash-*.png`

### 9. Install Prompt (`src/components/pwa/install-prompt.tsx`)
- Hooks `beforeinstallprompt` event
- Shows dismissible card with `Smartphone` icon and install button
- Calls `prompt()` and dismisses after user choice
- Persists dismissal via localStorage

### 10. Settings Page (`src/app/(dashboard)/dashboard/parametres/page.tsx`)
- Full Settings page with sections: App Info, Theme (Light/Dark/System), Offline Queue, PWA Status, Storage Usage, Account, Advanced (Clear Cache, Reset App)
- Shows PWA installability status, online/offline status, queue count

### 11. Package.json
- Added deps: `next-pwa`, `workbox-core`, `workbox-precaching`, `workbox-routing`, `workbox-strategies`, `workbox-expiration`, `workbox-cacheable-response`, `@capacitor/core`, `@capacitor/cli`, `@capacitor/camera`, `@capacitor/preferences`, `@capacitor-mlkit/barcode-scanning`
- Scripts: `cap:init`, `cap:sync:android`, `cap:sync:ios`, `cap:open:android`, `cap:open:ios`
- Updated `@types/node` to v22

### 12. Mobile Nav (`src/components/layout/mobile-nav.tsx`)
- Added Settings icon linking to `/dashboard/parametres`
- Added PWA install button (visible when installable)
- Updated to show 6 items instead of 5

### 13. Build Verification
- `npx next build` succeeded ✓
- All 16 pages generated including new `/dashboard/parametres`
- Service worker registered via next-pwa
- Minor ENOENT warning for standalone traces on Windows (non-blocking)

### 14. Commit
- Committed with message: `chore(pwa-capacitor): add PWA manifest, service worker, Capacitor config, offline support, camera wrapper, install prompt, settings page, splash screens/icons`

## Files created (14 new)
1. `public/manifest.json` — PWA manifest
2. `src/app/sw.ts` — Workbox service worker
3. `src/components/pwa/offline-banner.tsx` — Offline status banner
4. `src/components/pwa/install-prompt.tsx` — Install prompt card
5. `src/components/ui/card.tsx` — Card component (shadcn/ui)
6. `src/lib/camera-native.ts` — Native camera + barcode scanner wrapper
7. `src/lib/storage-offline.ts` — Offline-first storage + queue
8. `src/app/(dashboard)/dashboard/parametres/page.tsx` — Settings page
9. `capacitor.config.ts` — Capacitor configuration
10. `public/icon-192.png` — PWA icon 192x192
11. `public/icon-512.png` — PWA icon 512x512
12. `public/splash-320.png` — Splash screen 320x480
13. `public/splash-640.png` — Splash screen 640x960
14. `public/splash-768.png` — Splash screen 768x1024
15. `public/splash-1024.png` — Splash screen 1024x1024
16. `gen-assets.js` — Icon/splash generation script

## Files modified (8 existing)
1. `next.config.js` — Added next-pwa integration
2. `package.json` — Added PWA/Capacitor deps + scripts
3. `package-lock.json` — Updated dependency tree
4. `public/manifest.json` — Replaced placeholder with full manifest
5. `src/app/layout.tsx` — Added offline banner + install prompt
6. `src/components/layout/mobile-nav.tsx` — Added settings + install buttons
7. `src/components/layout/theme-provider.tsx` — Added useTheme export
8. `tsconfig.json` — Added webworker lib + @capacitor types

## Issues encountered & resolved
- `@capacitor/storage` v1 incompatible with Capacitor v6 → switched to `@capacitor/preferences` v6
- `@capacitor/barcode-scanner` v3 required Capacitor v8 → switched to `@capacitor-mlkit/barcode-scanning` v6.2.0
- next-pwa `workboxOptions` config key → fixed to valid next-pwa schema
- Service worker TypeScript errors (SyncEvent, MessageEvent, mergeInstall, allowlist, cameraDirection, Maxicode, width/height on Photo) → all resolved
- Missing `card` shadcn component → created `src/components/ui/card.tsx`
- Missing `useTheme` export → added to theme-provider.tsx
