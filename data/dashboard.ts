import { prisma } from "@/lib/prisma";
import { addDays, toDateKey, toUtcMidnight } from "@/lib/date";

const DAYS_WINDOW = 30;
const STREAK_WINDOW_DAYS = 365;

export async function getCompletionsPerDay(userId: string) {
  const today = toUtcMidnight(new Date());
  const start = addDays(today, -(DAYS_WINDOW - 1));

  const grouped = await prisma.habitCompletion.groupBy({
    by: ["date"],
    where: {
      date: { gte: start, lte: today },
      habit: { userId },
    },
    _count: { _all: true },
    orderBy: { date: "asc" },
  });

  return grouped.map((entry) => ({
    date: entry.date,
    count: entry._count._all,
  }));
}

export async function getDashboardMetrics(userId: string) {
  const today = toUtcMidnight(new Date());
  const start30 = addDays(today, -(DAYS_WINDOW - 1));
  const startPrevious30 = addDays(today, -(DAYS_WINDOW * 2 - 1));
  const endPrevious30 = addDays(today, -DAYS_WINDOW);
  const streakWindowStart = addDays(today, -(STREAK_WINDOW_DAYS - 1));

  const [
    activeHabitsCount,
    totalCompletions,
    completionsLast30,
    completionsPrevious30,
    completionDates,
  ] = await Promise.all([
    prisma.habit.count({ where: { userId, archivedAt: null } }),
    prisma.habitCompletion.count({ where: { habit: { userId } } }),
    prisma.habitCompletion.count({
      where: { habit: { userId }, date: { gte: start30, lte: today } },
    }),
    prisma.habitCompletion.count({
      where: {
        habit: { userId },
        date: { gte: startPrevious30, lte: endPrevious30 },
      },
    }),
    prisma.habitCompletion.findMany({
      where: { habit: { userId }, date: { gte: streakWindowStart, lte: today } },
      select: { date: true },
      distinct: ["date"],
      orderBy: { date: "desc" },
    }),
  ]);

  const completedDateKeys = new Set(
    completionDates.map((entry) => toDateKey(entry.date))
  );

  return {
    streak: calculateStreak(completedDateKeys, today),
    completionRate: calculateCompletionRate(completionsLast30, activeHabitsCount),
    previousCompletionRate: calculateCompletionRate(
      completionsPrevious30,
      activeHabitsCount
    ),
    totalCompletions,
    activeHabitsCount,
  };
}

function calculateCompletionRate(completions: number, activeHabitsCount: number) {
  if (activeHabitsCount === 0) {
    return 0;
  }

  return Math.round((completions / (activeHabitsCount * DAYS_WINDOW)) * 100);
}

function calculateStreak(completedDateKeys: Set<string>, today: Date) {
  let cursor = today;

  if (!completedDateKeys.has(toDateKey(cursor))) {
    cursor = addDays(cursor, -1);

    if (!completedDateKeys.has(toDateKey(cursor))) {
      return 0;
    }
  }

  let streak = 0;

  while (completedDateKeys.has(toDateKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}
