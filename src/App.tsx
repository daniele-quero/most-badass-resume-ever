import { useState } from "react";
import { Chat } from "./components/Chat";
import { Tabs, type TabItem } from "./components/Tabs";

const resumeTabs: TabItem[] = [
  {
    id: "welcome",
    label: "Welcome",
    content: (
      <article>
        <h3>Mission</h3>
        <p>
          I build digital products that blend UX, technical reliability, and
          fast delivery. This profile is designed as a terminal-style interface,
          ready to integrate real-time AI assistance.
        </p>
      </article>
    )
  },
  {
    id: "education",
    label: "Education",
    content: (
      <article>
        <h3>Background</h3>
        <ul>
          <li>Degree in technical disciplines with a software engineering focus.</li>
          <li>Cloud and distributed architecture certifications.</li>
          <li>Continuous learning in AI product development and DX.</li>
        </ul>
      </article>
    )
  },
  {
    id: "experience",
    label: "Experience",
    content: (
      <article>
        <h3>Field Log</h3>
        <ul className="timeline-list">
          <li>
            <strong>Lead Developer</strong> - Scalable front-end architecture,
            quality gates, CI/CD.
          </li>
          <li>
            <strong>Full Stack Engineer</strong> - API design, data pipelines,
            deploy cloud.
          </li>
          <li>
            <strong>Product Engineer</strong> - High-impact feature development
            with value-driven metrics.
          </li>
        </ul>
      </article>
    )
  },
  {
    id: "skills",
    label: "Skills",
    content: (
      <article>
        <h2>Perks</h2>
        <p>
          TypeScript, React, Node.js, API architecture, test automation,
          observability, performance tuning, AI-ready interfaces.
        </p>
      </article>
    )
  }
];

function App() {
  const [activeTabId, setActiveTabId] = useState("welcome");

  return (
    <div className="vault-shell">
      <aside className="summary-column terminal-panel" aria-label="Quick profile">
        <p className="summary-chip">STATUS: ACTIVE</p>
        <h1 className="summary-name">Daniele Quero</h1>
        <p className="summary-role">Senior Full Stack Engineer</p>
        <ul className="summary-list">
          <li>Milano, Italy</li>
          <li>Focus: Product + Platform</li>
          <li>Delivery: end-to-end ownership</li>
        </ul>
      </aside>

      <main className={`content-column${activeTabId !== "welcome" ? " chat-hidden" : ""}`}>
        <header className="hero-header terminal-panel">
          <img
            className="hero-cover"
            src="/cover.svg"
            alt="Post-apocalyptic terminal-style cover"
          />
          <img
            className="hero-avatar"
            src="/avatar.svg"
            alt="Profile avatar"
          />
          <div className="hero-meta">
            <p className="hero-tag">WASTELAND RESUME PROTOCOL</p>
            <h2>Most Badass Resume Ever</h2>
          </div>
        </header>

        <section className="tabs-wrapper terminal-panel" aria-label="Profile details">
          <Tabs items={resumeTabs} onTabChange={setActiveTabId} />
        </section>

        {activeTabId === "welcome" && (
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
