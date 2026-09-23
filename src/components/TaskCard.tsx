"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { Task } from "@/types/task";
import TaskCardDeleteConfirm from "@/components/TaskCardDeleteConfirm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "border-border/60 transition-all",
        transform && "glow-primary scale-[1.02] opacity-90",
      )}
    >
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{task.title}</p>
          <button
            type="button"
            {...listeners}
            {...attributes}
            aria-label="ドラッグして移動"
            className="cursor-grab rounded-sm p-1 text-muted-foreground transition-colors hover:text-primary active:cursor-grabbing"
          >
            <GripVertical className="size-4" />
          </button>
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}

        {isConfirmingDelete ? (
          <TaskCardDeleteConfirm
            onConfirm={() => onDelete(task.id)}
            onCancel={() => setIsConfirmingDelete(false)}
          />
        ) : (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
            >
              <Pencil className="size-3.5" />
              編集
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmingDelete(true)}
            >
              <Trash2 className="size-3.5" />
              削除
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
