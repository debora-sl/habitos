"use client";

import Link from "next/link";
import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toggleCompletionAction } from "@/actions/toggle-completion";
import { getWeekDays, toDateKey, toUtcMidnight } from "@/lib/date";
import { cn } from "@/lib/utils";

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

const WEEKDAY_NARROW_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "narrow",
  timeZone: "UTC",
});

const DAY_NUMBER_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  timeZone: "UTC",
});

const RANGE_DAY_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "UTC",
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  timeZone: "UTC",
});

function completionKey(habitId: string, dateKey: string) {
  return `${habitId}:${dateKey}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getTime() === b.getTime();
}

export function WeekGrid({
  habits,
  completions,
  weekStart,
  previousWeekStart,
  nextWeekStart,
}: WeekGridProps) {
  const days = getWeekDays(weekStart);
  const dayKeys = days.map(toDateKey);
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

  const completedDayKeysForHabit = (habitId: string) =>
    dayKeys.filter((dateKey) => completedKeys.has(completionKey(habitId, dateKey)));

  const handleToggleDay = (habitId: string, newValue: string[]) => {
    const previousValue = completedDayKeysForHabit(habitId);
    const changedDay = dayKeys.find(
      (dateKey) => newValue.includes(dateKey) !== previousValue.includes(dateKey)
    );

    if (changedDay) {
      execute({ habitId, date: changedDay });
    }
  };

  const rangeLabel = `${RANGE_DAY_FORMATTER.format(days[0])} – ${RANGE_DAY_FORMATTER.format(days[6])}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/semana?week=${toDateKey(previousWeekStart)}`} />}
        >
          <ChevronLeftIcon />
          <span className="hidden sm:inline">Semana anterior</span>
        </Button>
        <span className="text-sm font-medium text-muted-foreground">{rangeLabel}</span>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/semana?week=${toDateKey(nextWeekStart)}`} />}
        >
          <span className="hidden sm:inline">Próxima semana</span>
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
        <TooltipProvider>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[40rem] border-separate border-spacing-2">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground">
                    Hábito
                  </th>
                  {days.map((day) => {
                    const isToday = isSameDay(day, today);

                    return (
                      <th
                        key={toDateKey(day)}
                        className={cn(
                          "rounded-md text-center text-sm font-medium text-muted-foreground",
                          isToday && "bg-accent text-accent-foreground"
                        )}
                      >
                        {WEEKDAY_LABEL_FORMATTER.format(day)}
                      </th>
                    );
                  })}
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
                      const isToday = isSameDay(day, today);

                      return (
                        <td
                          key={dateKey}
                          className={cn(
                            "rounded-md text-center",
                            isToday && "bg-accent"
                          )}
                        >
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

          <div className="flex flex-col gap-3 md:hidden">
            {habits.map((habit) => (
              <Card key={habit.id}>
                <CardContent className="flex flex-col gap-3">
                  <span className="font-medium">{habit.name}</span>
                  <ToggleGroup
                    multiple
                    value={completedDayKeysForHabit(habit.id)}
                    onValueChange={(newValue) => handleToggleDay(habit.id, newValue)}
                    className="w-full"
                  >
                    {days.map((day) => {
                      const dateKey = toDateKey(day);
                      const isFuture = day.getTime() > today.getTime();
                      const isToday = isSameDay(day, today);

                      return (
                        <Tooltip key={dateKey}>
                          <TooltipTrigger
                            render={
                              <ToggleGroupItem
                                value={dateKey}
                                disabled={isFuture}
                                className={cn(
                                  "h-11 min-w-11 flex-1 flex-col gap-0.5",
                                  "data-pressed:bg-primary data-pressed:text-primary-foreground",
                                  isToday && "ring-2 ring-primary/40"
                                )}
                              />
                            }
                          >
                            <span className="text-[0.65rem] uppercase leading-none">
                              {WEEKDAY_NARROW_FORMATTER.format(day)}
                            </span>
                            <span className="text-sm leading-none font-semibold">
                              {DAY_NUMBER_FORMATTER.format(day)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            {FULL_DATE_FORMATTER.format(day)}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </ToggleGroup>
                </CardContent>
              </Card>
            ))}
          </div>
        </TooltipProvider>
      )}
    </div>
  );
}
