"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { MoreVerticalIcon, PlusIcon } from "lucide-react";
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
import { HabitForm } from "@/components/habitos/habit-form";
import { deleteHabitAction } from "@/actions/delete-habit";

interface Habit {
  id: string;
  name: string;
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
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Nenhum hábito cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {habits.map((habit) => (
            <Card key={habit.id}>
              <CardContent className="flex items-center justify-between">
                <span className="font-medium">{habit.name}</span>
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
          ))}
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
