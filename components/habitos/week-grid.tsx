"use client";

import Link from "next/link";
import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toggleCompletionAction } from "@/actions/toggle-completion";
import { getWeekDays, toDateKey, toUtcMidnight } from "@/lib/date";

interface Habit {
  id: string;
  name: string;
}

interface HabitCompletion {
  habitId: string;
  date: Date;
}

interface WeekGridProps {
  habits: Habit[];
  completions: HabitCompletion[];
  weekStart: Date;
  previousWeekStart: Date;
  nextWeekStart: Date;
}

const WEEKDAY_LABEL_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

function completionKey(habitId: string, dateKey: string) {
  return `${habitId}:${dateKey}`;
}

export function WeekGrid({
  habits,
  completions,
  weekStart,
  previousWeekStart,
  nextWeekStart,
}: WeekGridProps) {
  const days = getWeekDays(weekStart);
  const today = toUtcMidnight(new Date());

  const { execute, optimisticState } = useOptimisticAction(toggleCompletionAction, {
    currentState: completions,
    updateFn: (state, input) => {
      const isCompleted = state.some(
        (completion) =>
          completion.habitId === input.habitId &&
          toDateKey(completion.date) === input.date
      );

      if (isCompleted) {
        return state.filter(
          (completion) =>
            !(
              completion.habitId === input.habitId &&
              toDateKey(completion.date) === input.date
            )
        );
      }

      return [
        ...state,
        { habitId: input.habitId, date: new Date(`${input.date}T00:00:00.000Z`) },
      ];
    },
    onError: () => {
      toast.error("Não foi possível atualizar a conclusão.");
    },
  });

  const completedKeys = new Set(
    optimisticState.map((completion) =>
      completionKey(completion.habitId, toDateKey(completion.date))
    )
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/semana?week=${toDateKey(previousWeekStart)}`} />}
        >
          <ChevronLeftIcon />
          Semana anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/semana?week=${toDateKey(nextWeekStart)}`} />}
        >
          Próxima semana
          <ChevronRightIcon />
        </Button>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Cadastre um hábito para começar a marcar suas conclusões.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-separate border-spacing-2">
            <thead>
              <tr>
                <th className="text-left text-sm font-medium text-muted-foreground">
                  Hábito
                </th>
                {days.map((day) => (
                  <th
                    key={toDateKey(day)}
                    className="text-center text-sm font-medium text-muted-foreground"
                  >
                    {WEEKDAY_LABEL_FORMATTER.format(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id}>
                  <td className="text-sm font-medium">{habit.name}</td>
                  {days.map((day) => {
                    const dateKey = toDateKey(day);
                    const isCompleted = completedKeys.has(
                      completionKey(habit.id, dateKey)
                    );
                    const isFuture = day.getTime() > today.getTime();

                    return (
                      <td key={dateKey} className="text-center">
                        <Checkbox
                          checked={isCompleted}
                          disabled={isFuture}
                          onCheckedChange={() =>
                            execute({ habitId: habit.id, date: dateKey })
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
