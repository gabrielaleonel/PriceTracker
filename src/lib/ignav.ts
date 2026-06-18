const BASE_URL = "https://ignav.com/api"

function getApiKey(): string {
  const key = process.env.IGNAV_API_KEY
  if (!key) throw new Error("IGNAV_API_KEY is not set")
  return key
}

interface IgnavSegment {
  marketing_carrier_code: string
  flight_number: string
  operating_carrier_name: string
  departure_airport: string
  departure_time_local: string
  departure_timezone: string
  arrival_airport: string
  arrival_time_local: string
  arrival_timezone: string
  duration_minutes: number
  aircraft: string
}

export interface IgnavItinerary {
  price: { amount: number; currency: string }
  outbound: {
    carrier: string
    duration_minutes: number
    segments: IgnavSegment[]
  }
  inbound?: {
    carrier: string
    duration_minutes: number
    segments: IgnavSegment[]
  }
  cabin_class: string
  ignav_id: string
}

interface IgnavOneWayResponse {
  origin: string
  destination: string
  departure_date: string
  itineraries: IgnavItinerary[]
}

interface IgnavRoundTripResponse {
  origin: string
  destination: string
  departure_date: string
  return_date: string
  itineraries: IgnavItinerary[]
}

export async function searchOneWay(params: {
  origin: string
  destination: string
  departureDate: string
  adults?: number
  cabinClass?: string
  maxStops?: number
  market?: string
}): Promise<IgnavOneWayResponse> {
  const response = await fetch(`${BASE_URL}/fares/one-way`, {
    method: "POST",
    headers: {
      "X-Api-Key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departureDate,
      adults: params.adults ?? 1,
      cabin_class: params.cabinClass,
      max_stops: params.maxStops,
      market: params.market,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ignav API error (${response.status}): ${error}`)
  }

  return response.json()
}

export async function searchRoundTrip(params: {
  origin: string
  destination: string
  departureDate: string
  returnDate: string
  adults?: number
  cabinClass?: string
  maxStops?: number
  market?: string
}): Promise<IgnavRoundTripResponse> {
  const response = await fetch(`${BASE_URL}/fares/round-trip`, {
    method: "POST",
    headers: {
      "X-Api-Key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      origin: params.origin,
      destination: params.destination,
      departure_date: params.departureDate,
      return_date: params.returnDate,
      adults: params.adults ?? 1,
      cabin_class: params.cabinClass,
      max_stops: params.maxStops,
      market: params.market,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ignav API error (${response.status}): ${error}`)
  }

  return response.json()
}

export async function getBookingLinks(ignavId: string) {
  const response = await fetch(`${BASE_URL}/booking-links`, {
    method: "POST",
    headers: {
      "X-Api-Key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ignav_id: ignavId }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ignav API error (${response.status}): ${error}`)
  }

  return response.json()
}

export interface IgnavAirport {
  code: string
  name: string
  city: string
  country: string
}

export async function searchAirports(
  query: string,
  limit = 10,
): Promise<IgnavAirport[]> {
  const url = new URL(`${BASE_URL}/airports`)
  url.searchParams.set("q", query)
  url.searchParams.set("limit", String(Math.min(limit, 20)))

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": getApiKey() },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Ignav API error (${response.status}): ${error}`)
  }

  return response.json()
}

const countryNames: Record<string, string> = {
  US: "Estados Unidos",
  GB: "Reino Unido",
  BR: "Brasil",
  FR: "França",
  DE: "Alemanha",
  IT: "Itália",
  ES: "Espanha",
  PT: "Portugal",
  JP: "Japão",
  CN: "China",
  AU: "Austrália",
  CA: "Canadá",
  MX: "México",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colômbia",
  PE: "Peru",
  ZA: "África do Sul",
  IN: "Índia",
  RU: "Rússia",
  NL: "Holanda",
  CH: "Suíça",
  SE: "Suécia",
  NO: "Noruega",
  DK: "Dinamarca",
  FI: "Finlândia",
  IE: "Irlanda",
  AT: "Áustria",
  BE: "Bélgica",
  SG: "Singapura",
  HK: "Hong Kong",
  KR: "Coreia do Sul",
  AE: "Emirados Árabes",
  IL: "Israel",
  TR: "Turquia",
  TH: "Tailândia",
  NZ: "Nova Zelândia",
}

export function getCountryName(code: string): string {
  return countryNames[code] ?? code
}

export function ignavToFlightOffer(itinerary: IgnavItinerary) {
  const airline = itinerary.outbound.carrier
  const airlineCode = itinerary.outbound.segments[0]?.marketing_carrier_code ?? ""

  function segmentToLeg(seg: IgnavSegment) {
    return {
      departure: {
        airport: seg.departure_airport,
        city: seg.departure_airport,
        time: seg.departure_time_local.split("T")[1]?.slice(0, 5) ?? "00:00",
        date: seg.departure_time_local.split("T")[0],
      },
      arrival: {
        airport: seg.arrival_airport,
        city: seg.arrival_airport,
        time: seg.arrival_time_local.split("T")[1]?.slice(0, 5) ?? "00:00",
        date: seg.arrival_time_local.split("T")[0],
      },
      duration: `${Math.floor(seg.duration_minutes / 60)}h ${seg.duration_minutes % 60}m`,
      carrier: seg.operating_carrier_name,
      carrierCode: seg.marketing_carrier_code,
      flightNumber: seg.flight_number,
    }
  }

  const legs = [
    {
      ...segmentToLeg(itinerary.outbound.segments[0]),
      carrier: airline,
      carrierCode: airlineCode,
    },
  ]

  if (itinerary.inbound) {
    legs.push({
      ...segmentToLeg(itinerary.inbound.segments[0]),
      carrier: itinerary.inbound.carrier,
      carrierCode: itinerary.inbound.segments[0]?.marketing_carrier_code ?? "",
    })
  }

  const totalMinutes =
    (itinerary.outbound.duration_minutes ?? 0) +
    (itinerary.inbound?.duration_minutes ?? 0)

  return {
    id: itinerary.ignav_id,
    price: itinerary.price,
    legs,
    airline,
    airlineCode,
    totalDuration: `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
    numberOfStops: Math.max(0, itinerary.outbound.segments.length - 1),
  }
}
