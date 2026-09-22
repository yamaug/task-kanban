import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "@/lib/supabase";
import { fetchTasks, createTask, updateTask, deleteTask } from "@/lib/tasks";

vi.mock("@/lib/supabase", () => ({
  supabase: { from: vi.fn() },
}));

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  created_at: string;
  updated_at: string;
}

interface SupabaseResult<T> {
  data: T;
  error: { message: string } | null;
}

interface QueryBuilderMock<T> {
  select: ReturnType<typeof vi.fn>;
  order: ReturnType<typeof vi.fn>;
  insert: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  eq: ReturnType<typeof vi.fn>;
  single: ReturnType<typeof vi.fn>;
  then: <TResult1 = SupabaseResult<T>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResult<T>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) => Promise<TResult1 | TResult2>;
}

function createQueryBuilder<T>(result: SupabaseResult<T>): QueryBuilderMock<T> {
  const builder: QueryBuilderMock<T> = {
    select: vi.fn(() => builder),
    order: vi.fn(() => builder),
    insert: vi.fn(() => builder),
    update: vi.fn(() => builder),
    delete: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    single: vi.fn(() => builder),
    then: (onfulfilled, onrejected) =>
      Promise.resolve(result).then(onfulfilled, onrejected),
  };
  return builder;
}

function mockFrom<T>(builder: QueryBuilderMock<T>) {
  vi.mocked(supabase.from).mockReturnValue(
    builder as unknown as ReturnType<typeof supabase.from>,
  );
  return builder;
}

const mockRow: TaskRow = {
  id: "11111111-1111-1111-1111-111111111111",
  title: "牛乳を買う",
  description: "低脂肪乳を2本",
  status: "todo",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.mocked(supabase.from).mockReset();
});

describe("fetchTasks", () => {
  it("取得に成功した場合、タスク一覧をキャメルケースの型で返す", async () => {
    mockFrom(createQueryBuilder({ data: [mockRow], error: null }));

    const tasks = await fetchTasks();

    expect(tasks).toEqual([
      {
        id: mockRow.id,
        title: mockRow.title,
        description: mockRow.description,
        status: mockRow.status,
        createdAt: mockRow.created_at,
        updatedAt: mockRow.updated_at,
      },
    ]);
  });

  it("タスクが0件の場合、空配列を返す", async () => {
    mockFrom(createQueryBuilder({ data: [], error: null }));

    const tasks = await fetchTasks();

    expect(tasks).toEqual([]);
  });

  it("Supabaseがエラーを返した場合、エラーをthrowする", async () => {
    mockFrom(
      createQueryBuilder<TaskRow[] | null>({
        data: null,
        error: { message: "network error" },
      }),
    );

    await expect(fetchTasks()).rejects.toThrow("network error");
  });
});

describe("createTask", () => {
  it("titleのみ指定した場合、descriptionはnullとして保存され作成されたタスクを返す", async () => {
    const builder = mockFrom(
      createQueryBuilder({ data: { ...mockRow, description: null }, error: null }),
    );

    const task = await createTask({ title: "牛乳を買う" });

    expect(builder.insert).toHaveBeenCalledWith({
      title: "牛乳を買う",
      description: null,
    });
    expect(task.description).toBeNull();
  });

  it("titleとdescriptionを指定した場合、作成されたタスクを返す", async () => {
    const builder = mockFrom(createQueryBuilder({ data: mockRow, error: null }));

    const task = await createTask({
      title: mockRow.title,
      description: mockRow.description,
    });

    expect(builder.insert).toHaveBeenCalledWith({
      title: mockRow.title,
      description: mockRow.description,
    });
    expect(task).toEqual({
      id: mockRow.id,
      title: mockRow.title,
      description: mockRow.description,
      status: mockRow.status,
      createdAt: mockRow.created_at,
      updatedAt: mockRow.updated_at,
    });
  });

  it("Supabaseがエラーを返した場合、エラーをthrowする", async () => {
    mockFrom(
      createQueryBuilder<TaskRow | null>({
        data: null,
        error: { message: "insert failed" },
      }),
    );

    await expect(createTask({ title: "牛乳を買う" })).rejects.toThrow(
      "insert failed",
    );
  });
});

describe("updateTask", () => {
  it("statusのみ更新すると更新後のタスクを返す", async () => {
    const updatedRow = { ...mockRow, status: "done" as const };
    const builder = mockFrom(createQueryBuilder({ data: updatedRow, error: null }));

    const task = await updateTask(mockRow.id, { status: "done" });

    expect(builder.update).toHaveBeenCalledWith({ status: "done" });
    expect(builder.eq).toHaveBeenCalledWith("id", mockRow.id);
    expect(task.status).toBe("done");
  });

  it("titleとdescriptionを更新すると更新後のタスクを返す", async () => {
    const updatedRow = { ...mockRow, title: "パンを買う", description: "食パン" };
    const builder = mockFrom(createQueryBuilder({ data: updatedRow, error: null }));

    const task = await updateTask(mockRow.id, {
      title: "パンを買う",
      description: "食パン",
    });

    expect(builder.update).toHaveBeenCalledWith({
      title: "パンを買う",
      description: "食パン",
    });
    expect(task.title).toBe("パンを買う");
    expect(task.description).toBe("食パン");
  });

  it("Supabaseがエラーを返した場合、エラーをthrowする", async () => {
    mockFrom(
      createQueryBuilder<TaskRow | null>({
        data: null,
        error: { message: "update failed" },
      }),
    );

    await expect(updateTask(mockRow.id, { status: "done" })).rejects.toThrow(
      "update failed",
    );
  });
});

describe("deleteTask", () => {
  it("削除に成功した場合、例外を投げずに正常終了する", async () => {
    mockFrom(createQueryBuilder<null>({ data: null, error: null }));

    await expect(deleteTask(mockRow.id)).resolves.toBeUndefined();
  });

  it("Supabaseがエラーを返した場合、エラーをthrowする", async () => {
    mockFrom(
      createQueryBuilder<null>({
        data: null,
        error: { message: "delete failed" },
      }),
    );

    await expect(deleteTask(mockRow.id)).rejects.toThrow("delete failed");
  });
});
