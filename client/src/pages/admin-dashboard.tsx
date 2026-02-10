import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Shield, Users, Ticket, CheckCircle, XCircle, Clock,
  Trash2, Eye, Search, LogOut, MessageSquare, Send,
  AlertCircle, ChevronDown, Building2, BarChart3, TrendingUp, UserPlus,
  Baby, Mail, Phone, MapPin, Calendar, Bell, BellOff
} from "lucide-react";
import type { Mam, Ticket as TicketType, Parent } from "@shared/schema";
import { SEO } from "@/components/seo";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from "recharts";

function getAdminToken() {
  return localStorage.getItem("adminToken") || "";
}

async function adminFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAdminToken()}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Erreur serveur");
  }
  return res.json();
}

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvée",
  rejected: "Refusée",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
};

const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  in_progress: "En cours",
  closed: "Fermé",
};

const TICKET_PRIORITY_LABELS: Record<string, string> = {
  low: "Basse",
  normal: "Normale",
  high: "Haute",
};

function MamManagement() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMam, setSelectedMam] = useState<Omit<Mam, "password"> | null>(null);
  const [mamToDelete, setMamToDelete] = useState<Omit<Mam, "password"> | null>(null);

  const { data: mams = [], isLoading } = useQuery<Omit<Mam, "password">[]>({
    queryKey: ["/api/admin/mams"],
    queryFn: () => adminFetch("/api/admin/mams"),
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return adminFetch(`/api/admin/mams/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mams"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminFetch(`/api/admin/mams/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/mams"] });
      setSelectedMam(null);
      toast({ title: "MAM supprimée" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const filteredMams = mams.filter((mam) => {
    const matchesSearch =
      !search ||
      mam.name.toLowerCase().includes(search.toLowerCase()) ||
      mam.city.toLowerCase().includes(search.toLowerCase()) ||
      mam.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || mam.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: mams.length,
    pending: mams.filter((m) => m.status === "pending").length,
    approved: mams.filter((m) => m.status === "approved").length,
    rejected: mams.filter((m) => m.status === "rejected").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="hover-elevate cursor-pointer" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" data-testid="text-count-total">{counts.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setStatusFilter("pending")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600" data-testid="text-count-pending">{counts.pending}</p>
            <p className="text-xs text-muted-foreground">En attente</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setStatusFilter("approved")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="text-count-approved">{counts.approved}</p>
            <p className="text-xs text-muted-foreground">Approuvées</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setStatusFilter("rejected")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600" data-testid="text-count-rejected">{counts.rejected}</p>
            <p className="text-xs text-muted-foreground">Refusées</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, ville ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-admin-search-mam"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvées</SelectItem>
            <SelectItem value="rejected">Refusées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredMams.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucune MAM trouvée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredMams.map((mam) => (
            <Card key={mam.id} data-testid={`card-mam-${mam.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm" data-testid={`text-mam-name-${mam.id}`}>
                        {mam.name}
                      </h3>
                      <Badge variant={STATUS_VARIANTS[mam.status] || "secondary"} data-testid={`badge-status-${mam.id}`}>
                        {STATUS_LABELS[mam.status] || mam.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {mam.city} ({mam.postalCode}) - {mam.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Capacité : {mam.capacity} enfants - Inscrite le {new Date(mam.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {mam.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="gap-1.5"
                          onClick={() => statusMutation.mutate({ id: mam.id, status: "approved" })}
                          disabled={statusMutation.isPending}
                          data-testid={`button-approve-${mam.id}`}
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5"
                          onClick={() => statusMutation.mutate({ id: mam.id, status: "rejected" })}
                          disabled={statusMutation.isPending}
                          data-testid={`button-reject-${mam.id}`}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Refuser
                        </Button>
                      </>
                    )}
                    {mam.status === "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => statusMutation.mutate({ id: mam.id, status: "rejected" })}
                        disabled={statusMutation.isPending}
                        data-testid={`button-suspend-${mam.id}`}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Suspendre
                      </Button>
                    )}
                    {mam.status === "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => statusMutation.mutate({ id: mam.id, status: "approved" })}
                        disabled={statusMutation.isPending}
                        data-testid={`button-reactivate-${mam.id}`}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Réactiver
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedMam(mam)}
                      data-testid={`button-view-mam-${mam.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setMamToDelete(mam)}
                      data-testid={`button-delete-mam-${mam.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMam} onOpenChange={() => setSelectedMam(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedMam && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {selectedMam.name}
                  <Badge variant={STATUS_VARIANTS[selectedMam.status] || "secondary"}>
                    {STATUS_LABELS[selectedMam.status] || selectedMam.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p>{selectedMam.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Téléphone</p>
                    <p>{selectedMam.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Ville</p>
                    <p>{selectedMam.city} ({selectedMam.postalCode})</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Capacité</p>
                    <p>{selectedMam.capacity} enfants</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">Adresse</p>
                    <p>{selectedMam.address}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs mb-1">Horaires</p>
                    {Array.isArray(selectedMam.openingHours) ? (
                      <div className="space-y-0.5">
                        {(selectedMam.openingHours as any[]).map((d: any) => (
                          <p key={d.day} className="text-sm">
                            <span className="font-medium">{d.day}</span> : {d.open ? `${d.start} - ${d.end}` : "Fermé"}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p>{String(selectedMam.openingHours)}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Description de la structure</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedMam.descriptionStructure}</p>
                </div>
                {selectedMam.descriptionPedagogique && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Projet pédagogique</p>
                    <p className="text-sm whitespace-pre-wrap">{selectedMam.descriptionPedagogique}</p>
                  </div>
                )}
                {selectedMam.services.length > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Services</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedMam.services.map((s: string) => (
                        <Badge key={s} variant="outline">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMam.staffMembers && (selectedMam.staffMembers as any[]).length > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Équipe</p>
                    <div className="space-y-1">
                      {(selectedMam.staffMembers as any[]).map((member: any, i: number) => (
                        <p key={i} className="text-sm">
                          <span className="font-medium">{member.name}</span> — {member.role}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMam.photos && selectedMam.photos.length > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Photos ({selectedMam.photos.length})</p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedMam.photos.map((photo: string, i: number) => (
                        <a key={i} href={photo} target="_blank" rel="noopener noreferrer">
                          <img
                            src={photo}
                            alt={`Photo ${i + 1}`}
                            className="w-full h-20 object-cover rounded-md border"
                            data-testid={`img-mam-photo-${i}`}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="flex-wrap gap-2">
                {selectedMam.status === "pending" && (
                  <>
                    <Button
                      className="gap-1.5"
                      onClick={() => {
                        statusMutation.mutate({ id: selectedMam.id, status: "approved" });
                        setSelectedMam(null);
                      }}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approuver
                    </Button>
                    <Button
                      variant="destructive"
                      className="gap-1.5"
                      onClick={() => {
                        statusMutation.mutate({ id: selectedMam.id, status: "rejected" });
                        setSelectedMam(null);
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                      Refuser
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setSelectedMam(null)}>
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!mamToDelete} onOpenChange={() => setMamToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground" data-testid="text-delete-confirmation">
            Voulez-vous vraiment supprimer la MAM <strong>{mamToDelete?.name}</strong> ? Cette action est irréversible.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setMamToDelete(null)} data-testid="button-cancel-delete">
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (mamToDelete) {
                  deleteMutation.mutate(mamToDelete.id);
                  setMamToDelete(null);
                }
              }}
              data-testid="button-confirm-delete"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TicketManagement() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [adminResponse, setAdminResponse] = useState("");

  const { data: ticketsList = [], isLoading } = useQuery<TicketType[]>({
    queryKey: ["/api/admin/tickets"],
    queryFn: () => adminFetch("/api/admin/tickets"),
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ id, status, response }: { id: string; status?: string; response?: string }) => {
      return adminFetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, adminResponse: response }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tickets"] });
      toast({ title: "Ticket mis à jour" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const filteredTickets = ticketsList.filter((t) => {
    return statusFilter === "all" || t.status === statusFilter;
  });

  const counts = {
    total: ticketsList.length,
    open: ticketsList.filter((t) => t.status === "open").length,
    in_progress: ticketsList.filter((t) => t.status === "in_progress").length,
    closed: ticketsList.filter((t) => t.status === "closed").length,
  };

  const handleRespond = () => {
    if (!selectedTicket || !adminResponse.trim()) return;
    updateTicketMutation.mutate(
      { id: selectedTicket.id, status: "in_progress", response: adminResponse.trim() },
      {
        onSuccess: () => {
          setSelectedTicket(null);
          setAdminResponse("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="hover-elevate cursor-pointer" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" data-testid="text-ticket-count-total">{counts.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setStatusFilter("open")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600" data-testid="text-ticket-count-open">{counts.open}</p>
            <p className="text-xs text-muted-foreground">Ouverts</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setStatusFilter("in_progress")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600" data-testid="text-ticket-count-progress">{counts.in_progress}</p>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setStatusFilter("closed")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="text-ticket-count-closed">{counts.closed}</p>
            <p className="text-xs text-muted-foreground">Fermés</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-ticket-status-filter">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="open">Ouverts</SelectItem>
            <SelectItem value="in_progress">En cours</SelectItem>
            <SelectItem value="closed">Fermés</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucun ticket trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} data-testid={`card-ticket-${ticket.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
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
                      <Badge variant="outline">
                        {TICKET_PRIORITY_LABELS[ticket.priority] || ticket.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      De : {ticket.senderName} ({ticket.senderEmail})
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(ticket.createdAt).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm mt-2 line-clamp-2">{ticket.message}</p>
                    {ticket.adminResponse && (
                      <div className="mt-2 p-2 rounded-md bg-muted text-sm">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Réponse admin :</p>
                        <p>{ticket.adminResponse}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setAdminResponse(ticket.adminResponse || "");
                      }}
                      data-testid={`button-respond-ticket-${ticket.id}`}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Répondre
                    </Button>
                    {ticket.status !== "closed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5"
                        onClick={() => updateTicketMutation.mutate({ id: ticket.id, status: "closed" })}
                        disabled={updateTicketMutation.isPending}
                        data-testid={`button-close-ticket-${ticket.id}`}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Fermer
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTicket} onOpenChange={() => { setSelectedTicket(null); setAdminResponse(""); }}>
        <DialogContent className="max-w-lg">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTicket.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">
                    De : {selectedTicket.senderName} ({selectedTicket.senderEmail})
                  </p>
                  <p className="whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Votre réponse</label>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Rédigez votre réponse ici..."
                    className="min-h-[100px] resize-none"
                    data-testid="textarea-admin-response"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Statut</label>
                  <Select
                    value={selectedTicket.status}
                    onValueChange={(v) => setSelectedTicket({ ...selectedTicket, status: v })}
                  >
                    <SelectTrigger data-testid="select-ticket-status-update">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Ouvert</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="closed">Fermé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  className="gap-1.5"
                  onClick={handleRespond}
                  disabled={!adminResponse.trim() || updateTicketMutation.isPending}
                  data-testid="button-send-response"
                >
                  <Send className="h-4 w-4" />
                  Envoyer la réponse
                </Button>
                <Button variant="outline" onClick={() => { setSelectedTicket(null); setAdminResponse(""); }}>
                  Annuler
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

type ParentWithoutPassword = Omit<Parent, "password">;

function ParentManagement() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedParent, setSelectedParent] = useState<ParentWithoutPassword | null>(null);
  const [parentToDelete, setParentToDelete] = useState<ParentWithoutPassword | null>(null);

  const { data: parentsList = [], isLoading } = useQuery<ParentWithoutPassword[]>({
    queryKey: ["/api/admin/parents"],
    queryFn: () => adminFetch("/api/admin/parents"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return adminFetch(`/api/admin/parents/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/parents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setParentToDelete(null);
      toast({ title: "Parent supprimé" });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const filteredParents = parentsList.filter((p) => {
    const matchesSearch =
      !search ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "verified" && p.emailVerified) ||
      (filterType === "unverified" && !p.emailVerified) ||
      (filterType === "search_active" && p.searchActive);
    return matchesSearch && matchesFilter;
  });

  const counts = {
    total: parentsList.length,
    verified: parentsList.filter((p) => p.emailVerified).length,
    searchActive: parentsList.filter((p) => p.searchActive).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterType("all")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold" data-testid="text-parent-count-total">{counts.total}</p>
            <p className="text-xs text-muted-foreground">Total parents</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterType("verified")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600" data-testid="text-parent-count-verified">{counts.verified}</p>
            <p className="text-xs text-muted-foreground">Email vérifié</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate cursor-pointer" onClick={() => setFilterType("search_active")}>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600" data-testid="text-parent-count-active">{counts.searchActive}</p>
            <p className="text-xs text-muted-foreground">Recherche active</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, email ou ville..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-admin-search-parent"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]" data-testid="select-parent-filter">
            <SelectValue placeholder="Filtrer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="verified">Email vérifié</SelectItem>
            <SelectItem value="unverified">Non vérifié</SelectItem>
            <SelectItem value="search_active">Recherche active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredParents.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <UserPlus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Aucun parent trouvé</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredParents.map((parent) => (
            <Card key={parent.id} data-testid={`card-parent-${parent.id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm" data-testid={`text-parent-name-${parent.id}`}>
                        {parent.firstName} {parent.lastName}
                      </h3>
                      {parent.emailVerified ? (
                        <Badge variant="default" data-testid={`badge-verified-${parent.id}`}>Vérifié</Badge>
                      ) : (
                        <Badge variant="secondary" data-testid={`badge-unverified-${parent.id}`}>Non vérifié</Badge>
                      )}
                      {parent.searchActive && (
                        <Badge variant="outline" data-testid={`badge-search-active-${parent.id}`}>Recherche active</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {parent.city} ({parent.postalCode}) - {parent.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Inscrit le {new Date(parent.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedParent(parent)}
                      data-testid={`button-view-parent-${parent.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setParentToDelete(parent)}
                      data-testid={`button-delete-parent-${parent.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedParent} onOpenChange={() => setSelectedParent(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedParent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {selectedParent.firstName} {selectedParent.lastName}
                  {selectedParent.emailVerified ? (
                    <Badge variant="default">Vérifié</Badge>
                  ) : (
                    <Badge variant="secondary">Non vérifié</Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Email</p>
                      <p data-testid="text-parent-detail-email">{selectedParent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Téléphone</p>
                      <p data-testid="text-parent-detail-phone">{selectedParent.phone}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Adresse</p>
                      <p data-testid="text-parent-detail-address">{selectedParent.address}, {selectedParent.city} ({selectedParent.postalCode})</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Baby className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Date de naissance enfant</p>
                      <p data-testid="text-parent-detail-birth">{new Date(selectedParent.childBirthDate).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-muted-foreground text-xs">Date de début souhaitée</p>
                      <p data-testid="text-parent-detail-start">{new Date(selectedParent.desiredStartDate).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant={selectedParent.searchActive ? "default" : "secondary"}>
                    {selectedParent.searchActive ? (
                      <span className="flex items-center gap-1"><Search className="h-3 w-3" /> Recherche active</span>
                    ) : (
                      <span className="flex items-center gap-1"><Search className="h-3 w-3" /> Recherche inactive</span>
                    )}
                  </Badge>
                  <Badge variant={selectedParent.notificationsEnabled ? "default" : "secondary"}>
                    {selectedParent.notificationsEnabled ? (
                      <span className="flex items-center gap-1"><Bell className="h-3 w-3" /> Notifications actives</span>
                    ) : (
                      <span className="flex items-center gap-1"><BellOff className="h-3 w-3" /> Notifications désactivées</span>
                    )}
                  </Badge>
                </div>
                {selectedParent.notes && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap" data-testid="text-parent-detail-notes">{selectedParent.notes}</p>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-1">
                  Inscrit le {new Date(selectedParent.createdAt).toLocaleDateString("fr-FR")}
                  {selectedParent.latitude && selectedParent.longitude && (
                    <span> — Position : {selectedParent.latitude}, {selectedParent.longitude}</span>
                  )}
                </div>
              </div>
              <DialogFooter className="flex-wrap gap-2">
                <Button
                  variant="destructive"
                  className="gap-1.5"
                  onClick={() => {
                    setSelectedParent(null);
                    setParentToDelete(selectedParent);
                  }}
                  data-testid="button-delete-from-detail"
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
                <Button variant="outline" onClick={() => setSelectedParent(null)}>
                  Fermer
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!parentToDelete} onOpenChange={() => setParentToDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground" data-testid="text-parent-delete-confirmation">
            Voulez-vous vraiment supprimer le compte de <strong>{parentToDelete?.firstName} {parentToDelete?.lastName}</strong> ? Cette action est irréversible et supprimera également toutes ses notifications.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setParentToDelete(null)} data-testid="button-cancel-delete-parent">
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (parentToDelete) {
                  deleteMutation.mutate(parentToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete-parent"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr",
  "05": "Mai", "06": "Juin", "07": "Juil", "08": "Août",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc",
};

function formatMonth(ym: string) {
  const [year, month] = ym.split("-");
  return `${MONTH_LABELS[month] || month} ${year}`;
}

interface StatPoint {
  month: string;
  count: number;
  cumulative: number;
}

interface StatsData {
  mams: StatPoint[];
  parents: StatPoint[];
  totals: { mams: number; parents: number };
}

function StatisticsPanel() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/admin/stats"],
    queryFn: () => adminFetch("/api/admin/stats"),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  const mamChartData = stats.mams.map((d) => ({
    name: formatMonth(d.month),
    "Nouvelles inscriptions": d.count,
    "Total cumulé": d.cumulative,
  }));

  const parentChartData = stats.parents.map((d) => ({
    name: formatMonth(d.month),
    "Nouvelles inscriptions": d.count,
    "Total cumulé": d.cumulative,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/10">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold" data-testid="text-stats-total-mams">{stats.totals.mams}</p>
              <p className="text-sm text-muted-foreground">MAM inscrites au total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-primary/10">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold" data-testid="text-stats-total-parents">{stats.totals.parents}</p>
              <p className="text-sm text-muted-foreground">Parents inscrits au total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Évolution des inscriptions MAM
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {mamChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mamChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mamGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Total cumulé"
                  stroke="hsl(var(--primary))"
                  fill="url(#mamGradient)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Nouvelles inscriptions"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Évolution des inscriptions parents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {parentChartData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Aucune donnée disponible
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={parentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="parentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(340, 82%, 52%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(340, 82%, 52%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="Total cumulé"
                  stroke="hsl(340, 82%, 52%)"
                  fill="url(#parentGradient)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="Nouvelles inscriptions"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: authCheck, isLoading, error } = useQuery({
    queryKey: ["/api/admin/verify"],
    queryFn: () => adminFetch("/api/admin/verify"),
    retry: false,
  });

  useEffect(() => {
    if (error) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminEmail");
      navigate("/admin");
    }
  }, [error, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    toast({ title: "Déconnexion réussie" });
    navigate("/admin");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-5xl px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !authCheck) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Administration" noindex={true} />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-admin-dashboard-title">
                Administration
              </h1>
              <p className="text-muted-foreground text-sm">
                {localStorage.getItem("adminEmail")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleLogout}
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="mams">
          <TabsList className="mb-4 flex-wrap">
            <TabsTrigger value="mams" className="gap-2" data-testid="tab-admin-mams">
              <Building2 className="h-4 w-4" />
              MAM
            </TabsTrigger>
            <TabsTrigger value="parents" className="gap-2" data-testid="tab-admin-parents">
              <Users className="h-4 w-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2" data-testid="tab-admin-tickets">
              <Ticket className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2" data-testid="tab-admin-stats">
              <BarChart3 className="h-4 w-4" />
              Statistiques
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mams">
            <MamManagement />
          </TabsContent>

          <TabsContent value="parents">
            <ParentManagement />
          </TabsContent>

          <TabsContent value="tickets">
            <TicketManagement />
          </TabsContent>

          <TabsContent value="stats">
            <StatisticsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
