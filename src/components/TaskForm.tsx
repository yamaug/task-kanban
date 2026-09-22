"use client";

import { useState } from "react";
import type { Task } from "@/types/task";

interface TaskFormProps {
  initialTask?: Pick<Task, "title" | "description">;
  submitLabel: string;
  onSubmit: (values: { title: string; description: string | null }) => void;
  onCancel: () => void;
}

export default function TaskForm({
  initialTask,
  submitLabel,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? "");
  const [description, setDescription] = useState(
    initialTask?.description ?? "",
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (trimmedTitle === "") {
      setValidationError("タイトルは必須です");
      return;
    }

    const trimmedDescription = description.trim();
    onSubmit({
      title: trimmedTitle,
      description: trimmedDescription === "" ? null : trimmedDescription,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-md border border-black/[.08] p-4 dark:border-white/[.145]"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="task-title" className="text-sm font-medium">
          タイトル
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-md border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145] dark:bg-black"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="task-description" className="text-sm font-medium">
          説明
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-md border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145] dark:bg-black"
        />
      </div>

      {validationError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {validationError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145]"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
