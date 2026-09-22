"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { DndContext } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import TaskColumn from "@/components/TaskColumn";
import TaskForm from "@/components/TaskForm";
import { createTask, deleteTask, fetchTasks, updateTask } from "@/lib/tasks";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/types/task";
import type { Task, TaskStatus } from "@/types/task";

export function createOnDragEnd(
  tasks: Task[],
  setTasks: Dispatch<SetStateAction<Task[]>>,
  setErrorMessage: Dispatch<SetStateAction<string | null>>,
) {
  return async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const newStatus = String(over.id) as TaskStatus;
    const targetTask = tasks.find((task) => task.id === taskId);
    if (!targetTask || targetTask.status === newStatus) return;

    const previousTasks = tasks;
    const nextTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task,
    );
    setTasks(nextTasks);

    try {
      await updateTask(taskId, { status: newStatus });
    } catch {
      setTasks(previousTasks);
      setErrorMessage("タスクの移動に失敗しました");
    }
  };
}

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchTasks()
      .then((fetched) => {
        if (isMounted) setTasks(fetched);
      })
      .catch(() => {
        if (isMounted) setErrorMessage("タスクの取得に失敗しました");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAddTask(values: {
    title: string;
    description: string | null;
  }) {
    try {
      const newTask = await createTask(values);
      setTasks((prev) => [...prev, newTask]);
      setIsAddFormOpen(false);
    } catch {
      setErrorMessage("タスクの追加に失敗しました");
    }
  }

  async function handleEditSubmit(values: {
    title: string;
    description: string | null;
  }) {
    if (!editingTask) return;
    try {
      const updated = await updateTask(editingTask.id, values);
      setTasks((prev) =>
        prev.map((task) => (task.id === updated.id ? updated : task)),
      );
      setEditingTask(null);
    } catch {
      setErrorMessage("タスクの更新に失敗しました");
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch {
      setErrorMessage("タスクの削除に失敗しました");
    }
  }

  const onDragEnd = createOnDragEnd(tasks, setTasks, setErrorMessage);

  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-bold">タスクカンバン</h1>

      {errorMessage && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {errorMessage}
        </p>
      )}

      {isLoading ? (
        <p>読み込み中...</p>
      ) : (
        <>
          {isAddFormOpen ? (
            <TaskForm
              submitLabel="追加"
              onSubmit={handleAddTask}
              onCancel={() => setIsAddFormOpen(false)}
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsAddFormOpen(true)}
              className="w-fit rounded-md bg-zinc-900 px-3 py-2 text-sm text-white dark:bg-zinc-50 dark:text-black"
            >
              タスクを追加
            </button>
          )}

          {editingTask && (
            <TaskForm
              initialTask={editingTask}
              submitLabel="保存"
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingTask(null)}
            />
          )}

          <DndContext onDragEnd={onDragEnd}>
            <div className="flex flex-col gap-4 sm:flex-row">
              {TASK_STATUSES.map((status) => (
                <TaskColumn
                  key={status}
                  status={status}
                  title={TASK_STATUS_LABELS[status]}
                  tasks={tasks.filter((task) => task.status === status)}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </DndContext>
        </>
      )}
    </main>
  );
}
