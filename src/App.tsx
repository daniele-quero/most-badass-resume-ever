import { useEffect, useState } from "react";
import { Chat } from "./components/Chat";
import { Tabs } from "./components/Tabs";
import { HeroHeader } from "./components/resume/HeroHeader";
import { ProfileSummary } from "./components/resume/ProfileSummary";
import { WELCOME_TAB_ID, resumeTabs } from "./components/resume/resumeTabs";

const MOBILE_MEDIA_QUERY = "(max-width: 980px)";

function getIsMobileViewport() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

function App() {
  const [activeTabId, setActiveTabId] = useState(WELCOME_TAB_ID);
  const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(
    () => !getIsMobileViewport()
  );
  // La chat segue la tab Welcome, cosi il layout resta sempre montato.
  const isWelcomeTabActive = activeTabId === WELCOME_TAB_ID;

  const handleMobileSummaryToggle = () => {
    setIsMobileSummaryOpen((isOpen) => {
      const nextOpen = !isOpen;
      if (nextOpen) {
        window.requestAnimationFrame(() => {
          const summary = document.getElementById("profile-summary");
          if (!summary) {
            return;
          }

          if (typeof summary.scrollIntoView !== "function") {
            return;
          }

          const prefersReducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;

          summary.scrollIntoView({
            block: "start",
            behavior: prefersReducedMotion ? "auto" : "smooth"
          });
        });
      }

      return nextOpen;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);
    const applyViewport = (isMobile: boolean) => {
      setIsMobileViewport(isMobile);
      setIsMobileSummaryOpen(!isMobile);
    };

    applyViewport(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      applyViewport(event.matches);
    };

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
      return () => {
        mediaQueryList.removeEventListener("change", handleChange);
      };
    }

    mediaQueryList.addListener(handleChange);
    return () => {
      mediaQueryList.removeListener(handleChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const attr = "data-full-scroll";
    const enabled = isMobileViewport && activeTabId !== WELCOME_TAB_ID;

    if (enabled) {
      document.body.setAttribute(attr, "true");
    } else {
      document.body.removeAttribute(attr);
    }

    return () => {
      document.body.removeAttribute(attr);
    };
  }, [isMobileViewport, activeTabId]);

  return (
    <div className="vault-shell">
      {isMobileViewport && (
        <button
          type="button"
          className="mobile-summary-toggle"
          aria-controls="profile-summary"
          aria-expanded={isMobileSummaryOpen}
          onClick={handleMobileSummaryToggle}
        >
          {isMobileSummaryOpen ? "Hide profile" : "Show profile"}
        </button>
      )}

      <ProfileSummary isCollapsed={isMobileViewport && !isMobileSummaryOpen} />

      <main className={`content-column${isWelcomeTabActive ? "" : " chat-hidden"}`}>
        <HeroHeader />

        <section className="tabs-wrapper terminal-panel" aria-label="Profile details">
          <Tabs items={resumeTabs} onTabChange={setActiveTabId} swipeEnabled={isMobileViewport} />
        </section>

        {isWelcomeTabActive && (
          <section className="chat-wrapper terminal-panel" aria-label="Chat">
            <h2 className="section-title">AI Relay Console</h2>
            <Chat />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
