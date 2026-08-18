import { IssueCategory, IssueStatus, UserRole } from '@civictrack/shared';

const WARD_STATS = [
  { label: 'Total Issues (MTD)', value: '1,284', delta: '+12%', color: '#f59e0b' },
  { label: 'SLA Compliance', value: '94.2%', delta: '+2.1%', color: '#10b981' },
  { label: 'Avg Resolution Time', value: '18.4h', delta: '-3.2h', color: '#6366f1' },
  { label: 'Open Issues', value: '87', delta: '-5%', color: '#0ea5e9' },
];

const TOP_WARDS = [
  { name: 'Ward 5', score: 98, issues: 12, resolved: 11 },
  { name: 'Ward 12', score: 94, issues: 21, resolved: 19 },
  { name: 'Ward 3', score: 89, issues: 18, resolved: 16 },
  { name: 'Ward 8', score: 82, issues: 34, resolved: 27 },
  { name: 'Ward 17', score: 71, issues: 45, resolved: 30 },
];

const CATEGORY_DIST: Array<{ category: IssueCategory; count: number; color: string }> = [
  { category: IssueCategory.Pothole, count: 342, color: '#f59e0b' },
  { category: IssueCategory.GarbageOverflow, count: 218, color: '#10b981' },
  { category: IssueCategory.BrokenStreetlight, count: 187, color: '#6366f1' },
  { category: IssueCategory.WaterLeakage, count: 145, color: '#0ea5e9' },
  { category: IssueCategory.Other, count: 392, color: '#94a3b8' },
];

const TOTAL_ISSUES = CATEGORY_DIST.reduce((s, c) => s + c.count, 0);

const RECENT_ESCALATIONS = [
  { id: 'ESC-041', issue: 'ISS-208', ward: 'Ward 17', reason: 'SLA breached by 6h', time: '30m ago' },
  { id: 'ESC-040', issue: 'ISS-199', ward: 'Ward 9', reason: 'SLA breached by 2h', time: '2h ago' },
  { id: 'ESC-039', issue: 'ISS-187', ward: 'Ward 3', reason: 'Citizen dispute', time: '5h ago' },
];

const STATUS_DIST: Array<{ status: IssueStatus; count: number; color: string }> = [
  { status: IssueStatus.Reported, count: 24, color: '#f59e0b' },
  { status: IssueStatus.Acknowledged, count: 18, color: '#3b82f6' },
  { status: IssueStatus.InProgress, count: 45, color: '#8b5cf6' },
  { status: IssueStatus.Resolved, count: 187, color: '#10b981' },
  { status: IssueStatus.Verified, count: 142, color: '#06b6d4' },
];

export default function App() {
  const adminRole: UserRole = UserRole.Admin;

  return (
    <div className="app">
      {/* Top navbar */}
      <header className="topnav">
        <div className="topnav-brand">
          <span>🏙️</span>
          <span className="brand-name">CivicTrack</span>
          <span className="brand-role">Admin Dashboard</span>
        </div>
        <div className="topnav-center">
          <div className="time-range">
            {['Today', '7 Days', '30 Days', 'MTD', 'YTD'].map((r) => (
              <button key={r} className={`range-btn ${r === 'MTD' ? 'active' : ''}`}>{r}</button>
            ))}
          </div>
        </div>
        <div className="topnav-right">
          <span className="admin-badge">{adminRole}</span>
          <div className="admin-avatar">👤</div>
        </div>
      </header>

      <div className="content">
        {/* Sidebar */}
        <aside className="sidebar">
          {[
            { icon: '📊', label: 'Overview', active: true },
            { icon: '🗺️', label: 'Ward Heatmap', active: false },
            { icon: '🏆', label: 'Leaderboard', active: false },
            { icon: '⚠️', label: 'Escalations', active: false, badge: '3' },
            { icon: '📅', label: 'SLA Reports', active: false },
            { icon: '📤', label: 'Export Data', active: false },
            { icon: '⚙️', label: 'Config', active: false },
          ].map((item) => (
            <a key={item.label} href="#" className={`nav-item ${item.active ? 'active' : ''}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
              {item.badge !== undefined && <span className="nav-badge">{item.badge}</span>}
            </a>
          ))}
        </aside>

        {/* Main grid */}
        <main className="main">
          <div className="page-header">
            <h1 className="page-title">City Overview</h1>
            <p className="page-sub">August 2026 · All Wards</p>
          </div>

          {/* KPI row */}
          <div className="kpi-row">
            {WARD_STATS.map((s) => (
              <div key={s.label} className="kpi-card">
                <div className="kpi-value" style={{ color: s.color }}>{s.value}</div>
                <div className="kpi-label">{s.label}</div>
                <div className="kpi-delta" style={{ color: s.delta.startsWith('+') ? '#10b981' : '#f59e0b' }}>{s.delta}</div>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="charts-row">
            {/* Category distribution */}
            <div className="chart-card">
              <h2 className="chart-title">Issue Categories</h2>
              <div className="category-bars">
                {CATEGORY_DIST.map((c) => (
                  <div key={c.category} className="cat-row">
                    <span className="cat-label">{c.category.replace(/_/g, ' ')}</span>
                    <div className="cat-bar-wrap">
                      <div
                        className="cat-bar"
                        style={{ width: `${(c.count / TOTAL_ISSUES) * 100}%`, background: c.color }}
                      />
                    </div>
                    <span className="cat-count">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status distribution */}
            <div className="chart-card">
              <h2 className="chart-title">Status Breakdown</h2>
              <div className="status-donut">
                {STATUS_DIST.map((s) => (
                  <div key={s.status} className="donut-row">
                    <span className="donut-dot" style={{ background: s.color }} />
                    <span className="donut-label">{s.status.replace(/_/g, ' ')}</span>
                    <span className="donut-val">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="bottom-row">
            {/* Ward leaderboard */}
            <div className="chart-card">
              <h2 className="chart-title">🏆 Ward Leaderboard</h2>
              <div className="leaderboard">
                {TOP_WARDS.map((w, i) => (
                  <div key={w.name} className="lb-row">
                    <span className="lb-rank">{i + 1}</span>
                    <span className="lb-ward">{w.name}</span>
                    <div className="lb-bar-wrap">
                      <div className="lb-bar" style={{ width: `${w.score}%` }} />
                    </div>
                    <span className="lb-score">{w.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Escalations */}
            <div className="chart-card">
              <h2 className="chart-title">⚠️ Recent Escalations</h2>
              <div className="escalation-list">
                {RECENT_ESCALATIONS.map((e) => (
                  <div key={e.id} className="esc-card">
                    <div className="esc-header">
                      <span className="esc-id">{e.id}</span>
                      <span className="esc-time">{e.time}</span>
                    </div>
                    <div className="esc-issue">Issue: {e.issue} · {e.ward}</div>
                    <div className="esc-reason">{e.reason}</div>
                  </div>
                ))}
              </div>
              <div className="dev-notice">🛠 Full analytics, heatmaps &amp; exports coming soon</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
