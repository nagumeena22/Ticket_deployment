import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './KnowledgeBase.css';

/* ─── Article Data ─────────────────────────────────────────── */
const ARTICLES = [
  // General
  {
    id: 'G001', category: 'General',
    title: 'How to Submit a Support Ticket',
    summary: 'Step-by-step guide on raising a ticket, attaching files, and tracking resolution status.',
    content: 'Navigate to New Ticket from the sidebar. Fill in a clear description, select the appropriate category, and attach any screenshots. You will receive a ticket ID which you can track under My Tickets.',
    readTime: 2, tags: ['getting-started', 'tickets', 'guide'], views: 1420,
    icon: '🎫',
  },
  {
    id: 'G002', category: 'General',
    title: 'Understanding Ticket Priority Levels',
    summary: 'Explains Low, Medium, and High priorities and their SLA response time commitments.',
    content: 'High-priority tickets are critical blockers and are addressed within 4 hours. Medium-priority issues affecting productivity are resolved within 8 hours. Low-priority requests are handled within 24 hours.',
    readTime: 3, tags: ['sla', 'priority', 'response-time'], views: 980,
    icon: '📊',
  },
  {
    id: 'G003', category: 'General',
    title: 'Tracking and Updating Your Ticket',
    summary: 'Learn how to check ticket status, add comments, and close resolved tickets.',
    content: 'Open My Tickets to see all your active and resolved tickets. You can add remarks or close a ticket once the issue is resolved. Closed tickets are archived but remain searchable.',
    readTime: 2, tags: ['tracking', 'my-tickets', 'status'], views: 760,
    icon: '🔍',
  },
  {
    id: 'G004', category: 'General',
    title: 'Using Bulk Upload for Multiple Tickets',
    summary: 'Import a list of tickets at once using an Excel (.xlsx) template.',
    content: 'Download the Excel template from the Bulk Upload page. Fill in the columns: description, category, priority. Upload the file — tickets are created automatically. Useful for IT migrations and batch requests.',
    readTime: 3, tags: ['bulk-upload', 'excel', 'import'], views: 430,
    icon: '📂',
  },

  // Network
  {
    id: 'N001', category: 'Network',
    title: 'Cannot Connect to Office Wi-Fi',
    summary: 'Troubleshooting steps for Wi-Fi connectivity issues in the corporate network.',
    content: '1. Confirm Wi-Fi is enabled on your device.\n2. Forget and re-add the network profile.\n3. Flush DNS: run "ipconfig /flushdns" in Command Prompt.\n4. If issue persists, raise a High-priority ticket with your location and device model.',
    readTime: 4, tags: ['wifi', 'connectivity', 'office-network'], views: 2100,
    icon: '📶',
  },
  {
    id: 'N002', category: 'Network',
    title: 'VPN Connection Issues',
    summary: 'Fix common VPN disconnection and authentication errors for remote workers.',
    content: 'Ensure you are using the latest VPN client. Verify your credentials match your Active Directory account. If MFA is failing, contact the security team. For persistent drops, try switching between TCP and UDP protocol in VPN settings.',
    readTime: 5, tags: ['vpn', 'remote-work', 'authentication'], views: 1850,
    icon: '🔐',
  },
  {
    id: 'N003', category: 'Network',
    title: 'Slow Internet Speed in the Office',
    summary: 'Diagnose and report bandwidth issues affecting work performance.',
    content: 'Run a speed test at speedtest.net and note the results. Check if other colleagues are affected. Clear browser cache. Avoid large downloads during peak hours (9 AM – 11 AM). If under 5 Mbps, raise a ticket with the speed test screenshot.',
    readTime: 3, tags: ['bandwidth', 'speed', 'performance'], views: 1200,
    icon: '🌐',
  },
  {
    id: 'N004', category: 'Network',
    title: 'Firewall or Port Blocking Issues',
    summary: 'Request firewall rule changes or diagnose blocked application traffic.',
    content: 'Use "telnet [host] [port]" or "Test-NetConnection" in PowerShell to verify blocked ports. Document the source IP, destination IP, port, and protocol. Submit a Medium-priority ticket with these details for the network team to review.',
    readTime: 4, tags: ['firewall', 'ports', 'network-rules'], views: 690,
    icon: '🛡️',
  },

  // Database
  {
    id: 'D001', category: 'Database',
    title: 'Database Connection Timeout Errors',
    summary: 'Common causes and fixes for connection pool exhaustion and timeout issues.',
    content: 'Check if the DB server is reachable with a simple ping or telnet. Review connection pool settings — increase maxPoolSize if under load. Confirm credentials are correct and not expired. Check DB server logs for active locks or long-running queries.',
    readTime: 5, tags: ['timeout', 'connection-pool', 'mongodb'], views: 880,
    icon: '🗄️',
  },
  {
    id: 'D002', category: 'Database',
    title: 'Requesting Database Access or Permissions',
    summary: 'How to request read/write access to production or staging databases.',
    content: 'Submit a ticket with: your employee ID, the database name, the access level required (read/write/admin), and your manager\'s approval via email. Access is typically granted within 24 hours after verification.',
    readTime: 3, tags: ['access', 'permissions', 'dba'], views: 540,
    icon: '🔑',
  },
  {
    id: 'D003', category: 'Database',
    title: 'Slow Query Performance',
    summary: 'Identify and resolve queries causing performance degradation.',
    content: 'Use EXPLAIN (SQL) or .explain("executionStats") (MongoDB) to profile slow queries. Check for missing indexes on frequently filtered fields. Avoid SELECT * — select only required fields. Escalate to DBA for queries exceeding 5 seconds.',
    readTime: 6, tags: ['performance', 'slow-query', 'indexing'], views: 720,
    icon: '⚡',
  },

  // Technical Issue
  {
    id: 'T001', category: 'Technical Issue',
    title: 'Application Crashes on Startup',
    summary: 'Collect crash logs and perform initial first-level checks before escalation.',
    content: 'Check Windows Event Viewer or macOS Console for crash logs. Clear the application cache. Reinstall the latest version. If crashes persist across reinstalls, export the error log and raise a High-priority ticket.',
    readTime: 4, tags: ['crash', 'startup', 'logs'], views: 1560,
    icon: '💥',
  },
  {
    id: 'T002', category: 'Technical Issue',
    title: 'Software Installation Requests',
    summary: 'Request IT approval and installation of new software on company devices.',
    content: 'Submit a ticket specifying the software name, version, purpose, and whether it requires admin rights. Unapproved software cannot be installed on company devices. Licensed software requests may take 2–3 business days.',
    readTime: 3, tags: ['software', 'installation', 'request'], views: 1080,
    icon: '💾',
  },
  {
    id: 'T003', category: 'Technical Issue',
    title: 'Email Client Not Syncing',
    summary: 'Fix Outlook and other email clients that are stuck or showing old mail.',
    content: 'In Outlook: File → Account Settings → Repair. Disable cached Exchange mode temporarily. Check your mailbox quota — over 50 GB can cause sync freezes. If using IMAP, verify server settings with IT. Restart the email service via Task Manager.',
    readTime: 4, tags: ['email', 'outlook', 'sync'], views: 930,
    icon: '📧',
  },

  // Billing
  {
    id: 'B001', category: 'Billing',
    title: 'Invoice Discrepancy or Billing Error',
    summary: 'Steps to report and resolve incorrect charges on your account.',
    content: 'Gather the invoice number, the expected amount, and supporting documentation. Submit a ticket to the Billing category. The finance team will review and respond within 2 business days. Do not raise chargebacks until the ticket is reviewed.',
    readTime: 3, tags: ['invoice', 'discrepancy', 'finance'], views: 640,
    icon: '🧾',
  },
  {
    id: 'B002', category: 'Billing',
    title: 'Subscription Plan Changes',
    summary: 'How to upgrade, downgrade, or cancel service subscriptions.',
    content: 'Submit a Billing ticket with your current plan, desired plan, and effective date. Changes made before the 15th of the month take effect the same month. Downgrades take effect at the next billing cycle.',
    readTime: 2, tags: ['subscription', 'upgrade', 'plan'], views: 480,
    icon: '💳',
  },
];

