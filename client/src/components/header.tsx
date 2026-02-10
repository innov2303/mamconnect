import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useMamAuth } from "@/lib/mam-auth";
import { Home, Search, UserPlus, LogIn, Menu, X, LogOut, LayoutDashboard, User, Baby } from "lucide-react";
import { useState } from "react";

export function Header() {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const auth = useMamAuth();

  const navItems = auth.isLoggedIn
    ? [
        { href: "/", label: "Accueil", icon: Home },
        { href: "/annuaire", label: "Annuaire", icon: Search },
        { href: `/mam/${auth.mam!.slug}`, label: "Mon profil", icon: User },
        { href: `/dashboard/${auth.mam!.slug}`, label: "Tableau de bord", icon: LayoutDashboard },
      ]
    : [
        { href: "/", label: "Accueil", icon: Home },
        { href: "/annuaire", label: "Annuaire", icon: Search },
        { href: "/inscription-parent", label: "Inscription parent", icon: Baby },
        { href: "/inscription", label: "Inscrire ma MAM", icon: UserPlus },
        { href: "/connexion", label: "Connexion", icon: LogIn },
      ];

  const handleLogout = () => {
    auth.logout();
    setMobileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 py-3">
        <Link href="/" data-testid="link-home-logo">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="h-9 w-9 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">MC</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">Mam Connect</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="gap-2"
                  data-testid={`link-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          {auth.isLoggedIn && (
            <Button
              variant="ghost"
              className="gap-2"
              onClick={handleLogout}
              data-testid="button-nav-logout"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          )}
          <ThemeToggle />
        </nav>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                  onClick={() => setMobileOpen(false)}
                  data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          {auth.isLoggedIn && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
              data-testid="button-mobile-logout"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          )}
        </nav>
      )}
    </header>
  );
}
