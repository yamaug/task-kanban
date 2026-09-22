import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("見出しのテキストが表示される", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "タスクカンバン" }),
    ).toBeInTheDocument();
  });

  it("ボードへのリンクが正しいURLを持つ", () => {
    render(<Home />);

    const link = screen.getByRole("link", { name: /ボードを開く/ });
    expect(link).toHaveAttribute("href", "/board");
  });
});
