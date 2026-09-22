import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Active, ClientRect, DragEndEvent, Over } from "@dnd-kit/core";
import TaskBoard, { createOnDragEnd } from "@/components/TaskBoard";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/tasks";
import type { Task } from "@/types/task";

vi.mock("@/lib/tasks", () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

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

function buildActive(id: string): Active {
  return {
    id,
    data: { current: undefined },
    rect: { current: { initial: null, translated: null } },
  };
}

function buildOver(id: string): Over {
  return {
    id,
    rect: {} as unknown as ClientRect,
    disabled: false,
    data: { current: undefined },
  };
}

function buildDragEndEvent(activeId: string, overId: string | null): DragEndEvent {
  return {
    activatorEvent: new Event("pointerup"),
    active: buildActive(activeId),
    collisions: null,
    delta: { x: 0, y: 0 },
    over: overId ? buildOver(overId) : null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(fetchTasks).mockResolvedValue([]);
});

describe("初期表示", () => {
  it("読み込み中はローディング表示がされる", () => {
    vi.mocked(fetchTasks).mockReturnValue(new Promise(() => {}));

    render(<TaskBoard />);

    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("タスクが0件の場合、各カラムに空の状態メッセージが表示される", async () => {
    render(<TaskBoard />);

    const emptyMessages = await screen.findAllByText("タスクがありません");
    expect(emptyMessages).toHaveLength(3);
  });

  it("取得したタスクがステータスごとの列に表示される", async () => {
    vi.mocked(fetchTasks).mockResolvedValue([
      makeTask({ id: "1", title: "牛乳を買う", status: "todo" }),
      makeTask({ id: "2", title: "資料を作成する", status: "in_progress" }),
    ]);

    render(<TaskBoard />);

    expect(await screen.findByText("牛乳を買う")).toBeInTheDocument();
    expect(screen.getByText("資料を作成する")).toBeInTheDocument();
  });

  it("タスク取得に失敗した場合、エラーメッセージが表示される", async () => {
    vi.mocked(fetchTasks).mockRejectedValue(new Error("network error"));

    render(<TaskBoard />);

    expect(
      await screen.findByText("タスクの取得に失敗しました"),
    ).toBeInTheDocument();
  });
});

describe("タスクの追加", () => {
  it("タスクを追加ボタンを押すと追加フォームが表示される", async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);
    await screen.findAllByText("タスクがありません");

    await user.click(screen.getByRole("button", { name: "タスクを追加" }));

    expect(screen.getByLabelText("タイトル")).toBeInTheDocument();
  });

  it("追加フォームでキャンセルを押すとフォームが閉じる", async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);
    await screen.findAllByText("タスクがありません");
    await user.click(screen.getByRole("button", { name: "タスクを追加" }));

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByLabelText("タイトル")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "タスクを追加" }),
    ).toBeInTheDocument();
  });

  it("タイトルを入力して追加すると一覧に新しいタスクが追加されフォームが閉じる", async () => {
    const user = userEvent.setup();
    vi.mocked(createTask).mockResolvedValue(
      makeTask({ id: "new-task", title: "新しいタスク" }),
    );
    render(<TaskBoard />);
    await screen.findAllByText("タスクがありません");
    await user.click(screen.getByRole("button", { name: "タスクを追加" }));
    await user.type(screen.getByLabelText("タイトル"), "新しいタスク");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(await screen.findByText("新しいタスク")).toBeInTheDocument();
    expect(screen.queryByLabelText("タイトル")).not.toBeInTheDocument();
  });

  it("タイトルが空のまま追加しようとするとcreateTaskが呼ばれない", async () => {
    const user = userEvent.setup();
    render(<TaskBoard />);
    await screen.findAllByText("タスクがありません");
    await user.click(screen.getByRole("button", { name: "タスクを追加" }));

    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(createTask).not.toHaveBeenCalled();
  });

  it("タスク作成でエラーが発生した場合、エラーメッセージが表示され一覧は変化しない", async () => {
    const user = userEvent.setup();
    vi.mocked(createTask).mockRejectedValue(new Error("insert failed"));
    render(<TaskBoard />);
    await screen.findAllByText("タスクがありません");
    await user.click(screen.getByRole("button", { name: "タスクを追加" }));
    await user.type(screen.getByLabelText("タイトル"), "新しいタスク");
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(
      await screen.findByText("タスクの追加に失敗しました"),
    ).toBeInTheDocument();
    expect(screen.queryByText("新しいタスク")).not.toBeInTheDocument();
  });
});