const CATEGORIES = ['All', 'General', 'Network', 'Database', 'Technical Issue', 'Billing'];

const CATEGORY_ICONS = {
  All: '📋',
  General: '🏠',
  Network: '📶',
  Database: '🗄️',
  'Technical Issue': '🔧',
  Billing: '💳',
};

/* ─── Component ─────────────────────────────────────────────── */
export default function KnowledgeBase() {
  const navigate = useNavigate();
  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter(a => {
      const matchCat = category === 'All' || a.category === category;
      const matchQ   = !q
        || a.title.toLowerCase().includes(q)
        || a.summary.toLowerCase().includes(q)
        || a.tags.some(t => t.includes(q));
      return matchCat && matchQ;
    });
  }, [query, category]);

  const stats = useMemo(() => ({
    total:   ARTICLES.length,
    byCategory: CATEGORIES.slice(1).map(c => ({
      name:  c,
      count: ARTICLES.filter(a => a.category === c).length,
    })),
  }), []);

  return (
    <div className="kb-page">

      {/* Hero Search */}
      <div className="kb-hero">
        <h1 className="kb-hero-title">Knowledge Base</h1>
        <p className="kb-hero-sub">
          {stats.total} articles across {CATEGORIES.length - 1} categories &mdash; instant self-service support
        </p>
        <div className="kb-search-wrap">
          <svg className="kb-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="kb-search-input"
            placeholder="Search articles, keywords or tags…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="kb-search-clear" onClick={() => setQuery('')}>✕</button>
          )}
        </div>
      </div>

      <div className="kb-body">

        {/* Sidebar */}
        <aside className="kb-sidebar">
          <p className="kb-sidebar-title">Browse by Category</p>
          {CATEGORIES.map(c => {
            const count = c === 'All' ? ARTICLES.length : ARTICLES.filter(a => a.category === c).length;
            return (
              <button
                key={c}
                className={`kb-cat-btn ${category === c ? 'active' : ''}`}
                onClick={() => { setCategory(c); setExpanded(null); }}
              >
                <span className="kb-cat-icon">{CATEGORY_ICONS[c]}</span>
                <span className="kb-cat-name">{c}</span>
                <span className="kb-cat-count">{count}</span>
              </button>
            );
          })}

          <div className="kb-sidebar-divider" />
          <p className="kb-sidebar-title">Quick Stats</p>
          {stats.byCategory.map(s => (
            <div key={s.name} className="kb-stat-row">
              <span className="kb-stat-name">{s.name}</span>
              <div className="kb-stat-bar-wrap">
                <div
                  className="kb-stat-bar-fill"
                  style={{ width: `${(s.count / ARTICLES.length) * 100}%` }}
                />
              </div>
              <span className="kb-stat-count">{s.count}</span>
            </div>
          ))}

          <div className="kb-sidebar-divider" />
          <button className="kb-chatbot-btn" onClick={() => navigate('/chatbot')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Can't find your answer?
            <span>Ask AI Assistant →</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="kb-main">

          {/* Result header */}
          <div className="kb-results-header">
            <span className="kb-results-count">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
              {category !== 'All' && <span className="kb-results-cat"> in {category}</span>}
              {query && <span className="kb-results-q"> for "{query}"</span>}
            </span>
            {(query || category !== 'All') && (
              <button className="kb-clear-btn" onClick={() => { setQuery(''); setCategory('All'); }}>
                Clear filters
              </button>
            )}
          </div>

          {/* No results */}
          {filtered.length === 0 && (
            <div className="kb-empty">
              <div className="kb-empty-icon">🔎</div>
              <p className="kb-empty-title">No articles found</p>
              <p className="kb-empty-sub">Try different keywords or <button className="kb-link-btn" onClick={() => navigate('/chatbot')}>ask the AI Assistant</button>.</p>
            </div>
          )}

          {/* Article Cards */}
          <div className="kb-articles">
            {filtered.map(art => (
              <div key={art.id} className={`kb-card ${expanded === art.id ? 'expanded' : ''}`}>
                <div className="kb-card-header" onClick={() => setExpanded(expanded === art.id ? null : art.id)}>
                  <div className="kb-card-icon">{art.icon}</div>
                  <div className="kb-card-meta">
                    <div className="kb-card-title">{art.title}</div>
                    <div className="kb-card-summary">{art.summary}</div>
                    <div className="kb-card-footer">
                      <span className="kb-badge kb-badge-cat">{art.category}</span>
                      {art.tags.slice(0, 3).map(t => (
                        <span key={t} className="kb-badge kb-badge-tag" onClick={e => { e.stopPropagation(); setQuery(t); }}>
                          #{t}
                        </span>
                      ))}
                      <span className="kb-read-time">⏱ {art.readTime} min read</span>
                      <span className="kb-views">👁 {art.views.toLocaleString()} views</span>
                    </div>
                  </div>
                  <div className="kb-card-chevron">{expanded === art.id ? '▲' : '▼'}</div>
                </div>

                {expanded === art.id && (
                  <div className="kb-card-body">
                    <div className="kb-article-id">Article ID: {art.id}</div>
                    <div className="kb-article-content">
                      {art.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                    <div className="kb-card-actions">
                      <button
                        className="kb-action-btn kb-action-primary"
                        onClick={() => navigate('/chatbot')}
                      >
                        💬 Still need help? Ask AI
                      </button>
                      <button
                        className="kb-action-btn kb-action-secondary"
                        onClick={() => navigate('/new-ticket')}
                      >
                        🎫 Raise a Ticket
                      </button>
                      <button
                        className="kb-action-btn kb-action-success"
                        onClick={() => setExpanded(null)}
                      >
                        ✅ Issue Resolved
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
