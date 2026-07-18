# Contrato: Camada de Acesso a Dados (`data/`)

**Feature**: `001-gestao-de-habitos`

Únicas funções autorizadas a acessar o Prisma (Princípio II). Todas recebem
`userId` para escopar os dados ao usuário autenticado (FR-008). Assinaturas são
indicativas; a implementação vive na fase de tasks.

---

## `data/habits.ts`

- `getHabitsByUser(userId: string): Promise<Habit[]>`
  - Lista os hábitos do usuário, ordenados por `createdAt`. (FR-011)
- `getHabitById(id: string, userId: string): Promise<Habit | null>`
  - Retorna o hábito somente se pertencer ao usuário (checagem de propriedade).
- `createHabit(userId: string, name: string): Promise<Habit>` (FR-009)
- `updateHabit(id: string, userId: string, name: string): Promise<Habit>` (FR-012)
- `deleteHabit(id: string, userId: string): Promise<void>` (FR-013)

## `data/completions.ts`

- `getWeekCompletions(userId: string, weekStart: Date): Promise<HabitCompletion[]>`
  - Conclusões do usuário no intervalo de 7 dias a partir de `weekStart`,
    usadas na visão semanal. (FR-017)
- `toggleCompletion(habitId: string, userId: string, date: Date): Promise<{ completed: boolean }>`
  - Normaliza `date` para meia-noite UTC; alterna a conclusão de forma
    idempotente; valida propriedade do hábito. (FR-014, FR-015, FR-016)

## `data/dashboard.ts`

- `getCompletionsPerDay(userId: string): Promise<Array<{ date: Date; count: number }>>`
  - Agrega conclusões por dia via `groupBy`. Retorna `[]` quando não há dados,
    permitindo à UI exibir o estado vazio. (FR-019, FR-020, SC-004)

---

## Regras transversais

- Toda query filtra por `userId` (direta ou via relação `habit.userId`),
  garantindo isolamento entre usuários (SC-005).
- Nenhuma função assume sessão; a autenticação é responsabilidade da Server
  Action / layout que as chama.
