import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { LocaleProvider } from "@/components/shared/locale-provider"
import { Header } from "@/components/shared/header"
import { Toaster } from "sonner"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PriceTracker — Compare preços de passagens aéreas",
  description:
    "Encontre as melhores ofertas de passagens aéreas. Compare preços, crie alertas e economize em suas viagens.",
  keywords: ["passagens aéreas", "comparar preços", "voos baratos", "PriceTracker"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <SessionProvider>
          <ThemeProvider defaultTheme="system" storageKey="theme">
            <LocaleProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Toaster richColors closeButton position="bottom-right" />
            <footer className="border-t border-border bg-background/80 py-6 text-center text-sm text-muted-foreground">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p>&copy; {new Date().getFullYear()} PriceTracker. Todos os direitos reservados.</p>
                <div className="flex gap-4">
                  <a href="/privacidade" className="hover:text-foreground transition-colors">Privacidade</a>
                  <a href="/termos" className="hover:text-foreground transition-colors">Termos</a>
                </div>
              </div>
            </footer>
            </LocaleProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
