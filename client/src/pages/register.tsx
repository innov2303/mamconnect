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
import { registerMamSchema, getDefaultOpeningHours, DAYS_OF_WEEK } from "@shared/schema";
import type { DaySchedule } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { UserPlus, X, Plus, Check, Clock } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

const AVAILABLE_SERVICES = [
  "Repas bio",
  "Activités artistiques",
  "Sorties extérieures",
  "Langue des signes",
  "Montessori",
  "Yoga enfants",
  "Musique",
  "Psychomotricité",
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
  const [customService, setCustomService] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerMamSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      descriptionStructure: "",
      descriptionPedagogique: "",
      address: "",
      city: "",
      postalCode: "",
      capacity: 4,
      ageMin: 0,
      ageMax: 3,
      openingHours: getDefaultOpeningHours(),
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
        title: "Inscription envoyée !",
        description: "Votre inscription est en attente de validation par un administrateur. Vous serez visible dans l'annuaire une fois approuvée.",
      });
      navigate(`/dashboard/${data.slug}`);
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
    if (!acceptedPrivacy) {
      toast({
        title: "Politique de confidentialité",
        description: "Vous devez accepter la politique de confidentialité pour vous inscrire.",
        variant: "destructive",
      });
      return;
    }
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
            Inscription MAM
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Remplissez le formulaire ci-dessous pour créer la page de votre Maison d'Assistantes Maternelles.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Informations générales</h2>
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
                          <FormLabel>Téléphone *</FormLabel>
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
                            Ce mot de passe vous permettra de modifier votre page ultérieurement.
                          </FormDescription>
                          <FormControl>
                            <Input type="password" placeholder="8 caractères minimum" {...field} data-testid="input-password" />
                          </FormControl>
                          {field.value && (
                            <div className="text-xs space-y-1 p-3 rounded-md bg-muted mt-2">
                              <p className="font-medium mb-1">Exigences du mot de passe :</p>
                              <p className={field.value.length >= 8 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                <Check className={`h-3 w-3 inline mr-1 ${field.value.length >= 8 ? "" : "opacity-30"}`} />
                                Au moins 8 caractères
                              </p>
                              <p className={/[A-Z]/.test(field.value) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                <Check className={`h-3 w-3 inline mr-1 ${/[A-Z]/.test(field.value) ? "" : "opacity-30"}`} />
                                Au moins une majuscule
                              </p>
                              <p className={/[a-z]/.test(field.value) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                <Check className={`h-3 w-3 inline mr-1 ${/[a-z]/.test(field.value) ? "" : "opacity-30"}`} />
                                Au moins une minuscule
                              </p>
                              <p className={/[0-9]/.test(field.value) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                <Check className={`h-3 w-3 inline mr-1 ${/[0-9]/.test(field.value) ? "" : "opacity-30"}`} />
                                Au moins un chiffre
                              </p>
                              <p className={/[^A-Za-z0-9]/.test(field.value) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                                <Check className={`h-3 w-3 inline mr-1 ${/[^A-Za-z0-9]/.test(field.value) ? "" : "opacity-30"}`} />
                                Au moins un caractère spécial (!@#$...)
                              </p>
                            </div>
                          )}
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
                          <FormLabel>Adresse complète *</FormLabel>
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
                          <FormLabel>Capacité d'accueil *</FormLabel>
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
                          <FormLabel>Âge minimum</FormLabel>
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
                          <FormLabel>Âge maximum</FormLabel>
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

                <div>
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Horaires d'ouverture *
                  </p>
                  <div className="space-y-2">
                    {DAYS_OF_WEEK.map((day, index) => {
                      const hours = form.watch("openingHours") || getDefaultOpeningHours();
                      const daySchedule = hours[index];
                      return (
                        <div key={day} className="flex flex-wrap items-center gap-3 rounded-md border p-3" data-testid={`schedule-day-${day}`}>
                          <div className="flex items-center gap-2 w-28">
                            <Switch
                              checked={daySchedule?.open ?? false}
                              onCheckedChange={(checked) => {
                                const updated = [...hours];
                                updated[index] = { ...updated[index], open: checked };
                                form.setValue("openingHours", updated, { shouldValidate: true });
                              }}
                              data-testid={`switch-day-${day}`}
                            />
                            <span className="text-sm font-medium">{day}</span>
                          </div>
                          {daySchedule?.open ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="time"
                                value={daySchedule.start}
                                onChange={(e) => {
                                  const updated = [...hours];
                                  updated[index] = { ...updated[index], start: e.target.value };
                                  form.setValue("openingHours", updated, { shouldValidate: true });
                                }}
                                className="w-28"
                                data-testid={`input-start-${day}`}
                              />
                              <span className="text-sm text-muted-foreground">à</span>
                              <Input
                                type="time"
                                value={daySchedule.end}
                                onChange={(e) => {
                                  const updated = [...hours];
                                  updated[index] = { ...updated[index], end: e.target.value };
                                  form.setValue("openingHours", updated, { shouldValidate: true });
                                }}
                                className="w-28"
                                data-testid={`input-end-${day}`}
                              />
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Fermé</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="descriptionStructure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description de la structure *</FormLabel>
                      <FormDescription>
                        Décrivez votre lieu d'accueil : surface, aménagements, extérieur...
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px] resize-none"
                          placeholder="Ex : Maison de 100m2, clôturée avec jardin de 50m2, proche d'un parc public..."
                          {...field}
                          data-testid="input-description-structure"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionPedagogique"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description du projet pédagogique *</FormLabel>
                      <FormDescription>
                        Décrivez votre approche éducative, vos valeurs, les activités proposées...
                      </FormDescription>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px] resize-none"
                          placeholder="Ex : Notre projet s'appuie sur la motricité libre, l'éveil sensoriel et le respect du rythme de chaque enfant..."
                          {...field}
                          data-testid="input-description-pedagogique"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <h2 className="text-lg font-semibold mb-3">Services proposés</h2>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sélectionnez les services que vous proposez ou ajoutez les vôtres (optionnel)
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
                    {selectedServices
                      .filter((s) => !AVAILABLE_SERVICES.includes(s))
                      .map((service) => (
                        <Badge
                          key={service}
                          variant="default"
                          className="cursor-pointer toggle-elevate"
                          onClick={() => toggleService(service)}
                          data-testid={`badge-service-${service}`}
                        >
                          <X className="h-3 w-3 mr-1" />
                          {service}
                        </Badge>
                      ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Input
                      placeholder="Ajouter un service personnalisé"
                      value={customService}
                      onChange={(e) => setCustomService(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const trimmed = customService.trim();
                          if (trimmed && !selectedServices.includes(trimmed)) {
                            setSelectedServices((prev) => [...prev, trimmed]);
                            setCustomService("");
                          }
                        }
                      }}
                      data-testid="input-custom-service"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-shrink-0 gap-2"
                      onClick={() => {
                        const trimmed = customService.trim();
                        if (trimmed && !selectedServices.includes(trimmed)) {
                          setSelectedServices((prev) => [...prev, trimmed]);
                          setCustomService("");
                        }
                      }}
                      disabled={!customService.trim()}
                      data-testid="button-add-custom-service"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox
                    id="accept-privacy-mam"
                    checked={acceptedPrivacy}
                    onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                    data-testid="checkbox-privacy-mam"
                  />
                  <div className="space-y-1 leading-none">
                    <label htmlFor="accept-privacy-mam" className="text-sm font-medium cursor-pointer">
                      J'accepte la politique de confidentialité *
                    </label>
                    <p className="text-sm text-muted-foreground">
                      En cochant cette case, vous acceptez notre{" "}
                      <a href="/politique-de-confidentialite" target="_blank" className="text-primary underline" data-testid="link-privacy-mam">
                        politique de confidentialité
                      </a>{" "}
                      et le traitement de vos données personnelles.
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={mutation.isPending || !acceptedPrivacy}
                  data-testid="button-submit-register"
                >
                  {mutation.isPending ? (
                    "Inscription en cours..."
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Inscription MAM
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
