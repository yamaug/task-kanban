"use client";

import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import TaskBoardHeader from "@/components/TaskBoardHeader";
import TaskBoardSkeleton from "@/components/TaskBoardSkeleton";
import AddTaskControl from "@/components/AddTaskControl";
import TaskColumns from "@/components/TaskColumns";
import TaskForm from "@/components/TaskForm";
import { createTask, deleteTask, fetchTasks, updateTask } from "@/lib/tasks";
import type { Task, TaskStatus } from "@/types/task";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <main className="relative flex min-h-screen flex-col gap-4 overflow-hidden bg-starfield p-6">
      <div className="pointer-events-none absolute inset-0 bg-hud-grid opacity-40" />

      <TaskBoardHeader />

      {errorMessage && (
        <Alert variant="destructive" className="relative">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <>
          <p className="relative text-sm text-muted-foreground">読み込み中...</p>
          <div className="relative">
            <TaskBoardSkeleton />
          </div>
        </>
      ) : (
        <div className="relative flex flex-col gap-4">
          <AddTaskControl
            isOpen={isAddFormOpen}
            onOpen={() => setIsAddFormOpen(true)}
            onClose={() => setIsAddFormOpen(false)}
            onSubmit={handleAddTask}
          />

          {editingTask && (
            <TaskForm
              initialTask={editingTask}
              submitLabel="保存"
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingTask(null)}
            />
          )}

          <TaskColumns
            tasks={tasks}
            onEdit={setEditingTask}
            onDelete={handleDeleteTask}
            onDragEnd={onDragEnd}
          />
        </div>
      )}
    </main>
  );
}
