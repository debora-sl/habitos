# Guia de Validação (Quickstart): Sistema de Gestão de Hábitos

**Feature**: `001-gestao-de-habitos` | **Data**: 2026-07-18

Cenários executáveis que comprovam a funcionalidade ponta a ponta. A
verificação segue o Princípio VI: **não** se usa `next dev` como etapa de
verificação — usa-se análise estática mais validação manual pela usuária. O
gerenciador de pacotes é **pnpm** exclusivamente.

## Pré-requisitos

- Node.js compatível com Next.js 16 e pnpm instalados.
- Dependências instaladas: `pnpm install`.
- Variáveis de ambiente em `.env`:
  - `DATABASE_URL="file:./dev.db"`
  - `BETTER_AUTH_SECRET="<segredo aleatório>"`
  - `BETTER_AUTH_URL="http://localhost:3000"`

## Setup do ambiente (uma vez)

```bash
pnpm dlx shadcn@latest init
pnpm dlx prisma migrate dev --name init
```

> A geração do schema de autenticação é feita com
> `pnpm dlx @better-auth/cli generate` antes da migração inicial.

## Verificação estática (executar antes de considerar concluído)

```bash
pnpm exec tsc --noEmit   # sem erros de tipo
pnpm lint                # sem erros de ESLint (Princípio V)
```

## Cenários de validação manual

Referências: [spec.md](./spec.md) · [contratos](./contracts/) ·
[data-model.md](./data-model.md).

### US1 — Cadastro e autenticação (FR-001…FR-008)

1. Acesse `/sign-up`, cadastre um e-mail novo e uma senha válida → é autenticado
   e redirecionado à área logada.
2. Faça logout; acesse `/dashboard` sem sessão → é redirecionado a `/login`.
3. Faça login com as mesmas credenciais → acessa apenas os próprios dados.
4. Tente cadastrar o mesmo e-mail novamente → erro de e-mail em uso.
5. Login com senha errada → erro genérico, sem indicar o campo incorreto.

### US2 — Gestão de hábitos (FR-009…FR-013)

1. Crie um hábito com nome válido → aparece na lista.
2. Tente criar hábito com nome vazio → bloqueado com mensagem de nome
   obrigatório.
3. Edite o nome de um hábito → alteração persiste após recarregar.
4. Remova um hábito → some da lista.
5. Com um segundo usuário, confirme que ele não vê os hábitos do primeiro
   (SC-005).

### US3 — Conclusão diária (FR-014…FR-017)

1. Marque um hábito como concluído em um dia → estado persiste após recarregar.
2. Desmarque → registro do dia é removido.
3. Navegue entre os dias da semana → conclusões corretas por dia.
4. Marque duas vezes o mesmo hábito no mesmo dia → mantém uma única conclusão
   (FR-016).

### US4 — Dashboard (FR-019, FR-020)

1. Com conclusões em vários dias, acesse o dashboard → quantidade por dia
   confere exatamente com o marcado (SC-004).
2. Usuário sem conclusões → estado explícito de "sem dados" (FR-020).
3. Marque novas conclusões e reabra o dashboard → métricas atualizadas.

## Critérios de aceitação atendidos

Todos os cenários acima mapeiam para os *Acceptance Scenarios* e *Success
Criteria* da especificação. A conformidade constitucional é verificada na seção
Constitution Check do [plan.md](./plan.md).
