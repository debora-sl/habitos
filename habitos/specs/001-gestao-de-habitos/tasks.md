---
description: "Lista de tarefas para implementação do Sistema de Gestão de Hábitos"
---

# Tasks: Sistema de Gestão de Hábitos

**Input**: Documentos de design em `habitos/specs/001-gestao-de-habitos/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Não incluídos. O Princípio VI da constituição define verificação por
análise estática (`tsc --noEmit` + ESLint) e validação manual (quickstart.md);
não há test runner no escopo.

**Organization**: Tarefas agrupadas por história de usuário (US1–US4) para
implementação e validação independentes.

## Convenções de caminho

Código-fonte na **raiz do repositório** (`C:\Users\debor\projetos\habitos`):
`app/`, `components/`, `data/`, `actions/`, `lib/`, `prisma/`. Os artefatos de
spec ficam em `habitos/specs/001-gestao-de-habitos/`.

## Formato: `[ID] [P?] [Story?] Descrição com caminho`

- **[P]**: pode rodar em paralelo (arquivos distintos, sem dependência pendente)
- **[Story]**: história de usuário à qual a tarefa pertence (US1–US4)

> **⚠️ Reconciliação de artefatos (aplicar durante a implementação)**: o
> `spec.md` é a fonte de verdade e diverge de `data-model.md`/`contracts/` em
> quatro pontos. As tarefas abaixo seguem o `spec.md`:
> 1. **Tamanho do nome**: `spec` FR-010 = 1–50 chars (não 1–100).
> 2. **Remoção de hábito**: `spec` FR-013/FR-023 = **arquivar** (soft-delete)
>    preservando conclusões nas métricas — **não** apagar em cascade. Exige
>    campo `archivedAt DateTime?` em `Habit`.
> 3. **Unicidade do nome**: `spec` FR-021 = nome único entre hábitos **ativos**
>    do usuário (validação na camada de aplicação).
> 4. **Data futura**: `spec` FR-022 = bloquear conclusão em data futura na UI e
>    no servidor.
>
> **⚠️ Divergências do `research.md` descobertas na implementação (Fases 1–2,
> Context7 seguiu indisponível)**: o Prisma 7 instalado (`7.8.0`) muda pontos
> assumidos no research:
> 1. **Generator `prisma-client` (não `prisma-client-js`)**: emite arquivos
>    `.ts` fonte (sem `package.json`/`index`) em `lib/generated/prisma`; o
>    import correto é `@/lib/generated/prisma/client`, não o diretório.
> 2. **Client exige Driver Adapter — não há mais conexão só por `DATABASE_URL`
>    no client**: `PrismaClient` requer `adapter` (ou `accelerateUrl`). Para
>    SQLite local, usa-se `@prisma/adapter-better-sqlite3`
>    (`new PrismaBetterSqlite3({ url: process.env.DATABASE_URL })`) em
>    `lib/prisma.ts`. `prisma.config.ts` (novo em Prisma 7) ainda concentra a
>    config de `DATABASE_URL` para o CLI (migrate/generate).
> 3. **Better Auth 1.6.x divide o adapter Prisma em pacote próprio**
>    `@better-auth/prisma-adapter` (instalado como dependência); o import
>    público segue sendo `better-auth/adapters/prisma` (re-exporta o pacote).
> 4. **`@better-auth/cli` está uma major atrás** (`1.4.22` estável vs.
>    `better-auth@1.6.23`) — não há release do CLI compatível 1.6.x ainda;
>    usado mesmo assim pois `generate` funcionou corretamente contra o schema.
> 5. **shadcn `style: base-nova`**: componente `form` (react-hook-form) foi
>    substituído por `field` no registro atual — ver nota da T005.

---

## Phase 1: Setup (Infraestrutura compartilhada)

**Purpose**: Inicializar o stack sobre o app Next.js já existente.

- [X] T001 Instalar dependências de runtime com pnpm (`prisma`, `@prisma/client`, `better-auth`, `next-safe-action`, `zod`) e registrar em `package.json`
- [X] T002 [P] Criar `.env` na raiz com `DATABASE_URL="file:./dev.db"`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL="http://localhost:3000"`
- [X] T003 Inicializar Prisma com SQLite (`pnpm dlx prisma init --datasource-provider sqlite`) e ajustar `datasource`/`generator` em `prisma/schema.prisma`
- [X] T004 Inicializar shadcn/ui (`pnpm dlx shadcn@latest init`) gerando `components.json` e os tokens de tema em `app/globals.css`
- [X] T005 [P] Adicionar componentes shadcn em `components/ui/` (`button`, `input`, `label`, `card`, `dialog`, `sheet`, `checkbox`, `sonner`, `chart`, `dropdown-menu`, `skeleton`; `field` no lugar de `form` — o registro shadcn atual (`style: base-nova`) não possui mais o componente `form` baseado em react-hook-form; `field` é o substituto atual para composição de formulários)

