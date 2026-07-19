"use client";

import { useState, type FormEvent } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { createHabitAction } from "@/actions/create-habit";
import { updateHabitAction } from "@/actions/update-habit";

interface HabitFormProps {
  habit?: { id: string; name: string };
  onSuccess?: () => void;
}

export function HabitForm({ habit, onSuccess }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? "");

  const createAction = useAction(createHabitAction, {
    onSuccess: () => {
      toast.success("Hábito criado com sucesso.");
      setName("");
      onSuccess?.();
    },
  });

  const updateAction = useAction(updateHabitAction, {
    onSuccess: () => {
      toast.success("Hábito atualizado com sucesso.");
      onSuccess?.();
    },
  });

  const isPending = habit ? updateAction.isPending : createAction.isPending;
  const validationErrors = habit
    ? updateAction.result.validationErrors
    : createAction.result.validationErrors;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (habit) {
      updateAction.execute({ id: habit.id, name });
    } else {
      createAction.execute({ name });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field data-invalid={!!validationErrors?.name}>
        <FieldLabel htmlFor="habit-name">Nome do hábito</FieldLabel>
        <FieldContent>
          <Input
            id="habit-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Ler 10 páginas"
            maxLength={50}
            required
          />
          <FieldError
            errors={validationErrors?.name?._errors?.map((message) => ({ message }))}
          />
        </FieldContent>
      </Field>
      <Button type="submit" disabled={isPending}>
        {habit ? "Salvar alterações" : "Criar hábito"}
      </Button>
    </form>
  );
}
