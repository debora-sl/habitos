"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { returnServerError, returnValidationErrors } from "next-safe-action";
import { protectedActionClient } from "@/lib/action-client";
import { getHabitById, isHabitNameTaken, updateHabit } from "@/data/habits";
import {
  DEFAULT_HABIT_COLOR,
  DEFAULT_HABIT_ICON,
  HABIT_COLOR_OPTIONS,
  HABIT_ICON_OPTIONS,
} from "@/lib/habit-options";

const updateHabitSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome para o hábito.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  color: z.enum(HABIT_COLOR_OPTIONS).default(DEFAULT_HABIT_COLOR),
  icon: z.enum(HABIT_ICON_OPTIONS).default(DEFAULT_HABIT_ICON),
});

export const updateHabitAction = protectedActionClient
  .inputSchema(updateHabitSchema)
  .action(async ({ parsedInput, ctx }) => {
    const habit = await getHabitById(parsedInput.id, ctx.user.id);

    if (!habit) {
      returnServerError("Hábito não encontrado.");
    }

    const nameTaken = await isHabitNameTaken(
      ctx.user.id,
      parsedInput.name,
      parsedInput.id
    );

    if (nameTaken) {
      returnValidationErrors(updateHabitSchema, {
        name: { _errors: ["Já existe um hábito ativo com esse nome."] },
      });
    }

    const updated = await updateHabit(
      parsedInput.id,
      ctx.user.id,
      parsedInput.name,
      parsedInput.color,
      parsedInput.icon
    );

    revalidatePath("/habitos");

    return {
      habit: {
        id: updated.id,
        name: updated.name,
        color: updated.color,
        icon: updated.icon,
      },
    };
  });
