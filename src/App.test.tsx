import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach } from "vitest";
import App from "./App";
import { resetPersistedChatState } from "./components/chatState";

describe("App - chat visibility by active tab", () => {
  beforeEach(() => {
    resetPersistedChatState();
  });

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

  it("preserves chat draft when returning to Welcome", async () => {
    render(<App />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("Message"), "Persistent draft");
    fireEvent.click(screen.getByRole("tab", { name: "Education" }));
    fireEvent.click(screen.getByRole("tab", { name: "Welcome" }));

    expect(screen.getByLabelText("Message")).toHaveValue("Persistent draft");
    expect(screen.getByRole("button", { name: "Send" })).toBeEnabled();
  });

  it("renders C1 as a link to the PDF opening in a new tab", () => {
    render(<App />);

    const c1Link = screen.getByRole("link", { name: "C1" });
    expect(c1Link).toHaveAttribute(
      "href",
      "/Daniele_QUERO_Certificate_of_Language_Proficiency_full_version.pdf"
    );
    expect(c1Link).toHaveAttribute("target", "_blank");
    expect(c1Link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders Certificate as clickable label in Courses without showing raw URL text", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Courses" }));

    const certificateLinks = screen.getAllByRole("link", { name: "Certificate" });
    expect(certificateLinks.length).toBeGreaterThan(0);
    expect(
      screen.queryByText("https://storage.googleapis.com/programminghub/certificate%2F1595059716951.pdf")
    ).not.toBeInTheDocument();
  });

  it("renders Repo as clickable label in Repositories without showing raw Link URL text", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Repositories" }));

    const repoLinks = screen.getAllByRole("link", { name: "Repo" });
    expect(repoLinks.length).toBeGreaterThan(0);
    expect(screen.queryByText("Link: https://github.com/daniele-quero/ac-2d-primer")).not.toBeInTheDocument();
  });

  it("renders Game as clickable label in Games without showing raw Link URL text", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("tab", { name: "Games" }));

    const gameLinks = screen.getAllByRole("link", { name: "Game" });
    expect(gameLinks.length).toBeGreaterThan(0);
    expect(screen.queryByText("Link: https://danioquero.itch.io/family-zoo")).not.toBeInTheDocument();
  });
});
