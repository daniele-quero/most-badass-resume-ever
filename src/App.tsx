import { ChatPlaceholder } from "./components/ChatPlaceholder";
import { Tabs, type TabItem } from "./components/Tabs";

const resumeTabs: TabItem[] = [
  {
    id: "welcome",
    label: "Benvenuto",
    content: (
      <article>
        <h3>Missione</h3>
        <p>
          Creo prodotti digitali che uniscono UX, robustezza tecnica e velocita
          di consegna. Questo profilo e progettato come interfaccia terminale,
          pronta per integrare assistenza AI in tempo reale.
        </p>
      </article>
    )
  },
  {
    id: "education",
    label: "Formazione",
    content: (
      <article>
        <h3>Percorso</h3>
        <ul>
          <li>Laurea in discipline tecniche con focus software engineering.</li>
          <li>Certificazioni cloud e architetture distribuite.</li>
          <li>Formazione continua su AI product development e DX.</li>
        </ul>
      </article>
    )
  },
  {
    id: "experience",
    label: "Esperienze",
    content: (
      <article>
        <h3>Field Log</h3>
        <ul className="timeline-list">
          <li>
            <strong>Lead Developer</strong> - Progettazione front-end scalabili,
            quality gates, CI/CD.
          </li>
          <li>
            <strong>Full Stack Engineer</strong> - API design, data pipelines,
            deploy cloud.
          </li>
          <li>
            <strong>Product Engineer</strong> - Sviluppo feature ad alto impatto
            con metriche orientate al valore.
          </li>
        </ul>
      </article>
    )
  },
  {
    id: "skills",
    label: "Skill",
    content: (
      <article>
        <h3>Core Stack</h3>
        <p>
          TypeScript, React, Node.js, API architecture, test automation,
          observability, performance tuning, AI-ready interfaces.
        </p>
      </article>
    )
  }
];

function App() {
  return (
    <div className="vault-shell">
      <aside className="summary-column terminal-panel" aria-label="Profilo rapido">
        <p className="summary-chip">STATUS: ACTIVE</p>
        <h1 className="summary-name">Daniele Quero</h1>
        <p className="summary-role">Senior Full Stack Engineer</p>
        <ul className="summary-list">
          <li>Milano, Italy</li>
          <li>Focus: Product + Platform</li>
          <li>Delivery: end-to-end ownership</li>
        </ul>
      </aside>

      <main className="content-column">
        <header className="hero-header terminal-panel">
          <img
            className="hero-cover"
            src="/cover.svg"
            alt="Cover con stile terminale post-apocalittico"
          />
          <img
            className="hero-avatar"
            src="/avatar.svg"
            alt="Avatar profilo"
          />
          <div className="hero-meta">
            <p className="hero-tag">WASTELAND RESUME PROTOCOL</p>
            <h2>Most Badass Resume Ever</h2>
          </div>
        </header>

        <section className="tabs-wrapper terminal-panel" aria-label="Dettaglio profilo">
          <Tabs items={resumeTabs} />
        </section>

        <section className="chat-wrapper terminal-panel" aria-label="Chat placeholder">
          <h2 className="section-title">AI Relay Console</h2>
          <ChatPlaceholder />
        </section>
      </main>
    </div>
  );
}

export default App;
