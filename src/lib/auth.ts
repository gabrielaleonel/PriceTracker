import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import { loginSchema } from "./validation"
import type { Role } from "@prisma/client"

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    async authorize(credentials) {
      const parsed = loginSchema.safeParse(credentials)
      if (!parsed.success) return null

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
      })

      if (!user?.passwordHash || user.deletedAt) return null

      const isValid = await compare(parsed.data.password, user.passwordHash)
      if (!isValid) return null

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role,
      }
    },
  }),
]

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google)
}
if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  providers.push(GitHub)
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.role = (user as unknown as { role: Role }).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = (token.role as Role) ?? "USER"
      }
      return session
    },
  },
})
