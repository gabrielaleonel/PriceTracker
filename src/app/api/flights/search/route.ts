import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { flightSearchSchema } from "@/lib/validation"
import { searchOneWay, searchRoundTrip, ignavToFlightOffer } from "@/lib/ignav"
import type { IgnavItinerary } from "@/lib/ignav"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    const body = await request.json()

    const parsed = flightSearchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const bodyJson = body as Record<string, unknown>
    const originName = typeof bodyJson.originName === "string" ? bodyJson.originName : null
    const destinationName = typeof bodyJson.destinationName === "string" ? bodyJson.destinationName : null

    const { origin, destination, departureDate, returnDate, passengers, currency, cabinClass } =
      parsed.data

    const market = currency === "BRL" ? "BR" : currency === "EUR" ? "DE" : "US"
    const cabin = cabinClass === "ECONOMY" ? undefined : cabinClass

    let itineraries: IgnavItinerary[] = []

    if (returnDate) {
      const data = await searchRoundTrip({
        origin,
        destination,
        departureDate,
        returnDate,
        adults: passengers,
        market,
        cabinClass: cabin,
      })
      itineraries = data.itineraries
    } else {
      const data = await searchOneWay({
        origin,
        destination,
        departureDate,
        adults: passengers,
        market,
        cabinClass: cabin,
      })
      itineraries = data.itineraries
    }

    const flights = itineraries.map((it) => ignavToFlightOffer(it))

    if (session?.user?.id) {
      await prisma.searchHistory
        .create({
          data: {
            userId: session.user.id,
            origin,
            originName,
            destination,
            destinationName,
            departureDate: new Date(departureDate),
            returnDate: returnDate ? new Date(returnDate) : null,
            passengers,
            currency,
            resultsCount: flights.length,
          },
        })
        .catch(() => {})
    }

    return NextResponse.json({ flights })
  } catch (error) {
    console.error("[FLIGHTS_SEARCH]", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar passagens. Tente novamente.",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const history = await prisma.searchHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json({ history })
}
