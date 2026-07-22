"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { protectedActionClient } from "@/lib/action-client";
import { createHabit, isHabitNameTaken } from "@/data/habits";
import {
  DEFAULT_HABIT_COLOR,
  DEFAULT_HABIT_ICON,
  HABIT_COLOR_OPTIONS,
  HABIT_ICON_OPTIONS,
} from "@/lib/habit-options";

const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome para o hábito.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
  color: z.enum(HABIT_COLOR_OPTIONS).default(DEFAULT_HABIT_COLOR),
  icon: z.enum(HABIT_ICON_OPTIONS).default(DEFAULT_HABIT_ICON),
});

export const createHabitAction = protectedActionClient
  .inputSchema(createHabitSchema)
  .action(async ({ parsedInput, ctx }) => {
    const nameTaken = await isHabitNameTaken(ctx.user.id, parsedInput.name);

    if (nameTaken) {
      returnValidationErrors(createHabitSchema, {
        name: { _errors: ["Já existe um hábito ativo com esse nome."] },
      });
    }

    const habit = await createHabit(
      ctx.user.id,
      parsedInput.name,
      parsedInput.color,
      parsedInput.icon
    );

    revalidatePath("/habitos");

    return {
      habit: {
        id: habit.id,
        name: habit.name,
        color: habit.color,
        icon: habit.icon,
      },
    };
  });
