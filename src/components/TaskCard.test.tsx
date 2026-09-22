import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DndContext } from "@dnd-kit/core";
import TaskCard from "@/components/TaskCard";
import type { Task } from "@/types/task";

const task: Task = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "牛乳を買う",
  description: "低脂肪乳を2本",
  status: "todo",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderCard(
  overrides: Partial<{
    task: Task;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
  }> = {},
) {
  const onEdit = overrides.onEdit ?? vi.fn();
  const onDelete = overrides.onDelete ?? vi.fn();
  render(
    <DndContext onDragEnd={() => {}}>
      <TaskCard task={overrides.task ?? task} onEdit={onEdit} onDelete={onDelete} />
    </DndContext>,
  );
  return { onEdit, onDelete };
}

describe("TaskCard", () => {
  it("タスクのタイトルと説明が表示される", () => {
    renderCard();

    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("低脂肪乳を2本")).toBeInTheDocument();
  });

  it("descriptionがnullの場合、説明文が表示されない", () => {
    renderCard({ task: { ...task, description: null } });

    expect(screen.queryByText("低脂肪乳を2本")).not.toBeInTheDocument();
  });

  it("編集ボタンを押すとonEditにタスクが渡されて呼ばれる", async () => {
    const user = userEvent.setup();
    const { onEdit } = renderCard();

    await user.click(screen.getByRole("button", { name: "編集" }));

    expect(onEdit).toHaveBeenCalledWith(task);
  });

  it("削除ボタンを押すと削除確認メッセージが表示される", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(screen.getByRole("button", { name: "削除" }));

    expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
  });

  it("削除確認でキャンセルを押すと確認メッセージが閉じonDeleteが呼ばれない", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();

    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByText("本当に削除しますか？")).not.toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("削除確認で削除するを押すとonDeleteにタスクIDが渡されて呼ばれる", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderCard();

    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(onDelete).toHaveBeenCalledWith(task.id);
  });
});
