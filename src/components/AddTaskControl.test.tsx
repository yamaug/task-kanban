import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTaskControl from "@/components/AddTaskControl";

describe("AddTaskControl", () => {
  it("閉じている場合、タスクを追加ボタンが表示される", () => {
    render(
      <AddTaskControl
        isOpen={false}
        onOpen={vi.fn()}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "タスクを追加" }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("タイトル")).not.toBeInTheDocument();
  });

  it("タスクを追加ボタンを押すとonOpenが呼ばれる", async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    render(
      <AddTaskControl
        isOpen={false}
        onOpen={onOpen}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "タスクを追加" }));

    expect(onOpen).toHaveBeenCalled();
  });

  it("開いている場合、追加フォームが表示される", () => {
    render(
      <AddTaskControl
        isOpen={true}
        onOpen={vi.fn()}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "追加" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "タスクを追加" }),
    ).not.toBeInTheDocument();
  });

  it("フォームでキャンセルを押すとonCloseが呼ばれる", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AddTaskControl
        isOpen={true}
        onOpen={vi.fn()}
        onClose={onClose}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onClose).toHaveBeenCalled();
  });

  it("タイトルを入力して追加するとonSubmitが値付きで呼ばれる", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <AddTaskControl
        isOpen={true}
        onOpen={vi.fn()}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByLabelText("タイトル"), "新しいタスク");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "新しいタスク",
      description: null,
    });
  });
});
