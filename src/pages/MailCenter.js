import React, { useState } from 'react';
import './MailCenter.css';

const API_BASE = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/$/, '');

export default function MailCenter() {
  const [quickHeading, setQuickHeading] = useState('HR Team');
  const [quickBody, setQuickBody] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(''), 2500);
  };

  const sendMail = async (subject, body) => {
    const res = await fetch(`${API_BASE}/mail/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, body }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to send mail');
    }
  };

  const handleQuick = async (e) => {
    e.preventDefault();
    if (!quickBody.trim()) return;
    try {
      await sendMail(quickHeading, quickBody);
      setQuickBody('');
      showToast('Mail sent');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleForm = async (e) => {
    e.preventDefault();
    if (!formBody.trim()) return;
    setFormLoading(true);
    setTimeout(async () => {
      try {
        await sendMail('Software', formBody);
        setFormBody('');
        showToast('Mail sent');
      } catch (err) {
        showToast(err.message, 'error');
      } finally {
        setFormLoading(false);
      }
    }, 3000);
  };

  return (
    <div className="mail-page">
      <div className="mail-hero">
        <div>
          <p className="mail-eyebrow">Mail Center</p>
          <h1>Send quick updates without leaving the app.</h1>
          <p className="mail-sub">Pick a heading, type your note, and send directly. Form submissions include a brief analysing delay.</p>
        </div>
      </div>

      {toast && <div className={`mail-toast ${toastType === 'error' ? 'error' : 'success'}`}>{toast}</div>}

      <div className="mail-grid">
        <div className="mail-card">
          <div className="mail-card-head">
            <div>
              <p className="mail-card-eyebrow">Quick mail</p>
              <h3>HR / General</h3>
            </div>
          </div>
          <form onSubmit={handleQuick} className="mail-form">
            <label className="mail-label">Heading</label>
            <select value={quickHeading} onChange={(e) => setQuickHeading(e.target.value)} className="mail-select">
              <option>HR Team</option>
              <option>General Team</option>
            </select>
            <label className="mail-label">Message</label>
            <textarea
              value={quickBody}
              onChange={(e) => setQuickBody(e.target.value)}
              rows={4}
              placeholder="Share a short update..."
              className="mail-textarea"
            />
            <button type="submit" className="mail-btn">Send now</button>
          </form>
        </div>

        <div className="mail-card">
          <div className="mail-card-head">
            <div>
              <p className="mail-card-eyebrow">Form</p>
              <h3>Issue title to Software</h3>
            </div>
            {formLoading && <span className="mail-chip">Analysing…</span>}
          </div>
          <form onSubmit={handleForm} className="mail-form">
            <label className="mail-label">Issue title</label>
            <input
              type="text"
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              placeholder="e.g. Login service timing out for users"
              className="mail-input"
            />
            <button type="submit" className="mail-btn" disabled={formLoading}>
              {formLoading ? 'Analysing…' : 'Submit'}
            </button>
            <p className="mail-hint">We simulate a 3s analysis, then send directly.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
