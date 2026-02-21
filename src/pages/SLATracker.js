import React, { useEffect, useState, useCallback } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import './SLATracker.css';

/* ── SLA definitions (hours) ── */
const SLA_HOURS = { High: 4, Medium: 8, Low: 24 };
const MS = { hour: 3_600_000 };

function calcSLA(ticket) {
  if (ticket.status === 'Resolved') return { status: 'resolved', pct: 100, remaining: null, elapsed: null };
  const created  = new Date(ticket.date).getTime();
  const now      = Date.now();
  const elapsed  = now - created;                              // ms elapsed
  const budget   = (SLA_HOURS[ticket.priority] || 24) * MS.hour;
  const pct      = Math.min(Math.round((elapsed / budget) * 100), 100);
  const remaining = budget - elapsed;                          // ms left (can be negative)

  let status;
  if (remaining < 0)          status = 'breached';
  else if (pct >= 75)         status = 'critical';
  else if (pct >= 50)         status = 'warning';
  else                        status = 'ok';

  return { status, pct, remaining, elapsed, budget };
}

function fmtCountdown(ms) {
  if (ms <= 0) return 'Breached';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

function fmtElapsed(ms) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (h > 0) return `${h}h ${m}m ago`;
  return `${m}m ago`;
}

const STATUS_META = {
  breached: { label: 'Breached',  color: '#ef4444', bg: '#fef2f2', border: '#fecaca', bar: '#ef4444' },
  critical: { label: 'Critical',  color: '#dc2626', bg: '#fff7ed', border: '#fed7aa', bar: '#f97316' },
  warning:  { label: 'At Risk',   color: '#d97706', bg: '#fffbeb', border: '#fde68a', bar: '#f59e0b' },
  ok:       { label: 'On Track',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', bar: '#22c55e' },
  resolved: { label: 'Resolved',  color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', bar: '#0ea5e9' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#0f172a', color:'#f1f5f9', padding:'10px 14px', borderRadius:10, fontSize:'0.8rem', boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}>
      <p style={{ fontWeight:700, marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.fill }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

export default function SLATracker() {
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [now, setNow]           = useState(Date.now());
  const [filter, setFilter]     = useState('all');

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const base = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/$/, '');
      const res  = await fetch(`${base}/tickets/my-tickets`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  // Real-time tick every 30 s
  useEffect(() => {
    fetchTickets();
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Enrich tickets with SLA info
  const enriched = tickets.map(t => ({ ...t, sla: calcSLA(t) }));

  const total     = enriched.length;
  const breached  = enriched.filter(t => t.sla.status === 'breached').length;
  const critical  = enriched.filter(t => t.sla.status === 'critical').length;
  const atRisk    = enriched.filter(t => t.sla.status === 'warning').length;
  const onTrack   = enriched.filter(t => t.sla.status === 'ok').length;
  const resolved  = enriched.filter(t => t.sla.status === 'resolved').length;
  const compliant = enriched.filter(t => t.sla.status !== 'breached').length;
  const compliancePct = total ? Math.round((compliant / total) * 100) : 100;

  // Pie data
  const pieData = [
    { name: 'Breached', value: breached, color: '#ef4444' },
    { name: 'Critical', value: critical, color: '#f97316' },
    { name: 'At Risk',  value: atRisk,   color: '#f59e0b' },
    { name: 'On Track', value: onTrack,  color: '#22c55e' },
    { name: 'Resolved', value: resolved, color: '#0ea5e9' },
  ].filter(d => d.value > 0);

  // SLA compliance by priority
  const priorityCompData = ['High', 'Medium', 'Low'].map(p => {
    const sub = enriched.filter(t => t.priority === p);
    const met = sub.filter(t => t.sla.status !== 'breached').length;
    return { name: p, Compliant: met, Breached: sub.length - met };
  });

  // Filtered list
  const filterMap = { all: () => true, breached: t => t.sla.status === 'breached', 'at-risk': t => ['critical','warning'].includes(t.sla.status), open: t => t.status !== 'Resolved' };
  const filteredList = [...enriched]
    .filter(filterMap[filter] || (() => true))
    .sort((a, b) => {
      const order = { breached: 0, critical: 1, warning: 2, ok: 3, resolved: 4 };
      return (order[a.sla.status] ?? 5) - (order[b.sla.status] ?? 5);
    });

  // re-trigger every 30 s to re-render countdown
  void now;

  return (
    <div className="sla-page">

      {/* Header */}
      <div className="sla-header">
        <div>
          <h1 className="sla-title">SLA Tracker</h1>
          <p className="sla-sub">Real-time monitoring · Auto-refreshes every 30 seconds</p>
        </div>
        <button className="sla-refresh-btn" onClick={fetchTickets}>
          <svg viewBox="0 0 24 24" strokeWidth="2" fill="none" stroke="currentColor">
            <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="sla-loading"><div className="sla-spinner" /><p>Loading SLA data…</p></div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="sla-kpi-row">
            {[
              { label: 'SLA Compliance', value: `${compliancePct}%`, icon: '✅',  bg: '#eef2ff', vc: compliancePct >= 80 ? '#22c55e' : '#ef4444' },
              { label: 'Breached',       value: breached,            icon: '🔴',  bg: '#fef2f2', vc: '#ef4444' },
              { label: 'Critical',       value: critical,            icon: '🟠',  bg: '#fff7ed', vc: '#f97316' },
              { label: 'At Risk',        value: atRisk,              icon: '🟡',  bg: '#fffbeb', vc: '#f59e0b' },
              { label: 'On Track',       value: onTrack,             icon: '🟢',  bg: '#f0fdf4', vc: '#22c55e' },
            ].map((c, i) => (
              <div className="sla-kpi" key={i} style={{ background: c.bg }}>
                <span className="sla-kpi-icon">{c.icon}</span>
                <span className="sla-kpi-val" style={{ color: c.vc }}>{c.value}</span>
                <span className="sla-kpi-label">{c.label}</span>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="sla-charts-row">
            {/* Donut */}
            <div className="sla-chart-card">
              <div className="sla-chart-title">SLA Status Distribution</div>
              <div className="sla-chart-sub">Across all {total} tickets</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                    paddingAngle={3} dataKey="value" labelLine={false}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="sla-legend">
                {pieData.map((d, i) => (
                  <div className="sla-leg-item" key={i}>
                    <div className="sla-leg-dot" style={{ background: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </div>

            {/* Bar by priority */}
            <div className="sla-chart-card sla-chart-wide">
              <div className="sla-chart-title">SLA Compliance by Priority</div>
              <div className="sla-chart-sub">Compliant vs breached per priority tier</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={priorityCompData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Compliant" fill="#22c55e" radius={[6,6,0,0]} maxBarSize={48} />
                  <Bar dataKey="Breached"  fill="#ef4444" radius={[6,6,0,0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
              <div className="sla-legend">
                <div className="sla-leg-item"><div className="sla-leg-dot" style={{background:'#22c55e'}}/> Compliant</div>
                <div className="sla-leg-item"><div className="sla-leg-dot" style={{background:'#ef4444'}}/> Breached</div>
              </div>
            </div>
          </div>

          {/* Alert bar if breaches exist */}
          {(breached > 0 || critical > 0) && (
            <div className="sla-alert-bar">
              <span>🚨</span>
              <span>
                {breached > 0 && <><strong>{breached} ticket{breached > 1 ? 's' : ''} have breached SLA</strong> and require immediate escalation. </>}
                {critical > 0 && <><strong>{critical} ticket{critical > 1 ? 's' : ''} are critically close</strong> to the SLA deadline.</>}
              </span>
            </div>
          )}

          {/* Filter tabs */}
          <div className="sla-filter-row">
            {[
              { key: 'all',      label: `All (${total})` },
              { key: 'breached', label: `Breached (${breached})` },
              { key: 'at-risk',  label: `At Risk (${critical + atRisk})` },
              { key: 'open',     label: `Open (${total - resolved})` },
            ].map(f => (
              <button key={f.key} className={`sla-filter-btn ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Ticket list */}
          <div className="sla-ticket-list">
            {filteredList.length === 0 && (
              <div className="sla-empty">No tickets match this filter.</div>
            )}
            {filteredList.map((t, i) => {
              const meta = STATUS_META[t.sla.status];
              const isBad = ['breached','critical'].includes(t.sla.status);
              return (
                <div key={t._id || i} className={`sla-ticket-row ${isBad ? 'sla-ticket-urgent' : ''}`}>
                  {/* Status pill */}
                  <div className="sla-status-cell">
                    <span className="sla-status-pill" style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                      {meta.label}
                    </span>
                  </div>

                  {/* ID + desc */}
                  <div className="sla-desc-cell">
                    <span className="sla-ticket-id">#{String(t._id).slice(-6).toUpperCase()}</span>
                    <span className="sla-ticket-desc">{t.description}</span>
                  </div>

                  {/* Priority */}
                  <div className="sla-priority-cell">
                    <span className={`sla-pri-badge sla-pri-${t.priority?.toLowerCase()}`}>{t.priority}</span>
                  </div>

                  {/* SLA progress */}
                  <div className="sla-bar-cell">
                    {t.sla.status !== 'resolved' ? (
                      <>
                        <div className="sla-bar-track">
                          <div className="sla-bar-fill" style={{ width: `${t.sla.pct}%`, background: meta.bar }} />
                        </div>
                        <span className="sla-bar-label" style={{ color: meta.color }}>
                          {fmtCountdown(t.sla.remaining)}
                        </span>
                      </>
                    ) : (
                      <span className="sla-resolved-label">✓ Resolved · {fmtElapsed(t.sla.elapsed || 0)}</span>
                    )}
                  </div>

                  {/* SLA budget */}
                  <div className="sla-budget-cell">
                    {SLA_HOURS[t.priority] || 24}h SLA
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
