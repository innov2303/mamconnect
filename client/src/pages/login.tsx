import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMamAuth } from "@/lib/mam-auth";
import { useParentAuth } from "@/lib/parent-auth";
import { loginMamSchema, loginParentSchema } from "@shared/schema";
import { LogIn, UserPlus, Baby, Home, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

type MamLoginValues = z.infer<typeof loginMamSchema>;
type ParentLoginValues = z.infer<typeof loginParentSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const mamAuth = useMamAuth();
  const parentAuth = useParentAuth();
  const [showMamPassword, setShowMamPassword] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);

  const mamForm = useForm<MamLoginValues>({
    resolver: zodResolver(loginMamSchema),
    defaultValues: { email: "", password: "" },
  });

  const parentForm = useForm<ParentLoginValues>({
    resolver: zodResolver(loginParentSchema),
    defaultValues: { email: "", password: "" },
  });

  const mamMutation = useMutation({
    mutationFn: async (data: MamLoginValues) => {
      const res = await apiRequest("POST", "/api/mams/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      mamAuth.login(data.token, data);
      toast({ title: "Connexion réussie", description: "Bienvenue sur votre page MAM." });
      navigate(`/mam/${data.slug}`);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
    },
  });

  const parentMutation = useMutation({
    mutationFn: async (data: ParentLoginValues) => {
      const res = await apiRequest("POST", "/api/parents/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      parentAuth.login(data.token, data.parent);
      toast({ title: "Connexion réussie", description: "Bienvenue sur votre espace parent." });
      navigate("/espace-parent");
    },
    onError: (error: Error) => {
      toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2" data-testid="text-login-title">Connexion Mam Connect</h1>
          <p className="text-muted-foreground text-sm">
            Accédez à votre espace MAM ou parent
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="mam">
              <TabsList className="w-full mb-4">
                <TabsTrigger value="mam" className="flex-1" data-testid="tab-login-mam">
                  <Home className="w-4 h-4 mr-2" />
                  MAM
                </TabsTrigger>
                <TabsTrigger value="parent" className="flex-1" data-testid="tab-login-parent">
                  <Baby className="w-4 h-4 mr-2" />
                  Parent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="mam">
                <Form {...mamForm}>
                  <form onSubmit={mamForm.handleSubmit((data) => mamMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={mamForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contact@mam.fr" {...field} data-testid="input-mam-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={mamForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showMamPassword ? "text" : "password"}
                                placeholder="Votre mot de passe"
                                {...field}
                                data-testid="input-mam-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0"
                                onClick={() => setShowMamPassword(!showMamPassword)}
                                data-testid="button-toggle-mam-password"
                              >
                                {showMamPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full gap-2" disabled={mamMutation.isPending} data-testid="button-submit-mam-login">
                      {mamMutation.isPending ? "Connexion en cours..." : (
                        <><LogIn className="h-4 w-4" /> Se connecter</>
                      )}
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground mb-2">Pas encore inscrit ?</p>
                  <Link href="/inscription">
                    <Button variant="outline" className="gap-2" data-testid="link-go-register-mam">
                      <UserPlus className="h-4 w-4" />
                      Inscription MAM
                    </Button>
                  </Link>
                </div>
              </TabsContent>

              <TabsContent value="parent">
                <Form {...parentForm}>
                  <form onSubmit={parentForm.handleSubmit((data) => parentMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={parentForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="votre@email.fr" {...field} data-testid="input-parent-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={parentForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showParentPassword ? "text" : "password"}
                                placeholder="Votre mot de passe"
                                {...field}
                                data-testid="input-parent-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0"
                                onClick={() => setShowParentPassword(!showParentPassword)}
                                data-testid="button-toggle-parent-password"
                              >
                                {showParentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full gap-2" disabled={parentMutation.isPending} data-testid="button-submit-parent-login">
                      {parentMutation.isPending ? "Connexion en cours..." : (
                        <><LogIn className="h-4 w-4" /> Se connecter</>
                      )}
                    </Button>
                  </form>
                </Form>
                <div className="mt-4 pt-4 border-t text-center">
                  <p className="text-sm text-muted-foreground mb-2">Pas encore inscrit ?</p>
                  <Link href="/inscription-parent">
                    <Button variant="outline" className="gap-2" data-testid="link-go-register-parent">
                      <Baby className="h-4 w-4" />
                      Inscription Parent
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
