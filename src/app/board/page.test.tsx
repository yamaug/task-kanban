import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import BoardPage from "@/app/board/page";
import { fetchTasks } from "@/lib/tasks";

vi.mock("@/lib/tasks", () => ({
  fetchTasks: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(fetchTasks).mockResolvedValue([]);
});

describe("BoardPage", () => {
  it("boardページを表示するとタスクボードの見出しが表示される", async () => {
    render(<BoardPage />);

    expect(
      screen.getByRole("heading", { name: "タスクカンバン" }),
    ).toBeInTheDocument();
    await screen.findAllByText("タスクがありません");
  });
});
