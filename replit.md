# Mam Connect

## Overview
Mam Connect is a platform connecting parents with MAM (Maisons d'Assistantes Maternelles) in France. MAMs can register, create personalized profile pages, and manage their information. Parents can search the directory by city/postal code and view detailed MAM profiles.

## Recent Changes
- 2026-02-10: Initial MVP built with full registration, login, directory search, profile pages, and dashboard

## Architecture
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui components
- **Backend**: Express.js API
- **Database**: PostgreSQL with Drizzle ORM
- **Routing**: wouter (frontend), Express (backend)
- **State Management**: TanStack React Query

## Key Files
- `shared/schema.ts` - Data models (mams table, insert/select types, Zod schemas)
- `server/routes.ts` - API endpoints (GET/POST/PATCH for MAMs, login)
- `server/storage.ts` - Database storage interface
- `server/db.ts` - Database connection
- `server/seed.ts` - Seed data (3 sample MAMs)
- `client/src/App.tsx` - Main app with routing
- `client/src/pages/home.tsx` - Landing page with hero, features, featured MAMs
- `client/src/pages/directory.tsx` - MAM directory with search/filter
- `client/src/pages/mam-profile.tsx` - Individual MAM profile page
- `client/src/pages/register.tsx` - MAM registration form
- `client/src/pages/login.tsx` - MAM login page
- `client/src/pages/dashboard.tsx` - MAM management dashboard (edit info, team, photos)

## API Routes
- `GET /api/mams` - List all published MAMs
- `GET /api/mams/featured` - List featured MAMs (max 6)
- `GET /api/mams/:slug` - Get MAM by slug
- `POST /api/mams` - Register new MAM
- `POST /api/mams/login` - MAM login (returns MAM data)
- `PATCH /api/mams/:id` - Update MAM data

## Design
- Warm color palette (rose primary: hsl 340, warm beige backgrounds)
- Font: Plus Jakarta Sans
- Child-friendly, welcoming aesthetic
- Light/dark mode support

## User Preferences
- Language: French
