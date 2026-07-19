"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { returnServerError, returnValidationErrors } from "next-safe-action";
import { protectedActionClient } from "@/lib/action-client";
import { toggleCompletion } from "@/data/completions";
import { toUtcMidnight } from "@/lib/date";

const toggleCompletionSchema = z.object({
  habitId: z.string(),
  date: z.iso.date(),
});

export const toggleCompletionAction = protectedActionClient
  .inputSchema(toggleCompletionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const date = new Date(`${parsedInput.date}T00:00:00.000Z`);
    const today = toUtcMidnight(new Date());

    if (date.getTime() > today.getTime()) {
      returnValidationErrors(toggleCompletionSchema, {
        date: { _errors: ["Não é possível marcar conclusão em uma data futura."] },
      });
    }

    const result = await toggleCompletion(parsedInput.habitId, ctx.user.id, date);

    if (!result) {
      returnServerError("Hábito não encontrado.");
    }

    revalidatePath("/semana");

    return { date: parsedInput.date, completed: result.completed };
  });
