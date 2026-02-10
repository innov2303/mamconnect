# Mam Connect

## Overview
Mam Connect is a platform connecting parents with MAM (Maisons d'Assistantes Maternelles) in France. MAMs can register, create personalized profile pages, and manage their information. Parents can search the directory by city/postal code and view detailed MAM profiles. An admin system manages MAM validation, user management, and support tickets.

## Recent Changes
- 2026-02-10: Added parent registration system with geocoding (api-adresse.data.gouv.fr) and automatic 30km radius notification matching
- 2026-02-10: Added email notifications via Resend when MAM spots become available near registered parents
- 2026-02-10: Added available spots management (availableSpots JSONB) - MAMs can add spots with date, count, note; displayed on profile page
- 2026-02-10: Added staff member photo upload with avatar fallback (initials) in dashboard
- 2026-02-10: Added automatic image upscaling for photos below 1200x800 (Lanczos3 + sharpening)
- 2026-02-10: Added MAM session system with token auth - login redirects to profile page, edit buttons visible for owner, no password needed for edits
- 2026-02-10: Added photo upload from PC with sharp image optimization (resize, sharpen, WebP conversion)
- 2026-02-10: Split description field into descriptionStructure and descriptionPedagogique (schema, forms, profile page)
- 2026-02-10: Added admin system with MAM validation workflow, user management, and ticket system
- 2026-02-10: Added password security (bcrypt hashing, complexity validation)
- 2026-02-10: Initial MVP built with full registration, login, directory search, profile pages, and dashboard

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js API
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: bcrypt password hashing, Bearer token auth for admin and MAM sessions
- **Routing**: wouter (frontend), Express (backend)
- **State Management**: TanStack React Query

## Key Files
- `shared/schema.ts` - Data models (mams, admins, tickets, parents, parentNotifications tables + Zod schemas)
- `server/routes.ts` - API endpoints (MAM CRUD, admin auth, MAM auth, ticket management, parent registration)
- `server/storage.ts` - Database storage interface
- `server/db.ts` - Database connection
- `server/seed.ts` - Seed data (3 sample MAMs + default admin account)
- `server/geocoding.ts` - Geocoding utility (api-adresse.data.gouv.fr) + Haversine distance calculation
- `server/resend.ts` - Resend email client (Replit connector integration)
- `client/src/App.tsx` - Main app with routing (public + admin routes)
- `client/src/lib/mam-auth.tsx` - MAM authentication context (token + localStorage session)
- `client/src/pages/home.tsx` - Landing page with hero, features, featured MAMs
- `client/src/pages/directory.tsx` - MAM directory with search/filter
- `client/src/pages/mam-profile.tsx` - Individual MAM profile page (shows edit buttons for owner)
- `client/src/pages/register.tsx` - MAM registration form
- `client/src/pages/login.tsx` - MAM login page (redirects to profile page)
- `client/src/pages/dashboard.tsx` - MAM management dashboard (token auth, no password needed)
- `client/src/pages/parent-register.tsx` - Parent registration form (basic info + search criteria)
- `client/src/pages/admin-login.tsx` - Admin login page
- `client/src/pages/admin-dashboard.tsx` - Admin dashboard (MAM management + tickets)

## API Routes
### Public
- `GET /api/mams` - List approved+published MAMs
- `GET /api/mams/featured` - List featured MAMs (max 6)
- `GET /api/mams/me` - Get authenticated MAM data (requires Bearer token)
- `GET /api/mams/:slug` - Get MAM by slug
- `POST /api/mams` - Register new MAM (status: pending)
- `POST /api/mams/login` - MAM login (returns token)
- `POST /api/upload` - Upload photo (returns URL)
- `PATCH /api/mams/:id` - Update MAM data (requires Bearer token or currentPassword)
- `POST /api/mams/:id/tickets` - Create support ticket
- `GET /api/mams/:id/tickets` - List MAM's tickets

### Parent
- `POST /api/parents` - Register parent (geocodes address, returns parent data with lat/lng)
- `GET /api/parents/:id/notifications` - List parent's notifications

### Admin (requires Bearer token)
- `POST /api/admin/login` - Admin login (returns token)
- `GET /api/admin/verify` - Verify admin token
- `GET /api/admin/mams` - List all MAMs (all statuses)
- `PATCH /api/admin/mams/:id/status` - Update MAM status (pending/approved/rejected)
- `DELETE /api/admin/mams/:id` - Delete MAM
- `GET /api/admin/tickets` - List all tickets
- `PATCH /api/admin/tickets/:id` - Update ticket (status, response)
- `DELETE /api/admin/tickets/:id` - Close ticket

## MAM Validation Workflow
1. MAM registers -> status: "pending", published: false
2. Admin reviews in admin dashboard
3. Admin approves -> status: "approved", published: true (visible in directory)
4. Admin can reject -> status: "rejected", published: false
5. Admin can suspend approved MAMs or reactivate rejected ones

## Default Admin Account
- Email: admin@mamconnect.fr
- Password: Admin@12345

## Design
- Warm color palette (rose primary: hsl 340, warm beige backgrounds)
- Font: Plus Jakarta Sans
- Child-friendly, welcoming aesthetic
- Light/dark mode support
- Admin pages have no header/footer (standalone layout)

## User Preferences
- Language: French
