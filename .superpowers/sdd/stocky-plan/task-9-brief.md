# Task 9 Brief — Low Stock Alerts — Stocky

## Goal
Build the Low Stock Alerts system — automatically detect when product quantities fall below configurable thresholds, display alerts, and allow acknowledgment.

## Requirements

### 1. Type Definitions
Create `src/types/alert.ts` with:
- `Alert` interface: id, product_id (nullable for global alerts), threshold, current_quantity, acknowledged, acknowledged_at, created_at, product (relation)
- `AlertSeverity` type: 'critical' (qty <= threshold * 0.25) | 'warning' (qty <= threshold * 0.5) | 'notice' (qty <= threshold)
- `AlertSettings`: { global_threshold: number; email_notifications: boolean }
- Helper: `getAlertSeverity(quantity, threshold)` returns severity color class

### 2. Alert List Component
Create `src/components/alerts/alert-list.tsx` — Client component with:
- Table of active (unacknowledged) alerts
- Color-coded badges: red (<25% of threshold), yellow (25-50%), orange (50-100%)
- Product name + photo (thumbnail)
- Current quantity vs threshold
- Days since last movement
- Acknowledge button per alert
- "Acknowledge All" button
- Filter: show active / all / acknowledged
- Dependencies: `@/lib/supabase/client`, `lucide-react`

### 3. Alert Settings Component
Create `src/components/alerts/alert-settings.tsx` — Client component with:
- Global default threshold input
- Per-product threshold override (inline from product list)
- Toggle for email notifications (UI only, actual email to be implemented later)
- Save button with toast on success
- Dependencies: `@/lib/supabase/client`

### 4. Alert Badge (Header Integration)
Create `src/components/alerts/alert-badge.tsx` — Client component with:
- Small notification bell icon in the topbar
- Red badge count showing number of active (unacknowledged) alerts
- Clicking opens a dropdown with recent alerts summary
- Fetches alert count from Supabase
- Dependencies: `@/lib/supabase/client`, `lucide-react`

### 5. Alerts Page
Create `src/app/(dashboard)/dashboard/alertes/page.tsx` — Client component with:
- Tab navigation: Active Alerts | Acknowledged | Settings
- Active Alerts tab: alert list + acknowledge actions
- Acknowledged tab: historical acknowledged alerts
- Settings tab: alert settings (global threshold, per-product overrides)
- Load data from Supabase (alerts + products + settings)
- Dependencies: `@/lib/supabase/client`

### 6. Alert Check Utility
Create `src/lib/alerts.ts` with:
- `checkLowStockProducts(userId)`: query all products where quantity <= alert_threshold, return results with severity
- `acknowledgeAlert(alertId, userId)`: mark alert as acknowledged
- `getAlertCount(userId)`: return count of unacknowledged alerts
- `createOrUpdateAlert(product, quantity, threshold)`: upsert alert if product is below threshold
- Called after stock movements and on page load

### 7. Update Sidebar
Update sidebar navigation to include "Alertes" link (`/dashboard/alertes`) with a Bell icon and the alert count badge.

### 8. Update Layout
Update `(dashboard)/layout.tsx` to include the alerts route in the navigation items and integrate the AlertBadge in the topbar.

## Dependencies to Add
- None additional — use existing shadcn/ui components

## Build Verification
Run `npx next build` and verify:
- All pages compile
- `/dashboard/alertes` route works
- Zero TypeScript errors

## Commit
Commit: `feat(alerts): Low Stock Alerts — thresholds, severity levels, acknowledgment, and notification badge`

## Files to Create/Modify
1. `src/types/alert.ts` — NEW
2. `src/components/alerts/alert-list.tsx` — NEW
3. `src/components/alerts/alert-settings.tsx` — NEW
4. `src/components/alerts/alert-badge.tsx` — NEW
5. `src/app/(dashboard)/dashboard/alertes/page.tsx` — NEW
6. `src/lib/alerts.ts` — NEW
7. `src/components/layout/sidebar.tsx` — MODIFY (add alertes link with badge)
8. `src/app/(dashboard)/layout.tsx` — MODIFY (add alertes to nav, integrate AlertBadge)
9. `src/lib/utils.ts` — MODIFY (add getAlertSeverity helper)
