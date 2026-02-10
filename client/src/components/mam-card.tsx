import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Mam, DaySchedule } from "@shared/schema";

interface MamCardProps {
  mam: Mam;
}

export function MamCard({ mam }: MamCardProps) {
  const mainPhoto = mam.photos?.[0] || mam.coverPhoto || "/images/seed-mam-1.png";

  return (
    <Card className="overflow-visible group hover-elevate">
      <div className="relative overflow-hidden rounded-t-md">
        <img
          src={mainPhoto}
          alt={mam.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          data-testid={`img-mam-cover-${mam.id}`}
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            <Users className="h-3 w-3 mr-1" />
            {mam.capacity} places
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-base mb-1 line-clamp-1" data-testid={`text-mam-name-${mam.id}`}>
          {mam.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="line-clamp-1">{mam.city} ({mam.postalCode})</span>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {(() => {
              const hours = Array.isArray(mam.openingHours) ? (mam.openingHours as DaySchedule[]) : [];
              const openDays = hours.filter((d) => d.open);
              if (openDays.length === 0) return "Horaires non définis";
              const allSame = openDays.every((d) => d.start === openDays[0].start && d.end === openDays[0].end);
              if (allSame) return `${openDays[0].day.slice(0, 3)}-${openDays[openDays.length - 1].day.slice(0, 3)} : ${openDays[0].start} - ${openDays[0].end}`;
              return `${openDays.length}j/sem`;
            })()}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {mam.descriptionStructure}
        </p>

        {mam.services && mam.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {mam.services.slice(0, 3).map((service) => (
              <Badge key={service} variant="outline" className="text-xs">
                {service}
              </Badge>
            ))}
            {mam.services.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mam.services.length - 3}
              </Badge>
            )}
          </div>
        )}

        <Link href={`/mam/${mam.slug}`}>
          <Button variant="outline" className="w-full gap-2" data-testid={`button-view-mam-${mam.id}`}>
            Voir la page
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
