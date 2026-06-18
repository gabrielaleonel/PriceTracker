"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useMemo, Suspense } from "react"
import { FlightCard } from "@/components/flights/flight-card"
import { useLocale } from "@/lib/locale-context"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plane, ArrowLeft, SearchX, ArrowUpDown } from "lucide-react"
import type { FlightOffer } from "@/types"

type SortKey = "price" | "duration" | "stops"

function ResultadosContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useLocale()
  const [flights, setFlights] = useState<FlightOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>("price")

  const origin = searchParams.get("origin")
  const destination = searchParams.get("destination")
  const originName = searchParams.get("originName")
  const destinationName = searchParams.get("destinationName")
  const departureDate = searchParams.get("departureDate")
  const returnDate = searchParams.get("returnDate")
  const passengers = searchParams.get("passengers")

  const originLabel = originName ?? origin
  const destLabel = destinationName ?? destination

  useEffect(() => {
    if (!origin || !destination || !departureDate) {
      router.push("/")
      return
    }

    async function fetchFlights() {
      try {
        const response = await fetch("/api/flights/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin,
            destination,
            originName: originName || undefined,
            destinationName: destinationName || undefined,
            departureDate,
            returnDate: returnDate || undefined,
            passengers: Number(passengers) || 1,
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error ?? "Erro ao buscar voos")
        }

        const data = await response.json()
        setFlights(data.flights ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao buscar voos")
      } finally {
        setLoading(false)
      }
    }

    fetchFlights()
  }, [origin, destination, departureDate, returnDate, passengers, router])

  const sortedFlights = useMemo(() => {
    const sorted = [...flights]
    switch (sortBy) {
      case "price":
        sorted.sort((a, b) => a.price.amount - b.price.amount)
        break
      case "duration": {
        const parseDuration = (d: string) => {
          const [h, m] = d.match(/(\d+)h\s*(\d+)?m?/)?.slice(1).map(Number) ?? [0, 0]
          return h * 60 + (m ?? 0)
        }
        sorted.sort((a, b) => parseDuration(a.totalDuration) - parseDuration(b.totalDuration))
        break
      }
      case "stops":
        sorted.sort((a, b) => a.numberOfStops - b.numberOfStops)
        break
    }
    return sorted
  }, [flights, sortBy])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <Plane className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">
              {originLabel} → {destLabel}
            </h1>
            <p className="text-xs text-muted-foreground tracking-wide">
              {origin} — {destination}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {departureDate && new Date(departureDate).toLocaleDateString("pt-BR")}
              {returnDate && ` — ${new Date(returnDate).toLocaleDateString("pt-BR")}`}
              {" "}· {passengers ?? 1} {Number(passengers ?? 1) === 1 ? "passageiro" : "passageiros"}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push("/")} className="shrink-0 gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("resultados.newSearch")}
        </Button>
      </div>

      <div className="h-px bg-gradient-to-r from-border/40 via-border to-border/40" />

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 shimmer rounded-lg" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-destructive flex items-start gap-3">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-destructive" />
          <div>
            <p className="font-semibold">Erro na busca</p>
            <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && flights.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-foreground">
            {t("resultados.noFlights")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
            {t("resultados.noFlightsHint")}
            </p>
            <Button variant="outline" className="mt-6 gap-2" onClick={() => router.push("/")}>
              <ArrowLeft className="h-4 w-4" />
              {t("resultados.newSearch")}
            </Button>
        </div>
      )}

      {!loading && flights.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
              {flights.length} {flights.length === 1 ? t("resultados.flightFound") : t("resultados.flightsFound")}
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">{t("resultados.lowestPrice")}</SelectItem>
                  <SelectItem value="duration">{t("resultados.shortestDuration")}</SelectItem>
                  <SelectItem value="stops">{t("resultados.fewestStops")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {sortedFlights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ResultadosPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-6">
          <div className="h-12 w-72 shimmer rounded-lg" />
          <div className="h-px bg-border/40" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 shimmer rounded-lg" />
            ))}
          </div>
        </div>
      }
    >
      <ResultadosContent />
    </Suspense>
  )
}
