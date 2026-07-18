# Pesquisa (Fase 0): Sistema de Gestão de Hábitos

**Feature**: `001-gestao-de-habitos` | **Data**: 2026-07-18

Este documento consolida as decisões técnicas necessárias para o plano de
implementação. O stack é determinado pela [constituição](../../.specify/memory/constitution.md)
e pelas instruções de setup (`prompt.md`), portanto não restaram marcadores
`NEEDS CLARIFICATION`. A pesquisa foca em **como** integrar as tecnologias já
definidas.

> **Nota sobre documentação**: o MCP Context7 estava indisponível durante o
> planejamento (chave de API inválida). As decisões abaixo baseiam-se nos
> padrões estáveis conhecidos de cada biblioteca. Durante a implementação,
> valide as APIs contra a documentação oficial via Context7 e contra
> `node_modules/next/dist/docs/` (o Next.js 16 possui breaking changes,
> conforme `AGENTS.md`).

## 1. Persistência: Prisma 7 + SQLite

- **Decisão**: usar SQLite como banco de dados via `datasource db { provider = "sqlite" }`,
  com a URL `file:./dev.db` lida da variável de ambiente `DATABASE_URL`. O
  cliente Prisma é instanciado uma única vez em `lib/prisma.ts` (singleton) para
  evitar múltiplas conexões durante o hot-reload de desenvolvimento.
- **Justificativa**: SQLite foi solicitado explicitamente em `prompt.md`; é
  zero-config, adequado ao escopo (usuário único gerenciando seus próprios
  dados) e suportado nativamente pelo adapter do Prisma e do Better Auth.
- **Alternativas consideradas**: PostgreSQL (rejeitado — exige serviço externo,
  fora do escopo desta versão).

## 2. Autenticação: Better Auth + adapter Prisma

- **Decisão**:
  - Instância do servidor em `lib/auth.ts` usando `betterAuth({...})` com
    `database: prismaAdapter(prisma, { provider: "sqlite" })` e
    `emailAndPassword: { enabled: true }`.
  - Cliente de browser em `lib/auth-client.ts` via `createAuthClient()`,
    expondo `signIn`, `signUp`, `signOut` e `useSession`.
  - Handler de rota em `app/api/auth/[...all]/route.ts` via
    `toNextJsHandler(auth)`.
  - Os modelos exigidos pelo Better Auth (`User`, `Session`, `Account`,
    `Verification`) são adicionados ao `schema.prisma` e gerados com o CLI do
    Better Auth (`pnpm dlx @better-auth/cli generate`), depois migrados com
    Prisma.
  - Leitura de sessão no servidor: `auth.api.getSession({ headers: await headers() })`.
- **Justificativa**: Better Auth é o mecanismo de autenticação definido na
  constituição. O adapter Prisma reaproveita o mesmo banco SQLite, mantendo uma
  fonte única de dados. Requisitos mínimos de senha (FR-003) são configurados
  via `emailAndPassword.minPasswordLength`.
- **Regras mínimas de senha (FR-003)**: `minPasswordLength: 8` (padrão),
  ajustável. Mensagens de erro de login genéricas (FR-005) já são o
  comportamento padrão do Better Auth (não revela qual campo está incorreto).
- **Alternativas consideradas**: NextAuth/Auth.js (rejeitado — a constituição
  fixa Better Auth).

## 3. Server Actions: next-safe-action

- **Decisão**:
  - `lib/action-client.ts` define `actionClient = createSafeActionClient()` e
    `protectedActionClient`, que encadeia um middleware (`.use(...)`)
    verificando a sessão do Better Auth e injetando o usuário autenticado em
    `ctx`. Se não houver sessão, o middleware lança erro e a ação é bloqueada.
  - Cada ação vive em `actions/` (ex.: `actions/create-habit.ts`), usa
    `protectedActionClient`, valida a entrada com um schema Zod e executa a
    lógica delegando a persistência às funções de `data/`.
  - No cliente, as ações são chamadas com o hook `useAction`.
- **Justificativa**: padrão obrigatório pela constituição (Princípio III).
  Centraliza parsing de entrada, tratamento de erros e autorização.
- **Observação importante**: a constituição referencia
  `@actions/create-booking.ts` como base estrutural, mas esse arquivo **não
  existe** no projeto (o app está em estado inicial). A primeira ação criada
  (`actions/create-habit.ts`) passa a ser a referência canônica do padrão,
  seguindo a documentação do next-safe-action. Esta decisão está registrada em
  Complexity Tracking no `plan.md`.
