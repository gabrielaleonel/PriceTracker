import Link from "next/link"
import { Plane, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/60">
        <Plane className="h-10 w-10 text-primary/60" />
      </div>
      <h1 className="text-7xl font-bold font-heading text-foreground tracking-tight">404</h1>
      <p className="mt-4 text-xl font-medium text-foreground">Página não encontrada</p>
      <p className="mt-2 text-muted-foreground max-w-md">
        Parece que o destino que você procura não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.97]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao início
      </Link>
    </div>
  )
}
