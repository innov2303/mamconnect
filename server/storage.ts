import { type Mam, type InsertMam, type Admin, type InsertAdmin, type Ticket, type InsertTicket, type Parent, type InsertParent, type ParentNotification, type InsertParentNotification, mams, admins, tickets, parents, parentNotifications } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and, desc } from "drizzle-orm";

export interface IStorage {
  getMams(): Promise<Mam[]>;
  getAllMams(): Promise<Mam[]>;
  getMamById(id: string): Promise<Mam | undefined>;
  getMamBySlug(slug: string): Promise<Mam | undefined>;
  getMamByEmail(email: string): Promise<Mam | undefined>;
  createMam(mam: InsertMam & { slug: string }): Promise<Mam>;
  updateMam(id: string, data: Partial<InsertMam>): Promise<Mam | undefined>;
  deleteMam(id: string): Promise<boolean>;
  searchMams(query: string): Promise<Mam[]>;

  getAdminByEmail(email: string): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  getTickets(): Promise<Ticket[]>;
  getTicketsByMamId(mamId: string): Promise<Ticket[]>;
  getTicketById(id: string): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket | undefined>;

  getParentByEmail(email: string): Promise<Parent | undefined>;
  createParent(parent: InsertParent & { latitude?: string | null; longitude?: string | null }): Promise<Parent>;
  getAllParents(): Promise<Parent[]>;
  getParentById(id: string): Promise<Parent | undefined>;
  updateParent(id: string, data: Partial<Parent>): Promise<Parent | undefined>;

  createNotification(notification: InsertParentNotification): Promise<ParentNotification>;
  getNotificationsByParentId(parentId: string): Promise<ParentNotification[]>;
  markNotificationRead(id: string): Promise<ParentNotification | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getMams(): Promise<Mam[]> {
    return db.select().from(mams).where(and(eq(mams.published, true), eq(mams.status, "approved")));
  }

  async getAllMams(): Promise<Mam[]> {
    return db.select().from(mams).orderBy(desc(mams.createdAt));
  }

  async getMamById(id: string): Promise<Mam | undefined> {
    const [mam] = await db.select().from(mams).where(eq(mams.id, id));
    return mam;
  }

  async getMamBySlug(slug: string): Promise<Mam | undefined> {
    const [mam] = await db.select().from(mams).where(eq(mams.slug, slug));
    return mam;
  }

  async getMamByEmail(email: string): Promise<Mam | undefined> {
    const [mam] = await db.select().from(mams).where(eq(mams.email, email));
    return mam;
  }

  async createMam(mamData: InsertMam & { slug: string }): Promise<Mam> {
    const [mam] = await db.insert(mams).values(mamData).returning();
    return mam;
  }

  async updateMam(id: string, data: Partial<InsertMam>): Promise<Mam | undefined> {
    const [mam] = await db.update(mams).set(data).where(eq(mams.id, id)).returning();
    return mam;
  }

  async deleteMam(id: string): Promise<boolean> {
    await db.delete(tickets).where(eq(tickets.mamId, id));
    const result = await db.delete(mams).where(eq(mams.id, id)).returning();
    return result.length > 0;
  }

  async searchMams(query: string): Promise<Mam[]> {
    const q = `%${query}%`;
    return db
      .select()
      .from(mams)
      .where(
        and(
          eq(mams.status, "approved"),
          eq(mams.published, true),
          or(
            ilike(mams.name, q),
            ilike(mams.city, q),
            ilike(mams.postalCode, q),
            ilike(mams.address, q)
          )
        )
      );
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(adminData).returning();
    return admin;
  }

  async getTickets(): Promise<Ticket[]> {
    return db.select().from(tickets).orderBy(desc(tickets.createdAt));
  }

  async getTicketsByMamId(mamId: string): Promise<Ticket[]> {
    return db.select().from(tickets).where(eq(tickets.mamId, mamId)).orderBy(desc(tickets.createdAt));
  }

  async getTicketById(id: string): Promise<Ticket | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    return ticket;
  }

  async createTicket(ticketData: InsertTicket): Promise<Ticket> {
    const [ticket] = await db.insert(tickets).values(ticketData).returning();
    return ticket;
  }

  async updateTicket(id: string, data: Partial<Ticket>): Promise<Ticket | undefined> {
    const [ticket] = await db.update(tickets).set({ ...data, updatedAt: new Date() }).where(eq(tickets.id, id)).returning();
    return ticket;
  }

  async getParentByEmail(email: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.email, email));
    return parent;
  }

  async createParent(parentData: InsertParent & { latitude?: string | null; longitude?: string | null }): Promise<Parent> {
    const [parent] = await db.insert(parents).values(parentData).returning();
    return parent;
  }

  async getAllParents(): Promise<Parent[]> {
    return db.select().from(parents).where(eq(parents.notificationsEnabled, true));
  }

  async getParentById(id: string): Promise<Parent | undefined> {
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    return parent;
  }

  async updateParent(id: string, data: Partial<Parent>): Promise<Parent | undefined> {
    const [parent] = await db.update(parents).set(data).where(eq(parents.id, id)).returning();
    return parent;
  }

  async createNotification(notifData: InsertParentNotification): Promise<ParentNotification> {
    const [notif] = await db.insert(parentNotifications).values(notifData).returning();
    return notif;
  }

  async getNotificationsByParentId(parentId: string): Promise<ParentNotification[]> {
    return db.select().from(parentNotifications).where(eq(parentNotifications.parentId, parentId)).orderBy(desc(parentNotifications.createdAt));
  }

  async markNotificationRead(id: string): Promise<ParentNotification | undefined> {
    const [notif] = await db.update(parentNotifications).set({ read: true }).where(eq(parentNotifications.id, id)).returning();
    return notif;
  }
}

export const storage = new DatabaseStorage();
