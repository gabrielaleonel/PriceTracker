"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCountryName } from "@/lib/ignav"
import { Search, Building2, MapPin, Plane } from "lucide-react"
import { useLocale } from "@/lib/locale-context"

interface Airport {
  code: string
  name: string
  city: string
  country: string
}

export default function AirportsPage() {
  const { t } = useLocale()
  const [query, setQuery] = useState("")
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      if (query.length < 2) {
        setAirports([])
        return
      }
      setLoading(true)
      try {
        const res = await fetch(`/api/airports/search?q=${encodeURIComponent(query)}&limit=20`)
        const data = await res.json()
        setAirports(data.airports ?? [])
      } catch {
        setAirports([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [query])

  const groupedByCountry = airports.reduce<Record<string, Airport[]>>((acc, airport) => {
    const countryName = getCountryName(airport.country)
    if (!acc[countryName]) acc[countryName] = []
    acc[countryName].push(airport)
    return acc
  }, {})

  const sortedCountries = Object.keys(groupedByCountry).sort()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      <div className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">{t("airports.title")}</h1>
            <p className="text-muted-foreground">
              {t("airports.subtitle")}
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t("airports.searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 h-11 text-base"
        />
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 shimmer rounded-lg" />
          ))}
        </div>
      )}

      {!loading && query.length >= 2 && airports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-semibold text-foreground">
            {t("airports.noResults")} &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Tente usar termos diferentes ou verifique a ortografia.
          </p>
        </div>
      )}

      {!loading && sortedCountries.length > 0 && (
        <div className="space-y-8">
          {sortedCountries.map((country) => (
            <section key={country}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-primary" />
                <h2 className="text-xl font-bold font-heading text-foreground">{country}</h2>
                <Badge variant="secondary" className="text-[0.65rem] font-medium">
                  {groupedByCountry[country].length}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {groupedByCountry[country].map((airport) => (
                  <Card
                    key={airport.code}
                    className="group relative overflow-hidden border-border/60 bg-card/90 p-4 transition-all duration-300 hover:shadow-md hover:shadow-sky-500/5 card-hover"
                  >
                    <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Plane className="h-4 w-4" />
                    </div>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-foreground">{airport.name}</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {airport.city}
                        </span>
                      </div>
                      <span className="shrink-0 rounded-lg border border-border/60 bg-muted/50 px-2.5 py-1 text-sm font-mono font-bold text-foreground transition-colors group-hover:border-primary/30 group-hover:bg-primary/5">
                        {airport.code}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {!loading && query.length < 2 && (
        <div className="flex flex-col items-center py-12 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-lg font-semibold text-foreground">
            {t("airports.minChars")}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 max-w-lg mx-auto">
            <div className="rounded-xl border border-border/60 bg-card/80 p-4 text-left">
              <p className="font-medium text-foreground text-sm">{t("airports.byName")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Congonhas, Galeão, Heathrow</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/80 p-4 text-left">
              <p className="font-medium text-foreground text-sm">{t("airports.byCity")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Nova York, Londres, Tóquio</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card/80 p-4 text-left">
              <p className="font-medium text-foreground text-sm">{t("airports.byCode")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">GRU, JFK, LHR, CDG</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
