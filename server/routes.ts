import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerMamSchema, loginMamSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/mams", async (_req, res) => {
    try {
      const allMams = await storage.getMams();
      const safeMams = allMams.map(({ password, ...rest }) => rest);
      res.json(safeMams);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des MAM" });
    }
  });

  app.get("/api/mams/featured", async (_req, res) => {
    try {
      const allMams = await storage.getMams();
      const safeMams = allMams.map(({ password, ...rest }) => rest).slice(0, 6);
      res.json(safeMams);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des MAM" });
    }
  });

  app.get("/api/mams/:slug", async (req, res) => {
    try {
      const mam = await storage.getMamBySlug(req.params.slug);
      if (!mam) {
        return res.status(404).json({ message: "MAM introuvable" });
      }
      const { password, ...safeMam } = mam;
      res.json(safeMam);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/mams", async (req, res) => {
    try {
      const result = registerMamSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).message });
      }

      const existingMam = await storage.getMamByEmail(result.data.email);
      if (existingMam) {
        return res.status(400).json({ message: "Un compte existe déjà avec cet email" });
      }

      let slug = slugify(result.data.name);
      const existingSlug = await storage.getMamBySlug(slug);
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const hashedPassword = await bcrypt.hash(result.data.password, SALT_ROUNDS);

      const mamData = {
        ...result.data,
        password: hashedPassword,
        slug,
        photos: [],
        staffMembers: [],
        coverPhoto: null,
        published: true,
      };

      const mam = await storage.createMam(mamData);
      const { password, ...safeMam } = mam;
      res.status(201).json(safeMam);
    } catch (error) {
      console.error("Create MAM error:", error);
      res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  });

  app.post("/api/mams/login", async (req, res) => {
    try {
      const result = loginMamSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).message });
      }

      const mam = await storage.getMamByEmail(result.data.email);
      if (!mam) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const passwordMatch = await bcrypt.compare(result.data.password, mam.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const { password, ...safeMam } = mam;
      res.json(safeMam);
    } catch (error) {
      res.status(500).json({ message: "Erreur de connexion" });
    }
  });

  app.patch("/api/mams/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const mam = await storage.getMamById(id);
      if (!mam) {
        return res.status(404).json({ message: "MAM introuvable" });
      }

      const { currentPassword } = req.body;
      if (!currentPassword) {
        return res.status(401).json({ message: "Mot de passe requis pour modifier votre page" });
      }

      const passwordMatch = await bcrypt.compare(currentPassword, mam.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
      }

      const updateData: Record<string, unknown> = {};

      const allowedFields = [
        "name", "email", "phone", "description", "address", "city",
        "postalCode", "capacity", "ageMin", "ageMax", "openingHours",
        "services", "photos", "staffMembers", "coverPhoto", "published",
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (req.body.newPassword) {
        const newPwResult = registerMamSchema.shape.password.safeParse(req.body.newPassword);
        if (!newPwResult.success) {
          return res.status(400).json({ message: fromError(newPwResult.error).message });
        }
        updateData.password = await bcrypt.hash(req.body.newPassword, SALT_ROUNDS);
      }

      const updatedMam = await storage.updateMam(id, updateData);
      if (!updatedMam) {
        return res.status(500).json({ message: "Erreur lors de la mise à jour" });
      }

      const { password, ...safeMam } = updatedMam;
      res.json(safeMam);
    } catch (error) {
      console.error("Update MAM error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour" });
    }
  });

  return httpServer;
}
