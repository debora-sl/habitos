import { prisma } from "@/lib/prisma";
import { toUtcMidnight } from "@/lib/date";

export function getWeekCompletions(userId: string, weekStart: Date) {
  const start = toUtcMidnight(weekStart);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);

  return prisma.habitCompletion.findMany({
    where: {
      date: { gte: start, lt: end },
      habit: { userId },
    },
  });
}

export async function toggleCompletion(
  habitId: string,
  userId: string,
  date: Date
) {
  const habit = await prisma.habit.findFirst({ where: { id: habitId, userId } });

  if (!habit) {
    return null;
  }

  const normalizedDate = toUtcMidnight(date);

  const existingCompletion = await prisma.habitCompletion.findUnique({
    where: { habitId_date: { habitId, date: normalizedDate } },
  });

  if (existingCompletion) {
    await prisma.habitCompletion.delete({ where: { id: existingCompletion.id } });
    return { completed: false };
  }

  await prisma.habitCompletion.create({
    data: { habitId, date: normalizedDate },
  });

  return { completed: true };
}
