import type { Metadata } from "next"
import { Shield } from "lucide-react"

export const metadata: Metadata = {
  title: "Política de Privacidade — PriceTracker",
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-8">
      <div className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading">Política de Privacidade</h1>
            <p className="text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <Section title="1. Dados Coletados">
          <p>Coletamos apenas os dados estritamente necessários para o funcionamento do serviço:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              Nome e email (criação de conta)
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              Senha (armazenada de forma criptografada com bcrypt)
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              Histórico de buscas de passagens
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              Alertas de preço criados por você
            </li>
          </ul>
        </Section>

        <Section title="2. Finalidade do Tratamento">
          <p>Seus dados são utilizados exclusivamente para:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              Autenticação e gerenciamento da sua conta
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              Exibição de histórico de buscas
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              Notificações de alertas de preço
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              Melhoria da experiência do usuário
            </li>
          </ul>
        </Section>

        <Section title="3. Compartilhamento de Dados">
          <p>Não compartilhamos seus dados pessoais com terceiros. As buscas de passagens são realizadas através da API Ignav, que recebe apenas os parâmetros da busca (origem, destino, datas), sem identificar você.</p>
        </Section>

        <Section title="4. Armazenamento e Segurança">
          <p>Seus dados são armazenados em servidores seguros (Neon/PostgreSQL) com criptografia em trânsito (TLS) e em repouso. Senhas são armazenadas usando bcrypt com fator de custo 12.</p>
        </Section>

        <Section title="5. Seus Direitos (LGPD)">
          <p>Você tem direito a:</p>
          <ul className="mt-2 space-y-1.5">
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              <strong>Confirmação e acesso:</strong> Saber quais dados tratamos sobre você
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              <strong>Correção:</strong> Corrigir dados incompletos ou desatualizados
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              <strong>Exclusão:</strong> Solicitar a exclusão dos seus dados (conta e alertas)
            </li>
            <li className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              <strong>Portabilidade:</strong> Solicitar uma cópia dos seus dados em formato JSON
            </li>
          </ul>
        </Section>

        <Section title="6. Exclusão de Conta">
          <p>Você pode solicitar a exclusão da sua conta a qualquer momento através do dashboard. Seus dados serão removidos ou anonimizados em até 30 dias.</p>
        </Section>

        <Section title="7. Retenção de Dados">
          <p>Mantemos seus dados enquanto sua conta estiver ativa. Após solicitação de exclusão, os dados são mantidos por 180 dias para fins de auditoria e depois permanentemente removidos.</p>
        </Section>

        <Section title="8. Cookies">
          <p>Utilizamos cookies estritamente necessários para autenticação e funcionamento do serviço. Não utilizamos cookies de rastreamento ou publicidade.</p>
        </Section>

        <Section title="9. Contato">
          <p>Para exercer seus direitos ou tirar dúvidas, entre em contato pelo email: privacidade@pricetracker.dev</p>
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
