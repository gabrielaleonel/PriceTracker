import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { searchOneWay, searchRoundTrip } from "@/lib/ignav"
import { sendAlertNotificationEmail } from "@/lib/mail"
import type { IgnavItinerary } from "@/lib/ignav"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id, active: true },
  })

  if (alerts.length === 0) {
    return NextResponse.json({ checked: 0, triggered: [] })
  }

  const triggered: { id: string; origin: string; destination: string; bestPrice: number; maxPrice: number }[] = []

  for (const alert of alerts) {
    try {
      const today = new Date().toISOString().split("T")[0]
      const depDate = alert.departureDate.toISOString().split("T")[0]

      if (depDate < today) continue

      let itineraries: IgnavItinerary[] = []

      if (alert.returnDate) {
        const retDate = alert.returnDate.toISOString().split("T")[0]
        const data = await searchRoundTrip({
          origin: alert.origin,
          destination: alert.destination,
          departureDate: depDate,
          returnDate: retDate,
          adults: 1,
          market: alert.currency === "BRL" ? "BR" : alert.currency === "EUR" ? "DE" : "US",
        })
        itineraries = data.itineraries
      } else {
        const data = await searchOneWay({
          origin: alert.origin,
          destination: alert.destination,
          departureDate: depDate,
          adults: 1,
          market: alert.currency === "BRL" ? "BR" : alert.currency === "EUR" ? "DE" : "US",
        })
        itineraries = data.itineraries
      }

      if (itineraries.length === 0) continue

      const bestPrice = Math.min(...itineraries.map((i) => i.price.amount))
      if (bestPrice <= alert.maxPrice) {
        await prisma.priceAlert.update({
          where: { id: alert.id },
          data: { lastNotifiedAt: new Date() },
        })
        triggered.push({
          id: alert.id,
          origin: alert.origin,
          destination: alert.destination,
          bestPrice,
          maxPrice: alert.maxPrice,
        })
        await sendAlertNotificationEmail(
          session.user.email!,
          alert.originName ?? alert.origin,
          alert.destinationName ?? alert.destination,
          bestPrice,
          alert.maxPrice,
        ).catch(() => {})
      }
    } catch {
      continue
    }
  }

  return NextResponse.json({ checked: alerts.length, triggered })
}
