import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Users, Shield, ArrowRight, Baby, Clock, Bell } from "lucide-react";
import { MamCard } from "@/components/mam-card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Mam } from "@shared/schema";
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
      description: "Activez votre recherche parent et soyez notifié par email dès qu'une nouvelle place compatible est disponible près de chez vous.",
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

function FeaturedMams() {
  const { data: mams, isLoading } = useQuery<Mam[]>({
    queryKey: ["/api/mams", "featured"],
  });

  return (
    <section className="py-16 bg-card">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">MAM en vedette</h2>
            <p className="text-muted-foreground">Découvrez les Maisons d'Assistantes Maternelles inscrites</p>
          </div>
          <Link href="/annuaire">
            <Button variant="outline" className="gap-2" data-testid="button-view-all-mams">
              Voir tout l'annuaire
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-md" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : mams && mams.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mams.slice(0, 6).map((mam) => (
              <MamCard key={mam.id} mam={mam} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Aucune MAM inscrite pour le moment.</p>
              <Link href="/inscription">
                <Button className="mt-4 gap-2" data-testid="button-register-first-mam">
                  Inscrire la première MAM
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <Card className="bg-primary text-primary-foreground overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Vous gérez une MAM ?
                </h2>
                <p className="text-primary-foreground/85 mb-6">
                  Inscrivez votre Maison d'Assistantes Maternelles gratuitement
                  et gagnez en visibilité auprès des parents de votre secteur.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/inscription">
                    <Button variant="secondary" className="gap-2" data-testid="button-cta-register">
                      Inscrire ma MAM
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/annuaire">
                    <Button
                      variant="outline"
                      className="bg-transparent border-primary-foreground/30 text-primary-foreground backdrop-blur-sm"
                      data-testid="button-cta-directory"
                    >
                      Voir l'annuaire
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-primary-foreground/80" />
                    <p className="text-sm text-primary-foreground/80">Recherche locale</p>
                  </div>
                  <div className="p-4">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary-foreground/80" />
                    <p className="text-sm text-primary-foreground/80">Équipe détaillée</p>
                  </div>
                  <div className="p-4">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-primary-foreground/80" />
                    <p className="text-sm text-primary-foreground/80">Horaires clairs</p>
                  </div>
                  <div className="p-4">
                    <Shield className="h-8 w-8 mx-auto mb-2 text-primary-foreground/80" />
                    <p className="text-sm text-primary-foreground/80">Profil vérifié</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeroSection />
      <FeaturesSection />
      <FeaturedMams />
      <CTASection />
    </div>
  );
}
