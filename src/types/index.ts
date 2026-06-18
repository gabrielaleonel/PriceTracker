import type { Role } from "@prisma/client"

export interface SearchParams {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
  currency: "BRL" | "USD" | "EUR"
  cabinClass?: "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST"
}

export interface FlightOffer {
  id: string
  price: {
    amount: number
    currency: string
  }
  legs: FlightLeg[]
  airline: string
  airlineCode: string
  totalDuration: string
  numberOfStops: number
}

export interface FlightLeg {
  departure: {
    airport: string
    city: string
    time: string
    date: string
  }
  arrival: {
    airport: string
    city: string
    time: string
    date: string
  }
  duration: string
  carrier: string
  carrierCode: string
  flightNumber: string
}

export interface UserSession {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: Role
}

declare module "next-auth" {
  interface Session {
    user: UserSession
  }
}
