# Environment Setup

This guide covers all environment configuration needed for Stocky.

## Required Environment Variables

Create a `.env.local` file at the project root with the following variables:

```env
# ─── Supabase ──────────────────────────────────────────────
# Found in Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### How to Get Supabase Credentials

1. Go to [app.supabase.com](https://app.supabase.com) and sign in
2. Select (or create) your project
3. Navigate to **Settings → API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

These keys are safe to use in the browser (client-side). Supabase Row Level Security (RLS) ensures data access is still gated at the database level.

## Vercel Deployment Variables

When deploying to Vercel, add the same variables in:

1. **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Set the correct value for each deployment environment (Production / Preview / Development)
4. Redeploy after adding/updating variables

## Local Development

```bash
# From template
cp .env.local.template .env.local

# Edit .env.local with your Supabase credentials
# Then start the dev server
npm run dev
```

## Capacitor Platform Setup

### Android

The Capacitor config is in `capacitor.config.ts`. Platform-specific overrides can be added to:

- `capacitor.config.local.ts` (gitignored, for local dev only)

Android-specific config (in `capacitor.config.ts`):

```ts
android: {
  allowMixedContent: true,
}
```

To add the Android platform:

```bash
npx cap add android
```

Build artifacts go in the `android/` directory (see `.gitignore`).

### iOS

To add the iOS platform:

```bash
npx cap add ios
```

Build artifacts go in the `ios/` directory (see `.gitignore`).

## Environment Files Reference

| File | Purpose | Committed |
|------|---------|-----------|
| `.env.local.template` | Template with variable names only | ✅ Yes |
| `.env.local` | Your local credentials | ❌ No |
| `.env.development.local` | Dev-only overrides | ❌ No |
| `.env.test.local` | Test-only overrides | ❌ No |
| `.env.production.local` | Production overrides | ❌ No |

## Troubleshooting

- **Supabase connection errors:** Verify your URL and anon key are correct in `.env.local`
- **CORS issues:** Make sure your Supabase project's allowed URLs include `http://localhost:3000`
- **PWA not registering:** Check that `next-pwa` is correctly configured in `next.config.js`
- **Capacitor sync errors:** Run `npm run cap:sync` after making changes to `capacitor.config.ts`