---

## Phase 2: Foundational (Pré-requisitos bloqueantes)

**Purpose**: Persistência, autenticação, cliente de ações e camada de layout que
todas as histórias exigem.

**⚠️ CRITICAL**: Nenhuma história de usuário pode começar antes desta fase.

- [X] T006 Definir modelos de domínio `Habit` (com `archivedAt DateTime?`, `@@index([userId])`) e `HabitCompletion` (com `@@unique([habitId, date])`, `onDelete: Cascade`) em `prisma/schema.prisma`
- [X] T007 Gerar modelos do Better Auth (`User`, `Session`, `Account`, `Verification`) via `pnpm exec better-auth generate` e adicionar a relação `habits Habit[]` em `User`, preservando os campos gerados, em `prisma/schema.prisma`
- [X] T008 Executar a migração inicial `pnpm exec prisma migrate dev --name init` (depende de T006, T007)
- [X] T009 [P] Criar o singleton do Prisma Client em `lib/prisma.ts`
- [X] T010 Criar a instância de servidor do Better Auth em `lib/auth.ts` (`prismaAdapter(prisma, { provider: "sqlite" })`, `emailAndPassword: { enabled: true, minPasswordLength: 8 }`) (depende de T009)
- [X] T011 [P] Criar o cliente de browser do Better Auth em `lib/auth-client.ts` (`signIn`, `signUp`, `signOut`, `useSession`)
- [X] T012 Criar o handler de rota do Better Auth em `app/api/auth/[...all]/route.ts` via `toNextJsHandler(auth)` (depende de T010)
- [X] T013 Criar `actionClient` e `protectedActionClient` em `lib/action-client.ts` com middleware que valida a sessão e injeta `user` no `ctx` (depende de T010)
- [X] T014 [P] Criar o wrapper de layout de página em `components/ui/page.tsx`
- [X] T015 Criar o layout do route group `(app)` com guarda de sessão no servidor (redireciona para `/login` quando `getSession` é `null`, FR-007) em `app/(app)/layout.tsx` (depende de T010)
- [X] T016 [P] Configurar o `Toaster` (Sonner) no `app/layout.tsx`, verificando antes se já não está renderizado

**Checkpoint**: Fundação pronta — as histórias de usuário podem iniciar.

---

## Phase 3: User Story 1 - Cadastro e Autenticação (Priority: P1) 🎯 MVP

**Goal**: Visitante cria conta e faz login por e-mail/senha; usuário autenticado
acessa apenas seus dados e encerra a sessão.

**Independent Test**: Cadastrar novo e-mail → autenticado; logout; acessar
`/dashboard` sem sessão → redirecionado a `/login`; login com as credenciais →
acesso concedido; e-mail repetido → erro de e-mail em uso; senha errada → erro
genérico.

### Implementation for User Story 1

- [X] T017 [P] [US1] Criar formulário de autenticação reutilizável (campos e-mail/senha via `form` shadcn) em `components/habitos/auth-form.tsx`
- [X] T018 [US1] Criar a página de cadastro em `app/(auth)/sign-up/page.tsx` usando `authClient.signUp.email` (senha mín. 8, erro de e-mail em uso, FR-001…FR-003) (depende de T017)
- [X] T019 [P] [US1] Criar a página de login em `app/(auth)/login/page.tsx` usando `authClient.signIn.email` (erro genérico sem revelar o campo, FR-004, FR-005) (depende de T017)
- [X] T020 [P] [US1] Criar o botão de logout em `components/habitos/logout-button.tsx` via `authClient.signOut` com redirecionamento a `/login` (FR-006)
- [X] T021 [US1] Implementar o redirecionamento por sessão na landing em `app/page.tsx` (autenticado → `/dashboard`; anônimo → `/login`)

**Checkpoint**: US1 completa e testável de forma independente (MVP).

---

## Phase 4: User Story 2 - Criação e Gestão de Hábitos (Priority: P2)

