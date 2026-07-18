# Plano de Implementação: Sistema de Gestão de Hábitos

**Branch**: `001-gestao-de-habitos` | **Data**: 2026-07-18 | **Spec**: [spec.md](./spec.md)

**Input**: Especificação em `/specs/001-gestao-de-habitos/spec.md`

## Summary

Sistema web de gestão de hábitos com autenticação por e-mail e senha, no qual
cada usuário cria e gerencia seus próprios hábitos, marca conclusões por dia e
acompanha métricas de conclusões por dia em um dashboard. O projeto parte de um
app Next.js 16 recém-criado (apenas Next/React/Tailwind instalados): o plano
inclui o **setup** de Prisma 7 + SQLite, Better Auth, next-safe-action e
shadcn/ui, conforme `prompt.md`. A abordagem técnica isola o acesso a dados em
`data/`, expõe mutações via Server Actions protegidas em `actions/` e escopa
todos os dados ao usuário autenticado, atendendo aos requisitos de privacidade
e isolamento. Detalhes em [research.md](./research.md),
[data-model.md](./data-model.md) e [contracts/](./contracts/).

## Technical Context

**Language/Version**: TypeScript 5 (strict)

**Primary Dependencies**: Next.js 16.2.10 (App Router) · React 19.2.4 · Prisma 7
· Better Auth · next-safe-action · Zod · shadcn/ui (Tailwind v4) · lucide-react

**Storage**: SQLite via Prisma 7 (`DATABASE_URL="file:./dev.db"`)

**Testing**: Análise estática — `tsc --noEmit` + ESLint — e validação manual
(Princípio VI; sem test runner e sem `next dev` como verificação)

**Target Platform**: Navegador web (aplicação Next.js server-side + client)

**Project Type**: Aplicação web (Next.js App Router, projeto único)

**Performance Goals**: Interações de marcar/desmarcar refletidas sem recarga
manual (SC-003); métricas do dashboard com 100% de precisão (SC-004). Sem metas
de throughput específicas nesta versão.

**Constraints**: pnpm exclusivamente; sem cores hard-coded (tokens de tema);
`rem` em vez de `px`; sem comentários em código; Prisma nunca chamado de
componentes; toda mutação via `protectedActionClient`.

**Scale/Scope**: Uso individual (cada usuário gerencia os próprios dados); 4
histórias de usuário; ~4 telas (login/cadastro, hábitos, semana, dashboard).

## Constitution Check

*GATE: deve passar antes da Fase 0. Reavaliado após a Fase 1.*

| Princípio da Constituição | Como o plano cumpre | Status |
|---|---|---|
| I. Component-First UI (shadcn/ui) | Setup do shadcn/ui; todos os componentes vêm de `components/ui`; wrapper de página em `components/ui/page.tsx`; cores só via tokens de `app/globals.css`; `Sheet` usa o botão de fechar nativo | ✅ |
| II. Data Access Isolation | Todo acesso ao Prisma isolado em `data/`; componentes e actions nunca importam Prisma | ✅ |
| III. Server Actions via next-safe-action | Ações em `actions/` com `protectedActionClient`; cliente usa `useAction`; validação de auth + propriedade em cada ação | ✅ |
| IV. TypeScript, Clean Code & DRY | TS strict; kebab-case; `rem`; nomes descritivos; sem comentários; funções/`data` reutilizáveis | ✅ |
| V. Framework & Tooling | `next/image` para imagens; ícones `lucide-react`; ESLint zerado; `Footer` checado no `layout.tsx` antes de inserir | ✅ |
| VI. Manual Verification Only | Verificação por `tsc` + ESLint + revisão manual; nunca `next dev`; pnpm exclusivo | ✅ |
| Technology Stack | pnpm, React 19, Next 16, Prisma 7, shadcn/ui, Better Auth — sem desvio de stack | ✅ |

**Resultado**: PASS. Um ponto de atenção (arquivo-base de referência ausente)
está registrado em Complexity Tracking; não constitui desvio de princípio.

## Project Structure

### Documentation (this feature)

```text
specs/001-gestao-de-habitos/
├── plan.md              # Este arquivo (/speckit-plan)
├── research.md          # Fase 0
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1
├── contracts/           # Fase 1
│   ├── auth.md
│   ├── data-access.md
│   └── server-actions.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Fase 2 (/speckit-tasks — não criado aqui)
```

### Source Code (repository root)

O código-fonte fica na raiz do repositório (`C:\Users\debor\projetos\habitos`),
onde já existe o app Next.js. Os artefatos de spec ficam em `habitos/specs/`.

```text
app/
├── (auth)/
│   ├── login/page.tsx
│   └── sign-up/page.tsx
├── (app)/
│   ├── layout.tsx              # valida sessão; redireciona p/ /login (FR-007)
│   ├── dashboard/page.tsx      # métricas por dia (US4)
│   ├── habitos/page.tsx        # lista/gestão de hábitos (US2)
│   └── semana/page.tsx         # marcação diária da semana (US3)
├── api/
│   └── auth/[...all]/route.ts  # handler Better Auth
├── globals.css                 # tokens de tema (shadcn)
├── layout.tsx
└── page.tsx                    # landing / redireciona conforme sessão

components/
├── ui/                         # componentes shadcn + page.tsx (wrapper)
└── habitos/                    # componentes de feature (client) reutilizáveis

data/
├── habits.ts
├── completions.ts
└── dashboard.ts

actions/
├── create-habit.ts
├── update-habit.ts
├── delete-habit.ts
└── toggle-completion.ts

lib/
├── prisma.ts                   # singleton do Prisma Client
├── auth.ts                     # instância Better Auth (servidor)
├── auth-client.ts              # cliente Better Auth (browser)
└── action-client.ts            # actionClient + protectedActionClient

prisma/
└── schema.prisma               # User/Session/Account/Verification + Habit/HabitCompletion
```

**Structure Decision**: projeto único (aplicação web Next.js App Router) na raiz
do repositório. Rotas autenticadas agrupadas em `(app)` com verificação de
sessão centralizada no `layout.tsx` do grupo; rotas de autenticação em `(auth)`.
A separação `data/` (acesso a dados) · `actions/` (mutações) · `components/ui`
(apresentação) reflete diretamente os Princípios I–III da constituição.

## Complexity Tracking

> Sem violações de princípios. Registro de um ponto de atenção que exige
> decisão explícita durante a implementação.

| Ponto de atenção | Por que existe | Encaminhamento |
|---|---|---|
| A constituição referencia `@actions/create-booking.ts` como base estrutural das Server Actions, mas o arquivo não existe no projeto | O app está em estado inicial; nenhum exemplo de ação foi criado ainda | `actions/create-habit.ts` será a primeira ação e passa a ser a referência canônica do padrão next-safe-action, seguindo a documentação oficial da biblioteca |
| CLAUDE.md referencia `@prisma/schema.prisma`, `@data`, `@lib/action-client.ts` e `@components/ui/page.tsx` que ainda não existem | Setup do stack ainda não foi executado | Criados durante a fase de setup descrita em research.md/quickstart.md |
