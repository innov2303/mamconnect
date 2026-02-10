import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { registerMamSchema } from "@shared/schema";
import { UserPlus, X, Plus } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

const AVAILABLE_SERVICES = [
  "Repas bio",
  "Activit\u00e9s artistiques",
  "Sorties ext\u00e9rieures",
  "Langue des signes",
  "Montessori",
  "Yoga enfants",
  "Musique",
  "Psychomotricit\u00e9",
  "Jardinage",
  "Lecture",
  "Motricite libre",
  "Jeux d'eau",
];

type RegisterFormValues = z.infer<typeof registerMamSchema>;

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerMamSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      description: "",
      address: "",
      city: "",
      postalCode: "",
      capacity: 4,
      ageMin: 0,
      ageMax: 3,
      openingHours: "Lundi - Vendredi : 7h30 - 18h30",
      services: [],
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const res = await apiRequest("POST", "/api/mams", { ...data, services: selectedServices });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mams"] });
      toast({
        title: "MAM inscrite avec succ\u00e8s !",
        description: "Votre page est maintenant visible dans l'annuaire.",
      });
      navigate(`/mam/${data.slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mb-4">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2" data-testid="text-register-title">
            Inscrire ma MAM
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Remplissez le formulaire ci-dessous pour cr&eacute;er la page de votre Maison d'Assistantes Maternelles.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Informations g&eacute;n&eacute;rales</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Nom de la MAM *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Les Petits Explorateurs" {...field} data-testid="input-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@mam.fr" {...field} data-testid="input-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>T&eacute;l&eacute;phone *</FormLabel>
                          <FormControl>
                            <Input placeholder="06 12 34 56 78" {...field} data-testid="input-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Mot de passe *</FormLabel>
                          <FormDescription>
                            Ce mot de passe vous permettra de modifier votre page ult&eacute;rieurement.
                          </FormDescription>
                          <FormControl>
                            <Input type="password" placeholder="6 caract\u00e8res minimum" {...field} data-testid="input-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Adresse</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Adresse compl&egrave;te *</FormLabel>
                          <FormControl>
                            <Input placeholder="12 rue des Lilas" {...field} data-testid="input-address" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ville *</FormLabel>
                          <FormControl>
                            <Input placeholder="Lyon" {...field} data-testid="input-city" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="postalCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Code postal *</FormLabel>
                          <FormControl>
                            <Input placeholder="69001" {...field} data-testid="input-postal-code" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Accueil</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capacit&eacute; d'accueil *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              max={20}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-capacity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ageMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>&Acirc;ge minimum</FormLabel>
                          <Select
                            value={String(field.value)}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-age-min">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[0, 1, 2, 3, 4, 5, 6].map((age) => (
                                <SelectItem key={age} value={String(age)}>
                                  {age === 0 ? "Naissance" : `${age} an${age > 1 ? "s" : ""}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ageMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>&Acirc;ge maximum</FormLabel>
                          <Select
                            value={String(field.value)}
                            onValueChange={(v) => field.onChange(parseInt(v))}
                          >
                            <FormControl>
                              <SelectTrigger data-testid="select-age-max">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {[0, 1, 2, 3, 4, 5, 6].map((age) => (
                                <SelectItem key={age} value={String(age)}>
                                  {age} an{age > 1 ? "s" : ""}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="openingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horaires d'ouverture *</FormLabel>
                      <FormControl>
                        <Input placeholder="Lundi - Vendredi : 7h30 - 18h30" {...field} data-testid="input-hours" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormDescription>
                        D&eacute;crivez votre MAM, votre projet p&eacute;dagogique, vos valeurs...
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px] resize-none"
                          placeholder="Notre MAM accueille les enfants dans un cadre chaleureux et stimulant..."
                          {...field}
                          data-testid="input-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <h2 className="text-lg font-semibold mb-3">Services propos&eacute;s</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    S&eacute;lectionnez les services que vous proposez (optionnel)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_SERVICES.map((service) => {
                      const isSelected = selectedServices.includes(service);
                      return (
                        <Badge
                          key={service}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer toggle-elevate"
                          onClick={() => toggleService(service)}
                          data-testid={`badge-service-${service}`}
                        >
                          {isSelected ? (
                            <X className="h-3 w-3 mr-1" />
                          ) : (
                            <Plus className="h-3 w-3 mr-1" />
                          )}
                          {service}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={mutation.isPending}
                  data-testid="button-submit-register"
                >
                  {mutation.isPending ? (
                    "Inscription en cours..."
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Inscrire ma MAM
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
