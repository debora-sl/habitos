"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { returnServerError, returnValidationErrors } from "next-safe-action";
import { protectedActionClient } from "@/lib/action-client";
import { getHabitById, isHabitNameTaken, updateHabit } from "@/data/habits";

const updateHabitSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, "Informe um nome para o hábito.")
    .max(50, "O nome deve ter no máximo 50 caracteres."),
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

    const updated = await updateHabit(parsedInput.id, ctx.user.id, parsedInput.name);

    revalidatePath("/habitos");

    return { habit: { id: updated.id, name: updated.name } };
  });
