# Mam Connect

## Overview
Mam Connect is a platform connecting parents with MAM (Maisons d'Assistantes Maternelles) in France. MAMs can register, create personalized profile pages, and manage their information. Parents can search the directory by city/postal code and view detailed MAM profiles. An admin system manages MAM validation, user management, and support tickets.

## Recent Changes
- 2026-02-10: Added admin system with MAM validation workflow, user management, and ticket system
- 2026-02-10: Added password security (bcrypt hashing, complexity validation)
- 2026-02-10: Initial MVP built with full registration, login, directory search, profile pages, and dashboard

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js API
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: bcrypt password hashing, Bearer token auth for admin
- **Routing**: wouter (frontend), Express (backend)
- **State Management**: TanStack React Query

## Key Files
- `shared/schema.ts` - Data models (mams, admins, tickets tables + Zod schemas)
- `server/routes.ts` - API endpoints (MAM CRUD, admin auth, ticket management)
- `server/storage.ts` - Database storage interface
- `server/db.ts` - Database connection
- `server/seed.ts` - Seed data (3 sample MAMs + default admin account)
- `client/src/App.tsx` - Main app with routing (public + admin routes)
- `client/src/pages/home.tsx` - Landing page with hero, features, featured MAMs
- `client/src/pages/directory.tsx` - MAM directory with search/filter
- `client/src/pages/mam-profile.tsx` - Individual MAM profile page
- `client/src/pages/register.tsx` - MAM registration form
- `client/src/pages/login.tsx` - MAM login page
- `client/src/pages/dashboard.tsx` - MAM management dashboard (edit info, team, photos, support tickets)
- `client/src/pages/admin-login.tsx` - Admin login page
- `client/src/pages/admin-dashboard.tsx` - Admin dashboard (MAM management + tickets)

## API Routes
### Public
- `GET /api/mams` - List approved+published MAMs
- `GET /api/mams/featured` - List featured MAMs (max 6)
- `GET /api/mams/:slug` - Get MAM by slug
- `POST /api/mams` - Register new MAM (status: pending)
- `POST /api/mams/login` - MAM login
- `PATCH /api/mams/:id` - Update MAM data (requires currentPassword)
- `POST /api/mams/:id/tickets` - Create support ticket
- `GET /api/mams/:id/tickets` - List MAM's tickets

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
