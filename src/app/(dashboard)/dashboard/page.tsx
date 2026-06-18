"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, History, Route, Plane, Search, Power, PowerOff, Trash2, RefreshCw, CheckCircle2, Shield, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/lib/locale-context"

interface AlertItem {
  id: string
  origin: string
  originName?: string
  destination: string
  destinationName?: string
  departureDate: string
  maxPrice: number
  active: boolean
  lastNotifiedAt: string | null
}

interface SearchItem {
  id: string
  origin: string
  destination: string
  originName?: string
  destinationName?: string
  departureDate: string
  returnDate: string | null
  passengers: number
  createdAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [searches, setSearches] = useState<SearchItem[]>([])
  const [checking, setChecking] = useState(false)
  const { t } = useLocale()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status !== "authenticated") return

    async function load() {
      const [alertsRes, searchesRes] = await Promise.all([
        fetch("/api/alerts"),
        fetch("/api/flights/search"),
      ])
      if (alertsRes.ok) {
        const data = await alertsRes.json()
        setAlerts(data.alerts ?? [])
      }
      if (searchesRes.ok) {
        const data = await searchesRes.json()
        setSearches(data.history ?? [])
      }
    }
    load()
  }, [status, router])

  const uniqueRoutes = new Set(searches.map(s => `${s.origin}-${s.destination}`))

  async function handleToggleAlert(alert: AlertItem) {
    try {
      const res = await fetch(`/api/alerts/${alert.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !alert.active }),
      })
      if (!res.ok) throw new Error()
      setAlerts((prev) => prev.map((a) => (a.id === alert.id ? { ...a, active: !a.active } : a)))
      toast.success(alert.active ? t("dashboard.alertDeactivated") : t("dashboard.alertActivated"))
    } catch {
      toast.error("Erro ao atualizar alerta")
    }
  }

  async function handleDeleteAlert(id: string) {
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setAlerts((prev) => prev.filter((a) => a.id !== id))
      toast.success(t("dashboard.alertRemoved"))
    } catch {
      toast.error("Erro ao remover alerta")
    }
  }

  async function handleCheckAlerts() {
    setChecking(true)
    try {
      const res = await fetch("/api/alerts/check", { method: "POST" })
      if (!res.ok) throw new Error()
      const data = await res.json()
      if (data.triggered?.length > 0) {
        toast.success(`${data.triggered.length} ${data.triggered.length === 1 ? "alerta foi" : "alertas foram"} acionados!`)
        const res2 = await fetch("/api/alerts")
        if (res2.ok) {
          const d2 = await res2.json()
          setAlerts(d2.alerts ?? [])
        }
      } else {
        toast.success(`${data.checked} ${data.checked === 1 ? "alerta verificado" : "alertas verificados"}, nenhum acionado`)
      }
    } catch {
      toast.error("Erro ao verificar alertas")
    } finally {
      setChecking(false)
    }
  }

  function handleReSearch(search: SearchItem) {
    const params = new URLSearchParams({
      origin: search.origin,
      destination: search.destination,
      departureDate: search.departureDate.split("T")[0],
      passengers: String(search.passengers),
    })
    if (search.originName) params.set("originName", search.originName)
    if (search.destinationName) params.set("destinationName", search.destinationName)
    if (search.returnDate) {
      params.set("returnDate", search.returnDate.split("T")[0])
    }
    router.push(`/resultados?${params.toString()}`)
  }

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        <div className="h-20 shimmer rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
      <div className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <Plane className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">{t("dashboard.title")}</h1>
            <p className="text-muted-foreground">
              {t("dashboard.welcome")}, {session?.user?.name ?? "usuário"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{alerts.length}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.activeAlerts")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/80 text-secondary-foreground">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{searches.length}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.recentSearches")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Route className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{uniqueRoutes.size}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.differentRoutes")}</p>
            </div>
          </div>
        </div>
      </div>

      {session?.user?.role === "ADMIN" && (
        <a href="/dashboard/admin" className="block rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-amber-500/10 p-4 text-sm transition-all hover:border-amber-500/50 hover:shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">{t("dashboard.adminPanel")}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.adminDesc")}</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </a>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                  <CardTitle className="flex items-center gap-2 text-lg font-heading">
                    <Bell className="h-4 w-4 text-primary" />
                    {t("dashboard.priceAlerts")}
                  </CardTitle>
                <CardDescription>
                  {alerts.length} {alerts.length === 1 ? t("dashboard.activeAlert") : t("dashboard.activeAlerts")}
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCheckAlerts}
                disabled={checking || alerts.length === 0}
                className="h-8 shrink-0 gap-1.5 text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${checking ? "animate-spin" : ""}`} />
                {checking ? t("dashboard.checking") : t("dashboard.checkPrices")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.noAlerts")}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {alerts.map((alert) => {
                  const alertOrigin = alert.originName ?? alert.origin
                  const alertDest = alert.destinationName ?? alert.destination
                  return (
                  <li key={alert.id} className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm transition-colors hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Plane className="h-3 w-3 text-muted-foreground" />
                          {alertOrigin} → {alertDest}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.departureDate).toLocaleDateString("pt-BR")}
                          <span className="ml-1.5 text-[0.6rem]">{alert.origin}–{alert.destination}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {t("dashboard.upTo")} R$ {alert.maxPrice.toFixed(0)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleAlert(alert)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                          title={alert.active ? t("dashboard.deactivate") : t("dashboard.activate")}
                        >
                          {alert.lastNotifiedAt && <span title={t("dashboard.priceReached")}><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /></span>}
                  {alert.active ? <Power className="h-3.5 w-3.5 text-green-500" /> : <PowerOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAlert(alert.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title={t("dashboard.remove")}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-heading">
                  <History className="h-4 w-4 text-secondary-foreground" />
                  {t("dashboard.recentSearches")}
                </CardTitle>
                <CardDescription>{t("dashboard.lastSearches")}</CardDescription>
          </CardHeader>
          <CardContent>
            {searches.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <History className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.noSearches")}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {searches.map((search) => {
                  const originLabel = search.originName ?? search.origin
                  const destLabel = search.destinationName ?? search.destination
                  return (
                    <li key={search.id}>
                      <button
                        type="button"
                        onClick={() => handleReSearch(search)}
                        className="w-full rounded-lg border border-border/60 bg-muted/30 p-3 text-left text-sm transition-all hover:bg-muted/60 hover:border-primary/30 hover:shadow-sm active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground flex items-center gap-1.5">
                            <Search className="h-3 w-3 text-muted-foreground" />
                            {originLabel} → {destLabel}
                          </span>
                          <span className="text-[0.65rem] text-muted-foreground">
                            {new Date(search.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(search.departureDate).toLocaleDateString("pt-BR")}
                            {search.returnDate && ` — ${new Date(search.returnDate).toLocaleDateString("pt-BR")}`}
                          </span>
                          <span className="text-[0.6rem] text-muted-foreground">
                            {search.origin}–{search.destination}
                          </span>
                          <Badge variant="outline" className="text-[0.6rem] px-1 py-0">
                            {search.passengers} {t("dashboard.pax")}
                          </Badge>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
