import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskCardDeleteConfirm from "@/components/TaskCardDeleteConfirm";

describe("TaskCardDeleteConfirm", () => {
  it("削除確認メッセージが表示される", () => {
    render(<TaskCardDeleteConfirm onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText("本当に削除しますか？")).toBeInTheDocument();
  });

  it("削除するボタンを押すとonConfirmが呼ばれる", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<TaskCardDeleteConfirm onConfirm={onConfirm} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(onConfirm).toHaveBeenCalled();
  });

  it("キャンセルボタンを押すとonCancelが呼ばれる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TaskCardDeleteConfirm onConfirm={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
