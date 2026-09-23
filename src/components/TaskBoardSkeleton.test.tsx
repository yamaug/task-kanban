import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import TaskBoardSkeleton from "@/components/TaskBoardSkeleton";
import { TASK_STATUSES } from "@/types/task";

describe("TaskBoardSkeleton", () => {
  it("ステータスの数だけプレースホルダーのカードが表示される", () => {
    const { container } = render(<TaskBoardSkeleton />);

    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(
      TASK_STATUSES.length,
    );
  });
});
