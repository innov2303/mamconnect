import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { registerParentSchema } from "@shared/schema";
import { Baby, MapPin, Calendar, Mail, Phone, User, Heart, CheckCircle2, Lock, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

type ParentFormValues = z.infer<typeof registerParentSchema>;

export default function ParentRegister() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const form = useForm<ParentFormValues>({
    resolver: zodResolver(registerParentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      city: "",
      postalCode: "",
      childBirthDate: "",
      desiredStartDate: "",
      notes: "",
      notificationsEnabled: true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ParentFormValues) => {
      const res = await apiRequest("POST", "/api/parents", data);
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Inscription réussie !",
        description: "Vous serez notifié dès qu'une place sera disponible près de chez vous.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ParentFormValues) => {
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

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <Card className="max-w-lg w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2" data-testid="text-success-title">Inscription confirmée</h2>
            <p className="text-muted-foreground mb-6" data-testid="text-success-message">
              Votre compte a bien été créé. Connectez-vous pour accéder à votre espace parent
              et activer la recherche de places disponibles.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => navigate("/connexion")} data-testid="button-go-login">
                Se connecter
              </Button>
              <Button variant="outline" onClick={() => navigate("/annuaire")} data-testid="button-browse-directory">
                Parcourir l'annuaire
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Baby className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Inscription Parent</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Inscrivez-vous pour être notifié dès qu'une place se libère dans une MAM proche de chez vous.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informations personnelles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre prénom" {...field} data-testid="input-first-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} data-testid="input-last-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="votre@email.fr" {...field} data-testid="input-email" />
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
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="06 12 34 56 78" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Mot de passe sécurisé"
                            {...field}
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Adresse
                </h3>
                <FormDescription>
                  Votre adresse sera utilisée pour vous notifier des MAM dans un rayon de 30 km.
                </FormDescription>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse</FormLabel>
                      <FormControl>
                        <Input placeholder="12 rue de la Paix" {...field} data-testid="input-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris" {...field} data-testid="input-city" />
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
                        <FormLabel>Code postal</FormLabel>
                        <FormControl>
                          <Input placeholder="75001" {...field} data-testid="input-postal-code" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Recherche de place
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="childBirthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de naissance de l'enfant</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-child-birth-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="desiredStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'accueil souhaitée</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} data-testid="input-desired-start-date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informations complémentaires (optionnel)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Précisez vos besoins particuliers, horaires souhaités, etc."
                          className="resize-none"
                          rows={3}
                          {...field}
                          data-testid="input-notes"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Notifications
                </h3>

                <FormField
                  control={form.control}
                  name="notificationsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-notifications"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Recevoir des notifications par email
                        </FormLabel>
                        <FormDescription>
                          Vous serez alerté lorsqu'une place se libère dans une MAM à moins de 30 km de votre adresse.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <Checkbox
                  id="accept-privacy-parent"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                  data-testid="checkbox-privacy-parent"
                />
                <div className="space-y-1 leading-none">
                  <label htmlFor="accept-privacy-parent" className="text-sm font-medium cursor-pointer">
                    J'accepte la politique de confidentialité *
                  </label>
                  <p className="text-sm text-muted-foreground">
                    En cochant cette case, vous acceptez notre{" "}
                    <a href="/politique-de-confidentialite" target="_blank" className="text-primary underline" data-testid="link-privacy-parent">
                      politique de confidentialité
                    </a>{" "}
                    et le traitement de vos données personnelles.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending || !acceptedPrivacy}
                data-testid="button-submit-parent"
              >
                {mutation.isPending ? (
                  <>Inscription en cours...</>
                ) : (
                  <>
                    <Heart className="w-4 h-4 mr-2" />
                    S'inscrire
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
