import { PrismaClient, Role } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await hash("Admin@123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@pricetracker.dev" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@pricetracker.dev",
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
