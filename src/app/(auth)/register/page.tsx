"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export default function RegisterPage() {
  const { t } = useLocale()
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Senhas não conferem")

      setLoading(false)
      return
    }

    if (!consentGiven) {
      setError("Você precisa aceitar os termos de privacidade")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consentGiven }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? t("auth.registerError"))
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.registerError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-1/3 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-1/4 bottom-1/3 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-2xl shadow-primary/5 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-heading">{t("auth.registerTitle")}</CardTitle>
          <CardDescription>
            {t("auth.registerDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="group relative w-full overflow-hidden border-border/60 transition-all hover:border-primary/30 hover:shadow-sm"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[0.65rem] font-bold text-background">G</span>
                {t("auth.continueGoogle")}
              </span>
            </Button>
            <Button
              variant="outline"
              className="group relative w-full overflow-hidden border-border/60 transition-all hover:border-primary/30 hover:shadow-sm"
              onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                {t("auth.continueGitHub")}
              </span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">
                {t("auth.orEmail")}
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("auth.name")}</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="pl-9 pr-9"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("auth.passwordHint")}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-3.5">
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-primary"
                required
              />
              <label htmlFor="consent" className="text-xs leading-5 text-muted-foreground">
                {t("auth.consent")}{" "}
                <Link href="/privacidade" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  {t("auth.privacyPolicy")}
                </Link>{" "}
                {t("auth.consentDesc")}
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="h-10 w-full shadow-sm shadow-primary/15" disabled={loading}>
              {loading ? "Criando conta..." : t("auth.register")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t("auth.hasAccount")}{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              {t("auth.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
