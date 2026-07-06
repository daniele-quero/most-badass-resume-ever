import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

describe("App - chat visibility by active tab", () => {
  it("shows chat when the Welcome tab is active", () => {
    render(<App />);
    expect(screen.getByRole("region", { name: "Chat" })).toBeInTheDocument();
  });

  it("hides chat when switching to another tab", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Education" }));
    expect(screen.queryByRole("region", { name: "Chat" })).not.toBeInTheDocument();
  });

  it("keeps chat hidden on multiple non-Welcome tabs", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Experience" }));
    expect(screen.queryByRole("region", { name: "Chat" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Skills" }));
    expect(screen.queryByRole("region", { name: "Chat" })).not.toBeInTheDocument();
  });

  it("shows chat again when returning to Welcome", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Education" }));
    fireEvent.click(screen.getByRole("tab", { name: "Welcome" }));
    expect(screen.getByRole("region", { name: "Chat" })).toBeInTheDocument();
  });
});
