"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { returnServerError } from "next-safe-action";
import { protectedActionClient } from "@/lib/action-client";
import { deleteHabit, getHabitById } from "@/data/habits";

const deleteHabitSchema = z.object({
  id: z.string(),
});

export const deleteHabitAction = protectedActionClient
  .inputSchema(deleteHabitSchema)
  .action(async ({ parsedInput, ctx }) => {
    const habit = await getHabitById(parsedInput.id, ctx.user.id);

    if (!habit) {
      returnServerError("Hábito não encontrado.");
    }

    await deleteHabit(parsedInput.id, ctx.user.id);

    revalidatePath("/habitos");

    return { success: true as const };
  });
