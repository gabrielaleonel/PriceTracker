import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createAlertSchema } from "@/lib/validation"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ alerts })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createAlertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const alert = await prisma.priceAlert.create({
    data: {
      userId: session.user.id,
      ...parsed.data,
      departureDate: new Date(parsed.data.departureDate),
      returnDate: parsed.data.returnDate ? new Date(parsed.data.returnDate) : null,
    },
  })

  return NextResponse.json({ alert }, { status: 201 })
}
