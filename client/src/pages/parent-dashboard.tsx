import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { useParentAuth } from "@/lib/parent-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User, MapPin, Save, Search, Bell, BellOff, Baby, Calendar,
  LogOut, Mail, Phone, CheckCircle2, AlertCircle
} from "lucide-react";
import { z } from "zod";
import { useState, useEffect } from "react";

const editParentSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().min(5, "Adresse requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().regex(/^\d{5}$/, "Code postal invalide"),
  childBirthDate: z.string().min(1, "Date requise"),
  desiredStartDate: z.string().min(1, "Date requise"),
  notes: z.string().default(""),
});

type EditParentValues = z.infer<typeof editParentSchema>;

interface ParentData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: string | null;
  longitude: string | null;
  childBirthDate: string;
  desiredStartDate: string;
  notes: string;
  searchActive: boolean;
  notificationsEnabled: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  parentId: string;
  mamId: string;
  mamName: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function ParentDashboard() {
  const [, navigate] = useLocation();
  const { token, parent, isLoggedIn, logout } = useParentAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/connexion");
    }
  }, [isLoggedIn, navigate]);

  const { data: parentData, isLoading } = useQuery<ParentData>({
    queryKey: ["/api/parents/me"],
    enabled: !!token,
    queryFn: async () => {
      const res = await fetch("/api/parents/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/parents", parentData?.id, "notifications"],
    enabled: !!parentData?.id,
    queryFn: async () => {
      const res = await fetch(`/api/parents/${parentData!.id}/notifications`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const form = useForm<EditParentValues>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      childBirthDate: "",
      desiredStartDate: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (parentData) {
      form.reset({
        firstName: parentData.firstName,
        lastName: parentData.lastName,
        phone: parentData.phone,
        address: parentData.address,
        city: parentData.city,
        postalCode: parentData.postalCode,
        childBirthDate: parentData.childBirthDate,
        desiredStartDate: parentData.desiredStartDate,
        notes: parentData.notes || "",
      });
    }
  }, [parentData, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditParentValues) => {
      const res = await fetch("/api/parents/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parents/me"] });
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées." });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const toggleSearchMutation = useMutation({
    mutationFn: async (active: boolean) => {
      const res = await fetch("/api/parents/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ searchActive: active }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/parents/me"] });
      toast({
        title: data.searchActive ? "Recherche activée" : "Recherche désactivée",
        description: data.searchActive
          ? "Vous serez notifié dès qu'une place se libère à proximité."
          : "Vous ne recevrez plus de notifications de places disponibles.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const toggleNotifMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const res = await fetch("/api/parents/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationsEnabled: enabled }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parents/me"] });
    },
  });

  const onSubmit = (data: EditParentValues) => {
    updateMutation.mutate(data);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!isLoggedIn) return null;

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
            Bonjour {parentData?.firstName} !
          </h1>
          <p className="text-muted-foreground">Gérez votre profil et vos recherches de place</p>
        </div>
        <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold">Recherche de place</h3>
                <p className="text-sm text-muted-foreground">
                  {parentData?.searchActive
                    ? "Recherche active — vous serez notifié des places disponibles"
                    : "Recherche inactive — activez pour recevoir des notifications"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={parentData?.searchActive ? "default" : "secondary"} data-testid="badge-search-status">
                {parentData?.searchActive ? "Active" : "Inactive"}
              </Badge>
              <Switch
                checked={parentData?.searchActive || false}
                onCheckedChange={(checked) => toggleSearchMutation.mutate(checked)}
                disabled={toggleSearchMutation.isPending}
                data-testid="switch-search-active"
              />
            </div>
          </div>

          {parentData?.searchActive && (
            <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-300">
                Vous serez alerté par email lorsqu'une place se libère dans une MAM à moins de 30 km de {parentData.city}.
              </p>
            </div>
          )}

          {!parentData?.searchActive && (
            <div className="rounded-md bg-muted p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                Activez la recherche pour recevoir des notifications automatiques lorsqu'une MAM proche de chez vous propose des places.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
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
                              <Input {...field} data-testid="input-edit-first-name" />
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
                              <Input {...field} data-testid="input-edit-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {parentData?.email}
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} data-testid="input-edit-phone" />
                          </FormControl>
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
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-address" />
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
                              <Input {...field} data-testid="input-edit-city" />
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
                              <Input {...field} data-testid="input-edit-postal-code" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Baby className="w-5 h-5 text-primary" />
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
                              <Input type="date" {...field} data-testid="input-edit-child-birth" />
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
                              <Input type="date" {...field} data-testid="input-edit-desired-start" />
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
                          <FormLabel>Notes complémentaires</FormLabel>
                          <FormControl>
                            <Textarea
                              className="resize-none"
                              rows={3}
                              {...field}
                              data-testid="input-edit-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={parentData?.notificationsEnabled || false}
                        onCheckedChange={(checked) => toggleNotifMutation.mutate(checked)}
                        data-testid="switch-notifications"
                      />
                      <span className="text-sm">
                        {parentData?.notificationsEnabled ? (
                          <span className="flex items-center gap-1"><Bell className="w-3.5 h-3.5" /> Notifications activées</span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground"><BellOff className="w-3.5 h-3.5" /> Notifications désactivées</span>
                        )}
                      </span>
                    </div>
                    <Button type="submit" disabled={updateMutation.isPending} data-testid="button-save-profile">
                      <Save className="w-4 h-4 mr-2" />
                      {updateMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardContent className="pt-6">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucune notification pour le moment</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {parentData?.searchActive
                      ? "Vous serez notifié dès qu'une place sera disponible."
                      : "Activez la recherche pour recevoir des notifications."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-md border ${notif.read ? "bg-background" : "bg-primary/5 border-primary/20"}`}
                      data-testid={`notification-${notif.id}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{notif.mamName}</p>
                          <p className="text-sm text-muted-foreground">{notif.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notif.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      {!notif.read && (
                        <Badge variant="secondary" className="mt-2">Nouveau</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
