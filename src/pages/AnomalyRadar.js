import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import './AnomalyRadar.css';

const timeline = [
  { time: '00:00', events: 8, anomalies: 1 },
  { time: '02:00', events: 12, anomalies: 0 },
  { time: '04:00', events: 18, anomalies: 1 },
  { time: '06:00', events: 27, anomalies: 2 },
  { time: '08:00', events: 46, anomalies: 6 },
  { time: '10:00', events: 58, anomalies: 9 },
  { time: '12:00', events: 63, anomalies: 11 },
  { time: '14:00', events: 54, anomalies: 7 },
  { time: '16:00', events: 42, anomalies: 3 },
  { time: '18:00', events: 38, anomalies: 2 },
  { time: '20:00', events: 35, anomalies: 1 },
  { time: '22:00', events: 22, anomalies: 1 },
];

const hotspots = [
  { label: 'Grid: Sector 7', impact: 92, trend: '+28%', color: '#22d3ee' },
  { label: 'API: Latency p95', impact: 76, trend: '+14%', color: '#a855f7' },
  { label: 'Meter Cluster A3', impact: 68, trend: '+9%', color: '#f97316' },
  { label: 'Billing Webhook', impact: 44, trend: '-6%', color: '#10b981' },
];

const rootCauses = [
  {
    title: 'Substation cooling lag',
    likelihood: '46%',
    description: 'Heat spike + fan cycle overlap. Matches 12 prior events; SLA risk is elevated.',
  },
  {
    title: 'API throttling ripple',
    likelihood: '33%',
    description: 'Partner calls surged; retries pile up. Similar to 2024-11-02 incident.',
  },
  {
    title: 'Meter firmware jitter',
    likelihood: '21%',
    description: 'New push to cluster A3 correlates with noise; revert candidate.',
  },
];

export default function AnomalyRadar() {
  const headline = useMemo(
    () => ({ count: 11, window: 'last 24h', confidence: '93%' }),
    [],
  );

  return (
    <div className="radar-screen">
      <header className="radar-hero">
        <div>
          <p className="eyebrow">Detection · ML powered</p>
          <h1>Grid Anomaly Radar</h1>
          <p className="subhead">
            Live anomaly scoring across telemetry, tickets, and alerts. Tuned to catch cascading failures early.
          </p>
        </div>
        <div className="hero-metric">
          <div className="metric-number">{headline.count}</div>
          <div className="metric-label">anomalies · {headline.window}</div>
          <div className="metric-foot">Model confidence {headline.confidence}</div>
        </div>
      </header>

      <section className="radar-grid">
        <div className="panel wide">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Volume & Severity</p>
              <h3>Flow Through The Day</h3>
            </div>
            <div className="legend-pill">Expected band</div>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timeline} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAnom" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="time" stroke="#9fb7e6" tickLine={false} />
                <YAxis stroke="#9fb7e6" tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
                  labelStyle={{ color: '#e7ecf7' }}
                />
                <Area type="monotone" dataKey="events" stroke="#2563eb" fill="url(#colorEvents)" strokeWidth={2} />
                <Area type="monotone" dataKey="anomalies" stroke="#f43f5e" fill="url(#colorAnom)" strokeWidth={2} />
                <ReferenceLine y={40} stroke="#22d3ee" strokeDasharray="6 6" label={{ value: 'Alert band', fill: '#22d3ee', fontSize: 12 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Hotspots</p>
              <h3>Where to Look</h3>
            </div>
          </div>
          <div className="hotspots">
            {hotspots.map((h) => (
              <div key={h.label} className="hotspot-card">
                <div>
                  <div className="hotspot-label">{h.label}</div>
                  <div className="hotspot-trend">{h.trend}</div>
                </div>
                <div className="bar-shell">
                  <div className="bar-fill" style={{ width: `${h.impact}%`, background: h.color }} />
                </div>
                <div className="hotspot-impact">Impact {h.impact}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Suspects</p>
              <h3>Likely Root Causes</h3>
            </div>
          </div>
          <div className="root-list">
            {rootCauses.map((r) => (
              <div key={r.title} className="root-card">
                <div className="root-top">
                  <div className="root-title">{r.title}</div>
                  <span className="root-badge">{r.likelihood}</span>
                </div>
                <p>{r.description}</p>
                <div className="root-actions">
                  <button className="primary">Open playbook</button>
                  <button className="ghost">Mute signal</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel wide">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Channels</p>
              <h3>Signals by Source</h3>
            </div>
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hotspots} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="#9fb7e6" tickLine={false} interval={0} angle={-8} textAnchor="end" height={50} />
                <YAxis stroke="#9fb7e6" tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
                  labelStyle={{ color: '#e7ecf7' }}
                />
                <Legend wrapperStyle={{ color: '#e7ecf7' }} />
                <Bar dataKey="impact" name="Impact score" radius={[6, 6, 0, 0]}>
                  {hotspots.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
