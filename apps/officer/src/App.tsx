import { IssueStatus, UserRole } from '@civictrack/shared';

const QUEUE_ITEMS = [
  { id: 'ISS-001', category: 'Pothole', ward: 'Ward 12', status: IssueStatus.Reported, severity: 'high', time: '2m ago' },
  { id: 'ISS-002', category: 'Streetlight', ward: 'Ward 12', status: IssueStatus.Acknowledged, severity: 'medium', time: '15m ago' },
  { id: 'ISS-003', category: 'Water Leak', ward: 'Ward 12', status: IssueStatus.InProgress, severity: 'critical', time: '1h ago' },
  { id: 'ISS-004', category: 'Garbage', ward: 'Ward 12', status: IssueStatus.Resolved, severity: 'low', time: '3h ago' },
];

const STATUS_COLOR: Record<IssueStatus, string> = {
  [IssueStatus.Reported]: '#f59e0b',
  [IssueStatus.Acknowledged]: '#3b82f6',
  [IssueStatus.InProgress]: '#8b5cf6',
  [IssueStatus.Resolved]: '#10b981',
  [IssueStatus.Verified]: '#06b6d4',
  [IssueStatus.Disputed]: '#ef4444',
  [IssueStatus.Closed]: '#6b7280',
};

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#10b981',
};

export default function App() {
  const role: UserRole = UserRole.Officer;

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>🏙️</span>
          <div>
            <div className="brand-name">CivicTrack</div>
            <div className="brand-role">Officer Console</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {[
            { icon: '📋', label: 'My Queue', active: true },
            { icon: '🗺️', label: 'Ward Map', active: false },
            { icon: '🔔', label: 'Alerts', active: false, badge: '3' },
            { icon: '📊', label: 'My Stats', active: false },
            { icon: '⚙️', label: 'Settings', active: false },
          ].map((item) => (
            <a key={item.label} href="#" className={`nav-item ${item.active ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">👮</div>
          <div>
            <div className="user-name">Officer Ravi Kumar</div>
            <div className="user-role">{role} · Ward 12</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Header */}
        <header className="topbar">
          <div>
            <h1 className="page-title">My Issue Queue</h1>
            <p className="page-sub">Ward 12 · 4 active issues</p>
          </div>
          <div className="topbar-actions">
            <div className="search-box">
              <span>🔍</span>
              <input type="text" placeholder="Search issues..." id="search-issues" />
            </div>
            <div className="online-badge">● Online</div>
          </div>
        </header>

        {/* Stats row */}
        <div className="stats-row">
          {[
            { label: 'Open', value: '3', color: '#f59e0b' },
            { label: 'In Progress', value: '1', color: '#8b5cf6' },
            { label: 'Resolved Today', value: '5', color: '#10b981' },
            { label: 'SLA Breaches', value: '0', color: '#ef4444' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Queue */}
        <div className="queue-header">
          <h2 className="queue-title">Active Issues</h2>
          <div className="filter-pills">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((f) => (
              <button key={f} className={`filter-pill ${f === 'All' ? 'active' : ''}`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="issue-list">
          {QUEUE_ITEMS.map((issue) => (
            <div key={issue.id} className="issue-card">
              <div className="issue-id">{issue.id}</div>
              <div className="issue-info">
                <div className="issue-category">{issue.category}</div>
                <div className="issue-meta">{issue.ward} · {issue.time}</div>
              </div>
              <div className="issue-tags">
                <span className="tag severity-tag" style={{ color: SEVERITY_COLOR[issue.severity] ?? '#fff', borderColor: SEVERITY_COLOR[issue.severity] ?? '#fff' }}>
                  {issue.severity}
                </span>
                <span className="tag status-tag" style={{ color: STATUS_COLOR[issue.status], borderColor: STATUS_COLOR[issue.status] }}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              <button className="issue-action">Update →</button>
            </div>
          ))}
        </div>

        {/* Coming soon notice */}
        <div className="dev-notice">
          <span className="dev-icon">🛠</span>
          <div>
            <strong>Officer Console — Under Development</strong>
            <p>Full triage queue, map view, field updates, and proof-of-resolution upload coming soon.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
