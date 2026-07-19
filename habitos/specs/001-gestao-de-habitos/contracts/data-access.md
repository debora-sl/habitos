# Contrato: Camada de Acesso a Dados (`data/`)

**Feature**: `001-gestao-de-habitos`

Únicas funções autorizadas a acessar o Prisma (Princípio II). Todas recebem
`userId` para escopar os dados ao usuário autenticado (FR-008). Assinaturas são
indicativas; a implementação vive na fase de tasks.

---

## `data/habits.ts`

- `getHabitsByUser(userId: string): Promise<Habit[]>`
  - Lista os hábitos **ativos** do usuário (`archivedAt: null`), ordenados por
    `createdAt`. (FR-011)
- `getHabitById(id: string, userId: string): Promise<Habit | null>`
  - Retorna o hábito somente se pertencer ao usuário (checagem de propriedade).
- `isHabitNameTaken(userId: string, name: string, excludeId?: string): Promise<boolean>`
  - Verifica se já existe um hábito **ativo** do usuário com esse nome
    (excluindo opcionalmente o próprio `id`, para o caso de edição). (FR-021)
- `createHabit(userId: string, name: string): Promise<Habit>`
  - Cria o hábito após validar unicidade entre ativos. (FR-009, FR-010, FR-021)
- `updateHabit(id: string, userId: string, name: string): Promise<Habit>`
  - Atualiza o nome após validar propriedade e unicidade entre ativos. (FR-012, FR-021)
- `deleteHabit(id: string, userId: string): Promise<void>`
  - **Arquiva** o hábito (define `archivedAt = now()`) após validar
    propriedade; não apaga o registro nem suas conclusões. (FR-013, FR-023)

## `data/completions.ts`

- `getWeekCompletions(userId: string, weekStart: Date): Promise<HabitCompletion[]>`
  - Conclusões do usuário no intervalo de 7 dias a partir de `weekStart`,
    usadas na visão semanal. (FR-017)
- `toggleCompletion(habitId: string, userId: string, date: Date): Promise<{ completed: boolean }>`
  - Normaliza `date` para meia-noite UTC; rejeita `date` posterior ao dia atual
    (FR-022); alterna a conclusão de forma idempotente; valida propriedade do
    hábito. (FR-014, FR-015, FR-016, FR-022)

## `data/dashboard.ts`

- `getCompletionsPerDay(userId: string): Promise<Array<{ date: Date; count: number }>>`
  - Agrega conclusões por dia via `groupBy`, considerando os últimos 30 dias e
    incluindo conclusões de hábitos **arquivados** (join por `habit.userId`,
    sem filtrar por `archivedAt`). Retorna `[]` quando não há dados, permitindo
    à UI exibir o estado vazio. (FR-019, FR-020, FR-023, SC-004)

---

## Regras transversais

- Toda query filtra por `userId` (direta ou via relação `habit.userId`),
  garantindo isolamento entre usuários (SC-005).
- Nenhuma função assume sessão; a autenticação é responsabilidade da Server
  Action / layout que as chama.
