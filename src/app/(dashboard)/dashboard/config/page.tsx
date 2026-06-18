"use client"

import { useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { toast } from "sonner"
import { Settings, ShieldAlert, UserRound, ShieldCheck, ExternalLink } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

export default function ConfigPage() {
  const { data: session } = useSession()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [consentSaving, setConsentSaving] = useState(false)
  const { t } = useLocale()

  async function handleGiveConsent() {
    setConsentSaving(true)
    try {
      const res = await fetch("/api/user/consent", { method: "POST" })
      if (!res.ok) throw new Error("Erro ao salvar consentimento")
      toast.success(t("config.consentSuccess"))
    } catch {
      toast.error("Erro ao registrar consentimento")
    } finally {
      setConsentSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    try {
      await fetch("/api/user/delete", { method: "POST" })
      await signOut({ callbackUrl: "/" })
    } catch {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <div className="rounded-lg border border-border/80 bg-card/86 p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
          <Settings className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold">{t("config.title")}</h1>
        <p className="mt-1 text-muted-foreground">{t("config.accountDesc")}</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserRound className="h-4 w-4 text-primary" />
              {t("config.account")}
            </CardTitle>
            <CardDescription>{t("config.accountDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-border/80 bg-background/45 p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">{t("config.nameLabel")}</p>
            <p className="mt-1 font-semibold">{session?.user?.name ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-border/80 bg-background/45 p-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">{t("config.emailLabel")}</p>
            <p className="mt-1 font-semibold">{session?.user?.email ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t("config.privacy")}
            </CardTitle>
            <CardDescription>
              {t("config.privacyDesc")}
            </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Seus dados são utilizados exclusivamente para autenticação, exibição de histórico
            de buscas e notificações de alertas de preço. Você pode registrar ou renovar seu
            consentimento a qualquer momento.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="default"
              onClick={handleGiveConsent}
              disabled={consentSaving}
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {consentSaving ? t("config.consentSaving") : t("config.giveConsent")}
            </Button>
            <Link
              href="/privacidade"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Ver política de privacidade
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <ShieldAlert className="h-4 w-4" />
            {t("config.dangerZone")}
          </CardTitle>
          <CardDescription>
            {t("config.deleteAccountDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta ação é irreversível. Todos os seus dados serão removidos ou
            anonimizados conforme nossa política de privacidade.
          </p>
          {!confirmDelete ? (
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              {t("config.deleteAccount")}
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                {t("config.deleteConfirm")}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? t("config.deleting") : t("config.deleteButton")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