**Goal**: Usuário autenticado cria, visualiza, edita e remove (arquiva) seus
hábitos, sem ver hábitos de outros usuários.

**Independent Test**: Criar hábito com nome válido → aparece na lista; nome vazio
→ bloqueado; editar → persiste; remover → some da lista; segundo usuário não vê
os hábitos do primeiro.

### Implementation for User Story 2

- [X] T022 [P] [US2] Implementar acesso a dados em `data/habits.ts`: `getHabitsByUser` (apenas `archivedAt: null`, ordenado por `createdAt`), `getHabitById` (checagem de propriedade), `createHabit`, `updateHabit`, `deleteHabit` (arquivar setando `archivedAt`), e helper de unicidade de nome entre hábitos ativos (FR-008…FR-013, FR-021)
- [X] T023 [US2] Criar `actions/create-habit.ts` com `protectedActionClient`, Zod (`name` obrigatório, `trim`, 1–50 chars, único entre ativos) e `revalidatePath` — referência canônica do padrão next-safe-action (FR-009, FR-010, FR-021) (depende de T022)
- [X] T024 [US2] Criar `actions/update-habit.ts` com validação de propriedade e unicidade do nome (FR-008, FR-012, FR-021) (depende de T022)
- [X] T025 [US2] Criar `actions/delete-habit.ts` que arquiva o hábito após checar propriedade (FR-008, FR-013) (depende de T022)
- [X] T026 [P] [US2] Criar o formulário de hábito (criar/editar) em `components/habitos/habit-form.tsx` usando `useAction` (depende de T023, T024)
- [X] T027 [US2] Criar a lista de hábitos em `components/habitos/habit-list.tsx` com ações de editar/remover (`dropdown-menu` + `dialog`/`sheet`) usando `useAction` (depende de T025, T026)
- [X] T028 [US2] Criar a página de hábitos em `app/(app)/habitos/page.tsx` (Server Component que chama `getHabitsByUser` e renderiza a lista dentro do wrapper de página) (depende de T027)

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 - Marcação de Conclusão Diária (Priority: P3)

**Goal**: Usuário marca/desmarca a conclusão de hábitos por dia na visão da
semana, com no máximo uma conclusão por hábito por dia e bloqueio de datas
futuras.

**Independent Test**: Marcar hábito em um dia → persiste após recarregar;
desmarcar → registro removido; navegar entre dias → conclusões corretas; marcar
duas vezes o mesmo dia → mantém uma única conclusão.

### Implementation for User Story 3

- [X] T029 [P] [US3] Implementar `data/completions.ts`: `getWeekCompletions` (intervalo de 7 dias) e `toggleCompletion` (normaliza `date` para meia-noite UTC, checa propriedade, rejeita data futura, upsert/delete idempotente) (FR-014…FR-017, FR-022)
- [X] T030 [US3] Criar `actions/toggle-completion.ts` com `protectedActionClient`, Zod (`habitId`, `date` ISO), rejeição de data futura, checagem de propriedade e `revalidatePath` (FR-014, FR-015, FR-016, FR-022) (depende de T029)
- [X] T031 [P] [US3] Criar o componente cliente de navegação e grade da semana em `components/habitos/week-grid.tsx` (`checkbox` por hábito/dia, atualização otimista via `useAction`, dias futuros desabilitados) (depende de T030)
- [X] T032 [US3] Criar a página da semana em `app/(app)/semana/page.tsx` (Server Component que carrega hábitos ativos + `getWeekCompletions` e passa ao `week-grid`) (depende de T031)

**Checkpoint**: US1, US2 e US3 funcionam de forma independente.

---

## Phase 6: User Story 4 - Dashboard de Métricas (Priority: P4)

**Goal**: Usuário acompanha a quantidade de hábitos concluídos por dia nos
últimos 30 dias, incluindo conclusões de hábitos arquivados, com estado vazio
explícito.

**Independent Test**: Com conclusões em vários dias, o dashboard mostra a
quantidade por dia batendo com o marcado; usuário sem conclusões vê estado
explícito de "sem dados".

### Implementation for User Story 4

- [X] T033 [P] [US4] Implementar `data/dashboard.ts`: `getCompletionsPerDay` (`groupBy` por `date`, janela dos últimos 30 dias, incluindo conclusões de hábitos arquivados; retorna `[]` quando vazio) (FR-019, FR-020, FR-023, SC-004)
- [X] T034 [P] [US4] Criar o gráfico de conclusões por dia em `components/habitos/completions-chart.tsx` (componente `chart` shadcn/Recharts, cores dos tokens de tema, estado vazio "sem dados") (depende de T033)
- [X] T035 [US4] Criar a página do dashboard em `app/(app)/dashboard/page.tsx` (Server Component que chama `getCompletionsPerDay` e renderiza o gráfico ou o estado vazio) (depende de T034)

