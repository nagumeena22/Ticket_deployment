import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './NewTicket.css';

/* ══════════════════════════════════════
   CLIENT-SIDE AI CLASSIFICATION ENGINE
══════════════════════════════════════ */
const KB_ARTICLES = {
  Network: [
    { id: 'N1', title: 'Fix VPN connectivity issues on Windows/Mac', icon: '🔒' },
    { id: 'N2', title: 'Troubleshoot slow internet / bandwidth throttling', icon: '🌐' },
    { id: 'N3', title: 'DNS resolution failures — step-by-step guide', icon: '📡' },
    { id: 'N4', title: 'Configure firewall exceptions for corporate apps', icon: '🛡️' },
  ],
  Database: [
    { id: 'D1', title: 'Emergency database recovery from backup snapshots', icon: '💾' },
    { id: 'D2', title: 'SQL query optimisation for high-load tables', icon: '⚡' },
    { id: 'D3', title: 'Resolve connection pool exhaustion errors', icon: '🔗' },
  ],
  'Technical Issue': [
    { id: 'T1', title: 'Application crash — collect & submit diagnostic logs', icon: '📋' },
    { id: 'T2', title: 'Windows / macOS software installation guide', icon: '💿' },
    { id: 'T3', title: 'Clear cache and reset application to factory defaults', icon: '🔄' },
    { id: 'T4', title: 'Remote desktop & screen sharing troubleshooting', icon: '🖥️' },
  ],
  Billing: [
    { id: 'B1', title: 'Request a software license or seat upgrade', icon: '📄' },
    { id: 'B2', title: 'Dispute an incorrect charge on your account', icon: '💳' },
    { id: 'B3', title: 'Subscription renewal and auto-pay settings', icon: '🔁' },
  ],
  General: [
    { id: 'G1', title: 'Password reset — self-service portal guide', icon: '🔑' },
    { id: 'G2', title: 'IT helpdesk hours & escalation contacts', icon: '📞' },
    { id: 'G3', title: 'How to check your ticket status online', icon: '🎫' },
  ],
};

const SLA_HOURS = { High: 4, Medium: 8, Low: 24 };

const RULES = {
  Network: {
    keywords: ['network', 'internet', 'wifi', 'wi-fi', 'connection', 'connect', 'vpn', 'bandwidth',
      'firewall', 'router', 'switch', 'latency', 'ping', 'dns', 'ip address', 'ethernet', 'wireless',
      'offline', 'no access', 'no signal', 'packet loss', 'proxy', 'gateway', 'subnet'],
    weight: 10,
  },
  Database: {
    keywords: ['database', 'sql', 'query', ' db ', 'postgres', 'mongo', 'mysql', 'oracle', 'data',
      'backup', 'restore', 'corrupt', 'schema', 'table', 'index', 'migration', 'stored procedure',
      'transaction', 'deadlock', 'replication', 'connection pool'],
    weight: 10,
  },
  'Technical Issue': {
    keywords: ['crash', 'error', 'bug', 'install', 'update', 'patch', 'boot', 'freeze', 'slow',
      'performance', 'application', 'software', 'app', 'windows', 'macos', 'linux', 'memory',
      'cpu', 'disk', 'driver', 'blue screen', 'bsod', 'timeout', 'hangs', 'not responding',
      'unresponsive', 'corrupted', 'reset', 'stop working'],
    weight: 10,
  },
  Billing: {
    keywords: ['invoice', 'payment', 'charge', 'billing', 'subscription', 'license', 'purchase',
      'renewal', 'refund', 'cost', 'price', 'expire', 'account', 'seat', 'plan', 'upgrade',
      'cancel', 'receipt'],
    weight: 10,
  },
};

