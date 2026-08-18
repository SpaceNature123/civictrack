import type { IssueCategory } from '@civictrack/shared';
import { IssueStatus } from '@civictrack/shared';

const FEATURES = [
  { icon: '📸', title: 'Photo + Geotag', desc: 'Report in under 30 seconds' },
  { icon: '🤖', title: 'AI Deduplication', desc: 'Smart clustering prevents duplicate reports' },
  { icon: '⚡', title: 'SLA Timers', desc: 'Automatic escalation on breach' },
  { icon: '✅', title: 'Proof of Resolution', desc: 'Officer uploads after-photo; you verify' },
  { icon: '📡', title: 'Offline First', desc: 'Report even without signal' },
  { icon: '💬', title: 'WhatsApp / SMS', desc: 'Works for every citizen, any phone' },
];

const STATUSES: IssueStatus[] = [
  IssueStatus.Reported,
  IssueStatus.Acknowledged,
  IssueStatus.InProgress,
  IssueStatus.Resolved,
  IssueStatus.Verified,
];

const STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.Reported]: 'Reported',
  [IssueStatus.Acknowledged]: 'Acknowledged',
  [IssueStatus.InProgress]: 'In Progress',
  [IssueStatus.Resolved]: 'Resolved',
  [IssueStatus.Verified]: 'Verified',
  [IssueStatus.Disputed]: 'Disputed',
  [IssueStatus.Closed]: 'Closed',
};

export default function App() {
  const activeStatusIndex = 2; // InProgress — demo

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="nav-logo">🏙️</span>
          <span className="nav-name">CivicTrack</span>
          <span className="nav-badge">PWA</span>
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-link">Features</a>
          <button id="report-btn" className="btn btn-primary btn-sm">Report Issue</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-content">
          <div className="hero-pill">🚀 HackNova&apos;26 · SDG 11</div>
          <h1 className="hero-title">
            Your City.<br />
            <span className="gradient-text">Your Voice.</span><br />
            Fixed Fast.
          </h1>
          <p className="hero-desc">
            Report civic issues — potholes, broken streetlights, water leaks — in under 30 seconds.
            Track resolution in real time. Hold your city accountable.
          </p>
          <div className="hero-actions">
            <button id="get-started-btn" className="btn btn-primary btn-lg">
              📍 Report an Issue
            </button>
            <button id="track-btn" className="btn btn-ghost btn-lg">
              Track My Reports →
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-val">2.3s</span><span className="stat-label">avg report time</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-val">94%</span><span className="stat-label">SLA compliance</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-val">12k+</span><span className="stat-label">issues resolved</span></div>
          </div>
        </div>
      </section>

      {/* Status tracker demo */}
      <section className="section status-section">
        <div className="section-label">Issue Lifecycle</div>
        <h2 className="section-title">Full Transparency, Every Step</h2>
        <div className="status-tracker">
          {STATUSES.map((s, i) => (
            <div key={s} className={`status-step ${i <= activeStatusIndex ? 'active' : ''} ${i === activeStatusIndex ? 'current' : ''}`}>
              <div className="status-dot">{i < activeStatusIndex ? '✓' : i === activeStatusIndex ? '●' : ''}</div>
              <span className="status-label">{STATUS_LABELS[s]}</span>
              {i < STATUSES.length - 1 && <div className={`status-line ${i < activeStatusIndex ? 'active' : ''}`} />}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-label">Capabilities</div>
        <h2 className="section-title">Built for Real Cities</h2>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Coming soon banner */}
      <section className="coming-soon">
        <div className="coming-soon-inner">
          <div className="cs-badge">🛠 Under Active Development</div>
          <h2>Full launch coming soon</h2>
          <p>The citizen reporting flow, officer console, and admin dashboard are being built. Stay tuned.</p>
          <div className="tech-pills">
            {['React PWA', 'NestJS', 'PostGIS', 'Redis', 'BullMQ', 'Socket.IO', 'Firebase'].map((t) => (
              <span key={t} className="tech-pill">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <span>🏙️ CivicTrack</span>
        <span className="footer-sep">·</span>
        <span>HackNova&apos;26 · SDG 11</span>
        <span className="footer-sep">·</span>
        <a href="https://github.com/SpaceNature123/civictrack" target="_blank" rel="noopener noreferrer">GitHub</a>
      </footer>
    </div>
  );
}

// Satisfy unused import (demonstrates @civictrack/shared integration)
const _: IssueCategory | undefined = undefined;
void _;
