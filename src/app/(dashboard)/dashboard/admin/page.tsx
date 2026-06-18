"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Users, Calendar, Bell, Search, ArrowUpDown, Crown } from "lucide-react"
import { toast } from "sonner"
import { useLocale } from "@/lib/locale-context"

interface AdminUser {
  id: string
  name: string | null
  email: string
  role: string
  consentGiven: boolean
  createdAt: string
  deletedAt: string | null
  _count: { alerts: number; searches: number }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLocale()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
    if (status !== "authenticated") return

    async function load() {
      try {
        const res = await fetch("/api/admin")
        if (!res.ok) throw new Error()
        const data = await res.json()
        setUsers(data.users ?? [])
      } catch {
        toast.error("Erro ao carregar usuários")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [status, session, router])

  async function handleToggleRole(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN"
    try {
      const res = await fetch("/api/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      })
      if (!res.ok) throw new Error()
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      toast.success(t("admin.permissionUpdated"))
    } catch {
      toast.error("Erro ao atualizar permissão")
    }
  }

  const totalUsers = users.length
  const totalAlerts = users.reduce((acc, u) => acc + u._count.alerts, 0)
  const totalSearches = users.reduce((acc, u) => acc + u._count.searches, 0)

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        <div className="h-20 shimmer rounded-xl" />
        <div className="grid gap-4 sm:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="h-20 shimmer rounded-xl" />)}</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
      <div className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">{t("admin.title")}</h1>
            <p className="text-muted-foreground">{t("admin.desc")}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{totalUsers}</p>
              <p className="text-xs text-muted-foreground">{t("admin.users")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{totalAlerts}</p>
              <p className="text-xs text-muted-foreground">{t("admin.alerts")}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-card/80 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/80 text-secondary-foreground">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold font-heading">{totalSearches}</p>
              <p className="text-xs text-muted-foreground">{t("admin.searches")}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-heading">
              <Users className="h-4 w-4 text-primary" />
              {t("admin.users")}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left font-medium">{t("admin.name")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("admin.email")}</th>
                  <th className="px-4 py-3 text-center font-medium">{t("admin.permission")}</th>
                  <th className="px-4 py-3 text-center font-medium">{t("admin.alerts")}</th>
                  <th className="px-4 py-3 text-center font-medium">{t("admin.searches")}</th>
                  <th className="px-4 py-3 text-left font-medium">{t("admin.createdAt")}</th>
                  <th className="px-4 py-3 text-center font-medium">{t("admin.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border/40 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{user.name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="text-[0.6rem] px-1.5">
                        {user.role === "ADMIN" ? "Admin" : "User"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{user._count.alerts}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{user._count.searches}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="gap-1 text-xs"
                        disabled={user.id === session?.user?.id}
                      >
                        <Crown className="h-3 w-3" />
                        {user.role === "ADMIN" ? t("admin.removeAdmin") : t("admin.makeAdmin")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
