import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMamAuth } from "@/lib/mam-auth";
import { loginMamSchema } from "@shared/schema";
import { LogIn, UserPlus, Baby } from "lucide-react";
import { z } from "zod";

type LoginFormValues = z.infer<typeof loginMamSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const auth = useMamAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginMamSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const res = await apiRequest("POST", "/api/mams/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      auth.login(data.token, data);
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur votre page.",
      });
      navigate(`/mam/${data.slug}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Erreur de connexion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2" data-testid="text-login-title">Connexion Mam Connect</h1>
          <p className="text-muted-foreground text-sm">
            Accédez à votre tableau de bord pour gérer votre page
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@mam.fr" {...field} data-testid="input-login-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Votre mot de passe" {...field} data-testid="input-login-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={mutation.isPending}
                  data-testid="button-submit-login"
                >
                  {mutation.isPending ? (
                    "Connexion en cours..."
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-4 pt-4 border-t text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Vous n'avez pas encore de compte ?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/inscription">
                  <Button variant="outline" className="gap-2" data-testid="link-go-register">
                    <UserPlus className="h-4 w-4" />
                    Inscription MAM
                  </Button>
                </Link>
                <Link href="/inscription-parent">
                  <Button variant="outline" className="gap-2" data-testid="link-go-register-parent">
                    <Baby className="h-4 w-4" />
                    Inscription parent
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
