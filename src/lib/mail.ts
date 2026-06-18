import nodemailer from "nodemailer"

function getTransport() {
  const host = process.env.SMTP_HOST
  if (!host) return null
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

const transport = getTransport()

export async function sendPasswordResetEmail(email: string, token: string) {
  if (!transport) return
  const resetUrl = `${process.env.AUTH_URL}/reset-password?token=${token}`
  await transport.sendMail({
    from: `"PriceTracker" <${process.env.SMTP_FROM ?? "noreply@example.com"}>`,
    to: email,
    subject: "Redefinição de senha",
    html: `<p>Clique no link abaixo para redefinir sua senha:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Este link expira em 1 hora.</p>`,
  })
}

export async function sendAlertNotificationEmail(email: string, origin: string, destination: string, bestPrice: number, maxPrice: number) {
  if (!transport) return
  await transport.sendMail({
    from: `"PriceTracker" <${process.env.SMTP_FROM ?? "noreply@example.com"}>`,
    to: email,
    subject: `Passagem encontrada: ${origin} → ${destination} por R$ ${bestPrice.toFixed(0)}`,
    html: `<p>O preço do voo <strong>${origin} → ${destination}</strong> caiu!</p><p>Preço encontrado: <strong>R$ ${bestPrice.toFixed(0)}</strong></p><p>Seu limite era: R$ ${maxPrice.toFixed(0)}</p><p><a href="${process.env.AUTH_URL}/dashboard">Ver no dashboard</a></p>`,
  })
}
