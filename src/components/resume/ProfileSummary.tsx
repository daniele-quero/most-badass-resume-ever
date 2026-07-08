const C1_CERTIFICATE_PDF_URL = "/Daniele_QUERO_Certificate_of_Language_Proficiency_full_version.pdf";

type ProfileSummaryProps = {
  isCollapsed?: boolean;
};

export function ProfileSummary({ isCollapsed = false }: ProfileSummaryProps) {
  return (
    <aside
      id="profile-summary"
      className="summary-column terminal-panel"
      aria-label="Quick profile"
      hidden={isCollapsed}
    >
      <p className="summary-chip">STATUS: ACTIVE</p>
      <h1 className="summary-name">Daniele Quero</h1>
      <p className="summary-role">Senior Java/AI Engineer</p>
      <ul className="summary-list">
        <li>PhD in Nuclear Physics</li>
        <li>Napoli, Italy</li>
        <li>
          Estimated English Level: {" "}
          <a href={C1_CERTIFICATE_PDF_URL} target="_blank" rel="noopener noreferrer">
            C1
          </a>
        </li>
        <li>Focus: AI-augmented inventions and creations</li>
        <li>
          GitHub: {" "}
          <a href="https://github.com/daniele-quero" target="_blank" rel="noopener noreferrer">
            daniele-quero
          </a>
        </li>
        <li>
          itch.io: {" "}
          <a href="https://itch.io/dashboard" target="_blank" rel="noopener noreferrer">
            danio
          </a>
        </li>
        <li>
          LinkedIn: {" "}
          <a
            href="https://www.linkedin.com/in/daniele-quero-b1a708102/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Daniele Quero
          </a>
        </li>
        <li>Email: Ask me via LinkedIn!</li>
      </ul>
    </aside>
  );
}
