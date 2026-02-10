import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Shield, ArrowRight, Baby, Clock, Bell } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/annuaire?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/annuaire");
    }
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            Trouvez la MAM idéale pour votre enfant
          </h1>
          <p className="text-base md:text-lg text-white/85 mb-8 leading-relaxed">
            Mam Connect vous met en relation avec les Maisons d'Assistantes Maternelles
            de votre secteur. Parcourez l'annuaire, découvrez leurs espaces et
            leur équipe pédagogique.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ville ou code postal..."
                className="pl-10 bg-white dark:bg-card border-0 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-hero-search"
              />
            </div>
            <Button type="submit" className="h-11 gap-2 px-6" data-testid="button-hero-search">
              Rechercher
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "Recherche simplifiée",
      description: "Trouvez rapidement les MAM autour de chez vous grâce à notre annuaire par ville et code postal.",
    },
    {
      icon: Shield,
      title: "Profils vérifiés",
      description: "Chaque MAM crée son profil détaillé avec photos, équipe et services proposés.",
    },
    {
      icon: Baby,
      title: "Informations complètes",
      description: "Capacité d'accueil, tranches d'âge, horaires et activités proposées en un clin d'oeil.",
    },
    {
      icon: Bell,
      title: "Notification parent",
      description: "Grace à la recherche parent, soyez notifié dès qu'une nouvelle place est disponible.",
    },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Comment ça marche ?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mam Connect simplifie la recherche de garde pour votre enfant
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function InscriptionSection() {
  const mamServices = [
    { icon: Shield, label: "Profil personnalisé et vérifié" },
    { icon: MapPin, label: "Visibilité dans l'annuaire local" },
    { icon: Users, label: "Présentation de votre équipe" },
    { icon: Clock, label: "Gestion des places disponibles" },
  ];

  const parentServices = [
    { icon: Bell, label: "Notification dès qu'une place se libère" },
    { icon: MapPin, label: "Recherche dans un rayon de 30 km" },
    { icon: Search, label: "Accès à l'annuaire complet" },
    { icon: Baby, label: "Critères adaptés à votre enfant" },
  ];

  return (
    <section className="py-16 bg-card">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Rejoignez Mam Connect</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Que vous soyez une MAM ou un parent, inscrivez-vous gratuitement et profitez de nos services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="flex flex-col" data-testid="card-inscription-mam">
            <CardContent className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Inscription MAM</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Créez le profil de votre Maison d'Assistantes Maternelles et gagnez en visibilité auprès des familles de votre secteur.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {mamServices.map((service) => (
                  <li key={service.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <service.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{service.label}</span>
                  </li>
                ))}
              </ul>
              <Link href="/inscription">
                <Button className="w-full gap-2" data-testid="button-inscription-mam">
                  Inscription MAM
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="flex flex-col" data-testid="card-inscription-parent">
            <CardContent className="p-6 md:p-8 flex flex-col flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                  <Baby className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Inscription Parent</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Inscrivez-vous pour être alerté automatiquement dès qu'une place se libère dans une MAM proche de chez vous.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {parentServices.map((service) => (
                  <li key={service.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <service.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{service.label}</span>
                  </li>
                ))}
              </ul>
              <Link href="/inscription-parent">
                <Button className="w-full gap-2" data-testid="button-inscription-parent">
                  Inscription parent
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <InscriptionSection />
    </div>
  );
}
