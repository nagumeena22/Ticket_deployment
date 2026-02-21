import React from 'react';
import './MaintenancePlanner.css';

const windows = [
  { id: 'MW-204', asset: 'Substation A3', window: 'Mar 04 · 01:00-04:00', impact: 'Low', owner: 'Crew North' },
  { id: 'MW-205', asset: 'Fiber Ring West', window: 'Mar 05 · 02:00-05:30', impact: 'Medium', owner: 'NetOps' },
  { id: 'MW-206', asset: 'AMI Cluster 12', window: 'Mar 06 · 00:30-03:00', impact: 'Low', owner: 'Field Ops' },
];

const crews = [
  { name: 'Crew North', load: 78, tasks: 6 },
  { name: 'NetOps', load: 64, tasks: 5 },
  { name: 'Field Ops', load: 42, tasks: 3 },
  { name: 'SRE', load: 55, tasks: 4 },
];

const tasks = [
  { title: 'Swap cooling fans · A3', due: 'Today 11:00', risk: 'High', status: 'Scheduled' },
  { title: 'Patch AMI gateway', due: 'Tomorrow', risk: 'Medium', status: 'In review' },
  { title: 'Replace UPS batteries', due: 'Mar 04', risk: 'Low', status: 'Draft' },
  { title: 'Failover drill · Portal', due: 'Mar 06', risk: 'Medium', status: 'Scheduled' },
];

export default function MaintenancePlanner() {
  return (
    <div className="maint-screen">
      <header className="maint-hero">
        <div>
          <p className="eyebrow">Reliability</p>
          <h1>Maintenance Planner</h1>
          <p className="subhead">
            Coordinate crews, risk windows, and playbooks in one timeline to keep uptime predictable.
          </p>
        </div>
        <div className="hero-badge">
          <div className="badge-title">Safe Capacity</div>
          <div className="badge-value">82%</div>
          <div className="badge-foot">+6% buffer available</div>
        </div>
      </header>

      <section className="maint-grid">
        <div className="panel wide">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Calendar</p>
              <h3>Upcoming Windows</h3>
            </div>
            <button className="ghost-btn">Add window</button>
          </div>
          <div className="window-table">
            <div className="table-head">
              <span>ID</span>
              <span>Asset</span>
              <span>Window</span>
              <span>Impact</span>
              <span>Owner</span>
              <span />
            </div>
            {windows.map((w) => (
              <div key={w.id} className="table-row">
                <span className="mono">{w.id}</span>
                <span>{w.asset}</span>
                <span>{w.window}</span>
                <span className={`pill pill-${w.impact.toLowerCase()}`}>{w.impact}</span>
                <span>{w.owner}</span>
                <button className="secondary">Export plan</button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Crews</p>
              <h3>Load & Tasks</h3>
            </div>
            <button className="ghost-btn">Rebalance</button>
          </div>
          <div className="crew-list">
            {crews.map((c) => (
              <div key={c.name} className="crew-card">
                <div className="crew-top">
                  <div className="crew-name">{c.name}</div>
                  <div className="crew-tasks">{c.tasks} tasks</div>
                </div>
                <div className="load-bar">
                  <div className="load-fill" style={{ width: `${c.load}%` }} />
                </div>
                <div className="crew-foot">Load {c.load}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <p className="eyebrow">Checklist</p>
              <h3>Readiness Tasks</h3>
            </div>
            <button className="ghost-btn">View all</button>
          </div>
          <div className="task-list">
            {tasks.map((t) => (
              <div key={t.title} className="task-card">
                <div className="task-top">
                  <div className="task-title">{t.title}</div>
                  <span className={`pill pill-${t.risk.toLowerCase()}`}>{t.risk}</span>
                </div>
                <div className="task-meta">
                  <span>{t.due}</span>
                  <span className="status">{t.status}</span>
                </div>
                <div className="task-actions">
                  <button className="primary">Confirm</button>
                  <button className="ghost-btn">Reschedule</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
