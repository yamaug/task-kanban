import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("Home page", () => {
  it("見出しのテキストが表示される", () => {
    render(<Home />);

    expect(
      screen.getByText(/To get started, edit the/i)
    ).toBeInTheDocument();
  });

  it("Documentation へのリンクが正しいURLを持つ", () => {
    render(<Home />);

    const link = screen.getByRole("link", { name: /documentation/i });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("nextjs.org/docs")
    );
  });
});
