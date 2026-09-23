import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskBoardHeader from "@/components/TaskBoardHeader";

describe("TaskBoardHeader", () => {
  it("タスクカンバンという見出しが表示される", () => {
    render(<TaskBoardHeader />);

    expect(
      screen.getByRole("heading", { name: "タスクカンバン", level: 1 }),
    ).toBeInTheDocument();
  });
});
