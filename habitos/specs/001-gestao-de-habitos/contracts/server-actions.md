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

## `create-habit` — Criar hábito (US2, FR-009, FR-010)

- **Arquivo**: `actions/create-habit.ts`
- **Entrada (Zod)**: `{ name: string }` — `name` obrigatório, `trim`, 1–100 chars.
- **Autorização**: exige sessão. O hábito é criado com `userId = ctx.user.id`.
- **Efeito**: cria um `Habit`.
- **Saída**: `{ habit: { id, name } }`.
- **Erros**: `validationErrors.name` se vazio/ inválido.

## `update-habit` — Editar hábito (US2, FR-012)

- **Arquivo**: `actions/update-habit.ts`
- **Entrada (Zod)**: `{ id: string, name: string }` (mesmas regras de `name`).
- **Autorização**: exige sessão **e** que o hábito `id` pertença a `ctx.user.id`
  (FR-008). Caso contrário, `serverError` (não encontrado / não autorizado).
- **Efeito**: atualiza `Habit.name`.
- **Saída**: `{ habit: { id, name } }`.

## `delete-habit` — Remover hábito (US2, FR-013)

- **Arquivo**: `actions/delete-habit.ts`
- **Entrada (Zod)**: `{ id: string }`.
- **Autorização**: exige sessão e propriedade do hábito (FR-008).
- **Efeito**: remove o `Habit` e, em cascade, suas conclusões.
- **Saída**: `{ success: true }`.

## `toggle-completion` — Marcar/desmarcar conclusão (US3, FR-014, FR-015, FR-016)

- **Arquivo**: `actions/toggle-completion.ts`
- **Entrada (Zod)**: `{ habitId: string, date: string /* ISO date */ }`.
- **Autorização**: exige sessão e que o `habitId` pertença a `ctx.user.id`.
- **Efeito**: normaliza `date` para meia-noite UTC; se já existe conclusão para
  `(habitId, date)`, remove-a (desmarcar); caso contrário, cria-a (marcar).
  Operação idempotente e segura sob concorrência graças ao índice único.
- **Saída**: `{ date, completed: boolean }` (estado final).

---

## Regras transversais

- Ações sobre recurso identificado (`update-habit`, `delete-habit`,
  `toggle-completion`) **sempre** verificam propriedade antes de mutar (FR-008,
  SC-005).
- Após mutações, as rotas afetadas são revalidadas (`revalidatePath`) para
  refletir o novo estado sem recarga manual (SC-003).
- Nenhuma ação importa Prisma diretamente (Princípio II).
