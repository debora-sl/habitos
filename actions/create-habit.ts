"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { returnValidationErrors } from "next-safe-action";
import { protectedActionClient } from "@/lib/action-client";
import { createHabit, isHabitNameTaken } from "@/data/habits";

const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome para o hábito.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
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

    const habit = await createHabit(ctx.user.id, parsedInput.name);

    revalidatePath("/habitos");

    return { habit: { id: habit.id, name: habit.name } };
  });
