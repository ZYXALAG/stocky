# Task 14 Brief — Documentation & Deployment — Stocky

## Goal
Complete Stocky with full documentation and production deployment configuration.

## Requirements

### 1. README.md
Create `README.md` at project root with:
- Project title, description, features
- Tech stack badges
- Screenshots section (describe app screens)
- Quick start guide (install, setup, run dev)
- Supabase setup instructions
- Capacitor mobile build guide
- PWA installation guide
- Deployment guide (Vercel)
- License section
- Dependencies list

### 2. Environment Configuration
Create `docs/environment-setup.md` with:
- Required environment variables
- How to get Supabase URL and anon key
- Vercel deployment variables
- Capacitor platform setup notes

### 3. API Documentation
Create `docs/api-reference.md` with:
- All Supabase tables documented (schema, columns, relationships)
- Authentication endpoints (via Supabase Auth)
- Custom functions/triggers
- Example queries for each table

### 4. Deployment Guide
Create `docs/deployment.md` with:
- Vercel deployment steps (zero-config for Next.js)
- Supabase project setup and migration application
- Environment variables configuration on Vercel
- Custom domain setup
- CI/CD pipeline (GitHub Actions or Vercel auto-deploy)
- Mobile build and release steps (Android APK, iOS TestFlight)

### 5. User Guide
Create `docs/user-guide.md` with:
- Getting started (register, login)
- Creating templates
- Adding products
- Recording stock movements
- Using QR codes and scanning
- Managing suppliers and categories
- Understanding alerts
- Exporting data
- PWA installation
- Using offline mode

### 6. Architecture Documentation
Create `docs/architecture.md` with:
- Project structure overview
- Data flow diagram (Mermaid)
- Component hierarchy
- Database schema diagram (Mermaid)
- PWA/Capacitor architecture
- Security considerations (RLS, auth)

### 7. Vercel Configuration
Create `vercel.json` with:
- Build command: `next build`
- Output directory: `.next`
- Routes for SW, manifest, and API rewrites
- Environment variable injection settings
- Git branch deployment configuration

### 8. GitHub Actions CI/CD
Create `.github/workflows/ci.yml` with:
- Lint and build on push/PR
- Run on: main branch auto-deploy
- Node.js setup (18+)
- Install dependencies
- Run `next build`
- Deploy on merge to main (Vercel webhook)

### 9. Changelog
Create `CHANGELOG.md` with:
- Version 1.0.0 release notes
- All 13 features documented
- Known issues
- Future roadmap items

### 10. Update Root Layout
Update `src/app/layout.tsx` to include:
- OpenGraph metadata for PWA sharing
- Twitter card meta
- Structured data (JSON-LD)
- Favicon improvements

### 11. Update .gitignore
Verify `.gitignore` includes:
- Capacitor platforms directories
- Environment files (.env.local)
- Build artifacts (.next, out, dist)
- IDE settings
- OS files (.DS_Store, Thumbs.db)

### 12. Final Build Verification
Run full production build and verify:
- `npx next build` succeeds with all pages
- No warnings or errors
- PWA manifest valid
- Service worker registered
- All routes accessible
- Commit final changes

## Commit
Commit: `feat: finalize documentation and deployment configuration`

## Files to Create/Modify
1. `README.md` — NEW
2. `CHANGELOG.md` — NEW
3. `docs/environment-setup.md` — NEW
4. `docs/api-reference.md` — NEW
5. `docs/deployment.md` — NEW
6. `docs/user-guide.md` — NEW
7. `docs/architecture.md` — NEW
8. `vercel.json` — NEW
9. `.github/workflows/ci.yml` — NEW
10. `src/app/layout.tsx` — MODIFY (metadata)
11. `.gitignore` — VERIFY/UPDATE
12. `package.json` — MODIFY (update version to 1.0.0)
