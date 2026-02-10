import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

function ContactDialog() {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setSending(true);
    try {
      await apiRequest("POST", "/api/contact", { name, email, subject, message });
      toast({ title: "Message envoyé", description: "Nous vous répondrons dans les plus brefs délais." });
      setOpen(false);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer le message. Veuillez réessayer.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
          data-testid="button-contact-form"
        >
          Nous contacter
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Nous contacter
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Nom *</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom"
              required
              data-testid="input-contact-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email *</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              data-testid="input-contact-email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-subject">Sujet</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger data-testid="select-contact-subject">
                <SelectValue placeholder="Choisir un sujet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Demande d'informations">Demande d'informations</SelectItem>
                <SelectItem value="Problème inscription MAM">Problème inscription MAM</SelectItem>
                <SelectItem value="Problème inscription parent">Problème inscription parent</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Message *</Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Décrivez votre demande..."
              rows={8}
              required
              data-testid="input-contact-message"
            />
          </div>
          <Button type="submit" className="w-full gap-2" disabled={sending} data-testid="button-send-contact">
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">MC</span>
              </div>
              <span className="font-bold text-base">Mam Connect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              La plateforme qui connecte les parents aux Maisons d'Assistantes Maternelles.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Navigation</h3>
            <div className="flex flex-col gap-1.5">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-home">Accueil</Link>
              <Link href="/annuaire" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-annuaire">Annuaire</Link>
              <Link href="/inscription" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-inscription">Inscription MAM</Link>
              <Link href="/inscription-parent" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-inscription-parent">Inscription parent</Link>
              <Link href="/connexion" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-connexion">Connexion</Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Informations</h3>
            <div className="flex flex-col gap-1.5">
              <ContactDialog />
              <Link href="/politique-de-confidentialite" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">
                Politique de confidentialité
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex items-center justify-center text-sm text-muted-foreground">
          <span>&copy; 2026 <a href="https://innov-studio.fr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline" data-testid="link-innov-studio">Innov Studio</a>. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
