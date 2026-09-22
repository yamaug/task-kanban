"use client";

import { useDroppable } from "@dnd-kit/core";
import { Circle, Radio, CheckCircle2 } from "lucide-react";
import TaskCard from "@/components/TaskCard";
import type { Task, TaskStatus } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const STATUS_ACCENT: Record<
  TaskStatus,
  { icon: typeof Circle; badgeClassName: string; borderClassName: string }
> = {
  todo: {
    icon: Circle,
    badgeClassName: "border-chart-1/40 bg-chart-1/10 text-chart-1",
    borderClassName: "border-l-chart-1",
  },
  in_progress: {
    icon: Radio,
    badgeClassName: "border-chart-2/40 bg-chart-2/10 text-chart-2",
    borderClassName: "border-l-chart-2",
  },
  done: {
    icon: CheckCircle2,
    badgeClassName: "border-chart-3/40 bg-chart-3/10 text-chart-3",
    borderClassName: "border-l-chart-3",
  },
};

export default function TaskColumn({
  status,
  title,
  tasks,
  onEdit,
  onDelete,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const accent = STATUS_ACCENT[status];
  const Icon = accent.icon;

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "min-h-40 flex-1 gap-3 border-l-2 bg-hud-grid transition-colors",
        accent.borderClassName,
        isOver && "border-primary glow-primary",
      )}
    >
      <div className="flex flex-col gap-3 px-(--card-spacing)">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold tracking-wide">
            <Icon className="size-3.5 text-muted-foreground" />
            {title}
          </h2>
          <Badge variant="outline" className={accent.badgeClassName}>
            {tasks.length}
          </Badge>
        </div>
        <Separator />

        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">タスクがありません</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
