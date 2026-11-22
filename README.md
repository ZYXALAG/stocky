# Stocky — Universal Inventory Management

A modern, cross-platform inventory management application built with Next.js, Supabase, and Capacitor. Manage products, stock movements, suppliers, and categories from the web or as a native mobile app.

![Stocky Banner](public/icon-512.png)

## ✨ Features

- **📊 Dashboard** — Real-time KPIs: total inventory value, low-stock alerts, recent movements
- **📦 Product Management** — Full CRUD with custom field templates
- **🔄 Stock Movements** — Track IN/OUT movements with references and justifications
- **🏷️ Templates System** — Create custom field schemas for different product types
- **🚨 Low Stock Alerts** — Automatic alerts when stock falls below configurable thresholds
- **🔍 Global Search & Filters** — Instant search across all products with advanced filters
- **📤 Export** — CSV export of your inventory data
- **📱 QR Codes & Barcodes** — Generate QR labels and scan barcodes (mobile)
- **🏭 Suppliers & Categories** — Hierarchical categories and supplier management
- **🌐 PWA Support** — Install on any device; works offline with service worker
- **📱 Native Mobile** — Capacitor builds for Android and iOS
- **🌙 Dark/Light Theme** — Automatic system preference with manual toggle
- **🔒 Auth & Security** — Supabase Auth with Row Level Security (RLS)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, React Server Components) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Auth** | [Supabase Auth](https://supabase.com/docs/guides/auth) |
| **Charts** | [Recharts](https://recharts.org/) |
| **PWA** | [next-pwa](https://github.com/shadowwalker/next-pwa) (Workbox) |
| **Mobile** | [Capacitor 6](https://capacitorjs.com/) (Android & iOS) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

## 📸 Screenshots

- **Dashboard** — KPI overview with inventory charts and low-stock alerts
- **Products List** — Filterable, searchable table with CRUD actions
- **Product Detail** — Full product view with custom fields, stock history, and QR code
- **Stock Movements** — Log IN/OUT movements with references
- **Suppliers & Categories** — Manage your supply chain hierarchy
- **QR Code Scanner** — Mobile barcode/QR scanning via camera

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- A [Supabase](https://supabase.com/) project

### 1. Clone & Install

```bash
git clone https://github.com/your-org/stocky.git
cd stocky
npm install
```

### 2. Environment Setup

Copy the template and fill in your Supabase credentials:

```bash
cp .env.local.template .env.local
```

Edit `.env.local` with your Supabase project URL and anon key (see [Environment Setup](docs/environment-setup.md) for details).

### 3. Apply Database Migrations

Run the Supabase migrations using the Supabase CLI:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Or apply them manually in the Supabase Dashboard → SQL Editor.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Note your **Project URL** and **anon/public key** from Settings → API
3. Add them to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Apply migrations (see above)

See [Environment Setup](docs/environment-setup.md) for full details.

## 📱 Capacitor Mobile Build

### Android

```bash
npx cap add android
npm run cap:sync
npm run cap:android    # Opens Android Studio
```

### iOS

```bash
npx cap add ios
npm run cap:sync
npm run cap:ios         # Opens Xcode
```

### Sync Changes

```bash
npm run cap:sync
```

See [Deployment Guide](docs/deployment.md) for mobile build & release steps.

## 🌐 PWA Installation

Stocky is a Progressive Web App. To install:

- **Desktop (Chrome/Edge):** Click the install icon in the address bar
- **Android (Chrome):** "Add to Home Screen" from the menu
- **iOS (Safari):** Tap Share → "Add to Home Screen"

Once installed, Stocky runs full-screen and works offline.

## 🚀 Deployment

Deploy to [Vercel](https://vercel.com) with zero configuration:

1. Push to GitHub
2. Import the repo on Vercel
3. Add environment variables in Vercel Dashboard
4. Vercel auto-deploys on every push to `main`

See [Deployment Guide](docs/deployment.md) for detailed instructions.

## 📋 Dependencies

### Runtime
- `next@^14.0.0`, `react@^18.2.0`, `react-dom@^18.2.0`
- `@supabase/supabase-js@^2.39.0`, `@supabase/ssr@^0.12.7`
- `next-pwa@^5.6.0` (service worker)
- `@capacitor/core@^6.0.0`, `@capacitor/cli@^6.0.0` (+ plugins)
- `recharts@^2.10.0` (charts)
- `zod@^3.22.4` (validation)
- `react-hook-form@^7.92.0` (forms)
- `lucide-react@^0.303.0` (icons)
- `papaparse@^5.4.1` (CSV export)
- `qrcode@^1.5.4`, `qrcode.react@^3.1.0` (QR codes)
- `html5-qrcode@^2.3.8` (web barcode scanning)
- `date-fns@^3.0.0` (date formatting)
- Shadcn/ui (Radix UI primitives)

### Dev
- `typescript@^5.3.2`, `tailwindcss@^3.4.0`, `postcss@^8.4.32`, `autoprefixer@^10.4.16`

## 📄 License

MIT
