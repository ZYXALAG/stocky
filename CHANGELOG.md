# Changelog

All notable changes to Stocky will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-11-23

### Initial Release

#### ✨ Features

- **Task 1: Project Scaffolding**
  - Next.js 14 with App Router
  - TypeScript, Tailwind CSS, Shadcn/ui
  - Project structure and CI configuration

- **Task 2: Database Schema & Seed Data**
  - 8 database tables: profiles, templates, fields, products, stock_movements, categories, suppliers, alerts, settings
  - Row Level Security (RLS) policies on all tables
  - 10 SQL migrations with seed data
  - Foreign key relationships and cascading deletes

- **Task 3: Authentication**
  - Supabase Auth integration (email/password)
  - Login, register, forgot-password, reset-password, email verification pages
  - Auth context provider for session management
  - Protected routes with middleware

- **Task 4: Responsive Layout**
  - Collapsible sidebar navigation
  - Mobile-responsive layout
  - Dark/light theme toggle with persistence
  - Theme provider with system preference detection

- **Task 5: Dashboard with KPIs**
  - Total products count, stock value, low-stock alerts
  - Recharts-powered stock overview visualization
  - Recent stock movements feed
  - Real-time KPI updates

- **Task 6: Product CRUD**
  - Full create, read, update, delete for products
  - Product detail view with photo support
  - Product forms with Zod validation
  - Custom field support via templates

- **Task 7: Templates System**
  - Create custom field templates (Electronics, Clothing, etc.)
  - 7 field types: text, number, date, select, checkbox, textarea, currency
  - Field ordering and required flags
  - Template-based product creation

- **Task 8: Stock Movements**
  - Record IN/OUT stock movements
  - Movement history per product
  - Reference and justification fields
  - Automatic stock quantity updates

- **Task 9: Low Stock Alerts**
  - Per-product configurable alert thresholds
  - Automatic alert generation on stock changes
  - Alert acknowledgment system
  - Alert dashboard with unacknowledged count

- **Task 10: Global Search, Filters & Export**
  - Full-text search across product names
  - Filter by category, supplier, template
  - Sort by name, quantity, date
  - CSV export of inventory data

- **Task 11: QR Codes, Barcode Scanning & Label Printing**
  - QR code generation per product
  - In-browser barcode scanning (html5-qrcode)
  - Mobile barcode scanning via Capacitor ML Kit
  - Print label functionality

- **Task 12: Suppliers & Categories**
  - Supplier CRUD with contact details
  - Hierarchical categories with parent-child relationships
  - Category tree view
  - Category and supplier filtering on products

- **Task 13: PWA with Offline Support & Capacitor**
  - Service worker with Workbox caching
  - PWA manifest with icons and theme color
  - Install prompt for web and mobile
  - Capacitor 6 configuration for Android and iOS
  - Offline banner and cache strategy
  - Native camera, status bar, splash screen plugins

- **Task 14: Documentation & Deployment**
  - Comprehensive README with badges and quick start
  - Environment setup guide
  - Full API reference with schema documentation
  - Deployment guide (Vercel, mobile builds)
  - User guide covering all features
  - Architecture documentation with diagrams
  - Vercel deployment configuration (vercel.json)
  - GitHub Actions CI/CD pipeline
  - Root layout SEO metadata (OpenGraph, Twitter cards, JSON-LD)
  - CHANGELOG.md

#### 🐛 Bug Fixes

- Fixed PWA manifest path for iOS compatibility
- Fixed timezone handling for timestamps across regions
- Fixed mobile viewport meta for safe area insets

#### ⚡ Performance

- Standalone Next.js output for Vercel serverless deployment
- Indexed foreign keys on frequently queried columns
- Optimized bundle with tree-shaken dependencies

#### 📦 Dependencies

- Next.js 14, React 18, TypeScript 5
- Supabase JS client v2
- Capacitor 6 suite
- Shadcn/ui (Radix UI primitives)
- Recharts for data visualization
- next-pwa for service worker
- Zod + React Hook Form for validation

---

## Known Issues

- **Large dataset pagination:** Product list loads all items at once; pagination recommended for >1000 products
- **iOS PWA offline cache:** Safari's cache size limits may affect deeply nested pages after extensive use
- **Barcode scanning on desktop:** Requires a USB barcode scanner or webcam; no native support for physical barcode devices

## Roadmap

- [ ] Multi-user / team support with roles and permissions
- [ ] Real-time stock updates with Supabase Realtime subscriptions
- [ ] Barcode format support beyond QR (EAN-13, Code 128)
- [ ] Bulk import via CSV upload
- [ ] Reports and analytics dashboard
- [ ] Supplier order management
- [ ] Multi-warehouse support
- [ ] REST API endpoints for third-party integrations
- [ ] Internationalization (i18n) beyond French locale
- [ ] Docker development environment

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2026-11-23 | Initial release — all 14 tasks complete |
| 0.1.0 | — | Pre-release (development version) |
