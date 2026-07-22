"use client";

import { useState, type FormEvent } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { createHabitAction } from "@/actions/create-habit";
import { updateHabitAction } from "@/actions/update-habit";
import {
  DEFAULT_HABIT_COLOR,
  DEFAULT_HABIT_ICON,
  HABIT_COLOR_OPTIONS,
  HABIT_ICON_OPTIONS,
  getHabitColorVar,
  getHabitIcon,
  type HabitColorName,
  type HabitIconName,
} from "@/lib/habit-options";
import { cn } from "@/lib/utils";

interface HabitFormProps {
  habit?: { id: string; name: string; color: string; icon: string };
  onSuccess?: () => void;
}

export function HabitForm({ habit, onSuccess }: HabitFormProps) {
  const [name, setName] = useState(habit?.name ?? "");
  const [color, setColor] = useState<HabitColorName>(
    (habit?.color as HabitColorName) ?? DEFAULT_HABIT_COLOR
  );
  const [icon, setIcon] = useState<HabitIconName>(
    (habit?.icon as HabitIconName) ?? DEFAULT_HABIT_ICON
  );

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
      updateAction.execute({ id: habit.id, name, color, icon });
    } else {
      createAction.execute({ name, color, icon });
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

      <Field>
        <FieldTitle>Cor</FieldTitle>
        <FieldContent>
          <ToggleGroup
            value={[color]}
            onValueChange={(value) => {
              if (value[0]) {
                setColor(value[0] as HabitColorName);
              }
            }}
          >
            {HABIT_COLOR_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option}
                value={option}
                aria-label={`Cor ${option}`}
                className="size-8 rounded-full p-0 data-pressed:ring-2 data-pressed:ring-offset-2 data-pressed:ring-offset-background"
                style={{ backgroundColor: getHabitColorVar(option) }}
              />
            ))}
          </ToggleGroup>
        </FieldContent>
      </Field>

      <Field>
        <FieldTitle>Ícone</FieldTitle>
        <FieldContent>
          <ToggleGroup
            value={[icon]}
            onValueChange={(value) => {
              if (value[0]) {
                setIcon(value[0] as HabitIconName);
              }
            }}
            className="flex-wrap"
          >
            {HABIT_ICON_OPTIONS.map((option) => {
              const Icon = getHabitIcon(option);

              return (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  aria-label={option}
                  className={cn(
                    "size-9 p-0",
                    "data-pressed:bg-primary data-pressed:text-primary-foreground"
                  )}
                >
                  <Icon />
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </FieldContent>
      </Field>

      <Button type="submit" disabled={isPending}>
        {habit ? "Salvar alterações" : "Criar hábito"}
      </Button>
    </form>
  );
}
