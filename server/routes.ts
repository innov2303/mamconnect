import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerMamSchema, loginMamSchema, loginAdminSchema, createTicketSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import bcrypt from "bcrypt";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const SALT_ROUNDS = 12;

const adminTokens = new Map<string, { adminId: string; email: string; expiresAt: number }>();
const mamTokens = new Map<string, { mamId: string; email: string; expiresAt: number }>();

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  const token = authHeader.slice(7);
  const session = adminTokens.get(token);
  if (!session || session.expiresAt < Date.now()) {
    adminTokens.delete(token);
    return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter" });
  }
  (req as any).adminId = session.adminId;
  (req as any).adminEmail = session.email;
  next();
}

function mamAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentification requise" });
  }
  const token = authHeader.slice(7);
  const session = mamTokens.get(token);
  if (!session || session.expiresAt < Date.now()) {
    mamTokens.delete(token);
    return res.status(401).json({ message: "Session expirée, veuillez vous reconnecter" });
  }
  (req as any).mamId = session.mamId;
  (req as any).mamEmail = session.email;
  next();
}

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

  app.use("/uploads", (await import("express")).default.static(uploadDir));

  const MIN_WIDTH = 1200;
  const MIN_HEIGHT = 800;

  app.post("/api/upload", upload.single("photo"), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier envoyé ou format non supporté (jpg, png, webp)" });
    }
    try {
      const filename = `${crypto.randomBytes(16).toString("hex")}.webp`;
      const outputPath = path.join(uploadDir, filename);

      const metadata = await sharp(req.file.buffer).metadata();
      const origWidth = metadata.width || 0;
      const origHeight = metadata.height || 0;

      let pipeline = sharp(req.file.buffer);

      const needsUpscale = origWidth < MIN_WIDTH || origHeight < MIN_HEIGHT;
      if (needsUpscale) {
        const scaleX = MIN_WIDTH / origWidth;
        const scaleY = MIN_HEIGHT / origHeight;
        const scale = Math.max(scaleX, scaleY);
        const newWidth = Math.round(origWidth * scale);
        const newHeight = Math.round(origHeight * scale);
        pipeline = pipeline.resize(newWidth, newHeight, {
          kernel: sharp.kernel.lanczos3,
          fit: "fill",
        });
      } else {
        pipeline = pipeline.resize(1920, 1440, { fit: "inside", withoutEnlargement: true });
      }

      await pipeline
        .sharpen({ sigma: needsUpscale ? 2.0 : 1.5 })
        .webp({ quality: 92, effort: 6 })
        .toFile(outputPath);

      const finalMeta = await sharp(outputPath).metadata();

      res.json({
        url: `/uploads/${filename}`,
        upscaled: needsUpscale,
        originalSize: `${origWidth}x${origHeight}`,
        finalSize: `${finalMeta.width}x${finalMeta.height}`,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur lors du traitement de l'image" });
    }
  });

  app.get("/api/mams", async (_req, res) => {
    try {
      const allMams = await storage.getMams();
      const safeMams = allMams.map(({ password, ...rest }) => rest);
      res.json(safeMams);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des MAM" });
    }
  });

  app.get("/api/mams/me", mamAuth, async (req, res) => {
    try {
      const mamId = (req as any).mamId;
      const mam = await storage.getMamById(mamId);
      if (!mam) {
        return res.status(404).json({ message: "MAM introuvable" });
      }
      const { password, ...safeMam } = mam;
      res.json(safeMam);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
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
        published: false,
        status: "pending",
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

      const token = generateToken();
      mamTokens.set(token, {
        mamId: mam.id,
        email: mam.email,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const { password, ...safeMam } = mam;
      res.json({ ...safeMam, token });
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

      let authenticated = false;
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const session = mamTokens.get(token);
        if (session && session.expiresAt >= Date.now() && session.mamId === id) {
          authenticated = true;
        }
      }

      if (!authenticated) {
        const { currentPassword } = req.body;
        if (!currentPassword) {
          return res.status(401).json({ message: "Mot de passe requis pour modifier votre page" });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, mam.password);
        if (!passwordMatch) {
          return res.status(401).json({ message: "Mot de passe incorrect" });
        }
      }

      const updateData: Record<string, unknown> = {};

      const allowedFields = [
        "name", "email", "phone", "descriptionStructure", "descriptionPedagogique",
        "address", "city", "postalCode", "capacity", "ageMin", "ageMax",
        "openingHours", "services", "photos", "staffMembers", "coverPhoto",
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

  app.post("/api/mams/:id/tickets", async (req, res) => {
    try {
      const { id } = req.params;
      const mam = await storage.getMamById(id);
      if (!mam) {
        return res.status(404).json({ message: "MAM introuvable" });
      }

      const result = createTicketSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).message });
      }

      const ticket = await storage.createTicket({
        mamId: id,
        senderName: mam.name,
        senderEmail: mam.email,
        subject: result.data.subject,
        message: result.data.message,
        priority: result.data.priority,
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error("Create ticket error:", error);
      res.status(500).json({ message: "Erreur lors de la création du ticket" });
    }
  });

  app.get("/api/mams/:id/tickets", async (req, res) => {
    try {
      const { id } = req.params;
      const ticketsList = await storage.getTicketsByMamId(id);
      res.json(ticketsList);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des tickets" });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      const result = loginAdminSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: fromError(result.error).message });
      }

      const admin = await storage.getAdminByEmail(result.data.email);
      if (!admin) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      const passwordMatch = await bcrypt.compare(result.data.password, admin.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Identifiants incorrects" });
      }

      const token = generateToken();
      adminTokens.set(token, {
        adminId: admin.id,
        email: admin.email,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      });

      const { password, ...safeAdmin } = admin;
      res.json({ ...safeAdmin, token });
    } catch (error) {
      res.status(500).json({ message: "Erreur de connexion" });
    }
  });

  app.get("/api/admin/verify", adminAuth, async (_req, res) => {
    res.json({ authenticated: true });
  });

  app.get("/api/admin/mams", adminAuth, async (_req, res) => {
    try {
      const allMams = await storage.getAllMams();
      const safeMams = allMams.map(({ password, ...rest }) => rest);
      res.json(safeMams);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des MAM" });
    }
  });

  app.patch("/api/admin/mams/:id/status", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
      }

      const published = status === "approved";
      const updatedMam = await storage.updateMam(id, { status, published } as any);
      if (!updatedMam) {
        return res.status(404).json({ message: "MAM introuvable" });
      }

      const { password, ...safeMam } = updatedMam;
      res.json(safeMam);
    } catch (error) {
      console.error("Update MAM status error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du statut" });
    }
  });

  app.delete("/api/admin/mams/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteMam(id);
      if (!deleted) {
        return res.status(404).json({ message: "MAM introuvable" });
      }
      res.json({ message: "MAM supprimée avec succès" });
    } catch (error) {
      console.error("Delete MAM error:", error);
      res.status(500).json({ message: "Erreur lors de la suppression" });
    }
  });

  app.get("/api/admin/tickets", adminAuth, async (_req, res) => {
    try {
      const allTickets = await storage.getTickets();
      res.json(allTickets);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des tickets" });
    }
  });

  app.patch("/api/admin/tickets/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminResponse } = req.body;

      const updateData: Record<string, unknown> = {};
      if (status && ["open", "in_progress", "closed"].includes(status)) {
        updateData.status = status;
      }
      if (adminResponse !== undefined) {
        updateData.adminResponse = adminResponse;
      }

      const updatedTicket = await storage.updateTicket(id, updateData as any);
      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket introuvable" });
      }

      res.json(updatedTicket);
    } catch (error) {
      console.error("Update ticket error:", error);
      res.status(500).json({ message: "Erreur lors de la mise à jour du ticket" });
    }
  });

  app.delete("/api/admin/tickets/:id", adminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const ticket = await storage.getTicketById(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket introuvable" });
      }
      await storage.updateTicket(id, { status: "closed" } as any);
      res.json({ message: "Ticket fermé avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la fermeture du ticket" });
    }
  });

  return httpServer;
}
