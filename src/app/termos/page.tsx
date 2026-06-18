import type { Metadata } from "next"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Termos de Uso — PriceTracker",
}

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-8">
      <div className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Termos de Uso</h1>
            <p className="text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Section title="1. Serviço">
          <p>O PriceTracker é uma ferramenta de comparação de preços de passagens aéreas que utiliza a API Ignav para buscar ofertas. Não vendemos passagens nem atuamos como agência de viagens.</p>
        </Section>

        <Section title="2. Conta de Usuário">
          <p>Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas na sua conta.</p>
        </Section>

        <Section title="3. Uso Aceitável">
          <p>Você concorda em não utilizar o serviço para:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex items-start gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />Realizar buscas automatizadas em excesso (abuso da API)</li>
            <li className="flex items-start gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />Violar leis ou regulamentos aplicáveis</li>
            <li className="flex items-start gap-2 text-sm"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />Interferir no funcionamento do serviço</li>
          </ul>
        </Section>

        <Section title="4. Preços">
          <p>Os preços exibidos são fornecidos pela Ignav e podem não refletir o preço final da compra. Recomendamos verificar o preço no site da companhia aérea antes de comprar.</p>
        </Section>

        <Section title="5. Limitação de Responsabilidade">
          <p>O PriceTracker não se responsabiliza por diferenças de preço, disponibilidade de voos ou quaisquer danos decorrentes do uso da ferramenta.</p>
        </Section>

        <Section title="6. Alterações">
          <p>Estes termos podem ser alterados a qualquer momento. Notificaremos usuários registrados sobre mudanças significativas.</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-5">
      <h2 className="text-lg font-bold font-heading text-foreground mb-2">{title}</h2>
      <div className="text-sm leading-6 text-muted-foreground space-y-1">{children}</div>
    </div>
  )
}
