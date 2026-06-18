import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: "Token e senha são obrigatórios" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Senha deve ter pelo menos 8 caracteres" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } })
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    const passwordHash = await hash(password, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}
