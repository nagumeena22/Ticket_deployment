import React, { useEffect, useState, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  AreaChart, Area,
} from 'recharts';
import './Analytics.css';

/* ── Colour palettes ── */
const CATEGORY_COLORS = {
  'General':         '#6366f1',
  'Technical Issue': '#f59e0b',
  'Billing':         '#10b981',
  'Network':         '#3b82f6',
  'Database':        '#a855f7',
};

const PRIORITY_COLORS = {
  High:   '#ef4444',
  Medium: '#f59e0b',
  Low:    '#22c55e',
};

const STATUS_COLORS = {
  'Open':        '#3b82f6',
  'In Progress': '#f59e0b',
  'Resolved':    '#22c55e',
};

/* ── Helpers ── */
function getCategoryClass(cat) {
  const map = {
    'General': 'badge-category-general',
    'Technical Issue': 'badge-category-technical',
    'Billing':  'badge-category-billing',
    'Network':  'badge-category-network',
    'Database': 'badge-category-database',
  };
  return map[cat] || 'badge-category-general';
}

function getPriorityClass(p) {
  return `badge-priority-${p?.toLowerCase()}`;
}

function getStatusClass(s) {
  const map = {
    'Open': 'badge-status-open',
    'In Progress': 'badge-status-inprogress',
    'Resolved': 'badge-status-resolved',
  };
  return map[s] || 'badge-status-open';
}

function importanceScore(ticket) {
  let score = 0;
  if (ticket.priority === 'High')   score += 60;
  if (ticket.priority === 'Medium') score += 35;
  if (ticket.priority === 'Low')    score += 10;
  if (ticket.status === 'Open')        score += 30;
  if (ticket.status === 'In Progress') score += 15;
  if (ticket.category === 'Network')  score += 10;
  if (ticket.category === 'Database') score += 8;
  return Math.min(score, 100);
}

function importanceBarColor(score) {
  if (score >= 70) return '#ef4444';
  if (score >= 45) return '#f59e0b';
  return '#22c55e';
}

/* ── Custom tooltip ── */
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0f172a', color: '#f1f5f9', padding: '10px 14px',
      borderRadius: 10, fontSize: '0.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: '#e2e8f0' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0f172a', color: '#f1f5f9', padding: '10px 14px',
      borderRadius: 10, fontSize: '0.8rem', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
    }}>
      <p style={{ fontWeight: 700 }}>{payload[0].name}: <strong>{payload[0].value}</strong></p>
      <p style={{ color: '#94a3b8' }}>{payload[0].payload.percent}% of total</p>
    </div>
  );
};

