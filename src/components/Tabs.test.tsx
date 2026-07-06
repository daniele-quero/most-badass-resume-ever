import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Tabs, type TabItem } from "./Tabs";

const tabItems: TabItem[] = [
  {
    id: "welcome",
    label: "Welcome",
    content: <p>Welcome content</p>
  },
  {
    id: "education",
    label: "Education",
    content: <p>Education content</p>
  },
  {
    id: "experience",
    label: "Experience",
    content: <p>Experience content</p>
  },
  {
    id: "skills",
    label: "Skills",
    content: <p>Skills content</p>
  }
];

describe("Tabs", () => {
  it("renders with valid ARIA and first tab selected", () => {
    render(<Tabs items={tabItems} />);

    const firstTab = screen.getByRole("tab", { name: "Welcome" });
    const firstPanel = screen.getByRole("tabpanel", { name: "Welcome" });

    expect(firstTab).toHaveAttribute("aria-selected", "true");
    expect(firstTab).toHaveAttribute("tabindex", "0");
    expect(firstPanel).toBeVisible();
  });

  it("supports arrows, Home and End keyboard navigation", () => {
    render(<Tabs items={tabItems} />);

    const welcomeTab = screen.getByRole("tab", { name: "Welcome" });
    welcomeTab.focus();

    fireEvent.keyDown(welcomeTab, { key: "ArrowRight" });

    const educationTab = screen.getByRole("tab", { name: "Education" });
    expect(educationTab).toHaveFocus();
    expect(educationTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(educationTab, { key: "End" });

    const skillsTab = screen.getByRole("tab", { name: "Skills" });
    expect(skillsTab).toHaveFocus();
    expect(skillsTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(skillsTab, { key: "Home" });

    expect(welcomeTab).toHaveFocus();
    expect(welcomeTab).toHaveAttribute("aria-selected", "true");
  });

  it("calls onTabChange with the correct id on tab click", () => {
    const onTabChange = vi.fn();
    render(<Tabs items={tabItems} onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole("tab", { name: "Education" }));
    expect(onTabChange).toHaveBeenCalledTimes(1);
    expect(onTabChange).toHaveBeenCalledWith("education");
  });

  it("calls onTabChange from keyboard with the correct id", () => {
    const onTabChange = vi.fn();
    render(<Tabs items={tabItems} onTabChange={onTabChange} />);

    const welcomeTab = screen.getByRole("tab", { name: "Welcome" });
    welcomeTab.focus();
    fireEvent.keyDown(welcomeTab, { key: "ArrowRight" });

    expect(onTabChange).toHaveBeenCalledTimes(1);
    expect(onTabChange).toHaveBeenCalledWith("education");
  });
});
