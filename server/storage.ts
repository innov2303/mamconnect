import { type Mam, type InsertMam, mams } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or } from "drizzle-orm";

export interface IStorage {
  getMams(): Promise<Mam[]>;
  getMamById(id: string): Promise<Mam | undefined>;
  getMamBySlug(slug: string): Promise<Mam | undefined>;
  getMamByEmail(email: string): Promise<Mam | undefined>;
  createMam(mam: InsertMam & { slug: string }): Promise<Mam>;
  updateMam(id: string, data: Partial<InsertMam>): Promise<Mam | undefined>;
  searchMams(query: string): Promise<Mam[]>;
}

export class DatabaseStorage implements IStorage {
  async getMams(): Promise<Mam[]> {
    return db.select().from(mams).where(eq(mams.published, true));
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

  async searchMams(query: string): Promise<Mam[]> {
    const q = `%${query}%`;
    return db
      .select()
      .from(mams)
      .where(
        or(
          ilike(mams.name, q),
          ilike(mams.city, q),
          ilike(mams.postalCode, q),
          ilike(mams.address, q)
        )
      );
  }
}

export const storage = new DatabaseStorage();
