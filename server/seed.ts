import { db } from "./db";
import { mams } from "@shared/schema";
import { log } from "./index";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  const existing = await db.select().from(mams);
  if (existing.length > 0) {
    log("Database already seeded, skipping");
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
        "Notre MAM accueille vos enfants dans un cadre chaleureux et bienveillant au c\u0153ur de Lyon. Notre projet p\u00e9dagogique s'inspire de la m\u00e9thode Montessori et favorise l'autonomie, la d\u00e9couverte sensorielle et le respect du rythme de chaque enfant.\n\nNous disposons d'un grand espace int\u00e9rieur lumineux avec diff\u00e9rents coins d'activit\u00e9s (lecture, arts plastiques, jeux de construction) ainsi qu'un jardin s\u00e9curis\u00e9 pour les activit\u00e9s de plein air.",
      address: "15 rue des Lilas",
      city: "Lyon",
      postalCode: "69003",
      capacity: 8,
      ageMin: 0,
      ageMax: 3,
      openingHours: "Lundi - Vendredi : 7h30 - 18h30",
      services: ["Montessori", "Repas bio", "Activit\u00e9s artistiques", "Jardinage"],
      photos: ["/images/seed-mam-1.png", "/images/seed-mam-2.png"],
      coverPhoto: "/images/seed-mam-1.png",
      staffMembers: JSON.stringify([
        {
          name: "Sophie Martin",
          role: "Assistante maternelle agr\u00e9\u00e9e",
          photo: "/images/seed-staff-1.png",
          description: "Dipl\u00f4m\u00e9e en petite enfance, 12 ans d'exp\u00e9rience",
        },
        {
          name: "Claire Dubois",
          role: "Assistante maternelle agr\u00e9\u00e9e",
          photo: "/images/seed-staff-2.png",
          description: "Sp\u00e9cialiste en psychomotricit\u00e9, 8 ans d'exp\u00e9rience",
        },
      ]),
      published: true,
      password: "demo123456",
    },
    {
      name: "La Maison des Bambins",
      slug: "la-maison-des-bambins",
      email: "bonjour@maison-bambins.fr",
      phone: "01 45 67 89 01",
      description:
        "La Maison des Bambins est un lieu d'accueil convivial o\u00f9 chaque enfant est accompagn\u00e9 avec douceur et attention. Situ\u00e9e dans le 15\u00e8me arrondissement de Paris, notre MAM offre un environnement s\u00e9curisant et stimulant.\n\nNous proposons des activit\u00e9s vari\u00e9es : \u00e9veil musical, peinture, yoga enfants, lecture de contes, et sorties au parc voisin. Les repas sont pr\u00e9par\u00e9s sur place avec des produits frais et bio.",
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
        "Sorties ext\u00e9rieures",
      ],
      photos: ["/images/seed-mam-2.png", "/images/seed-mam-3.png"],
      coverPhoto: "/images/seed-mam-2.png",
      staffMembers: JSON.stringify([
        {
          name: "Marie Leroy",
          role: "Assistante maternelle agr\u00e9\u00e9e",
          photo: "/images/seed-staff-1.png",
          description: "Passionn\u00e9e par l'\u00e9veil musical des tout-petits",
        },
        {
          name: "Julie Moreau",
          role: "Assistante maternelle agr\u00e9\u00e9e",
          photo: "/images/seed-staff-3.png",
          description: "Form\u00e9e \u00e0 la m\u00e9thode Montessori et au yoga enfants",
        },
        {
          name: "Am\u00e9lie Petit",
          role: "Auxiliaire de pu\u00e9riculture",
          photo: "/images/seed-staff-2.png",
          description: "Dipl\u00f4m\u00e9e en soins infantiles, 5 ans d'exp\u00e9rience",
        },
      ]),
      published: true,
      password: "demo123456",
    },
    {
      name: "Les Coccinelles Joyeuses",
      slug: "les-coccinelles-joyeuses",
      email: "info@coccinelles-joyeuses.fr",
      phone: "04 91 23 45 67",
      description:
        "Bienvenue aux Coccinelles Joyeuses ! Notre MAM est un v\u00e9ritable cocon de douceur au c\u0153ur de Marseille. Nous accueillons vos enfants dans un cadre color\u00e9 et joyeux, propice \u00e0 l'\u00e9veil et au d\u00e9veloppement.\n\nNotre \u00e9quipe met l'accent sur la motricit\u00e9 libre, les jeux sensoriels et la d\u00e9couverte de la nature. Un grand jardin ensoleill\u00e9 permet aux enfants de profiter du plein air toute l'ann\u00e9e.",
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
        "Sorties ext\u00e9rieures",
        "Psychomotricit\u00e9",
      ],
      photos: ["/images/seed-mam-3.png", "/images/seed-mam-1.png"],
      coverPhoto: "/images/seed-mam-3.png",
      staffMembers: JSON.stringify([
        {
          name: "Nadia Benmoussa",
          role: "Assistante maternelle agr\u00e9\u00e9e",
          photo: "/images/seed-staff-3.png",
          description: "Sp\u00e9cialiste en d\u00e9veloppement psychomoteur",
        },
        {
          name: "Camille Roux",
          role: "Assistante maternelle agr\u00e9\u00e9e",
          photo: "/images/seed-staff-1.png",
          description: "Passionn\u00e9e par les activit\u00e9s en plein air et le jardinage",
        },
      ]),
      published: true,
      password: "demo123456",
    },
  ];

  const hashedPassword = await bcrypt.hash("Demo@12345", 12);

  for (const mamData of seedMams) {
    await db.insert(mams).values({ ...mamData, password: hashedPassword });
  }

  log("Seed data inserted successfully");
}
