import { fireEvent, render, screen } from "@testing-library/react";
import { Tabs, type TabItem } from "./Tabs";

const tabItems: TabItem[] = [
  {
    id: "welcome",
    label: "Benvenuto",
    content: <p>Contenuto benvenuto</p>
  },
  {
    id: "education",
    label: "Formazione",
    content: <p>Contenuto formazione</p>
  },
  {
    id: "experience",
    label: "Esperienze",
    content: <p>Contenuto esperienze</p>
  },
  {
    id: "skills",
    label: "Skill",
    content: <p>Contenuto skill</p>
  }
];

describe("Tabs", () => {
  it("renders with valid ARIA and first tab selected", () => {
    render(<Tabs items={tabItems} />);

    const firstTab = screen.getByRole("tab", { name: "Benvenuto" });
    const firstPanel = screen.getByRole("tabpanel", { name: "Benvenuto" });

    expect(firstTab).toHaveAttribute("aria-selected", "true");
    expect(firstTab).toHaveAttribute("tabindex", "0");
    expect(firstPanel).toBeVisible();
  });

  it("supports arrows, Home and End keyboard navigation", () => {
    render(<Tabs items={tabItems} />);

    const welcomeTab = screen.getByRole("tab", { name: "Benvenuto" });
    welcomeTab.focus();

    fireEvent.keyDown(welcomeTab, { key: "ArrowRight" });

    const formazioneTab = screen.getByRole("tab", { name: "Formazione" });
    expect(formazioneTab).toHaveFocus();
    expect(formazioneTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(formazioneTab, { key: "End" });

    const skillTab = screen.getByRole("tab", { name: "Skill" });
    expect(skillTab).toHaveFocus();
    expect(skillTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(skillTab, { key: "Home" });

    expect(welcomeTab).toHaveFocus();
    expect(welcomeTab).toHaveAttribute("aria-selected", "true");
  });
});
