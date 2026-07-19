# Contrato: Server Actions (next-safe-action)

**Feature**: `001-gestao-de-habitos`

Todas as ações vivem em `actions/`, usam `protectedActionClient`
(`lib/action-client.ts`), validam entrada com Zod e delegam persistência às
funções de `data/`. O `ctx` fornecido pelo `protectedActionClient` contém o
`user` autenticado. Erros de autorização/validação retornam via canais padrão
do next-safe-action (`serverError` / `validationErrors`), consumidos no cliente
pelo hook `useAction`.

Convenção de retorno: cada ação retorna `data` em sucesso e sinaliza falhas
através dos mecanismos do next-safe-action (nunca lança exceção crua para o
cliente).

---

## `create-habit` — Criar hábito (US2, FR-009, FR-010, FR-021)

- **Arquivo**: `actions/create-habit.ts`
- **Entrada (Zod)**: `{ name: string }` — `name` obrigatório, `trim`, 1–50 chars.
- **Autorização**: exige sessão. O hábito é criado com `userId = ctx.user.id`.
- **Efeito**: valida unicidade do nome entre os hábitos ativos do usuário
  (via `isHabitNameTaken`) e cria um `Habit`.
- **Saída**: `{ habit: { id, name } }`.
- **Erros**: `validationErrors.name` se vazio/inválido/exceder 50 chars, ou se
  já existir hábito ativo com o mesmo nome (FR-021).

## `update-habit` — Editar hábito (US2, FR-012, FR-021)

- **Arquivo**: `actions/update-habit.ts`
- **Entrada (Zod)**: `{ id: string, name: string }` (mesmas regras de `name`,
  1–50 chars).
- **Autorização**: exige sessão **e** que o hábito `id` pertença a `ctx.user.id`
  (FR-008). Caso contrário, `serverError` (não encontrado / não autorizado).
- **Efeito**: valida unicidade do nome entre os hábitos ativos do usuário
  (excluindo o próprio `id`) e atualiza `Habit.name`.
- **Saída**: `{ habit: { id, name } }`.
- **Erros**: `validationErrors.name` se inválido ou se colidir com outro
  hábito ativo (FR-021).

## `delete-habit` — Remover (arquivar) hábito (US2, FR-013, FR-023)

- **Arquivo**: `actions/delete-habit.ts`
- **Entrada (Zod)**: `{ id: string }`.
- **Autorização**: exige sessão e propriedade do hábito (FR-008).
- **Efeito**: **arquiva** o `Habit` (define `archivedAt = now()`); **não**
  remove o registro nem suas conclusões, que permanecem contabilizadas nas
  métricas históricas do dashboard (FR-013, FR-023).
- **Saída**: `{ success: true }`.

## `toggle-completion` — Marcar/desmarcar conclusão (US3, FR-014, FR-015, FR-016, FR-022)

- **Arquivo**: `actions/toggle-completion.ts`
- **Entrada (Zod)**: `{ habitId: string, date: string /* ISO date */ }`.
- **Autorização**: exige sessão e que o `habitId` pertença a `ctx.user.id`.
- **Efeito**: normaliza `date` para meia-noite UTC; rejeita a operação se
  `date` for posterior ao dia atual (FR-022, `validationErrors.date`); se já
  existe conclusão para `(habitId, date)`, remove-a (desmarcar); caso
  contrário, cria-a (marcar). Operação idempotente e segura sob concorrência
  graças ao índice único.
- **Saída**: `{ date, completed: boolean }` (estado final).
- **Erros**: `validationErrors.date` se a data for futura (FR-022).

---

## Regras transversais

- Ações sobre recurso identificado (`update-habit`, `delete-habit`,
  `toggle-completion`) **sempre** verificam propriedade antes de mutar (FR-008,
  SC-005).
- Após mutações, as rotas afetadas são revalidadas (`revalidatePath`) para
  refletir o novo estado sem recarga manual (SC-003).
- Nenhuma ação importa Prisma diretamente (Princípio II).
