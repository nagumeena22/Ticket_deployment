import React, { useMemo } from 'react';
import './Triage.css';

const sampleQueue = [
  {
    id: 'EM-1042',
    source: 'Email',
    channel: 'support@gridops.io',
    subject: 'Transformer overheating near Sector 7',
    severity: 'High',
    createdAt: '5m ago',
    summary:
      'Field engineer reports rising temps on T-77. Customers nearby seeing flickers. Needs dispatch + cooling plan.',
    nextStep: 'Create ticket and auto-assign to Field Ops North.',
  },
  {
    id: 'CH-208',
    source: 'Slack',
    channel: '#noc-alerts',
    subject: 'Frequent brownouts, Midtown loop',
    severity: 'Medium',
    createdAt: '18m ago',
    summary:
      'AI detects 14 brownout mentions past hour. Correlated to loop A3. Suggest load balancing and notification blast.',
    nextStep: 'Draft customer advisory and open incident bridge.',
  },
  {
    id: 'WS-992',
    source: 'Webhook',
    channel: 'Statuspage',
    subject: 'API latency spike > 800ms',
    severity: 'Low',
    createdAt: '32m ago',
    summary:
      'Uptime robot flagged elevated p95 latency. Traffic volume +19%. Cache hit ratio steady. Monitor closely.',
    nextStep: 'Create watch ticket with 30 min auto-checks.',
  },
];

const badgeColor = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981',
};

export default function Triage() {
  const recommendations = useMemo(
    () => [
      'Auto-assign high-severity grid issues to on-call NOC.',
      'Push brownout advisories to impacted ZIP clusters.',
      'Escalate repeat alerts when sentiment is negative in >5 mentions.',
    ],
    [],
  );

  return (
    <div className="triage-screen">
      <div className="triage-hero">
        <div>
          <p className="eyebrow">Live Intake · AI Suggested</p>
          <h1>AI Triage Queue</h1>
          <p className="subhead">
            Cross-channel incidents are summarized, scored, and ready to turn into tickets with one tap.
          </p>
        </div>
        <div className="hero-pill">
          <span className="dot" />
          <div>
            <div className="pill-title">Now Watching</div>
            <div className="pill-desc">Email · Slack · Webhooks · Statuspage</div>
          </div>
        </div>
      </div>

      <section className="triage-grid">
        <div className="triage-column">
          <div className="section-header">
            <div>
              <p className="eyebrow">Incoming</p>
              <h2>Queue</h2>
            </div>
            <button className="ghost-btn">Configure Sources</button>
          </div>

          <div className="card-stack">
            {sampleQueue.map((item) => (
              <article key={item.id} className="triage-card">
                <div className="card-top">
                  <div>
                    <div className="chip">{item.source}</div>
                    <div className="id">{item.id}</div>
                    <div className="subject">{item.subject}</div>
                  </div>
                  <div className="meta">
                    <span className="badge" style={{ background: badgeColor[item.severity] }}>
                      {item.severity}
                    </span>
                    <span className="age">{item.createdAt}</span>
                    <span className="channel">{item.channel}</span>
                  </div>
                </div>
                <p className="summary">{item.summary}</p>
                <div className="next-step">{item.nextStep}</div>
                <div className="actions">
                  <button className="primary">Create Ticket</button>
                  <button className="secondary">Pin & Monitor</button>
                  <button className="ghost">Mark Noise</button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="triage-column side">
          <div className="section-header">
            <div>
              <p className="eyebrow">Ops Copilot</p>
              <h2>Playbook</h2>
            </div>
            <button className="ghost-btn">Edit</button>
          </div>
          <div className="side-card">
            <h3>Recommended Moves</h3>
            <ul>
              {recommendations.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div className="divider" />
            <h4>Smart Fields</h4>
            <div className="chips">
              <span className="chip">Auto-owner: NOC North</span>
              <span className="chip">Impact: 2.1k users</span>
              <span className="chip">SLA risk: Elevated</span>
              <span className="chip">Status: Draft</span>
            </div>
          </div>

          <div className="side-card gradient">
            <div>
              <p className="eyebrow">Preview</p>
              <h3>Ticket will include</h3>
            </div>
            <div className="preview-list">
              <div>
                <span className="dot" />
                <span>AI summary + severity score</span>
              </div>
              <div>
                <span className="dot" />
                <span>Correlated mentions across channels</span>
              </div>
              <div>
                <span className="dot" />
                <span>Suggested responders & first message</span>
              </div>
              <div>
                <span className="dot" />
                <span>Auto-follow-up timer</span>
              </div>
            </div>
            <button className="primary wide">Push to Ticket</button>
          </div>
        </div>
      </section>
    </div>
  );
}