describe("タスクの編集", () => {
  it("編集ボタンを押すと編集フォームが表示される", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchTasks).mockResolvedValue([makeTask()]);
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await user.click(screen.getByRole("button", { name: "編集" }));

    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
    expect(screen.getByLabelText("タイトル")).toHaveValue("牛乳を買う");
  });

  it("編集フォームでキャンセルを押すとフォームが閉じる", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchTasks).mockResolvedValue([makeTask()]);
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");
    await user.click(screen.getByRole("button", { name: "編集" }));

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(
      screen.queryByRole("button", { name: "保存" }),
    ).not.toBeInTheDocument();
  });

  it("編集内容を保存すると一覧の対象タスクが更新される", async () => {
    const user = userEvent.setup();
    const original = makeTask();
    vi.mocked(fetchTasks).mockResolvedValue([original]);
    vi.mocked(updateTask).mockResolvedValue({
      ...original,
      title: "牛乳とパンを買う",
    });
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");
    await user.click(screen.getByRole("button", { name: "編集" }));
    const titleInput = screen.getByLabelText("タイトル");
    await user.clear(titleInput);
    await user.type(titleInput, "牛乳とパンを買う");
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("牛乳とパンを買う")).toBeInTheDocument();
    expect(screen.queryByText("牛乳を買う")).not.toBeInTheDocument();
  });

  it("編集の保存でエラーが発生した場合、エラーメッセージが表示され編集フォームは開いたままになる", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchTasks).mockResolvedValue([makeTask()]);
    vi.mocked(updateTask).mockRejectedValue(new Error("update failed"));
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");
    await user.click(screen.getByRole("button", { name: "編集" }));
    await user.click(screen.getByRole("button", { name: "保存" }));

    expect(
      await screen.findByText("タスクの更新に失敗しました"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();
  });
});

describe("タスクの削除", () => {
  it("削除を確定すると一覧からタスクが削除される", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchTasks).mockResolvedValue([makeTask()]);
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    await waitFor(() => {
      expect(screen.queryByText("牛乳を買う")).not.toBeInTheDocument();
    });
  });

  it("削除でエラーが発生した場合、エラーメッセージが表示され一覧からタスクは削除されない", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchTasks).mockResolvedValue([makeTask()]);
    vi.mocked(deleteTask).mockRejectedValue(new Error("delete failed"));
    render(<TaskBoard />);
    await screen.findByText("牛乳を買う");

    await user.click(screen.getByRole("button", { name: "削除" }));
    await user.click(screen.getByRole("button", { name: "削除する" }));

    expect(
      await screen.findByText("タスクの削除に失敗しました"),
    ).toBeInTheDocument();
    expect(screen.getByText("牛乳を買う")).toBeInTheDocument();
  });
});

describe("ドラッグ終了ハンドラ", () => {
  it("overがnullの場合、setTasksもupdateTaskも呼ばれない", async () => {
    const tasks = [makeTask()];
    const setTasks = vi.fn();
    const setErrorMessage = vi.fn();
    const onDragEnd = createOnDragEnd(tasks, setTasks, setErrorMessage);

    await onDragEnd(buildDragEndEvent(tasks[0].id, null));

    expect(setTasks).not.toHaveBeenCalled();
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("ドロップ先が現在と同じステータスの場合、setTasksもupdateTaskも呼ばれない", async () => {
    const tasks = [makeTask({ status: "todo" })];
    const setTasks = vi.fn();
    const setErrorMessage = vi.fn();
    const onDragEnd = createOnDragEnd(tasks, setTasks, setErrorMessage);

    await onDragEnd(buildDragEndEvent(tasks[0].id, "todo"));

    expect(setTasks).not.toHaveBeenCalled();
    expect(updateTask).not.toHaveBeenCalled();
  });

  it("別カラムにドロップするとステータスが更新されたtasksでsetTasksが呼ばれupdateTaskが呼ばれる", async () => {
    const tasks = [makeTask({ status: "todo" })];
    const setTasks = vi.fn();
    const setErrorMessage = vi.fn();
    vi.mocked(updateTask).mockResolvedValue(
      makeTask({ status: "in_progress" }),
    );
    const onDragEnd = createOnDragEnd(tasks, setTasks, setErrorMessage);

    await onDragEnd(buildDragEndEvent(tasks[0].id, "in_progress"));

    expect(setTasks).toHaveBeenCalledWith([{ ...tasks[0], status: "in_progress" }]);
    expect(updateTask).toHaveBeenCalledWith(tasks[0].id, {
      status: "in_progress",
    });
  });

  it("updateTaskが失敗した場合、setTasksが元のtasksに戻されエラーメッセージが設定される", async () => {
    const tasks = [makeTask({ status: "todo" })];
    const setTasks = vi.fn();
    const setErrorMessage = vi.fn();
    vi.mocked(updateTask).mockRejectedValue(new Error("update failed"));
    const onDragEnd = createOnDragEnd(tasks, setTasks, setErrorMessage);

    await onDragEnd(buildDragEndEvent(tasks[0].id, "in_progress"));

    expect(setTasks).toHaveBeenLastCalledWith(tasks);
    expect(setErrorMessage).toHaveBeenCalledWith("タスクの移動に失敗しました");
  });
});
