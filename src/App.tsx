import { useState } from "react";
import { Chat } from "./components/Chat";
import { Tabs } from "./components/Tabs";
import { HeroHeader } from "./components/resume/HeroHeader";
import { ProfileSummary } from "./components/resume/ProfileSummary";
import { WELCOME_TAB_ID, resumeTabs } from "./components/resume/resumeTabs";

function App() {
  const [activeTabId, setActiveTabId] = useState(WELCOME_TAB_ID);
  // La chat segue la tab Welcome, cosi il layout resta sempre montato.
  const isWelcomeTabActive = activeTabId === WELCOME_TAB_ID;

  return (
    <div className="vault-shell">
      <ProfileSummary />

      <main className={`content-column${isWelcomeTabActive ? "" : " chat-hidden"}`}>
        <HeroHeader />

        <section className="tabs-wrapper terminal-panel" aria-label="Profile details">
          <Tabs items={resumeTabs} onTabChange={setActiveTabId} />
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
