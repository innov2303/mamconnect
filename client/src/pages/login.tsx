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

import { useMamAuth } from "@/lib/mam-auth";
import { useParentAuth } from "@/lib/parent-auth";
import { loginMamSchema, loginParentSchema } from "@shared/schema";
import { LogIn, UserPlus, Baby, Home, Eye, EyeOff, Mail, Loader2, Check, RefreshCw, KeyRound, ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useState } from "react";

type MamLoginValues = z.infer<typeof loginMamSchema>;
type ParentLoginValues = z.infer<typeof loginParentSchema>;

function EmailVerificationStep({ email, type, onVerified }: { email: string; type: "mam" | "parent"; onVerified: () => void }) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setVerifying(true);
    try {
      const res = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.message || "Code incorrect", variant: "destructive" });
        return;
      }
      if (data.verified || data.alreadyVerified) {
        toast({ title: "Email vérifié", description: "Votre adresse email a été vérifiée. Vous pouvez maintenant vous connecter." });
        onVerified();
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de la vérification", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.message || "Impossible de renvoyer le code", variant: "destructive" });
        return;
      }
      toast({ title: "Code renvoyé", description: "Un nouveau code a été envoyé à votre adresse email." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de renvoyer le code", variant: "destructive" });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 space-y-6 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Vérifiez votre email</h2>
            <p className="text-muted-foreground text-sm">
              Un code de vérification à 6 chiffres a été envoyé à <strong>{email}</strong>
            </p>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Entrez le code à 6 chiffres"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              data-testid="input-verification-code"
            />
            <Button
              className="w-full gap-2"
              onClick={handleVerify}
              disabled={code.length !== 6 || verifying}
              data-testid="button-verify-code"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Vérifier
            </Button>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Vous n'avez pas reçu le code ?</p>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleResend}
              disabled={resending}
              data-testid="button-resend-code"
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Renvoyer le code
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ForgotPasswordFlow({ type, onBack }: { type: "mam" | "parent"; onBack: () => void }) {
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.message, variant: "destructive" });
        return;
      }
      toast({ title: "Code envoyé", description: "Si un compte existe avec cet email, un code vous a été envoyé." });
      setStep("code");
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de l'envoi du code", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (code.length !== 6) return;
    if (newPassword !== confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword, type }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Erreur", description: data.message, variant: "destructive" });
        return;
      }
      setStep("success");
      toast({ title: "Mot de passe réinitialisé", description: "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe." });
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de la réinitialisation", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center mb-4">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Mot de passe oublié</h1>
          <p className="text-muted-foreground text-sm">
            {type === "mam" ? "Réinitialisation du mot de passe MAM" : "Réinitialisation du mot de passe Parent"}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            {step === "email" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Adresse email</label>
                  <Input
                    type="email"
                    placeholder={type === "mam" ? "contact@mam.fr" : "votre@email.fr"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-forgot-email"
                  />
                  <p className="text-xs text-muted-foreground">
                    Un code de réinitialisation sera envoyé à cette adresse.
                  </p>
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handleSendCode}
                  disabled={!email || loading}
                  data-testid="button-send-reset-code"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Envoyer le code
                </Button>
              </>
            )}

            {step === "code" && (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Code de réinitialisation</label>
                  <Input
                    placeholder="Entrez le code à 6 chiffres"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="text-center text-2xl tracking-widest"
                    maxLength={6}
                    data-testid="input-reset-code"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau mot de passe</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Nouveau mot de passe"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      data-testid="input-new-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-new-password"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmer le mot de passe</label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirmez le mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-testid="input-confirm-password"
                  />
                </div>
                <Button
                  className="w-full gap-2"
                  onClick={handleResetPassword}
                  disabled={code.length !== 6 || !newPassword || !confirmPassword || loading}
                  data-testid="button-reset-password"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Réinitialiser le mot de passe
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      await fetch("/api/forgot-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, type }),
                      });
                      setCode("");
                      toast({ title: "Code renvoyé", description: "Un nouveau code a été envoyé à votre adresse email." });
                    } catch {
                      toast({ title: "Erreur", description: "Impossible de renvoyer le code", variant: "destructive" });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                  data-testid="button-resend-reset"
                >
                  <RefreshCw className="h-4 w-4" />
                  Renvoyer le code
                </Button>
              </>
            )}

            {step === "success" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Mot de passe réinitialisé</h3>
                  <p className="text-sm text-muted-foreground">
                    Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                </div>
                <Button className="w-full gap-2" onClick={onBack} data-testid="button-back-to-login">
                  <LogIn className="h-4 w-4" />
                  Retour à la connexion
                </Button>
              </div>
            )}

            {step !== "success" && (
              <div className="pt-2 border-t">
                <Button variant="ghost" className="w-full gap-2" onClick={onBack} data-testid="button-cancel-forgot">
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const mamAuth = useMamAuth();
  const parentAuth = useParentAuth();
  const [showMamPassword, setShowMamPassword] = useState(false);
  const [showParentPassword, setShowParentPassword] = useState(false);
  const [verificationState, setVerificationState] = useState<{ email: string; type: "mam" | "parent" } | null>(null);
  const [forgotPasswordType, setForgotPasswordType] = useState<"mam" | "parent" | null>(null);

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
      const res = await fetch("/api/mams/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.emailNotVerified) {
          setVerificationState({ email: body.email, type: "mam" });
          return null;
        }
        throw new Error(body.message || "Erreur de connexion");
      }
      return body;
    },
    onSuccess: (data) => {
      if (!data) return;
      mamAuth.login(data.token, data);
      toast({ title: "Connexion réussie", description: "Bienvenue sur votre page MAM." });
      setTimeout(() => navigate(`/mam/${data.slug}`), 100);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
    },
  });

  const parentMutation = useMutation({
    mutationFn: async (data: ParentLoginValues) => {
      const res = await fetch("/api/parents/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) {
        if (body.emailNotVerified) {
          setVerificationState({ email: body.email, type: "parent" });
          return null;
        }
        throw new Error(body.message || "Erreur de connexion");
      }
      return body;
    },
    onSuccess: (data) => {
      if (!data) return;
      parentAuth.login(data.token, data.parent);
      toast({ title: "Connexion réussie", description: "Bienvenue sur votre espace parent." });
      setTimeout(() => navigate("/mon-espace"), 100);
    },
    onError: (error: Error) => {
      toast({ title: "Erreur de connexion", description: error.message, variant: "destructive" });
    },
  });

  if (forgotPasswordType) {
    return <ForgotPasswordFlow type={forgotPasswordType} onBack={() => setForgotPasswordType(null)} />;
  }

  if (verificationState) {
    return (
      <EmailVerificationStep
        email={verificationState.email}
        type={verificationState.type}
        onVerified={() => {
          setVerificationState(null);
          toast({ title: "Email vérifié", description: "Vous pouvez maintenant vous connecter." });
        }}
      />
    );
  }

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
                                className="pr-10"
                                {...field}
                                data-testid="input-mam-password"
                              />
                              <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                                onClick={() => setShowMamPassword(!showMamPassword)}
                                data-testid="button-toggle-mam-password"
                              >
                                {showMamPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </span>
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
                <div className="mt-2 text-center">
                  <Button
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={() => setForgotPasswordType("mam")}
                    data-testid="link-forgot-password-mam"
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
                <div className="mt-2 pt-4 border-t text-center">
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
                                className="pr-10"
                                {...field}
                                data-testid="input-parent-password"
                              />
                              <span
                                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                                onClick={() => setShowParentPassword(!showParentPassword)}
                                data-testid="button-toggle-parent-password"
                              >
                                {showParentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </span>
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
                <div className="mt-2 text-center">
                  <Button
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={() => setForgotPasswordType("parent")}
                    data-testid="link-forgot-password-parent"
                  >
                    Mot de passe oublié ?
                  </Button>
                </div>
                <div className="mt-2 pt-4 border-t text-center">
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
