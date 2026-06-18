import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params

  const alert = await prisma.priceAlert.findUnique({ where: { id } })
  if (!alert || alert.userId !== session.user.id) {
    return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 })
  }

  await prisma.priceAlert.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const active = body.active as boolean

  const alert = await prisma.priceAlert.findUnique({ where: { id } })
  if (!alert || alert.userId !== session.user.id) {
    return NextResponse.json({ error: "Alerta não encontrado" }, { status: 404 })
  }

  const updated = await prisma.priceAlert.update({
    where: { id },
    data: { active },
  })

  return NextResponse.json({ alert: updated })
}
