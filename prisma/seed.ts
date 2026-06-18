import { PrismaClient, Role } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment")
  }

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = await hash(process.env.ADMIN_PASSWORD, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Admin",
      email: adminEmail,
      passwordHash: adminPassword,
      role: Role.ADMIN,
      consentGiven: true,
      consentAt: new Date(),
    },
  })

  console.log("Admin user created:", admin.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
