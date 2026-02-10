import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const staffMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  photo: z.string().optional(),
  description: z.string().optional(),
});

export type StaffMember = z.infer<typeof staffMemberSchema>;

export const mams = pgTable("mams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  description: text("description").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  capacity: integer("capacity").notNull(),
  ageMin: integer("age_min").notNull().default(0),
  ageMax: integer("age_max").notNull().default(6),
  openingHours: text("opening_hours").notNull(),
  services: text("services").array().notNull().default(sql`'{}'::text[]`),
  photos: text("photos").array().notNull().default(sql`'{}'::text[]`),
  staffMembers: jsonb("staff_members").notNull().default(sql`'[]'::jsonb`),
  coverPhoto: text("cover_photo"),
  published: boolean("published").notNull().default(true),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMamSchema = createInsertSchema(mams).omit({
  id: true,
  createdAt: true,
  slug: true,
});

export const registerMamSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  capacity: z.coerce.number().min(1, "Capacité minimum de 1").max(20, "Capacité maximum de 20"),
  ageMin: z.coerce.number().min(0).max(6),
  ageMax: z.coerce.number().min(0).max(6),
  openingHours: z.string().min(5, "Horaires requis"),
  services: z.array(z.string()).default([]),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const loginMamSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type InsertMam = z.infer<typeof insertMamSchema>;
export type Mam = typeof mams.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
