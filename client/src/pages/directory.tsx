import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, SlidersHorizontal, X, Users } from "lucide-react";
import { MamCard } from "@/components/mam-card";
import type { Mam } from "@shared/schema";
import { useSearch } from "wouter";
import { SEO } from "@/components/seo";

export default function Directory() {
  const searchString = useSearch();
  const urlParams = new URLSearchParams(searchString);
  const initialQuery = urlParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [activeSearch, setActiveSearch] = useState(initialQuery);
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  const { data: mams, isLoading } = useQuery<Mam[]>({
    queryKey: ["/api/mams"],
  });

  const filteredMams = useMemo(() => {
    if (!mams) return [];
    let results = [...mams];

    if (activeSearch.trim()) {
      const q = activeSearch.toLowerCase().trim();
      results = results.filter(
        (mam) =>
          mam.name.toLowerCase().includes(q) ||
          mam.city.toLowerCase().includes(q) ||
          mam.postalCode.includes(q) ||
          mam.address.toLowerCase().includes(q)
      );
    }

    results.sort((a, b) => {
      switch (sortBy) {
        case "capacity":
          return b.capacity - a.capacity;
        case "city":
          return a.city.localeCompare(b.city);
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return results;
  }, [mams, activeSearch, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Annuaire des MAM"
        description="Parcourez l'annuaire des Maisons d'Assistantes Maternelles en France. Recherchez par ville ou code postal et trouvez la MAM idéale près de chez vous."
        canonical="/annuaire"
      />
      <div className="bg-card border-b">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-directory-title">
            Annuaire des MAM
          </h1>
          <p className="text-muted-foreground mb-6">
            Recherchez une Maison d'Assistantes Maternelles près de chez vous
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par ville, code postal ou nom..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-directory-search"
              />
            </div>
            <Button type="submit" className="gap-2" data-testid="button-directory-search">
              <Search className="h-4 w-4" />
              Rechercher
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </form>

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-3 items-center max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trier par :</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Nom</SelectItem>
                    <SelectItem value="city">Ville</SelectItem>
                    <SelectItem value="capacity">Capacité</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {activeSearch && (
            <div className="mt-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Résultats pour « {activeSearch} »
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                data-testid="button-clear-search"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : filteredMams.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4" data-testid="text-results-count">
              {filteredMams.length} MAM trouvée{filteredMams.length > 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMams.map((mam) => (
                <MamCard key={mam.id} mam={mam} />
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun résultat</h3>
              <p className="text-muted-foreground mb-4">
                {activeSearch
                  ? `Aucune MAM trouvée pour « ${activeSearch} ». Essayez une autre recherche.`
                  : "Aucune MAM inscrite pour le moment."}
              </p>
              {activeSearch && (
                <Button variant="outline" onClick={clearSearch} data-testid="button-clear-no-results">
                  Effacer la recherche
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
