import { Plane, Search, Bell, BarChart3, ArrowRight, Sparkles } from "lucide-react"
import { FlightSearchForm } from "@/components/flights/search-form"
import { t } from "@/lib/i18n"

export default function Home() {
  return (
    <div className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]">
        <div className="bg-grid absolute inset-0 opacity-[0.15] dark:opacity-[0.06]" />
        <div className="absolute left-1/4 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-1/4 top-24 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute left-1/3 top-80 h-48 w-48 rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-9rem)] max-w-6xl flex-col justify-center gap-16">
        <section>
          <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-4 py-1.5 text-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="font-semibold text-primary">Novo!</span>
                <span className="text-muted-foreground">Compare rotas e configure alertas automaticamente</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
                {t("home.title")}
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                {t("home.subtitle")}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#buscar"
                  className="group inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97]"
                >
                  Buscar passagens
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
                <a
                  href="/airports"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary hover:shadow-md active:scale-[0.97]"
                >
                  <Plane className="mr-2 h-4 w-4" />
                  Ver aeroportos
                </a>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative rounded-[2rem] border border-border/60 bg-card p-6 shadow-2xl shadow-sky-500/5 sm:p-8 transition-all duration-300">
                <div className="absolute right-4 top-4 hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500/70" />
                    <span className="text-[0.7rem] font-medium text-muted-foreground">AO VIVO</span>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-foreground">Busque rápido e com confiança</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Selecione origem, destino, datas e passageiros em um formulário claro e responsivo.
                </p>
                <div className="mt-6" id="buscar">
                  <FlightSearchForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-3">
          <div className="group rounded-[1.5rem] border border-border/60 bg-card/80 p-6 text-center shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/5">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">Compare preços</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Busque em múltiplas companhias e encontre a melhor oferta para sua viagem.
            </p>
          </div>

          <div className="group rounded-[1.5rem] border border-border/60 bg-card/80 p-6 text-center shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/5">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/80 text-secondary-foreground transition-colors duration-300 group-hover:bg-secondary group-hover:text-secondary-foreground">
              <Bell className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">Alertas de preço</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Receba notificações sempre que o preço da sua rota favorita cair.
            </p>
          </div>

          <div className="group rounded-[1.5rem] border border-border/60 bg-card/80 p-6 text-center shadow-sm shadow-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/5">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-foreground">Histórico de preços</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Acompanhe a variação de valores e escolha o melhor momento para comprar.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
