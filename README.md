# PriceTracker ✈️

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![NextAuth](https://img.shields.io/badge/NextAuth-v5-beta-green?logo=auth0)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)
![bcryptjs](https://img.shields.io/badge/bcryptjs-12_rounds-FF6B6B)
![Zod](https://img.shields.io/badge/Zod-4-3068B7?logo=zod)
![CodeQL](https://img.shields.io/badge/CodeQL-Passing-28A745?logo=github)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

**PT** | Monitor de preços de passagens aéreas com alertas automáticos, autenticação segura, controle de acesso por papéis e conformidade LGPD/GDPR.

**EN** | Flight price tracker with automatic alerts, secure authentication, role-based access control, and LGPD/GDPR compliance.

---

## 📋 Sobre | About

**PT** | PriceTracker é uma aplicação full-stack que permite buscar passagens aéreas, criar alertas de preço e receber notificações quando o valor da sua rota favorita cair. O projeto foi desenvolvido com foco em segurança desde a concepção — incluindo hash robusto de senhas, proteção contra ataques comuns (SQL Injection, XSS, Clickjacking), validação rigorosa de entrada, rate limiting, e um pipeline de CI/CD com varredura de segredos e análise estática de segurança.

**EN** | PriceTracker is a full-stack application for searching flights, creating price alerts, and receiving notifications when your favorite route drops in price. The project was built with security in mind from the ground up — including robust password hashing, protection against common attacks (SQL Injection, XSS, Clickjacking), strict input validation, rate limiting, and a CI/CD pipeline with secret scanning and static security analysis.

---

## 🛡️ Segurança | Security

Este projeto foi desenvolvido com segurança como prioridade. Abaixo detalhamos cada camada de proteção implementada.

This project was built with security as a priority. Below we detail every implemented protection layer.

---

### 🔐 Autenticação & Autorização | Authentication & Authorization

| Medida | Detalhes |
|--------|----------|
| **NextAuth v5** | Autenticação via credentials (email/senha) + OAuth condicional (Google e GitHub) |
| **JWT Strategy** | Sessão stateless sem consulta ao banco a cada requisição; role do usuário embutida no token |
| **bcryptjs (12 rounds)** | Senhas hash com fator de custo 12 (~250ms por hash) — **nunca armazenadas em plaintext** |
| **RBAC** | Controle de acesso baseado em papéis (`USER` / `ADMIN`) verificado no servidor e no cliente |
| **Middleware** | Rotas públicas explícitas (`/login`, `/register`, etc.); demais exigem autenticação com redirect |
| **Isolamento de dados** | Toda query é scoped ao `userId` da sessão — nenhum usuário acessa dados de outro |

**Código relevante** | Relevant code:
- `src/lib/auth.ts` — Configuração NextAuth com JWT + role injection
- `src/proxy.ts` — Middleware de proteção de rotas + security headers
- `src/app/api/admin/route.ts` — Verificação server-side de role ADMIN (403 se não autorizado)

---

### 🛡️ Proteção Contra Ataques | Attack Prevention

#### SQL Injection
- **Prevenido pelo Prisma ORM** — todas as queries são parametrizadas; nenhuma SQL raw no código.

#### XSS (Cross-Site Scripting)
- **React JSX** — auto-escape de saída
- **Content-Security-Policy**: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'`
  > ⚠️ `unsafe-inline` e `unsafe-eval` são exigidos pelo Next.js para hot-reload em desenvolvimento. Em produção, o Next.js suporta Strict CSP sem `unsafe-inline`.

#### Clickjacking
- **`X-Frame-Options: DENY`** — impede que a aplicação seja carregada em iframes

#### MIME Sniffing
- **`X-Content-Type-Options: nosniff`** — força o navegador a respeitar o Content-Type declarado

#### HTTPS / HSTS
- **`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`** — 2 anos de HSTS
- **`DATABASE_URL` com `sslmode=require`** — conexão criptografada com o banco

#### Referrer Leakage
- **`Referrer-Policy: strict-origin-when-cross-origin`**

#### Feature Restriction
- **`Permissions-Policy: camera=(), microphone=(), geolocation=()`**

**Código relevante** | Relevant code:
- `src/proxy.ts:14-38` — Todos os security headers aplicados via middleware

---

### 🚦 Rate Limiting

| Endpoint | Limite | Janela | Implementação |
|----------|--------|--------|---------------|
| Todas as rotas API (exceto auth) | 60 requisições | 60 segundos | Sliding window in-memory |
| Busca de aeroportos | 120 requisições | 60 segundos | Sliding window in-memory |

- Headers de resposta: `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- IP extraído via `X-Forwarded-For` (compatível com proxies reversos)

**Código relevante** | Relevant code:
- `src/lib/rate-limit.ts` — Implementação do Rate Limiter
- `src/proxy.ts:40-52` — Aplicação no middleware

---

### 📝 Validação de Entrada | Input Validation

Todas as entradas de usuário são validadas com **Zod** antes do processamento:

| Schema | Campos | Validações |
|--------|--------|------------|
| `registerSchema` | name, email, password, confirmPassword, consentGiven | name (2-100), email (formato + lowercase), password (min 8, maiúscula + minúscula + dígito), refine match |
| `loginSchema` | email, password | Email formato + lowercase, password não vazio |
| `flightSearchSchema` | origin, destination, departureDate, returnDate?, passengers, currency, cabinClass? | Airport (3 chars uppercase), date (regex YYYY-MM-DD), passengers (1-9), currency enum |
| `createAlertSchema` | origin, destination, maxPrice, currency, dates | Mesmas regras + maxPrice positivo |

**Código relevante** | Relevant code:
- `src/lib/validation.ts` — Todos os schemas Zod
- `src/__tests__/validation.test.ts` — Testes unitários (200+ linhas)

---

### 🔄 Fluxo Seguro de Recuperação de Senha | Secure Password Reset

1. Usuário solicita reset → **sempre retorna `{ success: true }`** (previne enumeração de usuários)
2. Token criptograficamente seguro: `crypto.randomBytes(32).toString("hex")` (64 caracteres hex)
3. Token **single-use** com expiração de **1 hora**
4. Após o reset, token é **anulado no banco** (`resetToken: null`)
5. Nova senha hash com bcryptjs (12 rounds)
6. Erros de email são capturados silenciosamente — sem vazar informação sobre o destinatário

**Código relevante** | Relevant code:
- `src/app/api/auth/forgot-password/route.ts` — Solicitação
- `src/app/api/auth/reset-password/route.ts` — Reset com validação de token
- `src/lib/mail.ts` — Envio de email SMTP (STARTTLS / TLS)

---

### 🗑️ Privacidade e Conformidade | Privacy & Compliance (LGPD/GDPR)

- **Consentimento explícito**: Checkbox obrigatório no registro, validado por Zod (`consentGiven: true`)
- **Soft-delete**: Contas são desativadas com `deletedAt`, não removidas fisicamente
- **Cascade**: Deleção da conta remove alerts, searches, sessions e accounts associados
- **Páginas de política**: `/privacidade` e `/termos` com conteúdo completo
- **Registro de consentimento**: `consentAt` timestamp armazenado no banco

**Código relevante** | Relevant code:
- `prisma/schema.prisma` — Esquema com campos de consentimento e soft-delete
- `src/app/api/user/consent/route.ts` — Atualização de consentimento
- `src/app/api/user/delete/route.ts` — Soft-delete de conta

---

### 🔒 Segurança no CI/CD

| Ferramenta | Função |
|------------|--------|
| **ESLint** | Análise de qualidade e segurança de código |
| **TypeScript** | Type safety — previne tipos inseguros |
| **npm audit** | Varredura de vulnerabilidades em dependências (`--audit-level=high`) |
| **TruffleHog** | Detecta secrets e credenciais hardcoded no repositório |
| **CodeQL** | Análise estática de segurança com queries `security-extended` + `security-and-quality` |
| **Dependabot** | Atualizações automáticas semanais de dependências npm + Actions |

**Código relevante** | Relevant code:
- `.github/workflows/ci.yml` — Pipeline CI completo
- `.github/codeql.yml` — Configuração CodeQL
- `.github/dependabot.yml` — Configuração Dependabot

---

### ⚠️ Vulnerabilidades Conhecidas & Próximos Passos | Known Vulnerabilities & Roadmap

Transparência é parte da segurança. Abaixo, os gaps identificados que planejamos endereçar:

| Gap | Risco | Solução Planejada |
|-----|-------|-------------------|
| **Sem rate limiting em auth** (`/api/auth/*`) | Brute-force em login/register/forgot-password | Adicionar rate limiting com Redis ou Upstash |
| **Token de reset na URL** | Vazamento via Referer header ou logs do servidor | Implementar fluxo com token no body + página intermediária |
| **CSP `unsafe-inline` e `unsafe-eval`** | Enfraquece a CSP | Migrar para Strict CSP (suportado pelo Next.js) |
| **Rate limiting in-memory** | Perdido ao reiniciar servidor; não escala horizontalmente | Substituir por Redis |
| **Sem Zod validation em forgot-password/reset-password PATCH** | Validação mais fraca que register | Adicionar schemas Zod completos |
| **Sem 2FA / MFA** | Conta protegida apenas por senha | Adicionar TOTP (ex: speakeasy) |
| **Sem endpoint de troca de senha** | Usuário logado não pode alterar senha sem reset | Criar `POST /api/user/change-password` |
| **Sem CSRF tokens explícitos em APIs** | Apenas NextAuth protege formulários | Adicionar double-submit cookie pattern |

---

## 🧱 Stack | Tech Stack

| Categoria | Tecnologia | Badge |
|-----------|-----------|-------|
| **Framework** | Next.js 16 (App Router, Turbopack) | ![Next.js](https://img.shields.io/badge/-black?logo=next.js) |
| **Linguagem** | TypeScript 5 | ![TypeScript](https://img.shields.io/badge/-blue?logo=typescript) |
| **Autenticação** | NextAuth v5 (beta) + bcryptjs | ![Auth](https://img.shields.io/badge/-green?logo=auth0) |
| **ORM** | Prisma 5 | ![Prisma](https://img.shields.io/badge/-2D3748?logo=prisma) |
| **Banco de Dados** | PostgreSQL 15 | ![PostgreSQL](https://img.shields.io/badge/-4169E1?logo=postgresql) |
| **Validação** | Zod 4 | ![Zod](https://img.shields.io/badge/-3068B7?logo=zod) |
| **UI** | Tailwind CSS 4 + shadcn/ui + Lucide | ![Tailwind](https://img.shields.io/badge/-06B6D4?logo=tailwindcss) |
| **Estado** | Zustand | ![Zustand](https://img.shields.io/badge/-orange) |
| **Email** | Nodemailer (SMTP) | ![Email](https://img.shields.io/badge/-EA4335?logo=gmail) |
| **Testes** | Vitest + Testing Library | ![Vitest](https://img.shields.io/badge/-6E9F18?logo=vitest) |
| **CI/CD** | GitHub Actions + CodeQL + Dependabot + TruffleHog | ![GitHub Actions](https://img.shields.io/badge/-2088FF?logo=githubactions) |

---

## 👣 Passo a Passo do Desenvolvimento | Development Step-by-Step

O que fizemos, em ordem:

1. **Inicialização do projeto** — `create-next-app` com TypeScript + Tailwind + App Router
2. **Configuração do banco** — Prisma + PostgreSQL (UUID, Citext, cascade, soft-delete, role enum)
3. **Autenticação** — NextAuth v5 com credentials provider + bcryptjs (12 rounds) + JWT + role injection
4. **Middleware de segurança** — Proteção de rotas + rate limiting + security headers (CSP, HSTS, etc.)
5. **Validação de entrada** — Schemas Zod para register, login, search, alerts + testes unitários
6. **Fluxo de recuperação de senha** — Token criptográfico single-use com expiração de 1h + prevenção de enumeração
7. **CRUD de alertas** — Alertas de preço com verificação de ownership por usuário
8. **Painel administrativo** — RBAC com role ADMIN verificado server-side e client-side
9. **Privacidade LGPD/GDPR** — Consentimento explícito, soft-delete, páginas de termos e privacidade
10. **Internacionalização** — Suporte PT/EN com separação server/client components
11. **CI/CD** — GitHub Actions com ESLint + TypeScript + Build + npm audit + TruffleHog + CodeQL
12. **Dependabot** — Configuração de atualizações automáticas semanais com label de segurança

---

## 📦 Instalação | Setup

```bash
# Clone o repositório | Clone the repository
git clone https://github.com/seu-usuario/pricetracker.git
cd pricetracker

# Instale as dependências | Install dependencies
npm install

# Copie as variáveis de ambiente | Copy environment variables
cp .env.example .env
# → Preencha as variáveis no .env (veja seção abaixo)

# Configure o banco | Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Inicie o servidor de desenvolvimento | Start dev server
npm run dev
```

Acesse | Open: [http://localhost:3000](http://localhost:3000)

---

## 🔐 Variáveis de Ambiente | Environment Variables

```env
# Banco de Dados | Database
DATABASE_URL="postgresql://user:password@host:5432/pricetracker?sslmode=require"

# Autenticação | Auth
AUTH_SECRET="generate-with-openssl-rand-hex-32"
AUTH_URL="http://localhost:3000"

# OAuth (opcional) | OAuth (optional)
# AUTH_GOOGLE_ID=
# AUTH_GOOGLE_SECRET=
# AUTH_GITHUB_ID=
# AUTH_GITHUB_SECRET=

# API de Voos | Flight API
IGNAV_API_KEY="sua-chave-aqui"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="seu-email@gmail.com"
SMTP_PASS="sua-senha-de-app"
SMTP_FROM="noreply@pricetracker.dev"

# Segurança do CRON | CRON Security
CRON_SECRET="token-seguro-para-cron"
```

---

## 📄 Licença | License

MIT © 2024
