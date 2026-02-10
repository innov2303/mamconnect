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

export const availableSpotSchema = z.object({
  count: z.number().min(1),
  availableFrom: z.string().min(1),
  note: z.string().optional(),
});

export type AvailableSpot = z.infer<typeof availableSpotSchema>;

export const mams = pgTable("mams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  descriptionStructure: text("description_structure").notNull(),
  descriptionPedagogique: text("description_pedagogique").notNull().default(""),
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
  availableSpots: jsonb("available_spots").notNull().default(sql`'[]'::jsonb`),
  latitude: text("latitude"),
  longitude: text("longitude"),
  coverPhoto: text("cover_photo"),
  published: boolean("published").notNull().default(false),
  status: text("status").notNull().default("pending"),
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
  descriptionStructure: z.string().min(20, "La description de la structure doit contenir au moins 20 caractères"),
  descriptionPedagogique: z.string().min(20, "La description du projet pédagogique doit contenir au moins 20 caractères"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  capacity: z.coerce.number().min(1, "Capacité minimum de 1").max(20, "Capacité maximum de 20"),
  ageMin: z.coerce.number().min(0).max(6),
  ageMax: z.coerce.number().min(0).max(6),
  openingHours: z.string().min(5, "Horaires requis"),
  services: z.array(z.string()).default([]),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
    .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
    .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial (!@#$...)"),
});

export const loginMamSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type InsertMam = z.infer<typeof insertMamSchema>;
export type Mam = typeof mams.$inferSelect;

export const admins = pgTable("admins", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
  createdAt: true,
});

export const loginAdminSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;

export const tickets = pgTable("tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  mamId: varchar("mam_id").references(() => mams.id),
  senderName: text("sender_name").notNull(),
  senderEmail: text("sender_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("normal"),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  adminResponse: true,
  status: true,
});

export const createTicketSchema = z.object({
  subject: z.string().min(3, "Le sujet doit contenir au moins 3 caractères"),
  message: z.string().min(10, "Le message doit contenir au moins 10 caractères"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof tickets.$inferSelect;

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

export const parents = pgTable("parents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  childBirthDate: text("child_birth_date").notNull(),
  desiredStartDate: text("desired_start_date").notNull(),
  notes: text("notes").default(""),
  notificationsEnabled: boolean("notifications_enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertParentSchema = createInsertSchema(parents).omit({
  id: true,
  createdAt: true,
  latitude: true,
  longitude: true,
});

export const registerParentSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide (5 chiffres)"),
  childBirthDate: z.string().min(1, "Date de naissance de l'enfant requise"),
  desiredStartDate: z.string().min(1, "Date souhaitée requise"),
  notes: z.string().default(""),
  notificationsEnabled: z.boolean().default(true),
});

export type InsertParent = z.infer<typeof insertParentSchema>;
export type Parent = typeof parents.$inferSelect;

export const parentNotifications = pgTable("parent_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").references(() => parents.id).notNull(),
  mamId: varchar("mam_id").references(() => mams.id).notNull(),
  message: text("message").notNull(),
  spotInfo: text("spot_info"),
  read: boolean("read").notNull().default(false),
  emailSent: boolean("email_sent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(parentNotifications).omit({
  id: true,
  createdAt: true,
});

export type InsertParentNotification = z.infer<typeof insertNotificationSchema>;
export type ParentNotification = typeof parentNotifications.$inferSelect;
