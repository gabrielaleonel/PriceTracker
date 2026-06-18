import { NextResponse } from "next/server"
import { getBookingLinks } from "@/lib/ignav"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ignavId } = body

    if (!ignavId || typeof ignavId !== "string") {
      return NextResponse.json({ error: "ignavId é obrigatório" }, { status: 400 })
    }

    const data = await getBookingLinks(ignavId)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[BOOKING_LINKS]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar links de compra" },
      { status: 500 },
    )
  }
}
