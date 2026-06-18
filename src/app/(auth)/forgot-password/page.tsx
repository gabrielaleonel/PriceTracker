"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useLocale()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Erro ao enviar email")
      setSent(true)
    } catch {
      setError("Erro ao enviar email de recuperação")
    } finally {
      setLoading(false)
    }
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
            <Mail className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-heading">{t("forgotPassword.title")}</CardTitle>
          <CardDescription>
            {t("forgotPassword.desc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm text-muted-foreground">
                {t("forgotPassword.emailSent")}
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 px-3 py-1.5 text-sm font-semibold text-foreground transition-all hover:border-primary/30 hover:bg-secondary/55">
                <ArrowLeft className="h-4 w-4" />
                {t("forgotPassword.backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="h-10 w-full gap-2 shadow-sm shadow-primary/15" disabled={loading}>
                <Send className="h-4 w-4" />
                {loading ? t("forgotPassword.sending") : t("forgotPassword.sendLink")}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  <ArrowLeft className="mr-1 inline h-3 w-3" />
                  {t("forgotPassword.backToLogin")}
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
