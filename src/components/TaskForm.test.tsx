import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "@/components/TaskForm";

describe("TaskForm", () => {
  it("初期値未指定の場合、タイトルと説明の入力欄が空で表示される", () => {
    render(
      <TaskForm submitLabel="追加" onSubmit={vi.fn()} onCancel={vi.fn()} />,
    );

    expect(screen.getByLabelText("タイトル")).toHaveValue("");
    expect(screen.getByLabelText("説明")).toHaveValue("");
  });

  it("初期タスクを指定した場合、タイトルと説明に初期値が表示される", () => {
    render(
      <TaskForm
        initialTask={{ title: "牛乳を買う", description: "低脂肪乳を2本" }}
        submitLabel="保存"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("タイトル")).toHaveValue("牛乳を買う");
    expect(screen.getByLabelText("説明")).toHaveValue("低脂肪乳を2本");
  });

  it("タイトルが空のまま送信すると、エラーメッセージが表示されonSubmitが呼ばれない", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm submitLabel="追加" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(screen.getByText("タイトルは必須です")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("タイトルと説明を入力して送信すると、trimした値でonSubmitが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm submitLabel="追加" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText("タイトル"), "  牛乳を買う  ");
    await user.type(screen.getByLabelText("説明"), "  低脂肪乳を2本  ");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "牛乳を買う",
      description: "低脂肪乳を2本",
    });
  });

  it("説明を入力せず送信すると、descriptionにnullを渡してonSubmitが呼ばれる", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm submitLabel="追加" onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText("タイトル"), "牛乳を買う");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onSubmit).toHaveBeenCalledWith({
      title: "牛乳を買う",
      description: null,
    });
  });

  it("キャンセルボタンを押すとonCancelが呼ばれる", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<TaskForm submitLabel="追加" onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
