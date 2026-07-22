"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ListChecksIcon, MoreVerticalIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { HabitForm } from "@/components/habitos/habit-form";
import { deleteHabitAction } from "@/actions/delete-habit";
import { getHabitColorVar, getHabitIcon } from "@/lib/habit-options";

interface Habit {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface HabitListProps {
  habits: Habit[];
}

export function HabitList({ habits }: HabitListProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  const deleteAction = useAction(deleteHabitAction, {
    onSuccess: () => {
      toast.success("Hábito removido.");
      setDeletingHabit(null);
    },
    onError: () => {
      toast.error("Não foi possível remover o hábito.");
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <PlusIcon />
            Novo hábito
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo hábito</DialogTitle>
            </DialogHeader>
            <HabitForm onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {habits.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecksIcon />
            </EmptyMedia>
            <EmptyTitle>Nenhum hábito cadastrado</EmptyTitle>
            <EmptyDescription>
              Crie seu primeiro hábito para começar a acompanhar seu progresso.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <PlusIcon />
              Novo hábito
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {habits.map((habit) => {
            const Icon = getHabitIcon(habit.icon);

            return (
              <Card
                key={habit.id}
                className="transition-colors hover:bg-muted/50"
              >
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 shrink-0 items-center justify-center rounded-lg text-primary-foreground"
                      style={{ backgroundColor: getHabitColorVar(habit.color) }}
                    >
                      <Icon className="size-4.5" />
                    </span>
                    <span className="font-medium">{habit.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <MoreVerticalIcon />
                      <span className="sr-only">Ações do hábito</span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingHabit(habit)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingHabit(habit)}
                      >
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar hábito</DialogTitle>
          </DialogHeader>
          {editingHabit && (
            <HabitForm habit={editingHabit} onSuccess={() => setEditingHabit(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingHabit}
        onOpenChange={(open) => !open && setDeletingHabit(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover hábito</DialogTitle>
            <DialogDescription>
              Esta ação move &quot;{deletingHabit?.name}&quot; para os hábitos
              arquivados. As conclusões registradas serão mantidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingHabit(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteAction.isPending}
              onClick={() => deletingHabit && deleteAction.execute({ id: deletingHabit.id })}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
