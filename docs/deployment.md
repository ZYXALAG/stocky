# Deployment Guide

Complete deployment instructions for Stocky across web and mobile platforms.

## Table of Contents

1. [Vercel Deployment (Web)](#vercel-deployment-web)
2. [Supabase Setup & Migrations](#supabase-setup--migrations)
3. [Environment Variables on Vercel](#environment-variables-on-vercel)
4. [Custom Domain Setup](#custom-domain-setup)
5. [CI/CD with GitHub Actions](#cicd-with-github-actions)
6. [Mobile: Android APK Build & Release](#mobile-android-apk-build--release)
7. [Mobile: iOS Build & Testflight](#mobile-ios-build--testflight)

---

## Vercel Deployment (Web)

Stocky deploys to Vercel with zero configuration thanks to Next.js.

### Step 1: Push to GitHub

```bash
git checkout -b main
git add -A
git commit -m "feat: finalize documentation and deployment configuration"
git branch -M main
git push -u origin main
```

### Step 2: Import on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your Stocky GitHub repository
4. Vercel auto-detects Next.js settings
5. **Do not change** build command (`next build`) or output directory (`.next`)
6. Click **Deploy**

### Step 3: Add Environment Variables

Navigate to **Settings → Environment Variables** and add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | All |

Click **Save** then **Deploy** again.

### Step 4: Verify

Vercel provides a preview URL (e.g., `stocky.vercel.app`). Verify:
- Dashboard loads correctly
- Auth (login/register) works
- Products and movements load
- PWA manifest is accessible at `/manifest.json`

---

## Supabase Setup & Migrations

### Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Choose region (closest to your users)
4. Set a strong database password
5. Wait for provisioning (~2 minutes)

### Apply Migrations

**Option A: Supabase CLI (Recommended)**

```bash
# Install the CLI
npm install -g supabase

# Login
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Apply all migrations
supabase db push
```

**Option B: SQL Editor**

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy and paste each migration file from `supabase/migrations/` in order
3. Run them sequentially (001 through 010)

### Verify Schema

After migrations, check in **Table Editor** that all tables exist:
- `profiles`, `templates`, `fields`, `categories`, `suppliers`, `products`, `stock_movements`, `alerts`, `settings`

---

## Environment Variables on Vercel

Add these in **Vercel Dashboard → Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Set each variable for **Production**, **Preview**, and **Development** environments as needed.

### Updating Variables After Deploy

1. Changes to environment variables require a new deployment
2. Go to **Deployments** → Click the latest deploy → **Redeploy**

---

## Custom Domain Setup

1. In Vercel Dashboard, go to **Settings → Domains**
2. Add your domain (e.g., `stocky.yourdomain.com`)
3. Update your DNS provider:
   - Add a **CNAME** record: `stocky` → your-vercel-domain.vercel-dns.com
   - Or add an **A** record pointing to Vercel IPs
4. Wait for DNS propagation (usually < 15 minutes)
5. Vercel automatically provisions an SSL certificate

---

## CI/CD with GitHub Actions

Stocky includes a GitHub Actions workflow at `.github/workflows/ci.yml` that:

- Runs on every push and pull request to `main`
- Sets up Node.js 18+
- Installs dependencies
- Runs `next build` to verify the build succeeds
- Runs lint checks

### Set Up Vercel Auto-Deploy (Optional)

For automatic deployments on every `main` branch merge:

1. In Vercel Dashboard, go to **Settings → Git**
2. Ensure your GitHub repo is connected
3. Enable **Auto-Deploy on Push**
4. Optionally set the **Production Branch** to `main`

### Set Up GitHub Secrets (for Vercel CLI auto-deploy)

```
VERCEL_TOKEN=your-vercel-api-token
VERCEL_PROJECT_ID=your-project-id
```

---

## Mobile: Android APK Build & Release

### Step 1: Add Android Platform

```bash
npx cap add android
npm run cap:sync
```

### Step 2: Build with Android Studio

```bash
npm run cap:android
```

This opens Android Studio. From there:

1. Open the project
2. Sync Gradle files
3. **Build → Generate Signed Bundle / APK**
4. Create a keystore (or use existing)
5. Choose **APK** (for direct install) or **AAB** (for Google Play)
6. Sign and generate

### Step 3: Install & Test

- **APK:** Share the APK file; users can install it directly
- **Google Play:** Upload the AAB to Google Play Console
  - Create a new app listing
  - Upload the AAB to the Production track
  - Fill in store listing details
  - Submit for review

### Step 4: Sync After Code Changes

```bash
npm run dev          # Keep dev server running
npm run cap:sync     # Sync web build to Android project
npm run cap:android  # Open Android Studio to test
```

---

## Mobile: iOS Build & TestFlight

### Step 1: Add iOS Platform

```bash
npx cap add ios
npm run cap:sync
```

### Step 2: Build with Xcode

```bash
npm run cap:ios
```

This opens the project in Xcode. From there:

1. Select your team in **Signing & Capabilities**
2. Select a simulator or physical device
3. **Product → Build** to verify
4. **Product → Archive** to create a distributable build

### Step 3: Upload to TestFlight

1. In Xcode, after archiving, click **Distribute App**
2. Choose **App Store Connect** → **Upload**
3. Fill in the version info and submit
4. The build appears in App Store Connect → TestFlight

### Step 4: iOS App Store Release

1. Create an app record in App Store Connect
2. Upload the archive
3. Fill in the App Store listing (name, description, screenshots, privacy policy)
4. Submit for Apple review

### Prerequisites

- macOS with Xcode 15+ installed
- Apple Developer Program membership ($99/year)
- Provisioning profiles configured

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails on Vercel | Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set |
| Supabase 403 errors | Verify RLS policies are applied; check migration files were run |
| PWA not installing | Ensure `manifest.json` is served correctly at `/manifest.json` |
| Capacitor sync broken | Run `npm install` then `npm run cap:sync` |
| iOS signing errors | Check certificate expiry and team configuration in Xcode |
