---
task: Task 9 — Low Stock Alerts
status: completed
commit: e7dd85a
build: passed ✅ (zero TypeScript errors)
files_created:
  - src/types/alert.ts — Alert type definitions (Alert, AlertSeverity, AlertSettings, helpers)
  - src/components/alerts/alert-list.tsx — Alert list component (table/cards, severity badges, acknowledge actions, filter)
  - src/components/alerts/alert-settings.tsx — Alert settings (global threshold, per-product overrides, email toggle)
  - src/components/alerts/alert-badge.tsx — Notification bell in topbar with dropdown and count
  - src/app/(dashboard)/dashboard/alertes/page.tsx — Alerts page (Active / Acknowledged / Settings tabs)
  - src/lib/alerts.ts — Alerts utility (checkLowStockProducts, acknowledgeAlert, getAlertCount, createOrUpdateAlert, etc.)
files_modified:
  - src/components/layout/sidebar.tsx — Added alert count badge polling + badge on Alertes nav item
  - src/components/layout/topbar.tsx — Replaced hardcoded notification bell with AlertBadge component
api_calls: ~15 (write_file x6, patch x8, terminal x4)
time: ~15 minutes
---

## Summary

Built the complete Low Stock Alerts system for Stocky:

### What was built

1. **Type Definitions** (`src/types/alert.ts`): `Alert` interface, `AlertSeverity` type ('critical'/'warning'/'notice'), `AlertSettings`, and helper functions `getAlertSeverity()`, `getAlertSeverityColor()`, `getAlertSeverityLabel()`.

2. **AlertList** (`src/components/alerts/alert-list.tsx`): Client component showing alert cards with product photo/name, severity color badges (red/amber/orange), quantity vs threshold display, days since creation, per-alert acknowledge button, and "Acknowledge All" button. Filters: active / acknowledged.

3. **AlertSettings** (`src/components/alerts/alert-settings.tsx`): Global default threshold input, per-product threshold overrides with inline editing, email notifications toggle (UI only), save with toast feedback.

4. **AlertBadge** (`src/components/alerts/alert-badge.tsx`): Notification bell in topbar with red badge count (polls every 30s), dropdown with recent alerts summary, per-alert and bulk acknowledge.

5. **Alerts Page** (`src/app/(dashboard)/dashboard/alertes/page.tsx`): Three-tab interface (Active Alerts / Acknowledged / Settings) with badge counts on tabs.

6. **Alerts Utility** (`src/lib/alerts.ts`): `checkLowStockProducts()`, `acknowledgeAlert()`, `acknowledgeAllAlerts()`, `getAlertCount()`, `getAllAlerts()`, `createOrUpdateAlert()`, `getAlertSettings()`, `saveAlertSettings()`.

7. **Sidebar** updated: Alert count badge polling + red badge overlay on Bell icon in nav.

8. **Topbar** updated: Hardcoded notification bell replaced with functional `AlertBadge` component.

### Build status
- ✅ `npx next build` passed
- ✅ Zero TypeScript errors
- ✅ `/dashboard/alertes` route compiled (8.4 kB)
- ✅ 13 static pages generated

### Commit
`e7dd85a` — `feat(alerts): Low Stock Alerts — thresholds, severity levels, acknowledgment, and notification badge`

### Notes
- Sidebar already had Alertes nav item (added in prior task), enhanced with live alert count badge
- Mobile nav already had Alertes link
- Database `alerts` and `alert_settings` tables expected to exist (from schema defined in previous tasks)
- One minor build warning about copying traced files for standalone mode — cosmetic, no impact
