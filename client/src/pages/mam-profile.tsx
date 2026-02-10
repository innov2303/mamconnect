import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMamAuth } from "@/lib/mam-auth";
import {
  MapPin, Phone, Mail, Clock, Users, Baby, ArrowLeft, ChevronLeft, ChevronRight,
  Pencil, AlertCircle, LayoutDashboard
} from "lucide-react";
import type { Mam, StaffMember } from "@shared/schema";
import { useState } from "react";

function PhotoGallery({ photos, name }: { photos: string[]; name: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-md aspect-video bg-muted">
        <img
          src={photos[activeIndex]}
          alt={`${name} - Photo ${activeIndex + 1}`}
          className="w-full h-full object-cover"
          style={{ imageRendering: "auto" }}
          loading="eager"
          decoding="async"
          data-testid="img-gallery-main"
        />
        {photos.length > 1 && (
          <>
            <Button
              size="icon"
              variant="secondary"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={() => setActiveIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
              data-testid="button-gallery-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
              onClick={() => setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
              data-testid="button-gallery-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                i === activeIndex ? "border-primary" : "border-transparent"
              }`}
              data-testid={`button-gallery-thumb-${i}`}
            >
              <img
                src={photo}
                alt={`${name} - Miniature ${i + 1}`}
                className="w-20 h-20 object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StaffCard({ member }: { member: StaffMember }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="p-4 flex items-start gap-3">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={member.photo} alt={member.name} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-sm" data-testid={`text-staff-name-${member.name}`}>
            {member.name}
          </p>
          <p className="text-xs text-muted-foreground mb-1">{member.role}</p>
          {member.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{member.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MamProfile() {
  const [, params] = useRoute("/mam/:slug");
  const slug = params?.slug;
  const auth = useMamAuth();

  const { data: mam, isLoading, error } = useQuery<Mam>({
    queryKey: ["/api/mams", slug],
    enabled: !!slug,
  });

  if (isLoading) return <ProfileSkeleton />;

  if (error || !mam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">MAM introuvable</h2>
            <p className="text-muted-foreground mb-4">
              Cette Maison d'Assistantes Maternelles n'existe pas ou n'est plus disponible.
            </p>
            <Link href="/annuaire">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour à l'annuaire
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = auth.isLoggedIn && auth.mam?.slug === slug;

  const staffMembers: StaffMember[] = Array.isArray(mam.staffMembers)
    ? (mam.staffMembers as StaffMember[])
    : [];

  const allPhotos = [
    ...(mam.coverPhoto ? [mam.coverPhoto] : []),
    ...(mam.photos || []),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6">
        {isOwner && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/${mam.slug}`}>
              <Button className="gap-2" data-testid="button-edit-my-page">
                <LayoutDashboard className="h-4 w-4" />
                Modifier ma page
              </Button>
            </Link>
          </div>
        )}

        {isOwner && mam.status === "pending" && (
          <Card className="mb-4">
            <CardContent className="p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Inscription en attente de validation</p>
                <p className="text-xs text-muted-foreground">
                  Votre MAM sera visible dans l'annuaire une fois approuvée par l'administrateur.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {isOwner && mam.status === "rejected" && (
          <Card className="mb-4">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Inscription refusée</p>
                <p className="text-xs text-muted-foreground">
                  Votre MAM n'a pas été approuvée. Contactez le support via votre tableau de bord pour plus d'informations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isOwner && (
          <Link href="/annuaire">
            <Button variant="ghost" className="gap-2 mb-4" data-testid="button-back-directory">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'annuaire
            </Button>
          </Link>
        )}

        {allPhotos.length > 0 && (
          <PhotoGallery photos={allPhotos} name={mam.name} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-mam-title">
                {mam.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{mam.address}, {mam.city} {mam.postalCode}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">
                  <Users className="h-3 w-3 mr-1" />
                  {mam.capacity} places
                </Badge>
                <Badge variant="secondary">
                  <Baby className="h-3 w-3 mr-1" />
                  {mam.ageMin} - {mam.ageMax} ans
                </Badge>
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" />
                  {mam.openingHours}
                </Badge>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">La structure</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-mam-description-structure">
                {mam.descriptionStructure}
              </p>
            </div>

            {mam.descriptionPedagogique && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Projet pédagogique</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line" data-testid="text-mam-description-pedagogique">
                  {mam.descriptionPedagogique}
                </p>
              </div>
            )}

            {mam.services && mam.services.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Services proposés</h2>
                <div className="flex flex-wrap gap-2">
                  {mam.services.map((service) => (
                    <Badge key={service} variant="outline" data-testid={`badge-service-${service}`}>
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {staffMembers.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">L'équipe</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {staffMembers.map((member, i) => (
                    <StaffCard key={i} member={member} />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold">Coordonnées</h3>

                <div className="space-y-3">
                  <a
                    href={`tel:${mam.phone}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    data-testid="link-phone"
                  >
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <span>{mam.phone}</span>
                  </a>

                  <a
                    href={`mailto:${mam.email}`}
                    className="flex items-center gap-3 text-sm hover:text-primary transition-colors"
                    data-testid="link-email"
                  >
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="break-all">{mam.email}</span>
                  </a>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-9 w-9 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span>{mam.address}, {mam.city} {mam.postalCode}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold">Horaires</h3>
                <div className="flex items-start gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground whitespace-pre-line">{mam.openingHours}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold">Informations</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacité</span>
                    <span className="font-medium">{mam.capacity} enfants</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Âge accepté</span>
                    <span className="font-medium">{mam.ageMin} - {mam.ageMax} ans</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
