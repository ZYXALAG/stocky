# User Guide

Complete guide to using Stocky for inventory management.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Creating Templates](#creating-templates)
4. [Adding Products](#adding-products)
5. [Recording Stock Movements](#recording-stock-movements)
6. [Using QR Codes and Scanning](#using-qr-codes-and-scanning)
7. [Managing Suppliers and Categories](#managing-suppliers-and-categories)
8. [Understanding Alerts](#understanding-alerts)
9. [Exporting Data](#exporting-data)
10. [PWA Installation](#pwa-installation)
11. [Using Offline Mode](#using-offline-mode)

---

## Getting Started

### 1. Create an Account

1. Go to Stocky in your browser
2. Click **Sign Up**
3. Enter your email and a secure password
4. Check your email for a verification link (if email confirmation is enabled)
5. Click the verification link to activate your account

### 2. Log In

1. Go to the login page
2. Enter your email and password
3. Click **Sign In**

### 3. Set Up Your Profile

After logging in, you can update your display name and avatar in the settings page.

---

## Dashboard

The dashboard is your central hub, showing:

- **Total Products** — Count of all inventory items
- **Total Stock Value** — Aggregate value of all products (based on cost price)
- **Low Stock Alerts** — Number of products below their threshold
- **Recent Movements** — Latest stock IN/OUT movements
- **Stock Overview Chart** — Visual breakdown of stock levels

Use the sidebar navigation to access all sections from anywhere in the app.

---

## Creating Templates

Templates define custom fields for different product types.

### Step 1: Create a Template

1. Navigate to **Templates** in the sidebar
2. Click **Create Template**
3. Enter:
   - **Name** (e.g., "Electronics", "Clothing", "Raw Materials")
   - **Description** (optional)
   - **Icon** (select from available icons)
4. Click **Create**

### Step 2: Add Fields

After creating a template, add custom fields:

1. Click on the template to edit it
2. Click **Add Field**
3. Configure:
   - **Field Name** — Programmatic identifier (e.g., `serial_number`)
   - **Label** — Display name (e.g., "Serial Number")
   - **Type** — Text, Number, Date, Select, Checkbox, Textarea, or Currency
   - **Required** — Whether this field must be filled
   - **Options** — For "Select" type, enter values as a JSON array: `["red", "blue", "green"]`
   - **Order** — Display order (lower numbers appear first)
4. Click **Save**

### Step 3: Use a Template

When creating a product, select a template to apply its custom fields.

---

## Adding Products

### Step 1: Create a Product

1. Navigate to **Products**
2. Click **Create Product**
3. Fill in:
   - **Name** (required)
   - **Description** (optional)
   - **Photo** — Upload or paste a URL
   - **Category** — Select from existing categories
   - **Supplier** — Select from existing suppliers
   - **Template** — Choose a template for custom fields
   - **Initial Quantity** — Starting stock level
   - **Cost Price** — Unit cost (for value calculation)
   - **Selling Price** — Unit selling price
   - **Alert Threshold** — Quantity below which an alert triggers (default: 5)
4. If a template is selected, fill in the custom fields
5. Click **Save**

### Step 2: Edit a Product

1. Click on a product in the list to view details
2. Click **Edit**
3. Modify any fields
4. Click **Save**

### Step 3: Delete a Product

1. Open the product details
2. Click **Delete**
3. Confirm the deletion

> Deleting a product also deletes all associated stock movements.

---

## Recording Stock Movements

Track every time stock enters or leaves your inventory.

### Step 1: Create a Movement

1. Navigate to **Stock Movements**
2. Click **Record Movement**
3. Fill in:
   - **Product** — Select the product
   - **Type** — Choose **IN** (stock received) or **OUT** (stock dispatched)
   - **Quantity** — Number of units
   - **Reference** — Optional reference (e.g., PO number, invoice number)
   - **Justification** — Reason for the movement (e.g., "Restock from supplier")
4. Click **Save**

### Step 2: View Movement History

Each product shows its complete movement history. Navigate to a product's detail page to see all movements chronologically.

### Movement Types

| Type | Effect |
|------|--------|
| **IN** | Increases product stock quantity |
| **OUT** | Decreases product stock quantity |

---

## Using QR Codes and Scanning

### Generate QR Codes

1. Open a product's detail page
2. Click **Generate QR Code**
3. The QR code encodes the product's unique ID
4. Print the QR code and attach it to the physical product

### Scan QR Codes / Barcodes (Mobile)

1. On the mobile app, navigate to the scan feature
2. Point your camera at a QR code or barcode
3. The product is automatically opened
4. You can immediately record stock movements or edit the product

> Barcode scanning uses the device camera via Capacitor's ML Kit plugin on native, or `html5-qrcode` on the web.

---

## Managing Suppliers and Categories

### Suppliers

1. Navigate to **Suppliers**
2. **Create** — Add a new supplier with name, email, phone, address, website, and contact person
3. **Edit** — Update supplier details
4. **Delete** — Remove a supplier (products will keep their supplier reference but the supplier record is removed)

### Categories

1. Navigate to **Categories**
2. **Create** — Add a new category with name, slug, description, and optional parent category
3. **Edit** — Update category details
4. **Delete** — Remove a category (child categories become top-level)

### Hierarchical Categories

Categories support a tree structure:

```
Electronics (parent)
├── Phones (child)
│   ├── Smartphones
│   └── Feature Phones
└── Computers (child)
    ├── Laptops
    └── Desktops
```

---

## Understanding Alerts

Stocky automatically monitors stock levels and generates alerts.

### How Alerts Work

1. Each product has an **Alert Threshold** (default: 5 units)
2. After every stock movement, Stocky checks if the product's quantity has fallen below its threshold
3. If so, an **alert** is created in the **Alerts** page

### Managing Alerts

1. Navigate to **Alerts** (also accessible from the dashboard)
2. Review all unacknowledged alerts
3. Click **Acknowledge** on an alert to mark it as handled
4. Acknowledged alerts stay in the list with an acknowledgment timestamp

### Alert Columns

| Column | Description |
|--------|-------------|
| Product | Product name |
| Current Stock | Current quantity |
| Threshold | Alert trigger threshold |
| Status | Unacknowledged / Acknowledged |
| Created | When the alert was created |
| Acknowledged | When it was acknowledged (if applicable) |

---

## Exporting Data

Export your inventory data to CSV for use in spreadsheets or other tools.

1. Navigate to the **Products** page
2. Click **Export CSV**
3. The file downloads automatically with columns:
   - Product ID, Name, Description, Category, Supplier
   - Quantity, Cost Price, Selling Price
   - Custom fields (as separate columns)
   - Created At, Updated At

---

## PWA Installation

Install Stocky as a native-looking app on any device.

### Desktop (Chrome / Edge)

1. Visit Stocky in your browser
2. Click the **install icon** (⊕) in the address bar
3. Click **Install**
4. Stocky opens in its own window

### Android (Chrome)

1. Open Stocky in Chrome
2. Tap the **menu** (⋮) → **Add to Home Screen**
3. Tap **Add**

### iOS (Safari)

1. Open Stocky in Safari
2. Tap the **Share** button
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

### After Installation

- Stocky opens full-screen without the browser UI
- It appears in your app drawer / home screen
- You receive notifications (if enabled)
- Works offline (cached pages)

---

## Using Offline Mode

Stocky works partially offline using a service worker and local caching.

### What Works Offline

- **Viewing cached products** — Products you've visited are cached
- **Viewing dashboard** — Cached dashboard state
- **Composing movements** — Can record movements that sync when reconnected

### What Requires Connection

- **Authentication** — Login/registration requires internet
- **New data fetch** — Cannot load products you haven't visited yet
- **Export** — CSV export requires loading all data

### Offline Indicator

An **Offline Banner** appears at the top of the screen when the connection is lost, letting you know the app is working in offline mode.

### Automatic Sync

When the connection is restored, any queued movements are synced automatically.

---

## Tips & Best Practices

1. **Set up categories and suppliers first** — before adding products
2. **Create templates for your product types** — ensures consistent custom fields
3. **Set appropriate alert thresholds** — based on your reorder frequency
4. **Record every movement** — maintains an accurate audit trail
5. **Use QR codes** — speed up stock counting and tracking
6. **Regular exports** — back up your data periodically
7. **Install as PWA** — for the best mobile experience with offline support
