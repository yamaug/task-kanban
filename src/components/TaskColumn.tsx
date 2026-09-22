"use client";

import { useDroppable } from "@dnd-kit/core";
import TaskCard from "@/components/TaskCard";
import type { Task, TaskStatus } from "@/types/task";

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskColumn({
  status,
  title,
  tasks,
  onEdit,
  onDelete,
}: TaskColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className="flex min-h-40 flex-1 flex-col gap-3 rounded-md border border-black/[.08] p-3 dark:border-white/[.145]"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          タスクがありません
        </p>
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
  );
}