**Checkpoint**: Todas as histórias de usuário funcionam de forma independente.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Navegação, estados de carregamento e verificação final.

- [X] T036 [P] Criar a navegação autenticada entre `/habitos`, `/semana` e `/dashboard` com o botão de logout em `components/habitos/app-nav.tsx` e incluí-la no `app/(app)/layout.tsx`
- [X] T037 [P] Adicionar estados de carregamento com `skeleton` nas páginas de `(app)` (`loading.tsx` por rota)
- [X] T038 Executar `pnpm exec tsc --noEmit` e corrigir todos os erros de tipo
- [X] T039 Executar `pnpm lint` e corrigir todos os erros de ESLint (Princípio V)
- [ ] T040 Executar os cenários de validação manual do `quickstart.md` (US1–US4)

---

## Dependencies & Execution Order

### Dependências de fase

- **Setup (Phase 1)**: sem dependências — pode iniciar imediatamente.
- **Foundational (Phase 2)**: depende do Setup — **bloqueia todas as histórias**.
- **User Stories (Phases 3–6)**: dependem da fase Foundational.
  - Podem então prosseguir em paralelo (se houver equipe) ou em ordem de
    prioridade (P1 → P2 → P3 → P4).
- **Polish (Phase 7)**: depende das histórias desejadas concluídas.

### Dependências entre histórias

- **US1 (P1)**: inicia após Foundational — sem dependência de outras histórias.
- **US2 (P2)**: inicia após Foundational — independente (usa a auth da fundação).
- **US3 (P3)**: inicia após Foundational — consome hábitos de US2 em uso real,
  mas é testável de forma independente com hábitos previamente criados.
- **US4 (P4)**: inicia após Foundational — consome conclusões de US3 em uso real,
  mas é testável de forma independente com conclusões previamente registradas.

### Dentro de cada história

- Camada `data/` antes das `actions/`.
- `actions/` antes dos componentes cliente que as consomem via `useAction`.
- Componentes antes da página (Server Component) que os renderiza.

### Oportunidades de paralelismo

- Setup: T002 e T005 em paralelo com o restante conforme marcado.
- Foundational: T009, T011, T014, T016 podem correr em paralelo entre si.
- Após a Foundational, US1–US4 podem ser desenvolvidas em paralelo por pessoas
  diferentes.
- Dentro das histórias, tarefas marcadas `[P]` (arquivos distintos) são paralelas.

---

## Parallel Example: User Story 2

```bash
# Após a fundação, iniciar a camada de dados da US2:
Task: "T022 [P] [US2] Implementar data/habits.ts"

# Após T022, as três actions podem ser escritas em paralelo (arquivos distintos):
Task: "T023 [US2] actions/create-habit.ts"
Task: "T024 [US2] actions/update-habit.ts"
Task: "T025 [US2] actions/delete-habit.ts"
```

---

## Implementation Strategy

### MVP primeiro (apenas User Story 1)

1. Concluir Phase 1 (Setup).
2. Concluir Phase 2 (Foundational) — CRÍTICO, bloqueia tudo.
3. Concluir Phase 3 (US1).
4. **PARAR e VALIDAR**: testar US1 de forma independente (cadastro/login/logout).

### Entrega incremental

1. Setup + Foundational → fundação pronta.
2. US1 → validar → MVP.
3. US2 → validar → gestão de hábitos.
4. US3 → validar → marcação diária.
5. US4 → validar → dashboard.

Cada história agrega valor sem quebrar as anteriores.

---

## Notes

- `[P]` = arquivos distintos, sem dependência pendente.
- `[Story]` mapeia a tarefa à história para rastreabilidade.
- Nenhuma função de componente/ação importa Prisma diretamente (Princípio II).
- Toda mutação usa `protectedActionClient` e revalida rotas afetadas (SC-003).
- Verificação por `tsc --noEmit` + `pnpm lint` + validação manual; nunca
  `next dev` como etapa de verificação (Princípio VI).
- Aplicar a reconciliação de artefatos indicada no topo (nome 1–50, arquivar em
  vez de apagar, unicidade entre ativos, bloqueio de data futura).
