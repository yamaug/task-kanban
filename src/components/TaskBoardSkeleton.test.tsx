import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TaskBoardSkeleton from "@/components/TaskBoardSkeleton";
import { TASK_STATUSES } from "@/types/task";

describe("TaskBoardSkeleton", () => {
  it("ステータスの数だけプレースホルダーのカードが表示される", () => {
    render(<TaskBoardSkeleton />);

    expect(screen.getAllByRole("status")).toHaveLength(TASK_STATUSES.length);
  });
});
