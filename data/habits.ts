import { prisma } from "@/lib/prisma";

export function getHabitsByUser(userId: string) {
  return prisma.habit.findMany({
    where: { userId, archivedAt: null },
    orderBy: { createdAt: "asc" },
  });
}

export function getHabitById(id: string, userId: string) {
  return prisma.habit.findFirst({
    where: { id, userId },
  });
}

export async function isHabitNameTaken(
  userId: string,
  name: string,
  excludeId?: string
) {
  const existingHabit = await prisma.habit.findFirst({
    where: {
      userId,
      name,
      archivedAt: null,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  return existingHabit !== null;
}

export function createHabit(
  userId: string,
  name: string,
  color: string,
  icon: string
) {
  return prisma.habit.create({
    data: { userId, name, color, icon },
  });
}

export async function updateHabit(
  id: string,
  userId: string,
  name: string,
  color: string,
  icon: string
) {
  const { count } = await prisma.habit.updateMany({
    where: { id, userId },
    data: { name, color, icon },
  });

  if (count === 0) {
    throw new Error("Hábito não encontrado.");
  }

  return prisma.habit.findFirstOrThrow({ where: { id, userId } });
}

export async function deleteHabit(id: string, userId: string) {
  const { count } = await prisma.habit.updateMany({
    where: { id, userId, archivedAt: null },
    data: { archivedAt: new Date() },
  });

  if (count === 0) {
    throw new Error("Hábito não encontrado.");
  }
}
