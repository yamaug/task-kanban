"use client";

import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import type { Task } from "@/types/task";

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
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col gap-2 rounded-md border border-black/[.08] bg-white p-3 text-sm shadow-sm dark:border-white/[.145] dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium">{task.title}</p>
        <button
          type="button"
          {...listeners}
          {...attributes}
          aria-label="ドラッグして移動"
          className="cursor-grab px-1 text-zinc-400"
        >
          ⠿
        </button>
      </div>
      {task.description && (
        <p className="text-zinc-600 dark:text-zinc-400">{task.description}</p>
      )}

      {isConfirmingDelete ? (
        <div className="flex flex-col gap-2">
          <p className="text-red-600 dark:text-red-400">
            本当に削除しますか？
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="rounded-md bg-red-600 px-2 py-1 text-white"
            >
              削除する
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              className="rounded-md border border-black/[.08] px-2 py-1 dark:border-white/[.145]"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-md border border-black/[.08] px-2 py-1 dark:border-white/[.145]"
          >
            編集
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="rounded-md border border-black/[.08] px-2 py-1 dark:border-white/[.145]"
          >
            削除
          </button>
        </div>
      )}
    </div>
  );
}
