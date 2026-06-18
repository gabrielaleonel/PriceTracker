"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useLocale } from "@/lib/locale-context"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-8rem)] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { t } = useLocale()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Erro ao redefinir senha")
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-2xl shadow-primary/5 backdrop-blur-sm">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <p className="text-muted-foreground">{t("resetPassword.invalidLink")}</p>
              <Link href="/forgot-password" className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-1.5 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-secondary/55">
                {t("resetPassword.requestNewLink")}
              </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/3 h-48 w-48 rounded-full bg-accent/5 blur-3xl" />
      </div>
      <Card className="w-full max-w-md border-border/60 bg-card/90 shadow-2xl shadow-primary/5 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-heading">{t("resetPassword.title")}</CardTitle>
          <CardDescription>{t("resetPassword.desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">{t("resetPassword.success")}</p>
              <Button className="mt-2 gap-2" onClick={() => router.push("/login")}>
                {t("resetPassword.goToLogin")}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">{t("resetPassword.title")}</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                <p className="text-xs text-muted-foreground">{t("auth.passwordHint")}</p>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="h-10 w-full shadow-sm shadow-primary/15" disabled={loading}>
                {loading ? t("resetPassword.resetting") : t("resetPassword.reset")}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
