# Task 13 Brief — PWA & Capacitor — Stocky

## Goal
Convert Stocky into a fully installable PWA and build native mobile/desktop apps using Capacitor for Android and iOS, plus desktop builds via Capacitor's platform abstraction.

## Requirements

### 1. PWA Manifest
Update `public/manifest.json` with:
- Proper app name (Stocky), short_name, description
- Theme color (#0D6EFD), background color (#ffffff)
- Icons: 192x192 and 512x512 PNG files
- Display mode: `standalone`
- Orientation: `portrait-primary`
- Start URL: `/`
- App supports all routes (not just `/`)
- Dependencies: generate icons via SVG → PNG conversion

### 2. Service Worker
Create `src/app/sw.ts` (using Next.js PWA plugin or manual SW):
- Cache static assets for offline access
- Runtime caching for API responses (Supabase)
- Stale-while-revalidate strategy for data
- Background sync for pending stock movements (offline mode)
- Skip waiting and claim clients for instant updates

### 3. Next PWA Configuration
Update `next.config.mjs` with:
- `next-pwa` plugin integration
- Workbox configuration
- Exclude API routes from SW caching (except stock movements for offline)
- Proper SW registration in `_app.tsx`

### 4. Offline Support Component
Create `src/components/pwa/offline-banner.tsx` — Client component with:
- Detects online/offline status
- Shows toast/banner when connection is lost
- Shows count of unsaved operations (pending movements)
- Auto-reconnects when back online
- "Retry sync" button for pending operations
- Dependencies: `use-before-unload` or `navigator.onLine` API

### 5. Capacitor Configuration
Create `capacitor.config.ts` with:
- App ID: `com.stocky.app`
- App name: Stocky
- Web assets directory: `.next` (for build) or `out` (for static)
- Server URL configuration (for local dev)
- Plugins: Camera, Storage, App, StatusBar, Keyboard
- Dependencies: `@capacitor/core`, `@capacitor/cli`

### 6. Capacitor Plugins Integration
Install and configure:
- `@capacitor/camera` — for scanning barcodes/QR codes (native)
- `@capacitor/storage` — for local cache/offline data
- `@capacitor/app` — for app lifecycle events
- `@capacitor/status-bar` — for status bar customization (blue theme)
- `@capacitor/keyboard` — for keyboard management
- `@capacitor/splash-screen` — for custom splash screen

### 7. Camera Native Integration
Create `src/lib/camera-native.ts` with:
- Wrapper around camera that uses Capacitor Camera plugin on mobile
- Falls back to html5-qrcode on web/desktop
- Uses device rear camera for barcode scanning by default
- Dependencies: `@capacitor/camera`, `html5-qrcode`

### 8. Local Storage for Offline
Create `src/lib/storage-offline.ts` with:
- Local storage wrapper using Capacitor Storage or localStorage fallback
- Queue for pending stock movements (when offline)
- Sync queue when back online
- Data persistence for templates and categories (cached)

### 9. Splash Screen & Icons
Create `public/splash-*.png` files:
- Launch screens for Android and iOS
- Different sizes: 320x470, 640x960, 768x1024, etc.
- Stocky branding (blue background, logo, app name)

### 10. Update Mobile Navigation
Update `src/components/layout/mobile-nav.tsx` to include:
- PWA install prompt (when available)
- "Add to Home Screen" banner
- App version display in settings
- Dependencies: `use-pwa-install` or custom implementation

### 11. Build Scripts
Update `package.json` with Capacitor build scripts:
- `cap:android` — open Android Studio
- `cap:ios` — open Xcode
- `cap:sync` — sync web assets to platforms
- `cap:run:android` — build and run on Android
- `cap:run:ios` — build and run on iOS

### 12. Update Settings Page
Create `src/app/(dashboard)/dashboard/parametres/page.tsx` with:
- App version info
- PWA install prompt
- Offline data management (clear cache)
- Theme settings
- Account settings (profile, password)
- Dependencies: `@/lib/supabase/client`

## Dependencies to Add
- `next-pwa` — PWA plugin for Next.js
- `@capacitor/core` — Capacitor core
- `@capacitor/cli` — Capacitor CLI
- `@capacitor/camera` — Camera plugin
- `@capacitor/storage` — Storage plugin
- `@capacitor/app` — App lifecycle
- `@capacitor/status-bar` — Status bar
- `@capacitor/keyboard` — Keyboard management
- `@capacitor/splash-screen` — Splash screen

## Build Verification
Run `npx next build` and verify:
- PWA manifest is valid JSON
- Service worker is generated
- Icons are present
- Zero TypeScript errors
- App installs correctly as PWA (test in Chrome DevTools)

## Notes
- For native builds (Android/iOS), user needs Android Studio / Xcode installed
- Capacitor sync copies web build to native platforms
- Android: `npx cap add android && npx cap sync`
- iOS: `npx cap add ios && npx cap sync` (macOS only)
- The PWA works immediately without native builds

## Commit
Commit: `feat(pwa): Progressive Web App with offline support, Capacitor mobile builds, install prompt`

## Files to Create/Modify
1. `public/manifest.json` — MODIFY (PWA manifest)
2. `src/app/sw.ts` — NEW (service worker)
3. `next.config.mjs` — MODIFY (next-pwa config)
4. `src/components/pwa/offline-banner.tsx` — NEW
5. `capacitor.config.ts` — NEW
6. `src/lib/camera-native.ts` — NEW
7. `src/lib/storage-offline.ts` — NEW
8. `src/components/pwa/install-prompt.tsx` — NEW
9. `src/app/(dashboard)/dashboard/parametres/page.tsx` — NEW
10. `package.json` — MODIFY (add scripts)
11. `src/components/layout/mobile-nav.tsx` — MODIFY (add install prompt)
12. `public/splash-*.png` — NEW (splash screens)
13. `public/icon-192.png`, `public/icon-512.png` — NEW (app icons)
