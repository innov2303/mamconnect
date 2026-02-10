import { db } from "./db";
import { mams, admins } from "@shared/schema";
import { log } from "./index";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  const existingMams = await db.select().from(mams);
  const existingAdmins = await db.select().from(admins);

  if (existingAdmins.length === 0) {
    log("Creating default admin account...");
    const adminPassword = await bcrypt.hash("Admin@12345", 12);
    await db.insert(admins).values({
      username: "admin",
      email: "admin@mamconnect.fr",
      password: adminPassword,
    });
    log("Admin account created (admin@mamconnect.fr)");
  }

  if (existingMams.length > 0) {
    log("MAM data already seeded, skipping");
    return;
  }

  log("Seeding database with sample MAM data...");

  const seedMams = [
    {
      name: "Les Petits Explorateurs",
      slug: "les-petits-explorateurs",
      email: "contact@petits-explorateurs.fr",
      phone: "04 78 12 34 56",
      description:
        "Notre MAM accueille vos enfants dans un cadre chaleureux et bienveillant au c\u0153ur de Lyon. Notre projet pédagogique s'inspire de la méthode Montessori et favorise l'autonomie, la découverte sensorielle et le respect du rythme de chaque enfant.\n\nNous disposons d'un grand espace intérieur lumineux avec différents coins d'activités (lecture, arts plastiques, jeux de construction) ainsi qu'un jardin sécurisé pour les activités de plein air.",
      address: "15 rue des Lilas",
      city: "Lyon",
      postalCode: "69003",
      capacity: 8,
      ageMin: 0,
      ageMax: 3,
      openingHours: "Lundi - Vendredi : 7h30 - 18h30",
      services: ["Montessori", "Repas bio", "Activités artistiques", "Jardinage"],
      photos: ["/images/seed-mam-1.png", "/images/seed-mam-2.png"],
      coverPhoto: "/images/seed-mam-1.png",
      staffMembers: JSON.stringify([
        {
          name: "Sophie Martin",
          role: "Assistante maternelle agréée",
          photo: "/images/seed-staff-1.png",
          description: "Diplômée en petite enfance, 12 ans d'expérience",
        },
        {
          name: "Claire Dubois",
          role: "Assistante maternelle agréée",
          photo: "/images/seed-staff-2.png",
          description: "Spécialiste en psychomotricité, 8 ans d'expérience",
        },
      ]),
      published: true,
      status: "approved",
      password: "demo123456",
    },
    {
      name: "La Maison des Bambins",
      slug: "la-maison-des-bambins",
      email: "bonjour@maison-bambins.fr",
      phone: "01 45 67 89 01",
      description:
        "La Maison des Bambins est un lieu d'accueil convivial où chaque enfant est accompagné avec douceur et attention. Située dans le 15ème arrondissement de Paris, notre MAM offre un environnement sécurisant et stimulant.\n\nNous proposons des activités variées : éveil musical, peinture, yoga enfants, lecture de contes, et sorties au parc voisin. Les repas sont préparés sur place avec des produits frais et bio.",
      address: "42 avenue Victor Hugo",
      city: "Paris",
      postalCode: "75015",
      capacity: 12,
      ageMin: 0,
      ageMax: 4,
      openingHours: "Lundi - Vendredi : 7h00 - 19h00",
      services: [
        "Repas bio",
        "Musique",
        "Yoga enfants",
        "Lecture",
        "Sorties extérieures",
      ],
      photos: ["/images/seed-mam-2.png", "/images/seed-mam-3.png"],
      coverPhoto: "/images/seed-mam-2.png",
      staffMembers: JSON.stringify([
        {
          name: "Marie Leroy",
          role: "Assistante maternelle agréée",
          photo: "/images/seed-staff-1.png",
          description: "Passionnée par l'éveil musical des tout-petits",
        },
        {
          name: "Julie Moreau",
          role: "Assistante maternelle agréée",
          photo: "/images/seed-staff-3.png",
          description: "Formée à la méthode Montessori et au yoga enfants",
        },
        {
          name: "Amélie Petit",
          role: "Auxiliaire de puériculture",
          photo: "/images/seed-staff-2.png",
          description: "Diplômée en soins infantiles, 5 ans d'expérience",
        },
      ]),
      published: true,
      status: "approved",
      password: "demo123456",
    },
    {
      name: "Les Coccinelles Joyeuses",
      slug: "les-coccinelles-joyeuses",
      email: "info@coccinelles-joyeuses.fr",
      phone: "04 91 23 45 67",
      description:
        "Bienvenue aux Coccinelles Joyeuses ! Notre MAM est un véritable cocon de douceur au cœur de Marseille. Nous accueillons vos enfants dans un cadre coloré et joyeux, propice à l'éveil et au développement.\n\nNotre équipe met l'accent sur la motricité libre, les jeux sensoriels et la découverte de la nature. Un grand jardin ensoleillé permet aux enfants de profiter du plein air toute l'année.",
      address: "8 boulevard de la Canebière",
      city: "Marseille",
      postalCode: "13001",
      capacity: 6,
      ageMin: 0,
      ageMax: 3,
      openingHours: "Lundi - Vendredi : 8h00 - 18h00",
      services: [
        "Motricite libre",
        "Jeux d'eau",
        "Sorties extérieures",
        "Psychomotricité",
      ],
      photos: ["/images/seed-mam-3.png", "/images/seed-mam-1.png"],
      coverPhoto: "/images/seed-mam-3.png",
      staffMembers: JSON.stringify([
        {
          name: "Nadia Benmoussa",
          role: "Assistante maternelle agréée",
          photo: "/images/seed-staff-3.png",
          description: "Spécialiste en développement psychomoteur",
        },
        {
          name: "Camille Roux",
          role: "Assistante maternelle agréée",
          photo: "/images/seed-staff-1.png",
          description: "Passionnée par les activités en plein air et le jardinage",
        },
      ]),
      published: true,
      status: "approved",
      password: "demo123456",
    },
  ];

  const hashedPassword = await bcrypt.hash("Demo@12345", 12);

  for (const mamData of seedMams) {
    await db.insert(mams).values({ ...mamData, password: hashedPassword });
  }

  log("Seed data inserted successfully");
}
