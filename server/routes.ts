import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerMamSchema, loginMamSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

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
      res.status(500).json({ message: "Erreur lors de la r\u00e9cup\u00e9ration des MAM" });
    }
  });

  app.get("/api/mams/featured", async (_req, res) => {
    try {
      const allMams = await storage.getMams();
      const safeMams = allMams.map(({ password, ...rest }) => rest).slice(0, 6);
      res.json(safeMams);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la r\u00e9cup\u00e9ration des MAM" });
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
        return res.status(400).json({ message: "Un compte existe d\u00e9j\u00e0 avec cet email" });
      }

      let slug = slugify(result.data.name);
      const existingSlug = await storage.getMamBySlug(slug);
      if (existingSlug) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const mamData = {
        ...result.data,
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

      if (mam.password !== result.data.password) {
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

      const updateData: Record<string, unknown> = {};

      const allowedFields = [
        "name", "email", "phone", "description", "address", "city",
        "postalCode", "capacity", "ageMin", "ageMax", "openingHours",
        "services", "photos", "staffMembers", "coverPhoto", "published",
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          if (field === "staffMembers") {
            updateData[field] = req.body[field];
          } else {
            updateData[field] = req.body[field];
          }
        }
      }

      const updatedMam = await storage.updateMam(id, updateData);
      if (!updatedMam) {
        return res.status(500).json({ message: "Erreur lors de la mise \u00e0 jour" });
      }

      const { password, ...safeMam } = updatedMam;
      res.json(safeMam);
    } catch (error) {
      console.error("Update MAM error:", error);
      res.status(500).json({ message: "Erreur lors de la mise \u00e0 jour" });
    }
  });

  return httpServer;
}