/* ── Render custom pie label ── */
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function Analytics() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const baseUrl = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/$/, '');
      const res  = await fetch(`${baseUrl}/tickets/my-tickets`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  /* ── Derived metrics ── */
  const total      = tickets.length;
  const open       = tickets.filter(t => t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved   = tickets.filter(t => t.status === 'Resolved').length;
  const highPri    = tickets.filter(t => t.priority === 'High').length;

  /* Category bar-chart data */
  const categoryData = (() => {
    const counts = {};
    tickets.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  })();

  /* Priority pie data */
  const priorityData = (() => {
    const counts = {};
    tickets.forEach(t => { counts[t.priority] = (counts[t.priority] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name, value,
      percent: total ? Math.round((value / total) * 100) : 0,
    }));
  })();

  /* Status donut data */
  const statusData = (() => {
    const counts = {};
    tickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({
      name, value,
      percent: total ? Math.round((value / total) * 100) : 0,
    }));
  })();

  /* Trend: tickets per day (last 7 days) */
  const trendData = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ day: key, date: d, count: 0 });
    }
    tickets.forEach(t => {
      const td = new Date(t.date);
      days.forEach(d => {
        if (td.toDateString() === d.date.toDateString()) d.count++;
      });
    });
    return days.map(({ day, count }) => ({ day, Tickets: count }));
  })();

  /* Priority stacked bar (category × priority) */
  const stackedData = (() => {
    const map = {};
    tickets.forEach(t => {
      if (!map[t.category]) map[t.category] = { name: t.category, High: 0, Medium: 0, Low: 0 };
      map[t.category][t.priority]++;
    });
    return Object.values(map);
  })();

  /* Importance-sorted ticket table (top 10) */
  const importantTickets = [...tickets]
    .map(t => ({ ...t, score: importanceScore(t) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  /* ── KPI cards config ── */
  const kpiCards = [
    { icon: '🎫', bg: '#eef2ff', label: 'Total Tickets',  value: total,      trend: null },
    { icon: '📂', bg: '#eff6ff', label: 'Open',           value: open,       trend: total ? `${Math.round(open/total*100)}%` : '0%' },
    { icon: '🔧', bg: '#fff7ed', label: 'In Progress',    value: inProgress, trend: total ? `${Math.round(inProgress/total*100)}%` : '0%' },
    { icon: '✅', bg: '#f0fdf4', label: 'Resolved',       value: resolved,   trend: total ? `${Math.round(resolved/total*100)}%` : '0%' },
  ];

  return (
    <div className="analytics-page">

      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <h1>Ticket Analytics</h1>
          <p>Last refreshed: {lastRefresh.toLocaleTimeString()} · {total} tickets loaded</p>
        </div>
        <button className="analytics-refresh-btn" onClick={fetchTickets}>
          <svg viewBox="0 0 24 24" strokeWidth="2">
            <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="analytics-loading">
          <div className="analytics-spinner" />
          <p>Loading analytics data…</p>
        </div>
      ) : (
        <>
          {/* ── KPI Cards ── */}
          <div className="kpi-grid">
            {kpiCards.map((c, i) => (
              <div className="kpi-card" key={i}>
                <div className="kpi-icon" style={{ background: c.bg }}>{c.icon}</div>
                <div className="kpi-info">
                  <h3>{c.value}</h3>
                  <p>{c.label}</p>
                </div>
                {c.trend && (
                  <span className={`kpi-trend ${c.label === 'Resolved' ? 'up' : 'neutral'}`}>
                    {c.trend}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* ── Row 1: Trend + Status Donut ── */}
          <div className="charts-grid" style={{ marginBottom: 20 }}>
            {/* Area chart — trend */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Ticket Volume — Last 7 Days</div>
                  <div className="chart-card-sub">Number of tickets raised per day</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.18}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Area type="monotone" dataKey="Tickets" stroke="#6366f1" strokeWidth={2.5}
                    fill="url(#areaGrad)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#4f46e5' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Pie */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Status Distribution</div>
                  <div className="chart-card-sub">Breakdown by current ticket status</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey="value"
                    labelLine={false} label={renderCustomLabel}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="priority-legend" style={{ justifyContent: 'center', marginTop: 4 }}>
                {statusData.map((s, i) => (
                  <div className="pleg" key={i}>
                    <div className="pleg-dot" style={{ background: STATUS_COLORS[s.name] || '#6366f1' }} />
                    {s.name} ({s.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 2: Category Bar + Priority Donut ── */}
          <div className="charts-grid" style={{ marginBottom: 20 }}>
            {/* Category bar */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Tickets by Category</div>
                  <div className="chart-card-sub">Total count per operational category</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Priority pie */}
            <div className="chart-card">
              <div className="chart-card-header">
                <div>
                  <div className="chart-card-title">Priority Distribution</div>
                  <div className="chart-card-sub">High / Medium / Low breakdown</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={priorityData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey="value"
                    labelLine={false} label={renderCustomLabel}>
                    {priorityData.map((entry, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="priority-legend" style={{ justifyContent: 'center', marginTop: 4 }}>
                {priorityData.map((p, i) => (
                  <div className="pleg" key={i}>
                    <div className="pleg-dot" style={{ background: PRIORITY_COLORS[p.name] }} />
                    {p.name} ({p.value})
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Row 3: Stacked bar (category × priority) ── */}
          <div className="chart-card" style={{ marginBottom: 20 }}>
            <div className="chart-card-header">
              <div>
                <div className="chart-card-title">Category × Priority Matrix</div>
                <div className="chart-card-sub">Priority severity stacked within each category</div>
              </div>
              <div className="priority-legend">
                {['High', 'Medium', 'Low'].map(p => (
                  <div className="pleg" key={p}>
                    <div className="pleg-dot" style={{ background: PRIORITY_COLORS[p] }} />
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stackedData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="High"   stackId="a" fill={PRIORITY_COLORS.High}   radius={[0,0,0,0]} maxBarSize={52} />
                <Bar dataKey="Medium" stackId="a" fill={PRIORITY_COLORS.Medium} radius={[0,0,0,0]} maxBarSize={52} />
                <Bar dataKey="Low"    stackId="a" fill={PRIORITY_COLORS.Low}    radius={[6,6,0,0]} maxBarSize={52} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── High-Importance Ticket Table ── */}
          <div className="priority-table-card">
            <div className="chart-card-title">Top Tickets by Importance</div>
            <div className="chart-card-sub" style={{ marginBottom: 0, fontSize: '0.75rem', color: '#94a3b8' }}>
              Ranked by priority, status urgency, and category criticality
            </div>

            {importantTickets.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 20, textAlign: 'center' }}>
                No tickets found.
              </p>
            ) : (
              <table className="priority-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ticket ID</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Importance</th>
                  </tr>
                </thead>
                <tbody>
                  {importantTickets.map((t, i) => (
                    <tr key={t._id}>
                      <td style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }}>{i + 1}</td>
                      <td className="ticket-id-cell">
                        #{String(t._id).slice(-6).toUpperCase()}
                      </td>
                      <td className="ticket-desc-cell">{t.description}</td>
                      <td>
                        <span className={`badge-pill ${getCategoryClass(t.category)}`}>
                          {t.category}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${getPriorityClass(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-pill ${getStatusClass(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div className="importance-bar-wrap">
                          <div className="importance-bar-bg">
                            <div
                              className="importance-bar-fill"
                              style={{
                                width: `${t.score}%`,
                                background: importanceBarColor(t.score),
                              }}
                            />
                          </div>
                          <span className="importance-pct">{t.score}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── High priority alert ── */}
          {highPri > 0 && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
              padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
              fontSize: '0.85rem', color: '#dc2626', fontWeight: 600,
            }}>
              <span style={{ fontSize: '1.1rem' }}>🚨</span>
              <span>
                <strong>{highPri} High-priority ticket{highPri > 1 ? 's' : ''}</strong> require immediate attention.
                {' '}Resolve open critical issues to improve SLA compliance.
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
