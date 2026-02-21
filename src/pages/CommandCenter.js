import React from 'react';
import './CommandCenter.css';

const services = [
  { name: 'Grid Telemetry', status: 'Healthy', uptime: '99.98%', latency: '112 ms', color: '#22c55e' },
  { name: 'Incident Bridge', status: 'Watch', uptime: '99.4%', latency: '184 ms', color: '#f59e0b' },
  { name: 'Customer Portal', status: 'Degraded', uptime: '98.7%', latency: '320 ms', color: '#ef4444' },
  { name: 'Billing Webhooks', status: 'Healthy', uptime: '99.93%', latency: '140 ms', color: '#22c55e' },
  { name: 'Outage Maps', status: 'Healthy', uptime: '99.99%', latency: '96 ms', color: '#22c55e' },
  { name: 'SMS Alerts', status: 'Watch', uptime: '99.1%', latency: '210 ms', color: '#f59e0b' },
];

const signals = [
  { label: 'Voltage drift · North loop', action: 'Open playbook', time: '2m ago' },
  { label: 'Login failures spike · Portal', action: 'Trigger MFA banner', time: '8m ago' },
  { label: 'Webhook retries > 3x · Billing', action: 'Scale workers + alert partner', time: '15m ago' },
  { label: 'Customer sentiment drop · Chat', action: 'Enable guided flows', time: '22m ago' },
];

const runbooks = [
  { title: 'Brownout Protocol', desc: 'Notify cluster, shed 5% load, keep SLA timer.', tag: 'Ops' },
  { title: 'API Latency >800ms', desc: 'Warm caches, stagger retries, page SRE.', tag: 'SRE' },
  { title: 'Webhook Storm', desc: 'Enable rate limit, queue fan-out, backpressure.', tag: 'Integrations' },
];

export default function CommandCenter() {
  return (
    <div className="command-screen">
      <header className="command-hero">
        <div>
          <p className="eyebrow">Live Control</p>
          <h1>Command Center</h1>
          <p className="subhead">Single pane for health, signals, and fast actions across the grid stack.</p>
        </div>
        <div className="hero-grid">
          <div className="metric-card">
            <div className="metric-label">Active incidents</div>
            <div className="metric-value">2</div>
            <div className="metric-foot">1 major · 1 minor</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Uptime (7d)</div>
            <div className="metric-value">99.92%</div>
            <div className="metric-foot">+0.11% vs last week</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">MTTR</div>
            <div className="metric-value">7m</div>
            <div className="metric-foot">target &lt; 10m</div>
          </div>
        </div>
      </header>

      <section className="command-grid">
        <div className="panel wide">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Health</p>
              <h3>Service Pulse</h3>
            </div>
            <button className="ghost-btn">Export report</button>
          </div>
          <div className="service-grid">
            {services.map((s) => (
              <div key={s.name} className="service-card">
                <div className="service-top">
                  <div className="service-name">{s.name}</div>
                  <span className="pill" style={{ background: s.color }}>{s.status}</span>
                </div>
                <div className="service-meta">
                  <span>Uptime {s.uptime}</span>
                  <span>Latency {s.latency}</span>
                </div>
                <div className="bar">
                  <div className="bar-fill" style={{ width: s.uptime, background: s.color }} />
                </div>
                <div className="actions">
                  <button className="primary">Open status</button>
                  <button className="ghost-btn">Mute 1h</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Signals</p>
              <h3>Action Queue</h3>
            </div>
            <button className="ghost-btn">View history</button>
          </div>
          <div className="signal-list">
            {signals.map((sig) => (
              <div key={sig.label} className="signal-card">
                <div>
                  <div className="signal-label">{sig.label}</div>
                  <div className="signal-time">{sig.time}</div>
                </div>
                <button className="secondary">{sig.action}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Runbooks</p>
              <h3>Rapid Plays</h3>
            </div>
            <button className="ghost-btn">Manage</button>
          </div>
          <div className="runbook-list">
            {runbooks.map((r) => (
              <div key={r.title} className="runbook-card">
                <div className="tag">{r.tag}</div>
                <div className="runbook-title">{r.title}</div>
                <p>{r.desc}</p>
                <div className="actions">
                  <button className="primary">Launch</button>
                  <button className="ghost-btn">Preview</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
