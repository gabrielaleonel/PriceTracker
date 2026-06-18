import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendPasswordResetEmail } from "@/lib/mail"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.deletedAt) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires },
    })

    await sendPasswordResetEmail(email, token).catch(() => {})

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