- **Autorização em cada ação (FR-008)**: além de exigir sessão, ações que
  operam sobre um recurso específico (editar/remover hábito, marcar conclusão)
  verificam que o recurso pertence ao usuário do `ctx` antes de mutá-lo.

## 4. Camada de acesso a dados: `data/`

- **Decisão**: toda leitura/escrita no Prisma passa por funções em `data/`
  (ex.: `data/habits.ts`, `data/completions.ts`, `data/dashboard.ts`).
  Componentes e Server Actions **nunca** importam o Prisma diretamente
  (Princípio II). As funções recebem sempre o `userId` para escopar os dados.
- **Justificativa**: isolamento de acesso a dados exigido pela constituição;
  torna as queries reutilizáveis entre rotas e testáveis.

## 5. Modelagem da conclusão diária e unicidade (FR-016)

- **Decisão**: o dia da conclusão é armazenado no campo `date` (tipo `DateTime`)
  **normalizado para a meia-noite em UTC** (componente de horário zerado). Uma
  restrição de unicidade composta `@@unique([habitId, date])` garante no nível
  do banco no máximo uma conclusão por hábito por dia.
- **Justificativa**: a restrição no banco resolve simultaneamente FR-016 e o
  edge case de duas requisições concorrentes de marcação (a segunda inserção
  viola a unicidade e é tratada de forma idempotente). Marcar/desmarcar é
  implementado como upsert/delete idempotente.
- **Alternativas consideradas**: armazenar o dia como string `YYYY-MM-DD`
  (rejeitado — perde tipagem temporal e ordenação nativa; a normalização para
  meia-noite UTC oferece o mesmo efeito com um tipo `DateTime`).

## 6. Métricas do dashboard (FR-019, FR-020, SC-004)

- **Decisão**: agregação com `prisma.habitCompletion.groupBy({ by: ['date'],
  where: { habit: { userId } }, _count: { _all: true }, orderBy: { date: 'asc' } })`,
  produzindo pares `{ dia, quantidadeConcluida }`. Quando o resultado é vazio, a
  UI exibe um estado explícito de "sem dados" (FR-020) em vez de zeros.
- **Justificativa**: agregação no banco garante precisão de 100% (SC-004) e
  evita transferir todas as conclusões para a aplicação.
- **Visualização**: gráfico de barras usando o componente `chart` do shadcn/ui
  (baseado em Recharts), com cores vindas dos tokens do tema
  (`app/globals.css`).

## 7. UI: shadcn/ui + Tailwind v4 + Next.js 16

- **Decisão**: inicializar com `pnpm dlx shadcn@latest init` (compatível com
  Tailwind v4 já presente). Componentes a adicionar: `button`, `input`,
  `label`, `card`, `dialog`, `sheet`, `form`, `checkbox`, `sonner` (toasts),
  `chart`, `dropdown-menu`, `skeleton`. O wrapper de layout de página
  obrigatório fica em `components/ui/page.tsx` (Princípio I). Tokens de cor são
  gerados pelo shadcn em `app/globals.css`; nenhuma cor hard-coded é utilizada.
- **Justificativa**: constituição exige shadcn/ui como única fonte de
  componentes e proíbe cores hard-coded e componentes do zero.
- **Ícones**: `lucide-react` (Princípio V).
- **Semana**: Server Component carrega hábitos + conclusões da semana corrente;
  um Client Component renderiza os dias e dispara `toggle-completion` via
  `useAction`, com atualização otimista para atender SC-003 (sem recarregar).

## 8. Estrutura de rotas e proteção (FR-007)

- **Decisão**: rotas autenticadas agrupadas em um route group `(app)` com um
  `layout.tsx` que valida a sessão no servidor e redireciona para `/login`
  quando ausente. Rotas públicas de autenticação em `(auth)/login` e
  `(auth)/sign-up`.
- **Justificativa**: centraliza a checagem de autenticação (FR-007) em um único
  ponto por grupo de rotas, evitando repetição.

## 9. Verificação (Princípio VI)

- **Decisão**: a verificação usa análise estática — `pnpm exec tsc --noEmit`
  (TypeScript) e `pnpm lint` (ESLint) — mais revisão manual. **Não** se executa
  `next dev` como etapa de verificação. Migrações são validadas com
  `pnpm exec prisma migrate dev` e `prisma studio` quando necessário.
- **Justificativa**: exigência explícita da constituição (sem dev server como
  verificação) e do `prompt.md`.
