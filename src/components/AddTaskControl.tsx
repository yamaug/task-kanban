"use client";

import { Plus } from "lucide-react";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";

interface AddTaskControlProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSubmit: (values: { title: string; description: string | null }) => void;
}

export default function AddTaskControl({
  isOpen,
  onOpen,
  onClose,
  onSubmit,
}: AddTaskControlProps) {
  if (isOpen) {
    return <TaskForm submitLabel="追加" onSubmit={onSubmit} onCancel={onClose} />;
  }

  return (
    <Button type="button" onClick={onOpen} className="w-fit">
      <Plus className="size-4" />
      タスクを追加
    </Button>
  );
}
