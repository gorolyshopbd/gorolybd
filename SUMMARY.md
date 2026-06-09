# Shopio MERN E-Commerce Project

## Goal
- Build a full MERN eCommerce platform with admin panel, checkout, OTP, chat, dynamic footer, banners, pages, offers, coupons, popups, brand/category management, and flash sale scheduling.

## Constraints & Preferences
- Next.js App Router frontend with `'use client'` components, Express/MongoDB backend with mock fallback
- Admin login: `admin@shopio.com` / `admin123`; User login: `user@shopio.com` / `user123`
- All product clicks navigate to `/product/[id]`; modal kept as "Quick View"
- OTP verification required before order submission; phone must be verified
- Mobile sticky bottom nav in Footer, horizontal nav pills in Header on mobile
- Multiple product images with thumbnail selector and file upload
- Image paths stored as URLs; `getImageUrl()` resolves external and `/uploads/` relative paths
- All admin features behind admin auth
- `Facebook`, `Twitter`, `Instagram`, `Youtube` not in lucide-react — replaced with inline SVGs
- `<script>` tags in custom HTML must be re-created as real DOM elements for execution

## Done
- **Build Fix — Missing Icon Exports**: `Footer.js` replaced `Facebook`, `Twitter`, `Instagram`, `Youtube` with inline SVGs. `AuthModal.js` already had only valid imports.
- **Footer Removed from Admin Panel**: Admin page no longer renders Footer. "Back" button in `AdminDashboard` sidebar via `onTabChange` prop.
- **ChatWidget Connected to Frontend**: `page.js` imports and renders `<ChatWidget />`. Chat GET endpoint made public.
- **BannerSlider Integrated into Hero**: `Hero.js` renders `BannerSlider` with fallback default banner, `onShopClick`, flexible min-height.
- **Chat Close / Reopen Flow**: `isClosed` field on `ChatMessage`. Admin closes chat via `POST /api/chat/close`. User sees closed banner with "Start new chat" calling `POST /api/chat/reopen`. Input hidden when closed.
- **Custom Header Code Field**: Added to Settings model, public endpoint, admin form, and `TrackingScripts.js` (injects into `<head>` with proper script re-creation).
- **Public Settings Endpoint Expanded**: `GET /api/settings/public` returns all footer, popup, tracking fields, and `customHeaderCode`.
- **Category & Brand Management**: Full CRUD models, controllers, routes with image + order fields. Routes registered in server.js. Admin UI tabs with list/form/edit/delete.
- **Flash Sale Date Scheduling**: `flashSaleStart`, `flashSaleEnd` (Date) fields on Product. Controller filters expired sales. Admin form has datetime-local inputs for start/end. Mock data includes `flashSaleEnd`.
- **Phone Field in Registration**: Added to User model, register controller, ShopContext.register(), AuthModal register form.

## Key Decisions
- Category/Brand are separate models with image + order — enables dynamic frontend display and admin CRUD
- Flash sale expiration uses `$or: [{ flashSaleEnd: { $exists: false } }, ...]` so existing products without end dates still show
- Custom header scripts re-created via `document.createElement('script')` after innerHTML parsing for execution
- Chat GET endpoint made public so ChatWidget can fetch messages without login
- `onTabChange` prop passed to AdminDashboard for "Back" navigation to store

## Next Steps
1. End-to-end test chat flow and flash sale filtering

## Done Recently
- **Category API**: Verified `CategorySection.js` is already fetching from the API (`/categories`).
- **Newsletter Subscription**: Added `subscribers` schema, `POST /api/subscribers` route, and wired up the Subscribe button state and API call in `Footer.js`.
- **Sidebar Menu Reorder**: Moved **Products** tab above **Orders** in AdminDashboard sidebar menu for better logical grouping.
- **Prompt → Dropdown Replacement**: Replaced `prompt()`-based inline permission add in both **Manage Staffs** and **Staff Roles** tables with proper `<select>` dropdown + confirm/cancel buttons.
- **Backend Roles Table Fix**: `getRoles()` was falling back to mock system-only data on DB failure, hiding custom roles and their delete buttons. Fixed by adding `ensureRolesTable()` (auto-creates `roles` table + seeds system roles), removing mock fallback, and updating CRUD helpers to use `ensureRolesTable()` on error.
- **VPS Migration — `is_system` Column Missing on Existing Tables**: If the `roles` table was created before the `is_system` column was added (e.g., on VPS), `CREATE TABLE IF NOT EXISTS` won't add it — making `role.is_system` `undefined` and showing edit/delete buttons on **all** roles. Fixed by adding `ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false` in both `db.js:connectDB()` and `userController.js:ensureRolesTable()`, plus `UPDATE` to retroactively flag existing system role rows.

## Relevant Files
- `backend/models/Category.js`, `Brand.js`, `ChatMessage.js` (isClosed), `User.js` (phone), `Product.js` (flashSaleStart/End), `Settings.js` (customHeaderCode)
- `backend/controllers/categoryController.js`, `brandController.js`, `productController.js`
- `backend/routes/categoryRoutes.js`, `brandRoutes.js`, `chatRoutes.js`, `settingsRoutes.js`
- `backend/server.js` — registered category/brand routes
- `frontend/src/components/AdminDashboard.js` — categories/brands tabs, flash sale dates, "Back" button, "Close Chat", custom header code field
- `frontend/src/components/Footer.js` — inline SVG social icons
- `frontend/src/components/BannerSlider.js` — fallback default banner, flexible min-height, onShopClick
- `frontend/src/components/Hero.js` — imports and renders BannerSlider
- `frontend/src/components/ChatWidget.js` — closed state detection, reopen button, input hidden when closed
- `frontend/src/components/TrackingScripts.js` — custom header code injection with script re-creation
- `frontend/src/components/AuthModal.js` — phone field in register form
- `frontend/src/context/ShopContext.js` — register() accepts phone
- `frontend/src/app/page.js` — admin no Footer, ChatWidget imported
