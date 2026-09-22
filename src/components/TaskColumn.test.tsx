import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DndContext } from "@dnd-kit/core";
import TaskColumn from "@/components/TaskColumn";
import type { Task } from "@/types/task";

const tasks: Task[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "牛乳を買う",
    description: null,
    status: "todo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "パンを買う",
    description: null,
    status: "todo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function renderColumn(taskList: Task[]) {
  render(
    <DndContext onDragEnd={() => {}}>
      <TaskColumn
        status="todo"
        title="未着手"
        tasks={taskList}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    </DndContext>,
  );
}

describe("TaskColumn", () => {
  it("タイトルとタスク件数が表示される", () => {
    renderColumn(tasks);

    expect(screen.getByText("未着手")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("タスクが0件の場合、空の状態メッセージが表示される", () => {
    renderColumn([]);

    expect(screen.getByText("タスクがありません")).toBeInTheDocument();
  });

  it("渡されたタスクの数だけカードが表示される", () => {
    renderColumn(tasks);

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("パンを買う")).toBeInTheDocument();
  });
});