const HIGH_KEYWORDS = [
  'critical', 'urgent', 'down', 'outage', 'broken', "can't access", 'cannot access',
  'not working', 'cannot connect', "can't connect", 'not connecting', 'offline', 'down completely',
  'emergency', 'production', 'blocked', 'failure', 'completely', 'major', 'all users',
  'system down', 'service down', 'site down', 'cannot login', "can't login",
];
const MEDIUM_KEYWORDS = [
  'slow', 'intermittent', 'degraded', 'sometimes', 'issue', 'problem', 'unstable',
  'difficult', 'occasional', 'partial', 'limited', 'unusual', 'not loading', 'cannot open',
  "can't open", 'not responding', 'failing', 'errors', 'retry',
];

function classifyTicket(text) {
  if (!text || text.trim().length < 8) return null;
  const lower = text.toLowerCase();

  // Category scoring
  const scores = {};
  Object.entries(RULES).forEach(([cat, { keywords, weight }]) => {
    scores[cat] = 0;
    keywords.forEach(kw => { if (lower.includes(kw)) scores[cat] += weight; });
  });

  const topScore = Math.max(...Object.values(scores));
  const category = topScore > 0
    ? Object.keys(scores).find(k => scores[k] === topScore)
    : 'General';

  // Priority scoring
  let priorityScore = 0;
  HIGH_KEYWORDS.forEach(kw => { if (lower.includes(kw)) priorityScore += 2; });
  MEDIUM_KEYWORDS.forEach(kw => { if (lower.includes(kw)) priorityScore += 1; });
  let priority = priorityScore >= 3 ? 'High' : priorityScore >= 1 ? 'Medium' : 'Low';
  if (priority === 'Low' && category !== 'General') {
    // Elevate non-general incidents to at least Medium when no severity keywords were found
    priority = 'Medium';
  }

  // Confidence (0-100)
  const maxPossible = RULES[category]?.keywords?.length * 10 || 10;
  const confidence = Math.min(Math.round((topScore / Math.max(maxPossible * 0.4, 1)) * 100), 97);
  const cappedConf = Math.max(confidence, text.length > 20 ? 52 : 30);

  // SLA
  const slaHours = SLA_HOURS[priority];

  // Routing team
  const teams = { Network: 'Network Ops', Database: 'Database Admin', 'Technical Issue': 'L2 Support', Billing: 'Finance Ops', General: 'L1 Helpdesk' };

  return { category, priority, confidence: cappedConf, slaHours, team: teams[category], articles: (KB_ARTICLES[category] || KB_ARTICLES.General).slice(0, 2) };
}

