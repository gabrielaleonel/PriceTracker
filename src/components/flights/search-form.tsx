"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { AirportCombobox } from "@/components/shared/airport-combobox"
import { useLocale } from "@/lib/locale-context"

import { CalendarDays, Search, Users, Sofa } from "lucide-react"

export function FlightSearchForm() {
  const { t } = useLocale()
  const router = useRouter()
  const [originCode, setOriginCode] = useState("")
  const [originName, setOriginName] = useState("")
  const [destCode, setDestCode] = useState("")
  const [destName, setDestName] = useState("")
  const [departureDate, setDepartureDate] = useState("")
  const [returnDate, setReturnDate] = useState("")
  const [passengers, setPassengers] = useState("1")
  const [cabinClass, setCabinClass] = useState("ECONOMY")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!originCode || !destCode) return
    setLoading(true)

    const params = new URLSearchParams({
      origin: originCode,
      destination: destCode,
      originName: originName,
      destinationName: destName,
      departureDate,
      passengers,
      cabinClass,
    })
    if (returnDate) params.set("returnDate", returnDate)

    router.push(`/resultados?${params.toString()}`)
  }

  return (
    <Card className="mx-auto w-full max-w-3xl border-border/80 bg-card/96 p-5 shadow-2xl shadow-primary/10 backdrop-blur-md sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("home.search")}</p>
            <p className="text-xs text-muted-foreground">{t("home.searchDesc")}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm shadow-accent/25">
            <Search className="h-5 w-5" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <AirportCombobox
            id="origin"
            label={t("home.origin")}
            placeholder={t("home.originPlaceholder")}
            value={originCode}
            onChange={(code, name) => {
              setOriginCode(code)
              setOriginName(name)
            }}
          />
          <AirportCombobox
            id="destination"
            label={t("home.destination")}
            placeholder={t("home.destinationPlaceholder")}
            value={destCode}
            onChange={(code, name) => {
              setDestCode(code)
              setDestName(name)
            }}
          />
          <div className="space-y-2">
            <Label htmlFor="departure" className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              {t("home.departure")}
            </Label>
            <Input id="departure" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="return" className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
              {t("home.return")}
            </Label>
            <Input id="return" type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passengers" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              {t("home.passengers")}
            </Label>
            <Select value={passengers} onValueChange={(v) => v && setPassengers(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n === 1 ? "passageiro" : "passageiros"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cabin" className="flex items-center gap-1.5">
              <Sofa className="h-3.5 w-3.5 text-muted-foreground" />
              {t("home.cabin")}
            </Label>
            <Select value={cabinClass} onValueChange={(v) => v && setCabinClass(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ECONOMY">{t("home.economy")}</SelectItem>
                <SelectItem value="PREMIUM_ECONOMY">{t("home.premiumEconomy")}</SelectItem>
                <SelectItem value="BUSINESS">{t("home.business")}</SelectItem>
                <SelectItem value="FIRST">{t("home.firstClass")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="h-11 w-full text-sm" disabled={loading || !originCode || !destCode}>
          <Search className="h-4 w-4" />
          {loading ? t("home.searching") : t("home.searchFlights")}
        </Button>
      </form>
    </Card>
  )
}
