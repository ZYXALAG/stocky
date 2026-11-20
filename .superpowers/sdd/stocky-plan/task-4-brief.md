# Task 4: Layout & Navigation — Stocky

## Context
Stocky is a universal inventory management app. Task 3 completed authentication. Now we implement the main layout with navigation, sidebar, and responsive design.

WORKING DIRECTORY: C:/Users/adrig/stocky/
GIT BASE: be3062e (Task 3 commit)

## Requirements (verbatim from plan)

### Step 1: Layout components

- src/components/layout/sidebar.tsx — Collapsible sidebar with:
  - Logo "Stocky" with a box/package icon
  - Navigation links with icons (lucide-react):
    - Dashboard (LayoutDashboard)
    - Produits (Package)
    - Catégories (Tag)
    - Fournisseurs (Users)
    - Mouvements (ArrowRightLeft)
    - Alertes (Bell)
    - Templates (Layers)
    - Paramètres (Settings)
  - Collapsible: shows icons only when collapsed, full text + icons when expanded
  - Active state highlighting
  - Bottom section: user profile avatar + name + sign out button
  - Transition animations

- src/components/layout/topbar.tsx — Top bar with:
  - Hamburger menu button (mobile only, toggles sidebar)
  - Global search input
  - Notification bell icon (with badge count)
  - Theme toggle (dark/light mode)
  - User dropdown menu (profile, settings, sign out)
  - Only visible on mobile/tablet in certain views

- src/components/layout/mobile-nav.tsx — Bottom navigation for mobile:
  - 5 tabs: Dashboard, Produits, Mouvements, Alertes, Menu
  - Icons + labels
  - Active state highlighting
  - Fixed at bottom
  - Hidden on desktop

- src/components/layout/app-layout.tsx — Main layout wrapper:
  - Combines sidebar + topbar + mobile-nav + main content area
  - Responsive: sidebar hidden on mobile, shown on desktop
  - Main content area with padding
  - Uses CSS grid or flexbox

- src/app/(dashboard)/layout.tsx — Layout for authenticated routes:
  - Imports AppLayout
  - Provides navigation context
  - Wraps children in AppLayout

### Step 2: Theme support

- src/components/layout/theme-provider.tsx — ThemeProvider:
  - Uses next-themes package
  - Supports dark/light/system modes
  - Persists preference in localStorage
  - Providers theme context

- src/app/theme.css — Additional theme variables if needed
- Update globals.css with theme-aware colors

### Step 3: Update root layout

- src/app/layout.tsx — Update to:
  - Include ThemeProvider from next-themes
  - Include SessionProvider or auth context if needed
  - Add Inter font (from next/font/google)
  - Add PWA meta tags
  - Add metadata (title: "Stocky", description)

### Step 4: Responsive breakpoints

Tailwind breakpoints in tailwind.config.ts:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Sidebar hidden on mobile, shown on desktop
- Bottom nav visible only on mobile

### Step 5: Verify

- Sidebar is collapsible with smooth animation
- Navigation links work with Next.js Link component
- Mobile bottom nav appears on screens < 640px
- Theme toggle works (dark/light mode)
- Topbar shows on mobile with hamburger menu
- Layout is responsive across all breakpoints
- User profile + sign out visible in sidebar bottom

### Step 6: Commit
```bash
git add .
git commit -m "feat: add responsive layout with collapsible sidebar, topbar, mobile nav, and theme toggle"
```

## Interfaces
- Consumes: Auth from Task 3 (user profile, sign out), Supabase client
- Produces: Complete responsive layout with sidebar, topbar, mobile bottom nav, theme support

## Constraints
- Use lucide-react for all icons
- Use next-themes for dark/light mode (install it)
- Sidebar should be collapsible (minimized width ~64px, expanded ~256px)
- Mobile bottom nav: fixed at bottom, 5 tabs max
- Use Tailwind responsive classes (md:, lg:)
- All navigation uses Next.js <Link> component
- Sidebar user section: avatar (if available) + full_name + sign out button
- Theme persistence in localStorage
- Active link highlighting based on current route
- Use forward-slash paths

## Report File
Write report to: `C:/Users/adrig/stocky/.superpowers/sdd/stocky-plan/task-4-report.md`
