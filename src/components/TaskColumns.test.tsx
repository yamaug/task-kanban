import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskColumns from "@/components/TaskColumns";
import type { Task } from "@/types/task";

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    title: "牛乳を買う",
    description: null,
    status: "todo",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("TaskColumns", () => {
  it("ステータスごとの3つの列見出しが表示される", () => {
    render(
      <TaskColumns
        tasks={[]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );

    expect(screen.getByText("未着手")).toBeInTheDocument();
    expect(screen.getByText("進行中")).toBeInTheDocument();
    expect(screen.getByText("完了")).toBeInTheDocument();
  });

  it("タスクがステータスごとの列に振り分けて表示される", () => {
    render(
      <TaskColumns
        tasks={[
          makeTask({ id: "1", title: "牛乳を買う", status: "todo" }),
          makeTask({ id: "2", title: "資料を作成する", status: "in_progress" }),
          makeTask({ id: "3", title: "報告書を提出する", status: "done" }),
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onDragEnd={vi.fn()}
      />,
    );

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("資料を作成する")).toBeInTheDocument();
    expect(screen.getByText("報告書を提出する")).toBeInTheDocument();
  });
});
