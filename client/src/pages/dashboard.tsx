import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { useMamAuth } from "@/lib/mam-auth";
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
  Eye, Save, X, Plus, Trash2, UserPlus, Image, Settings, Users, Lock, Check,
  MessageSquare, Send, AlertCircle, Clock, Upload
} from "lucide-react";
import type { Mam, StaffMember, Ticket } from "@shared/schema";
import { z } from "zod";
import { useState, useEffect } from "react";

const AVAILABLE_SERVICES = [
  "Repas bio", "Activités artistiques", "Sorties extérieures",
  "Langue des signes", "Montessori", "Yoga enfants", "Musique",
  "Psychomotricité", "Jardinage", "Lecture", "Motricite libre", "Jeux d'eau",
];

const editMamSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  descriptionStructure: z.string().min(20),
  descriptionPedagogique: z.string().min(20),
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
              placeholder="Rôle (ex: Assistante maternelle)"
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
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const newPhotos: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("photo", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Erreur lors de l'upload");
        }
        const data = await res.json();
        newPhotos.push(data.url);
        if (data.upscaled) {
          toast({
            title: "Image redimensionnée",
            description: `Photo agrandie de ${data.originalSize} à ${data.finalSize} pour une meilleure qualité d'affichage.`,
          });
        }
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'envoyer le fichier",
          variant: "destructive",
        });
      }
    }
    if (newPhotos.length > 0) {
      onUpdate([...photos, ...newPhotos]);
    }
    setUploading(false);
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

      <div>
        <label
          className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50"
          data-testid="label-upload-photo"
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {uploading ? "Envoi en cours..." : "Cliquez ou glissez vos photos ici"}
          </span>
          <span className="text-xs text-muted-foreground">JPG, PNG ou WebP (max 5 Mo) - min. 1200x800 recommandé</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={uploading}
            data-testid="input-upload-photo"
          />
        </label>
      </div>
    </div>
  );
}

const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  closed: "Fermé",
};

