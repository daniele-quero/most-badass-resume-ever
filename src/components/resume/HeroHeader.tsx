export function HeroHeader() {
  return (
    <header className="hero-header terminal-panel">
      <img
        className="hero-cover"
        src="/cover.svg"
        alt="Post-apocalyptic terminal-style cover"
        loading="lazy"
        decoding="async"
      />
      <img
        className="hero-avatar"
        src="/avatar.png"
        alt="Profile avatar"
        width={104}
        height={104}
        loading="lazy"
        decoding="async"
      />
      <div className="hero-meta">
        <p className="hero-tag">WASTELAND RESUME PROTOCOL</p>
        <h2>Most Badass Resume Ever</h2>
      </div>
    </header>
  );
}
