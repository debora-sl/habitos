import { prisma } from "@/lib/prisma";
import { addDays, toUtcMidnight } from "@/lib/date";

const DAYS_WINDOW = 30;

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
