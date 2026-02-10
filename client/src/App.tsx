import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { MamAuthProvider } from "@/lib/mam-auth";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Home from "@/pages/home";
import Directory from "@/pages/directory";
import MamProfile from "@/pages/mam-profile";
import Register from "@/pages/register";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import ParentRegister from "@/pages/parent-register";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/annuaire" component={Directory} />
      <Route path="/mam/:slug" component={MamProfile} />
      <Route path="/inscription" component={Register} />
      <Route path="/connexion" component={Login} />
      <Route path="/dashboard/:slug" component={Dashboard} />
      <Route path="/inscription-parent" component={ParentRegister} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function AppLayout() {
  const [location] = useLocation();
  const isAdminPage = location.startsWith("/admin");

  if (isAdminPage) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <Router />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <main className="flex-1">
        <Router />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MamAuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <AppLayout />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </MamAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
