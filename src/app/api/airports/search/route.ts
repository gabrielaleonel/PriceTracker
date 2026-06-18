import { NextResponse } from "next/server"
import { searchAirports } from "@/lib/ignav"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

export async function GET(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`airports:${ip}`, { maxRequests: 120, windowMs: 60000 })

  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")

  if (!q || q.length < 2) {
    return NextResponse.json({ airports: [] })
  }

  try {
    const airports = await searchAirports(q)
    return NextResponse.json({ airports })
  } catch (error) {
    console.error("[AIRPORTS_SEARCH]", error)
    return NextResponse.json(
      { error: "Erro ao buscar aeroportos" },
      { status: 500 },
    )
  }
}