/* ══════════════════════════════════════
   COMPONENT
══════════════════════════════════════ */
function NewTicket() {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (description.trim().length < 8) { setAiResult(null); setAiAnalyzing(false); return; }
    setAiAnalyzing(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const res = classifyTicket(description);
      setAiResult(res);
      setAiAnalyzing(false);
    }, 650);
    return () => clearTimeout(debounceRef.current);
  }, [description]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('description', description);
    if (file) formData.append('file', file);
    try {
      const baseUrl = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/$/, '');
      const res = await fetch(`${baseUrl}/tickets/create`, { method: 'POST', body: formData });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => navigate('/my-tickets'), 1800);
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit ticket');
      }
    } catch (err) {
      alert('Network error. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = { High: '#ef4444', Medium: '#f59e0b', Low: '#22c55e' };
  const categoryColor = { Network: '#3b82f6', Database: '#a855f7', 'Technical Issue': '#f59e0b', Billing: '#10b981', General: '#6366f1' };

  return (
    <div className="ticket-container">
      {submitted && (
        <div className="ticket-success-overlay">
          <div className="ticket-success-box">
            <div className="ticket-success-icon">✓</div>
            <h3>Ticket Submitted!</h3>
            <p>Routed to <strong>{aiResult?.team || 'Support Team'}</strong> · SLA: {aiResult?.slaHours}h</p>
          </div>
        </div>
      )}

      <div className="ticket-card nt-wide">
        {/* Left: form */}
        <div className="nt-form-col">
          <div className="nt-card-head">
            <h2>Raise a Ticket</h2>
            <p>Describe your issue — our AI engine classifies and routes it instantly.</p>
          </div>

          <form onSubmit={handleSubmit} className="ticket-form">
            <div className="form-group nt-textarea-wrap">
              <textarea
                placeholder="e.g. VPN keeps dropping every 10 minutes and users in building A cannot connect to internal resources…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={6}
              />
              <div className="nt-char-count">{description.length} chars</div>
            </div>

            <div className="file-upload-group" onClick={() => document.getElementById('ticketFile').click()}>
              <input type="file" id="ticketFile" accept=".txt" onChange={e => setFile(e.target.files[0])} />
              <div className="file-label">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                <span>{file ? 'Change File' : 'Attach log or text file'}</span>
                {file && <div className="selected-file">{file.name}</div>}
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading || submitted}>
              {loading ? (
                <span className="nt-btn-loading"><span className="nt-btn-spinner" />Submitting…</span>
              ) : 'Submit Ticket →'}
            </button>
          </form>

          <Link to="/" className="back-link">← Back to Dashboard</Link>
        </div>

        {/* Right: AI panel */}
        <div className="nt-ai-col">
          <div className="nt-ai-header">
            <div className="nt-ai-dot" />
            <span className="nt-ai-label">AI Classification Engine</span>
          </div>

          {!aiResult && !aiAnalyzing && (
            <div className="nt-ai-idle">
              <div className="nt-ai-idle-icon">🤖</div>
              <p>Start typing your issue description to see live AI classification, SLA assignment, and knowledge base suggestions.</p>
            </div>
          )}

          {aiAnalyzing && (
            <div className="nt-ai-analyzing">
              <div className="nt-ai-pulse-ring" />
              <span>Analysing issue…</span>
            </div>
          )}

          {aiResult && !aiAnalyzing && (
            <div className="nt-ai-result">
              {/* Category + Priority */}
              <div className="nt-ai-row">
                <div className="nt-ai-field">
                  <span className="nt-ai-field-label">Category</span>
                  <span className="nt-ai-badge" style={{ background: categoryColor[aiResult.category] + '18', color: categoryColor[aiResult.category], border: `1px solid ${categoryColor[aiResult.category]}40` }}>
                    {aiResult.category}
                  </span>
                </div>
                <div className="nt-ai-field">
                  <span className="nt-ai-field-label">Priority</span>
                  <span className="nt-ai-badge" style={{ background: priorityColor[aiResult.priority] + '18', color: priorityColor[aiResult.priority], border: `1px solid ${priorityColor[aiResult.priority]}40` }}>
                    {aiResult.priority}
                  </span>
                </div>
              </div>

              {/* SLA + Team */}
              <div className="nt-ai-row">
                <div className="nt-ai-field">
                  <span className="nt-ai-field-label">SLA Deadline</span>
                  <span className="nt-ai-value">⏱ {aiResult.slaHours}h response</span>
                </div>
                <div className="nt-ai-field">
                  <span className="nt-ai-field-label">Routed To</span>
                  <span className="nt-ai-value">👥 {aiResult.team}</span>
                </div>
              </div>

              {/* Confidence bar */}
              <div className="nt-ai-conf-wrap">
                <div className="nt-ai-conf-label">
                  <span>AI Confidence</span>
                  <span style={{ color: aiResult.confidence >= 70 ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>{aiResult.confidence}%</span>
                </div>
                <div className="nt-ai-conf-bg">
                  <div className="nt-ai-conf-fill" style={{ width: `${aiResult.confidence}%`, background: aiResult.confidence >= 70 ? '#22c55e' : aiResult.confidence >= 50 ? '#f59e0b' : '#ef4444' }} />
                </div>
              </div>

              {/* KB Suggestions */}
              <div className="nt-ai-kb-head">
                <span>💡</span> Suggested Articles
              </div>
              <div className="nt-ai-kb-list">
                {aiResult.articles.map(a => (
                  <div className="nt-ai-kb-item" key={a.id}>
                    <span>{a.icon}</span>
                    <span>{a.title}</span>
                  </div>
                ))}
                <Link to="/knowledge-base" className="nt-kb-link">Browse full knowledge base →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewTicket;
