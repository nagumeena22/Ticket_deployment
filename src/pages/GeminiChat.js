import { useState, useRef, useEffect } from "react";

const GROQ_API_KEY = "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";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .ai-page {
    display: flex;
    height: 100vh;
    background: #f1f5f9;
    font-family: 'Inter', sans-serif;
    overflow: hidden;
  }

  /* ── Sidebar ── */
  .ai-sidebar {
    width: 272px;
    flex-shrink: 0;
    background: #0f172a;
    display: flex;
    flex-direction: column;
    border-right: 1px solid rgba(255,255,255,0.06);
  }

  .ai-sidebar-brand {
    padding: 26px 22px 18px;
    border-bottom: 1px solid rgba(255,255,255,0.07);
  }

  .ai-brand-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }

  .ai-brand-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .ai-brand-icon svg { width: 20px; height: 20px; fill: #fff; }

  .ai-brand-name {
    font-size: 1rem;
    font-weight: 700;
    color: #f1f5f9;
    letter-spacing: -0.01em;
  }

  .ai-brand-tagline {
    font-size: 0.69rem;
    color: rgba(148,163,184,0.6);
    letter-spacing: 0.02em;
    margin-top: 2px;
  }

  .ai-sidebar-section { padding: 18px 14px 8px; }

  .ai-sidebar-label {
    font-size: 0.63rem;
    font-weight: 600;
    color: rgba(100,116,139,0.75);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0 8px;
    margin-bottom: 8px;
  }

  .ai-new-chat-btn {
    width: 100%;
    padding: 9px 14px;
    background: rgba(79,70,229,0.14);
    border: 1px solid rgba(79,70,229,0.28);
    border-radius: 8px;
    color: #a5b4fc;
    font-size: 0.81rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s;
    font-family: 'Inter', sans-serif;
  }

  .ai-new-chat-btn:hover {
    background: rgba(79,70,229,0.24);
    border-color: rgba(79,70,229,0.5);
    color: #c7d2fe;
  }

  .ai-new-chat-btn svg {
    width: 15px; height: 15px;
    stroke: currentColor; fill: none; flex-shrink: 0;
  }

  .ai-status-card {
    margin: 6px 14px;
    padding: 13px 15px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px;
  }

  .ai-status-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 7px;
  }

  .ai-status-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
    animation: aiPulse 2.5s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes aiPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .ai-status-text {
    font-size: 0.77rem;
    font-weight: 600;
    color: #10b981;
  }

  .ai-status-meta {
    font-size: 0.67rem;
    color: rgba(148,163,184,0.5);
    line-height: 1.55;
  }

  .ai-capabilities {
    flex: 1;
    padding: 10px 14px;
    overflow-y: auto;
  }

  .ai-cap-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 8px;
    margin-bottom: 3px;
    transition: background 0.15s;
  }

  .ai-cap-item:hover { background: rgba(255,255,255,0.04); }

  .ai-cap-icon {
    width: 30px; height: 30px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.82rem;
  }

  .ai-cap-info h5 {
    font-size: 0.77rem;
    font-weight: 600;
    color: #cbd5e1;
    margin-bottom: 2px;
  }

  .ai-cap-info p {
    font-size: 0.67rem;
    color: rgba(100,116,139,0.75);
    line-height: 1.4;
  }

  .ai-sidebar-footer {
    padding: 14px;
    border-top: 1px solid rgba(255,255,255,0.06);
  }

  .ai-powered-by {
    font-size: 0.66rem;
    color: rgba(71,85,105,0.55);
    text-align: center;
    letter-spacing: 0.03em;
  }

  /* ── Main Chat Area ── */
  .ai-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  .ai-topbar {
    padding: 0 28px;
    height: 62px;
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .ai-topbar-title {
    font-size: 0.93rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  .ai-topbar-sub {
    font-size: 0.73rem;
    color: #64748b;
    margin-top: 1px;
  }

  .ai-topbar-right {
    display: flex;
    align-items: center;
    gap: 9px;
  }

  .ai-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.69rem;
    font-weight: 600;
    letter-spacing: 0.03em;
  }

  .ai-badge.secure { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
  .ai-badge.live   { background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; }

  .ai-badge svg { width: 11px; height: 11px; stroke: currentColor; fill: none; }

  /* ── Messages ── */
  .ai-messages {
    flex: 1;
    overflow-y: auto;
    padding: 28px 32px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: #f8fafc;
  }

  .ai-messages::-webkit-scrollbar { width: 5px; }
  .ai-messages::-webkit-scrollbar-track { background: transparent; }
  .ai-messages::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
  .ai-messages::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

  .ai-empty {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 40px 20px;
  }

  .ai-empty-visual {
    width: 70px; height: 70px;
    border-radius: 20px;
    background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(79,70,229,0.25);
    margin-bottom: 8px;
  }

  .ai-empty-visual svg { width: 34px; height: 34px; fill: #fff; }

  .ai-empty h3 {
    font-size: 1.08rem;
    font-weight: 700;
    color: #0f172a;
    letter-spacing: -0.01em;
  }

  .ai-empty p {
    font-size: 0.82rem;
    color: #64748b;
    text-align: center;
    max-width: 340px;
    line-height: 1.65;
  }

  .ai-suggestion-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin-top: 10px;
    max-width: 500px;
  }

  .ai-chip {
    padding: 7px 16px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    font-size: 0.77rem;
    color: #334155;
    cursor: pointer;
    transition: all 0.18s;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
  }

  .ai-chip:hover {
    background: #eef2ff;
    border-color: #a5b4fc;
    color: #4338ca;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79,70,229,0.12);
  }

  .ai-msg-row {
    display: flex;
    gap: 12px;
    animation: aiFadeUp 0.28s ease;
    max-width: 820px;
  }

  @keyframes aiFadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ai-msg-row.user { align-self: flex-end; flex-direction: row-reverse; max-width: 680px; }
  .ai-msg-row.assistant { align-self: flex-start; }

  .ai-avatar {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .ai-msg-row.user .ai-avatar      { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; }
  .ai-msg-row.assistant .ai-avatar { background: linear-gradient(135deg, #0ea5e9, #06b6d4); color: #fff; }
  .ai-avatar svg { width: 18px; height: 18px; fill: #fff; }

  .ai-msg-content { display: flex; flex-direction: column; gap: 4px; }

  .ai-msg-meta {
    font-size: 0.67rem;
    color: #94a3b8;
    font-weight: 500;
    padding: 0 4px;
  }

  .ai-msg-row.user .ai-msg-meta { text-align: right; }

  .ai-bubble {
    padding: 13px 18px;
    border-radius: 14px;
    font-size: 0.875rem;
    line-height: 1.72;
    max-width: 100%;
    word-break: break-word;
  }

  .ai-msg-row.user .ai-bubble {
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    border-top-right-radius: 4px;
    box-shadow: 0 4px 16px rgba(79,70,229,0.25);
  }

  .ai-msg-row.assistant .ai-bubble {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #1e293b;
    border-top-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }

  .ai-bubble pre {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 12px 16px;
    overflow-x: auto;
    margin: 10px 0;
    font-size: 0.78rem;
    line-height: 1.6;
    color: #e2e8f0;
  }

  .ai-bubble code {
    background: rgba(79,70,229,0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.79rem;
    color: #4338ca;
    font-family: 'Courier New', monospace;
  }

  .ai-msg-row.user .ai-bubble code { background: rgba(255,255,255,0.15); color: #e0e7ff; }
  .ai-bubble pre code { background: transparent; padding: 0; color: #e2e8f0; }

  .ai-typing-row {
    display: flex;
    gap: 12px;
    align-self: flex-start;
    animation: aiFadeUp 0.25s ease;
  }

  .ai-typing-bubble {
    padding: 14px 18px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    border-top-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .ai-typing-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #94a3b8;
    animation: aiDotBounce 1.4s ease-in-out infinite;
  }

  .ai-typing-dot:nth-child(2) { animation-delay: 0.18s; }
  .ai-typing-dot:nth-child(3) { animation-delay: 0.36s; }

  @keyframes aiDotBounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-6px); opacity: 1; }
  }

  .ai-error {
    align-self: center;
    padding: 10px 18px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    font-size: 0.79rem;
    color: #dc2626;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: aiFadeUp 0.25s ease;
  }

  .ai-error svg { width: 15px; height: 15px; stroke: #dc2626; fill: none; flex-shrink: 0; }

  /* ── Input Zone ── */
  .ai-input-zone {
    padding: 14px 32px 18px;
    background: #ffffff;
    border-top: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .ai-input-card {
    background: #f8fafc;
    border: 1.5px solid #e2e8f0;
    border-radius: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    overflow: hidden;
  }

  .ai-input-card:focus-within {
    border-color: #818cf8;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.08);
    background: #fff;
  }

  .ai-textarea {
    width: 100%;
    padding: 14px 18px 10px;
    background: transparent;
    border: none;
    outline: none;
    font-family: 'Inter', sans-serif;
    font-size: 0.875rem;
    color: #0f172a;
    resize: none;
    min-height: 52px;
    max-height: 160px;
    line-height: 1.6;
  }

  .ai-textarea::placeholder { color: #94a3b8; }

  .ai-input-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 12px 9px;
    border-top: 1px solid #f1f5f9;
  }

  .ai-input-hint {
    font-size: 0.67rem;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .ai-kbd {
    background: #e2e8f0;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    padding: 1px 5px;
    font-size: 0.61rem;
    color: #475569;
    font-family: 'Inter', sans-serif;
  }

  .ai-send-btn {
    height: 35px;
    padding: 0 18px;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: 'Inter', sans-serif;
    font-size: 0.79rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: all 0.2s;
    letter-spacing: 0.02em;
  }

  .ai-send-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #4338ca, #4f46e5);
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(79,70,229,0.35);
  }

  .ai-send-btn:active:not(:disabled) { transform: translateY(0); }
  .ai-send-btn:disabled { opacity: 0.38; cursor: not-allowed; transform: none; }
  .ai-send-btn svg { width: 14px; height: 14px; fill: #fff; }

  @media (max-width: 768px) {
    .ai-sidebar { display: none; }
    .ai-messages { padding: 20px 16px; }
    .ai-input-zone { padding: 12px 16px 16px; }
    .ai-topbar { padding: 0 16px; }
  }

`;

function renderContent(text) {
  text = text.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) => `<pre><code>${escapeHtml(code.trim())}</code></pre>`);
  text = text.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\n/g, '<br/>');
  return text;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SUGGESTIONS = [
  "Summarize an open ticket",
  "Best practices for SLA management",
  "How to prioritize critical issues?",
  "Draft a customer response",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    setError("");
    const timestamp = new Date();
    const newMessages = [...messages, { role: "user", content: msg, time: timestamp }];
    setMessages(newMessages);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "52px";
    setLoading(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);

      const reply = data.choices?.[0]?.message?.content || "No response.";
      setMessages([...newMessages, { role: "assistant", content: reply, time: new Date() }]);
    } catch (err) {
      setError("Unable to get a response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => { setMessages([]); setError(""); };

  return (
    <>
      <style>{styles}</style>
      <div className="ai-page">

        {/* ── Sidebar ── */}
        <aside className="ai-sidebar">
          <div className="ai-sidebar-brand">
            <div className="ai-brand-logo">
              <div className="ai-brand-icon">
                <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
              </div>
              <span className="ai-brand-name">AI Assistant</span>
            </div>
            <div className="ai-brand-tagline">Enterprise Support Intelligence</div>
          </div>

          <div className="ai-sidebar-section">
            <div className="ai-sidebar-label">Session</div>
            <button className="ai-new-chat-btn" onClick={clearChat}>
              <svg viewBox="0 0 24 24" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Conversation
            </button>
          </div>

          <div className="ai-status-card">
            <div className="ai-status-row">
              <div className="ai-status-dot"/>
              <span className="ai-status-text">System Online</span>
            </div>
            <div className="ai-status-meta">
              Response latency: ultra-low<br/>
              Context window: extended
            </div>
          </div>

          <div className="ai-capabilities">
            <div className="ai-sidebar-label" style={{padding:'0 8px', marginBottom:'10px'}}>Capabilities</div>
            {[
              { icon: "📋", bg: "rgba(79,70,229,0.12)",   title: "Ticket Analysis",    desc: "Summarize and categorize support tickets" },
              { icon: "✍️", bg: "rgba(16,185,129,0.12)",  title: "Response Drafting",  desc: "Generate professional customer replies" },
              { icon: "📊", bg: "rgba(6,182,212,0.12)",   title: "SLA Insights",       desc: "Analyze priorities and escalation paths" },
              { icon: "🔍", bg: "rgba(245,158,11,0.12)",  title: "Knowledge Lookup",   desc: "Query internal docs and procedures" },
            ].map((c, i) => (
              <div className="ai-cap-item" key={i}>
                <div className="ai-cap-icon" style={{ background: c.bg }}>{c.icon}</div>
                <div className="ai-cap-info">
                  <h5>{c.title}</h5>
                  <p>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="ai-sidebar-footer">
            <div className="ai-powered-by">Secured · Enterprise Grade · v2.4</div>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="ai-main">

          {/* Topbar */}
          <div className="ai-topbar">
            <div>
              <div className="ai-topbar-title">AI Support Assistant</div>
              <div className="ai-topbar-sub">Ask anything about tickets, SLA, or operations</div>
            </div>
            <div className="ai-topbar-right">
              <span className="ai-badge secure">
                <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Secure
              </span>
              <span className="ai-badge live">
                <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>
                Live
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-messages">
            {messages.length === 0 && !loading && (
              <div className="ai-empty">
                <div className="ai-empty-visual">
                  <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                </div>
                <h3>How can I assist you today?</h3>
                <p>I can help with ticket management, SLA analysis, drafting responses, and operational insights — tailored for your workflow.</p>
                <div className="ai-suggestion-chips">
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} className="ai-chip" onClick={() => sendMessage(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg-row ${msg.role}`}>
                <div className="ai-avatar">
                  {msg.role === "user"
                    ? <span style={{fontSize:'0.68rem',fontWeight:700}}>YOU</span>
                    : <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                  }
                </div>
                <div className="ai-msg-content">
                  <div className="ai-msg-meta">
                    {msg.role === "user" ? "You" : "AI Assistant"} · {formatTime(msg.time || new Date())}
                  </div>
                  <div className="ai-bubble" dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }} />
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-typing-row">
                <div className="ai-avatar" style={{background:'linear-gradient(135deg,#0ea5e9,#06b6d4)'}}>
                  <svg viewBox="0 0 24 24" style={{width:18,height:18,fill:'#fff'}}><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                </div>
                <div className="ai-typing-bubble">
                  <div className="ai-typing-dot"/><div className="ai-typing-dot"/><div className="ai-typing-dot"/>
                </div>
              </div>
            )}

            {error && (
              <div className="ai-error">
                <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Zone */}
          <div className="ai-input-zone">
            <div className="ai-input-card">
              <textarea
                ref={textareaRef}
                className="ai-textarea"
                placeholder="Describe your query or paste a ticket for analysis…"
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <div className="ai-input-footer">
                <div className="ai-input-hint">
                  <span className="ai-kbd">Enter</span> to send &nbsp;·&nbsp;
                  <span className="ai-kbd">Shift+Enter</span> new line
                </div>
                <button
                  className="ai-send-btn"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                >
                  <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  Send
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

