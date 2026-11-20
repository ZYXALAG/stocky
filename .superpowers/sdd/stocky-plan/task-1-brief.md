# Task 1: Project Scaffolding — Stocky

## Context
Stocky is a universal inventory management app for web, mobile, and desktop.
**Tech stack:** Next.js 14, TypeScript, Tailwind CSS, Shadcn/ui, Supabase, Capacitor
**Bleu électrique color:** primary `#0D6EFD`, light `#3399FF`, dark `#0052CC`
**Design:** Modern, clean, minimal

## Requirements (verbatim from plan)

### Step 1: Scaffold the project with package.json and all config files
- next.config.js with proper Next.js 14 settings
- tailwind.config.ts with the blue electric color palette (#0D6EFD as primary)
- tsconfig.json with strict mode, path aliases (@/* → src/*)
- postcss.config.mjs
- .env.local.template with Supabase URL and anon key placeholders
- .gitignore (include node_modules, .next, .env, native/, capacitor.config.local.ts)
- capacitor.config.ts
- public/manifest.json for PWA

### Step 2: Create base src/ structure
- src/app/layout.tsx — root layout with metadata, PWA links, global CSS, Inter font
- src/app/page.tsx — redirects to /dashboard (placeholder for now)
- src/app/globals.css — CSS variables for the blue electric theme, base Tailwind imports
- src/lib/utils.ts — cn() utility from Shadcn/ui pattern
- src/lib/constants.ts — color palette, supabase URLs placeholder

### Step 3: Install dependencies
- core: next@^14.0.0, react@^18, react-dom@^18
- tailwind: tailwindcss@^3.4, @tailwindcss/forms, @tailwindcss/typography
- ui: class-variance-authority, clsx, tailwind-merge, lucide-react
- data: @supabase/supabase-js, zod
- csv: papaparse
- qrcode: qrcode.react
- charts: recharts
- capacitor: @capacitor/core, @capacitor/cli
- other: date-fns, uuid, @capacitor/camera

### Step 4: Verify build
- Run `npx next build` and verify successful compilation
- Ensure no TypeScript errors
- Verify the blue electric color appears in the generated CSS

### Step 5: Commit
```bash
git add .
git commit -m "chore: scaffold Stocky project with Next.js, Tailwind, and Capacitor"
```

## Interfaces
- Consumes: nothing (this is the first task)
- Produces: A working Next.js project with Tailwind, TypeScript, Shadcn/ui configured, global color system with #0D6EFD primary, responsive base layout

## Constraints
- All file paths must be absolute from `C:/Users/adrig/stocky/`
- Use exact versions as specified above
- The cn() utility in utils.ts should use the standard Shadcn pattern: `import { clsx } from "clsx"; import { twMerge } from "tailwind-merge"; export function cn(...inputs) { return twMerge(clsx(inputs)); }`
- globals.css must include `@tailwind base; @tailwind components; @tailwind utilities;` and CSS variables for the color theme
- tailwind.config.ts must define the primary color #0D6EFD in the extend colors section
- capacitor.config.ts: appId "com.stocky.app", appName "Stocky", webDir "out"

## Report File
Write your report to: `C:/Users/adrig/stocky/.superpowers/sdd/stocky-plan/task-1-report.md`

The report must contain:
1. Status: DONE, DONE_WITH_CONCERNS, NEEDS_CONTEXT, or BLOCKED
2. List of commits made
3. One-line test summary (did next build succeed?)
4. Any concerns
