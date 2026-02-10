import { Link } from "wouter";
import { Heart } from "lucide-react";

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
            <h3 className="font-semibold text-sm mb-3">Contact</h3>
            <p className="text-sm text-muted-foreground">
              contact@mamconnect.fr
            </p>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t flex items-center justify-center text-sm text-muted-foreground">
          <span>&copy; 2026 <a href="https://innov-studio.fr" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline" data-testid="link-innov-studio">Innov Studio</a>. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
