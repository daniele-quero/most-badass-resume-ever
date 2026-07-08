import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, vi } from "vitest";
import App from "../App";
import { resetPersistedChatState } from "./chatState";

type MatchMediaListener = (event: MediaQueryListEvent) => void;

const originalMatchMedia = window.matchMedia;

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => {
      const listeners = new Set<MatchMediaListener>();

      return {
        matches,
        media: query,
        onchange: null,
        addListener: (listener: MatchMediaListener) => listeners.add(listener),
        removeListener: (listener: MatchMediaListener) => listeners.delete(listener),
        addEventListener: (_type: string, listener: MatchMediaListener) =>
          listeners.add(listener),
        removeEventListener: (_type: string, listener: MatchMediaListener) =>
          listeners.delete(listener),
        dispatchEvent: () => true
      };
    })
  });
}

describe("Profile summary responsive behavior", () => {
  beforeEach(() => {
    resetPersistedChatState();
  });

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: originalMatchMedia
    });
  });

  it("toggles profile summary on mobile with aria-expanded state", async () => {
    setMatchMedia(true);
    const user = userEvent.setup();

    render(<App />);

    const toggleButton = screen.getByRole("button", { name: "Show profile" });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    const profileSummary = document.getElementById("profile-summary");
    expect(profileSummary).toHaveAttribute("hidden");

    await user.click(toggleButton);

    expect(screen.getByRole("button", { name: "Hide profile" })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(profileSummary).not.toHaveAttribute("hidden");
  });

  it("keeps profile summary visible on desktop and hides mobile toggle", () => {
    setMatchMedia(false);

    render(<App />);

    expect(
      screen.queryByRole("button", { name: /show profile|hide profile/i })
    ).not.toBeInTheDocument();

    const profileSummary = screen.getByLabelText("Quick profile");
    expect(profileSummary).toBeInTheDocument();
    expect(profileSummary).not.toHaveAttribute("hidden");
  });
});
