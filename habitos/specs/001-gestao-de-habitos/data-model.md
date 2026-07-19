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
- A remoção de um `User` remove seus `Habit` (cascade, nível de banco).
- A remoção de um `Habit` pelo usuário **não** apaga o registro nem suas
  `HabitCompletion`: ela **arquiva** o hábito (define `archivedAt`), ocultando-o
  da lista ativa e preservando as conclusões para as métricas históricas
  (FR-013, FR-023). O cascade de `HabitCompletion` no schema existe apenas como
  salvaguarda referencial (ex.: exclusão administrativa direta no banco), não é
  o caminho usado pela funcionalidade de remoção.

## Entidades de domínio

### Habit (Hábito)

| Campo        | Tipo             | Regras                                                     |
|--------------|------------------|------------------------------------------------------------|
| `id`         | String           | Chave primária (cuid).                                     |
| `name`       | String           | Obrigatório, não vazio após `trim` (FR-010).              |
| `userId`     | String           | FK → `User.id`. Escopo de propriedade (FR-008).           |
| `archivedAt` | DateTime?        | `null` = ativo; preenchido = arquivado (remoção lógica, FR-013). |
| `createdAt`  | DateTime         | Default `now()`.                                           |
| `updatedAt`  | DateTime         | `@updatedAt`.                                              |

- **Relacionamentos**: `user User @relation(fields: [userId], references: [id], onDelete: Cascade)`;
  `completions HabitCompletion[]`.
- **Índices**: `@@index([userId])` para listar hábitos ativos do usuário
  (FR-011; a listagem filtra `archivedAt: null`).
- **Validação (camada de aplicação, via Zod)**: `name` com 1–50 caracteres após
  `trim` (FR-010).
- **Unicidade condicional (camada de aplicação, FR-021)**: `name` deve ser único
  entre os hábitos **ativos** (`archivedAt: null`) do mesmo `userId`. SQLite não
  suporta índice único parcial via Prisma, então `createHabit`/`updateHabit`
  verificam a unicidade explicitamente antes de persistir (consultando hábitos
  ativos com o mesmo nome para o `userId`).

### HabitCompletion (Conclusão de Hábito)

| Campo       | Tipo       | Regras                                                     |
|-------------|------------|------------------------------------------------------------|
| `id`        | String     | Chave primária (cuid).                                     |
| `habitId`   | String     | FK → `Habit.id`.                                           |
| `date`      | DateTime   | Dia da conclusão, normalizado à meia-noite UTC. Não pode ser posterior ao dia atual (FR-022, validado na camada de aplicação). |
| `createdAt` | DateTime   | Default `now()` — data do registro.                        |

- **Relacionamentos**: `habit Habit @relation(fields: [habitId], references: [id], onDelete: Cascade)`.
- **Unicidade**: `@@unique([habitId, date])` — no máximo uma conclusão por
  hábito por dia (FR-016; resolve concorrência).
- **Índices**: o índice de unicidade também acelera a consulta da semana e do
  dashboard por `date`.
- **Validação (camada de aplicação, FR-022)**: `toggleCompletion` rejeita
  qualquer `date` posterior ao dia atual, tanto na interface (dias futuros
  desabilitados) quanto no servidor (Server Action retorna erro de validação).

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
| `Habit.name` não vazio, 1–50 chars   | FR-009, FR-010                  |
| Unicidade de `Habit.name` entre ativos | FR-021                        |
| `Habit.archivedAt`                   | FR-013, FR-023                  |
| `HabitCompletion @@unique`           | FR-016 + edge case concorrência |
| `HabitCompletion.date` normalizado   | FR-014, FR-015, FR-017          |
| Validação de `date` não futura       | FR-022                          |
| Arquivar em vez de apagar `Habit`    | Edge case: hábito removido      |
| `groupBy(date)` sobre conclusões (inclui hábitos arquivados) | FR-019, FR-020, FR-023, SC-004 |

## Transições de estado

- **Conclusão diária** (por par hábito+dia): `Ausente → Concluído` (marcar,
  via upsert) e `Concluído → Ausente` (desmarcar, via delete). Ambas
  idempotentes: repetir a mesma operação mantém o estado final consistente
  (FR-016). Só é permitida para `date <= hoje` (FR-022).
- **Hábito**: `Ativo → Arquivado` (remoção pelo usuário, via `archivedAt =
  now()`; FR-013). É uma transição unidirecional nesta versão — não há
  reativação de hábito arquivado. As conclusões associadas permanecem
  inalteradas e continuam contabilizadas nas métricas (FR-023).
- **Sessão**: `Anônimo → Autenticado` (login/cadastro) → `Anônimo` (logout,
  FR-006).
