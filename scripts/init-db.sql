-- ==============================================
-- Mam Connect - Script d'initialisation BDD
-- À exécuter sur le serveur de production
-- ==============================================

-- Activation de l'extension pour gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- Table: mams
-- ==============================================
CREATE TABLE IF NOT EXISTS mams (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  description_structure TEXT NOT NULL,
  description_pedagogique TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  age_min INTEGER NOT NULL DEFAULT 0,
  age_max INTEGER NOT NULL DEFAULT 6,
  opening_hours JSONB NOT NULL DEFAULT '[]'::jsonb,
  services TEXT[] NOT NULL DEFAULT '{}'::text[],
  photos TEXT[] NOT NULL DEFAULT '{}'::text[],
  staff_members JSONB NOT NULL DEFAULT '[]'::jsonb,
  available_spots JSONB NOT NULL DEFAULT '[]'::jsonb,
  latitude TEXT,
  longitude TEXT,
  cover_photo TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  password TEXT NOT NULL,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_code TEXT,
  password_reset_code TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==============================================
-- Table: admins
-- ==============================================
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==============================================
-- Table: tickets
-- ==============================================
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  mam_id VARCHAR REFERENCES mams(id),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  admin_response TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==============================================
-- Table: users (sessions internes)
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- ==============================================
-- Table: parents
-- ==============================================
CREATE TABLE IF NOT EXISTS parents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  password TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  latitude TEXT,
  longitude TEXT,
  child_birth_date TEXT NOT NULL,
  desired_start_date TEXT NOT NULL,
  notes TEXT DEFAULT '',
  search_active BOOLEAN NOT NULL DEFAULT false,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  email_verification_code TEXT,
  password_reset_code TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==============================================
-- Table: parent_notifications
-- ==============================================
CREATE TABLE IF NOT EXISTS parent_notifications (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id VARCHAR NOT NULL REFERENCES parents(id),
  mam_id VARCHAR NOT NULL REFERENCES mams(id),
  message TEXT NOT NULL,
  spot_info TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ==============================================
-- Index pour les recherches fréquentes
-- ==============================================
CREATE INDEX IF NOT EXISTS idx_mams_status ON mams(status);
CREATE INDEX IF NOT EXISTS idx_mams_published ON mams(published);
CREATE INDEX IF NOT EXISTS idx_mams_city ON mams(city);
CREATE INDEX IF NOT EXISTS idx_mams_postal_code ON mams(postal_code);
CREATE INDEX IF NOT EXISTS idx_mams_slug ON mams(slug);
CREATE INDEX IF NOT EXISTS idx_mams_email ON mams(email);

CREATE INDEX IF NOT EXISTS idx_parents_email ON parents(email);
CREATE INDEX IF NOT EXISTS idx_parents_search_active ON parents(search_active);
CREATE INDEX IF NOT EXISTS idx_parents_postal_code ON parents(postal_code);

CREATE INDEX IF NOT EXISTS idx_tickets_mam_id ON tickets(mam_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_notifications_parent_id ON parent_notifications(parent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_mam_id ON parent_notifications(mam_id);

-- ==============================================
-- Compte admin par défaut
-- Mot de passe : Admin@12345 (hashé en bcrypt)
-- IMPORTANT : Changez ce mot de passe après la première connexion !
-- ==============================================
INSERT INTO admins (username, email, password)
VALUES (
  'admin',
  'admin@mamconnect.fr',
  '$2b$12$gAXfDk6DrWutMVKIbuw2.uXdiufybmX32kboYImVkVg.fmfeupeEm'
)
ON CONFLICT (email) DO NOTHING;

-- ==============================================
-- Fin du script
-- ==============================================