function TicketPanel({ mamId }: { mamId: string }) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("normal");

  const { data: ticketsList = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["/api/mams", mamId, "tickets"],
    queryFn: async () => {
      const res = await fetch(`/api/mams/${mamId}/tickets`);
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const createTicketMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/mams/${mamId}/tickets`, {
        subject, message, priority,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mams", mamId, "tickets"] });
      setSubject("");
      setMessage("");
      setPriority("normal");
      toast({
        title: "Ticket créé",
        description: "Votre demande de support a été envoyée.",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Créer un ticket de support</h2>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Sujet</label>
            <Input
              placeholder="Ex: Problème de connexion, question sur mon profil..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              data-testid="input-ticket-subject"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Priorité</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger data-testid="select-ticket-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Basse</SelectItem>
                <SelectItem value="normal">Normale</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Message</label>
            <Textarea
              placeholder="Décrivez votre problème ou votre question en détail..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] resize-none"
              data-testid="input-ticket-message"
            />
          </div>
          <Button
            className="gap-2"
            onClick={() => createTicketMutation.mutate()}
            disabled={!subject.trim() || !message.trim() || message.length < 10 || createTicketMutation.isPending}
            data-testid="button-create-ticket"
          >
            <Send className="h-4 w-4" />
            {createTicketMutation.isPending ? "Envoi..." : "Envoyer le ticket"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold">Mes tickets</h2>
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : ticketsList.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">Aucun ticket pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {ticketsList.map((ticket) => (
            <Card key={ticket.id} data-testid={`card-my-ticket-${ticket.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm">{ticket.subject}</h3>
                  <Badge
                    variant={
                      ticket.status === "open" ? "secondary" :
                      ticket.status === "in_progress" ? "default" :
                      "outline"
                    }
                  >
                    {TICKET_STATUS_LABELS[ticket.status] || ticket.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(ticket.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
                <p className="text-sm">{ticket.message}</p>
                {ticket.adminResponse && (
                  <div className="mt-3 p-3 rounded-md bg-muted">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      <MessageSquare className="h-3 w-3 inline mr-1" />
                      Réponse de l'équipe :
                    </p>
                    <p className="text-sm">{ticket.adminResponse}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
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
  const auth = useMamAuth();
  const [, navigate] = useLocation();

  const { data: mam, isLoading, error } = useQuery<Mam>({
    queryKey: ["/api/mams", slug],
    enabled: !!slug,
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [customService, setCustomService] = useState("");

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editMamSchema),
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
      openingHours: "",
    },
  });

  useEffect(() => {
    if (mam) {
      form.reset({
        name: mam.name,
        email: mam.email,
        phone: mam.phone,
        descriptionStructure: mam.descriptionStructure,
        descriptionPedagogique: mam.descriptionPedagogique,
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
      const payload: Record<string, unknown> = {
        ...data,
        services: selectedServices,
        staffMembers,
        photos,
      };
      if (newPassword) {
        payload.newPassword = newPassword;
      }
      const res = await fetch(`/api/mams/${mam!.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        let message = `${res.status}: ${text}`;
        try {
          const json = JSON.parse(text);
          if (json.message) message = json.message;
        } catch {}
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mams"] });
      setNewPassword("");
      toast({
        title: "Modifications enregistrées",
        description: "Votre page a été mise à jour.",
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

  if (!auth.isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Connexion requise</h2>
            <p className="text-muted-foreground mb-4">
              Veuillez vous connecter pour accéder à votre tableau de bord.
            </p>
            <Link href="/connexion">
              <Button className="gap-2">Se connecter</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mam && auth.mam && auth.mam.slug !== slug) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas accès à ce tableau de bord.
            </p>
            <Link href={`/dashboard/${auth.mam.slug}`}>
              <Button className="gap-2">Mon tableau de bord</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !mam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground mb-4">
              Impossible d'accéder au tableau de bord. Veuillez vous connecter.
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

        {mam.status === "pending" && (
          <Card className="mb-4">
            <CardContent className="p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Inscription en attente de validation</p>
                <p className="text-xs text-muted-foreground">
                  Votre MAM sera visible dans l'annuaire une fois approuvée par l'administrateur.
                  Vous pouvez compléter votre profil en attendant.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        {mam.status === "rejected" && (
          <Card className="mb-4">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Inscription refusée</p>
                <p className="text-xs text-muted-foreground">
                  Votre MAM n'a pas été approuvée. Contactez le support via l'onglet Support pour plus d'informations.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info" className="gap-2" data-testid="tab-info">
              <Settings className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2" data-testid="tab-team">
              <Users className="h-4 w-4" />
              Équipe
            </TabsTrigger>
            <TabsTrigger value="photos" className="gap-2" data-testid="tab-photos">
              <Image className="h-4 w-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2" data-testid="tab-security">
              <Lock className="h-4 w-4" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="support" className="gap-2" data-testid="tab-support">
              <MessageSquare className="h-4 w-4" />
              Support
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
                            <FormLabel>Téléphone</FormLabel>
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
                            <FormLabel>Capacité</FormLabel>
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
                            <FormLabel>Âge min</FormLabel>
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
                            <FormLabel>Âge max</FormLabel>
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
                      name="descriptionStructure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description de la structure</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-[120px] resize-none" placeholder="Surface, aménagements, extérieur..." {...field} data-testid="input-edit-description-structure" />
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
                          <FormLabel>Description du projet pédagogique</FormLabel>
                          <FormControl>
                            <Textarea className="min-h-[120px] resize-none" placeholder="Approche éducative, valeurs, activités..." {...field} data-testid="input-edit-description-pedagogique" />
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
                        {selectedServices
                          .filter((s) => !AVAILABLE_SERVICES.includes(s))
                          .map((service) => (
                            <Badge
                              key={service}
                              variant="default"
                              className="cursor-pointer toggle-elevate"
                              onClick={() => toggleService(service)}
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
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Gérer l'équipe</h2>
                    <StaffEditor staff={staffMembers} onChange={setStaffMembers} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos">
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Gérer les photos</h2>
                    <PhotoManager photos={photos} onUpdate={setPhotos} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold mb-4">Changer le mot de passe</h2>
                    <p className="text-sm text-muted-foreground">
                      Laissez le champ "Nouveau mot de passe" vide si vous ne souhaitez pas le modifier.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Nouveau mot de passe</label>
                        <Input
                          type="password"
                          placeholder="Laisser vide pour ne pas changer"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          data-testid="input-new-password"
                        />
                      </div>
                      {newPassword && (
                        <div className="text-xs space-y-1 p-3 rounded-md bg-muted">
                          <p className="font-medium mb-1">Exigences du mot de passe :</p>
                          <p className={newPassword.length >= 8 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            <Check className={`h-3 w-3 inline mr-1 ${newPassword.length >= 8 ? "" : "opacity-30"}`} />
                            Au moins 8 caractères
                          </p>
                          <p className={/[A-Z]/.test(newPassword) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            <Check className={`h-3 w-3 inline mr-1 ${/[A-Z]/.test(newPassword) ? "" : "opacity-30"}`} />
                            Au moins une majuscule
                          </p>
                          <p className={/[a-z]/.test(newPassword) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            <Check className={`h-3 w-3 inline mr-1 ${/[a-z]/.test(newPassword) ? "" : "opacity-30"}`} />
                            Au moins une minuscule
                          </p>
                          <p className={/[0-9]/.test(newPassword) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            <Check className={`h-3 w-3 inline mr-1 ${/[0-9]/.test(newPassword) ? "" : "opacity-30"}`} />
                            Au moins un chiffre
                          </p>
                          <p className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            <Check className={`h-3 w-3 inline mr-1 ${/[^A-Za-z0-9]/.test(newPassword) ? "" : "opacity-30"}`} />
                            Au moins un caractère spécial (!@#$...)
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <Card className="mt-4">
                <CardContent className="p-4">
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
                </CardContent>
              </Card>
            </form>
          </Form>

          <TabsContent value="support">
            {mam && <TicketPanel mamId={mam.id} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
