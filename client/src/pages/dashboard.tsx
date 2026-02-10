import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Eye, Save, X, Plus, Trash2, UserPlus, Image, Settings, Users
} from "lucide-react";
import type { Mam, StaffMember } from "@shared/schema";
import { z } from "zod";
import { useState, useEffect } from "react";

const AVAILABLE_SERVICES = [
  "Repas bio", "Activit\u00e9s artistiques", "Sorties ext\u00e9rieures",
  "Langue des signes", "Montessori", "Yoga enfants", "Musique",
  "Psychomotricit\u00e9", "Jardinage", "Lecture", "Motricite libre", "Jeux d'eau",
];

const editMamSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  description: z.string().min(20),
  address: z.string().min(5),
  city: z.string().min(2),
  postalCode: z.string().regex(/^\d{5}$/),
  capacity: z.number().min(1).max(20),
  ageMin: z.number().min(0).max(6),
  ageMax: z.number().min(0).max(6),
  openingHours: z.string().min(5),
});

type EditFormValues = z.infer<typeof editMamSchema>;

function StaffEditor({
  staff,
  onChange,
}: {
  staff: StaffMember[];
  onChange: (staff: StaffMember[]) => void;
}) {
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const addMember = () => {
    if (!newName.trim() || !newRole.trim()) return;
    onChange([
      ...staff,
      { name: newName.trim(), role: newRole.trim(), description: newDesc.trim() || undefined },
    ]);
    setNewName("");
    setNewRole("");
    setNewDesc("");
  };

  const removeMember = (index: number) => {
    onChange(staff.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {staff.map((member, i) => (
        <Card key={i}>
          <CardContent className="p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-sm">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.role}</p>
              {member.description && (
                <p className="text-xs text-muted-foreground mt-1">{member.description}</p>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeMember(i)}
              data-testid={`button-remove-staff-${i}`}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="p-4 space-y-3">
          <p className="font-medium text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Ajouter un membre
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              placeholder="Nom"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              data-testid="input-new-staff-name"
            />
            <Input
              placeholder="R\u00f4le (ex: Assistante maternelle)"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              data-testid="input-new-staff-role"
            />
          </div>
          <Input
            placeholder="Description courte (optionnel)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            data-testid="input-new-staff-desc"
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={addMember}
            disabled={!newName.trim() || !newRole.trim()}
            data-testid="button-add-staff"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PhotoManager({
  photos,
  onUpdate,
}: {
  photos: string[];
  onUpdate: (photos: string[]) => void;
}) {
  const [newUrl, setNewUrl] = useState("");

  const addPhoto = () => {
    if (!newUrl.trim()) return;
    onUpdate([...photos, newUrl.trim()]);
    setNewUrl("");
  };

  const removePhoto = (index: number) => {
    onUpdate(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative group rounded-md overflow-hidden">
              <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-28 object-cover" />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removePhoto(i)}
                style={{ visibility: "visible" }}
                data-testid={`button-remove-photo-${i}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          placeholder="URL de l'image"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          data-testid="input-new-photo-url"
        />
        <Button variant="outline" className="gap-2 flex-shrink-0" onClick={addPhoto} disabled={!newUrl.trim()} data-testid="button-add-photo">
          <Image className="h-4 w-4" />
          Ajouter
        </Button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [, params] = useRoute("/dashboard/:slug");
  const slug = params?.slug;
  const { toast } = useToast();

  const { data: mam, isLoading, error } = useQuery<Mam>({
    queryKey: ["/api/mams", slug],
    enabled: !!slug,
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editMamSchema),
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
      openingHours: "",
    },
  });

  useEffect(() => {
    if (mam) {
      form.reset({
        name: mam.name,
        email: mam.email,
        phone: mam.phone,
        description: mam.description,
        address: mam.address,
        city: mam.city,
        postalCode: mam.postalCode,
        capacity: mam.capacity,
        ageMin: mam.ageMin,
        ageMax: mam.ageMax,
        openingHours: mam.openingHours,
      });
      setSelectedServices(mam.services || []);
      setStaffMembers(
        Array.isArray(mam.staffMembers) ? (mam.staffMembers as StaffMember[]) : []
      );
      setPhotos(mam.photos || []);
    }
  }, [mam, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditFormValues) => {
      const res = await apiRequest("PATCH", `/api/mams/${mam!.id}`, {
        ...data,
        services: selectedServices,
        staffMembers,
        photos,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mams"] });
      toast({
        title: "Modifications enregistr\u00e9es",
        description: "Votre page a \u00e9t\u00e9 mise à jour.",
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

  const onSubmit = (data: EditFormValues) => {
    updateMutation.mutate(data);
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  if (isLoading) return <DashboardSkeleton />;

  if (error || !mam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Acc&egrave;s refus&eacute;</h2>
            <p className="text-muted-foreground mb-4">
              Impossible d'acc&eacute;der au tableau de bord. Veuillez vous connecter.
            </p>
            <Link href="/connexion">
              <Button className="gap-2">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground text-sm">{mam.name}</p>
          </div>
          <Link href={`/mam/${mam.slug}`}>
            <Button variant="outline" className="gap-2" data-testid="button-view-page">
              <Eye className="h-4 w-4" />
              Voir ma page
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info" className="gap-2" data-testid="tab-info">
              <Settings className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2" data-testid="tab-team">
              <Users className="h-4 w-4" />
              &Eacute;quipe
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-2" data-testid="tab-photos">
              <Image className="h-4 w-4" />
              Photos
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="info">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Nom de la MAM</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-edit-name" />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} data-testid="input-edit-email" />
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
                            <FormLabel>T&eacute;l&eacute;phone</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-edit-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Adresse</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-edit-address" />
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacit&eacute;</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={20}
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-edit-capacity"
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
                            <FormLabel>&Acirc;ge min</FormLabel>
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
                              <FormControl>
                                <SelectTrigger data-testid="select-edit-age-min">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[0,1,2,3,4,5,6].map((a) => (
                                  <SelectItem key={a} value={String(a)}>{a === 0 ? "Naissance" : `${a} an${a > 1 ? "s" : ""}`}</SelectItem>
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
                            <FormLabel>&Acirc;ge max</FormLabel>
                            <Select value={String(field.value)} onValueChange={(v) => field.onChange(parseInt(v))}>
                              <FormControl>
                                <SelectTrigger data-testid="select-edit-age-max">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {[0,1,2,3,4,5,6].map((a) => (
                                  <SelectItem key={a} value={String(a)}>{a} an{a > 1 ? "s" : ""}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="openingHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horaires</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-edit-hours" />
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
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-[120px] resize-none" {...field} data-testid="input-edit-description" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div>
                      <p className="font-medium text-sm mb-3">Services</p>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_SERVICES.map((service) => {
                          const isSelected = selectedServices.includes(service);
                          return (
                            <Badge
                              key={service}
                              variant={isSelected ? "default" : "outline"}
                              className="cursor-pointer toggle-elevate"
                              onClick={() => toggleService(service)}
                            >
                              {isSelected ? <X className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                              {service}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">G&eacute;rer l'&eacute;quipe</h2>
                    <StaffEditor staff={staffMembers} onChange={setStaffMembers} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">G&eacute;rer les photos</h2>
                    <PhotoManager photos={photos} onUpdate={setPhotos} />
                  </CardContent>
                </Card>
              </TabsContent>

              <div className="mt-4">
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={updateMutation.isPending}
                  data-testid="button-save-changes"
                >
                  {updateMutation.isPending ? (
                    "Enregistrement..."
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Enregistrer les modifications
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </div>
    </div>
  );
}
