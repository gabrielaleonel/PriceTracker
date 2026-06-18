import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      consentGiven: true,
      createdAt: true,
      deletedAt: true,
      _count: { select: { alerts: true, searches: true } },
    },
  })

  return NextResponse.json({ users })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  const { userId, role } = await request.json()
  if (!userId || !["USER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role },
  })

  return NextResponse.json({ success: true })
}
