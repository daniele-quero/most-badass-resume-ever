export function HeroHeader() {
  return (
    <header className="hero-header terminal-panel">
      <img
        className="hero-cover"
        src="/cover.svg"
        alt="Post-apocalyptic terminal-style cover"
      />
      <img className="hero-avatar" src="/avatar.png" alt="Profile avatar" />
      <div className="hero-meta">
        <p className="hero-tag">WASTELAND RESUME PROTOCOL</p>
        <h2>Most Badass Resume Ever</h2>
      </div>
    </header>
  );
}
