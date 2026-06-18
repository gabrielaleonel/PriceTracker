import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { searchOneWay, searchRoundTrip } from "@/lib/ignav"
import { sendAlertNotificationEmail } from "@/lib/mail"
import type { IgnavItinerary } from "@/lib/ignav"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const expectedKey = process.env.CRON_SECRET

  if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { active: true },
    include: { user: { select: { email: true } } },
  })

  let checked = 0
  let triggered = 0

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
        triggered++
        if (alert.user.email) {
          await sendAlertNotificationEmail(
            alert.user.email,
            alert.originName ?? alert.origin,
            alert.destinationName ?? alert.destination,
            bestPrice,
            alert.maxPrice,
          ).catch(() => {})
        }
      }
      checked++
    } catch {
      continue
    }
  }

  return NextResponse.json({ checked, triggered })
}
