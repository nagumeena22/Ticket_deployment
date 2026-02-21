import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="home-container">
      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1>Intelligence at the <br /> <span>Heart of Support</span></h1>
            <p>
              Experience the future of helpdesk management. Automatic classification,
              AI-driven routing, and real-time analytics all in one place.
            </p>
            {!token ? (
              <div className="cta-group">
                <Link to="/login" className="cta-primary">Launch Dashboard</Link>
                <Link to="/signup" className="cta-secondary">Get Started Free</Link>
              </div>
            ) : (
              <div className="cta-group" style={{ flexWrap: 'wrap', maxWidth: '600px', margin: '0 auto' }}>
                <Link to="/my-tickets" className="cta-primary">View My Tickets</Link>
                <Link to="/new-ticket" className="cta-secondary">New Ticket</Link>
                <Link to="/analytics" className="cta-secondary">Analytics</Link>
                <Link to="/sla-tracker" className="cta-secondary">SLA Monitor</Link>
                <Link to="/knowledge-base" className="cta-secondary">Knowledge Base</Link>
                <Link to="/chatbot" className="cta-secondary">AI Assistant</Link>
                <Link to="/excel-upload" className="cta-secondary">Excel Upload</Link>
              </div>
            )}
          </div>
        </section>

        <section className="features-grid">
          <div className="feature-card">
            <h3>AI Classification</h3>
            <p>Tickets are automatically categorized using state-of-the-art NLP models.</p>
          </div>
          <div className="feature-card">
            <h3>Smart Routing</h3>
            <p>Intelligent assignment to the right team based on content and priority.</p>
          </div>
          <div className="feature-card">
            <h3>Real-time Analytics</h3>
            <p>Monitor system health and ticket trends with dynamic visualizations.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;
