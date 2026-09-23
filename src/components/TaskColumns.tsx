"use client";

import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import TaskColumn from "@/components/TaskColumn";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/types/task";
import type { Task } from "@/types/task";

interface TaskColumnsProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export default function TaskColumns({
  tasks,
  onEdit,
  onDelete,
  onDragEnd,
}: TaskColumnsProps) {
  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="flex flex-col gap-4 sm:flex-row">
        {TASK_STATUSES.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            title={TASK_STATUS_LABELS[status]}
            tasks={tasks.filter((task) => task.status === status)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </DndContext>
  );
}
