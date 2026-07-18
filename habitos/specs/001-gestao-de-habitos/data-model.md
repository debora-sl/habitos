# Modelo de Dados (Fase 1): Sistema de Gestão de Hábitos

**Feature**: `001-gestao-de-habitos` | **Data**: 2026-07-18

Baseado nas *Key Entities* da [especificação](./spec.md) e nas decisões da
[pesquisa](./research.md). O banco é SQLite via Prisma 7. Os modelos de
autenticação (`User`, `Session`, `Account`, `Verification`) são gerados pelo
Better Auth; abaixo descrevemos os campos relevantes ao domínio e os modelos de
domínio (`Habit`, `HabitCompletion`).

## Diagrama de relacionamentos

```text
User (1) ───< (N) Habit (1) ───< (N) HabitCompletion
```

- Um `User` possui muitos `Habit`.
- Um `Habit` possui muitas `HabitCompletion` (no máximo uma por dia).
- A remoção de um `User` remove seus `Habit`; a remoção de um `Habit` remove
  suas `HabitCompletion` (cascade).

## Entidades de domínio

### Habit (Hábito)

| Campo       | Tipo       | Regras                                                     |
|-------------|------------|------------------------------------------------------------|
| `id`        | String     | Chave primária (cuid).                                     |
| `name`      | String     | Obrigatório, não vazio após `trim` (FR-010).              |
| `userId`    | String     | FK → `User.id`. Escopo de propriedade (FR-008).           |
| `createdAt` | DateTime   | Default `now()`.                                           |
| `updatedAt` | DateTime   | `@updatedAt`.                                              |

- **Relacionamentos**: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`;
  `completions HabitCompletion[]`.
- **Índices**: `@@index([userId])` para listar hábitos do usuário (FR-011).
- **Validação (camada de aplicação, via Zod)**: `name` com 1–100 caracteres
  após `trim`.

### HabitCompletion (Conclusão de Hábito)

| Campo       | Tipo       | Regras                                                     |
|-------------|------------|------------------------------------------------------------|
| `id`        | String     | Chave primária (cuid).                                     |
| `habitId`   | String     | FK → `Habit.id`.                                           |
| `date`      | DateTime   | Dia da conclusão, normalizado à meia-noite UTC.           |
| `createdAt` | DateTime   | Default `now()` — data do registro.                        |

- **Relacionamentos**: `habit Habit @relation(fields: [habitId], references: [id], onDelete: Cascade)`.
- **Unicidade**: `@@unique([habitId, date])` — no máximo uma conclusão por
  hábito por dia (FR-016; resolve concorrência).
- **Índices**: o índice de unicidade também acelera a consulta da semana e do
  dashboard por `date`.

## Modelos de autenticação (gerados pelo Better Auth)

Adicionados ao `schema.prisma` e gerados via `pnpm dlx @better-auth/cli generate`.
Campos sujeitos à versão do Better Auth; abaixo o essencial:

- **User**: `id`, `name`, `email` (único, FR-002), `emailVerified`, `image?`,
  `createdAt`, `updatedAt`, relação `habits Habit[]`.
- **Session**: `id`, `userId`, `token`, `expiresAt`, `ipAddress?`,
  `userAgent?`.
- **Account**: `id`, `userId`, `providerId`, `accountId`, `password?`
  (hash da senha para `emailAndPassword`).
- **Verification**: `id`, `identifier`, `value`, `expiresAt`.

> Ao editar `User` para adicionar a relação `habits`, preserve os campos
> gerados pelo Better Auth.

## Mapeamento entidade → requisitos

| Entidade / Regra                     | Requisitos atendidos            |
|--------------------------------------|---------------------------------|
| `User.email` único                   | FR-002                          |
| `Account.password` (hash)            | FR-001, FR-003, FR-004          |
| `Habit.userId` + índice              | FR-008, FR-011                  |
| `Habit.name` não vazio               | FR-009, FR-010                  |
| `HabitCompletion @@unique`           | FR-016 + edge case concorrência |
| `HabitCompletion.date` normalizado   | FR-014, FR-015, FR-017          |
| Cascade em `Habit`/`HabitCompletion` | Edge case: hábito removido      |
| `groupBy(date)` sobre conclusões     | FR-019, FR-020, SC-004          |

## Transições de estado

- **Conclusão diária** (por par hábito+dia): `Ausente → Concluído` (marcar,
  via upsert) e `Concluído → Ausente` (desmarcar, via delete). Ambas
  idempotentes: repetir a mesma operação mantém o estado final consistente
  (FR-016).
- **Sessão**: `Anônimo → Autenticado` (login/cadastro) → `Anônimo` (logout,
  FR-006).
