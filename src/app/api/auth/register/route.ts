import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { name, email, password } = parsed.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 },
      )
    }

    const passwordHash = await hash(password, 12)

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        consentGiven: true,
        consentAt: new Date(),
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("[REGISTER]", error)
    return NextResponse.json(
      { error: "Erro ao criar conta. Tente novamente." },
      { status: 500 },
    )
  }
}
