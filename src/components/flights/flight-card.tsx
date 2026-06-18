"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocale } from "@/lib/locale-context"

import { Plane, Clock, ArrowUpRight, BellPlus, ExternalLink, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import type { FlightOffer } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FlightCardProps {
  flight: FlightOffer
}

export function FlightCard({ flight }: FlightCardProps) {
  const { t } = useLocale()
  const { data: session } = useSession()
  const [alertPrice, setAlertPrice] = useState(String(flight.price.amount))
  const [creatingAlert, setCreatingAlert] = useState(false)
  const [bookingLinks, setBookingLinks] = useState<{ provider: string; url: string }[] | null>(null)
  const [loadingLinks, setLoadingLinks] = useState(false)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const formatTime = (_dateStr: string, timeStr: string) => {
    const [h, m] = timeStr.split(":")
    return `${h}:${m}`
  }

  async function handleBookingLinks() {
    setLoadingLinks(true)
    try {
      const res = await fetch("/api/flights/booking-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ignavId: flight.id }),
      })
      if (!res.ok) throw new Error("Erro ao buscar links")
      const data = await res.json()
      setBookingLinks(Array.isArray(data) ? data : data.links ?? [])
    } catch {
      toast.error("Erro ao carregar links de compra")
    } finally {
      setLoadingLinks(false)
    }
  }

  async function handleCreateAlert() {
    if (!session?.user) {
      toast.error("Faça login para criar alertas")
      return
    }
    setCreatingAlert(true)
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: flight.legs[0]?.departure.airport,
          originName: flight.legs[0]?.departure.city,
          destination: flight.legs[0]?.arrival.airport,
          destinationName: flight.legs[0]?.arrival.city,
          departureDate: flight.legs[0]?.departure.date,
          returnDate: flight.legs[1]?.departure.date,
          maxPrice: Number(alertPrice),
          currency: flight.price.currency,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Erro ao criar alerta")
      }
      toast.success("Alerta criado com sucesso!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar alerta")
    } finally {
      setCreatingAlert(false)
    }
  }

  return (
    <Card className="group relative overflow-hidden border-border/60 bg-card/90 p-0 transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5 card-hover">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/40 via-primary/60 to-accent/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plane className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-medium text-foreground">{flight.airline}</span>
              <Badge variant="secondary" className="text-[0.65rem] font-medium px-1.5 py-0">
                {flight.airlineCode}
              </Badge>
            </div>

            {flight.legs.map((leg, index) => (
              <div key={index} className="relative">
                <div className="flex items-center gap-4">
                  <div className="text-right min-w-[4.5rem]">
                    <p className="text-lg font-bold text-foreground leading-tight">
                      {formatTime(leg.departure.date, leg.departure.time)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{leg.departure.airport}</p>
                  </div>

                  <div className="relative flex flex-1 items-center">
                    <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-primary bg-background" />
                    <div className="mx-3 h-[2px] flex-1 bg-gradient-to-r from-primary/40 to-border" />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[0.65rem] text-muted-foreground font-medium">{leg.duration}</span>
                    </div>
                    <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-border bg-background" />
                  </div>

                  <div className="text-left min-w-[4.5rem]">
                    <p className="text-lg font-bold text-foreground leading-tight">
                      {formatTime(leg.arrival.date, leg.arrival.time)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{leg.arrival.airport}</p>
                  </div>
                </div>

                {index < flight.legs.length - 1 && (
                  <div className="mt-2 ml-[4.5rem] flex items-center gap-2">
                    <div className="h-px flex-1 bg-dashed bg-border" />
                    <span className="text-[0.65rem] text-muted-foreground font-medium">{t("resultados.stops")}</span>
                    <div className="h-px flex-1 bg-dashed bg-border" />
                  </div>
                )}
              </div>
            ))}

            <div className="flex items-center gap-2 pt-1">
              <Badge
                variant={flight.numberOfStops === 0 ? "default" : "secondary"}
                className="text-[0.65rem] font-medium"
              >
                {flight.numberOfStops === 0
                  ? t("resultados.direct")
                  : `${flight.numberOfStops} ${flight.numberOfStops === 1 ? t("resultados.stops") : t("resultados.stops")}`}
              </Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {flight.totalDuration}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 shrink-0">
            <p className="text-2xl font-bold text-foreground tracking-tight">
              {formatCurrency(flight.price.amount, flight.price.currency)}
            </p>
            <Dialog>
              <DialogTrigger
                render={
                  <button type="button" className="group/btn inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:text-primary hover:shadow-sm active:scale-[0.97]" />
                }
              >
                {t("resultados.details")}
                <ArrowUpRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-primary" />
                    {flight.airline} — {flight.airlineCode}
                  </DialogTitle>
                  <DialogDescription>
                    Detalhes completos do voo
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {flight.legs.map((leg, index) => (
                    <div key={index} className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-2">
                      <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Plane className="h-3.5 w-3.5 text-primary" />
                        Trecho {index + 1}: {leg.departure.airport} → {leg.arrival.airport}
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Companhia</p>
                          <p className="text-foreground">{leg.carrier}</p>
                        </div>
                        <div>
                          <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Voo</p>
                          <p className="text-foreground">{leg.carrierCode} {leg.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Partida</p>
                          <p className="text-foreground">{leg.departure.date} às {leg.departure.time}</p>
                        </div>
                        <div>
                          <p className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Chegada</p>
                          <p className="text-foreground">{leg.arrival.date} às {leg.arrival.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Duração: {leg.duration}
                      </div>
                    </div>
                  ))}

                  <div className="rounded-xl border border-border/60 bg-primary/5 p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <BellPlus className="h-4 w-4 text-primary" />
                      {t("resultados.priceAlert")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("resultados.priceAlertDesc")}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label htmlFor="alert-price" className="sr-only">{t("resultados.maxPrice")}</Label>
                        <Input
                          id="alert-price"
                          type="number"
                          value={alertPrice}
                          onChange={(e) => setAlertPrice(e.target.value)}
                          className="h-9 text-sm"
                          placeholder={t("resultados.maxPrice")}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={handleCreateAlert}
                        disabled={creatingAlert}
                        className="h-9 shrink-0 gap-1.5"
                      >
                        <BellPlus className="h-3.5 w-3.5" />
                        {creatingAlert ? t("resultados.creating") : t("resultados.createAlert")}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-muted/40 p-4 space-y-3">
                    <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      {t("resultados.bookingLinks")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("resultados.bookingLinksDesc")}
                    </p>
                    {bookingLinks === null ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBookingLinks}
                        disabled={loadingLinks}
                        className="h-9 gap-1.5"
                      >
                        {loadingLinks ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ExternalLink className="h-3.5 w-3.5" />}
                        {loadingLinks ? t("resultados.loading") : t("resultados.viewOffers")}
                      </Button>
                    ) : bookingLinks.length === 0 ? (
                      <p className="text-xs text-muted-foreground">{t("resultados.noLinks")}</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {bookingLinks.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/40 hover:text-primary hover:shadow-sm"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {link.provider ?? t("resultados.buyAt")}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  )
}
