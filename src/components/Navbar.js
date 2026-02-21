import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const location = useLocation();
    const token = localStorage.getItem('token');

    if (!token) return null;

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="global-navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">PowerGrid AI</Link>
                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>Home</Link>
                    <Link to="/my-tickets" className={`nav-link ${isActive('/my-tickets')}`}>My Tickets</Link>
                    <Link to="/new-ticket" className={`nav-link ${isActive('/new-ticket')}`}>New Ticket</Link>
                    <Link to="/analytics" className={`nav-link ${isActive('/analytics')}`}>Analytics</Link>
                    <Link to="/triage" className={`nav-link ${isActive('/triage')}`}>AI Triage</Link>
                    <Link to="/anomaly-radar" className={`nav-link ${isActive('/anomaly-radar')}`}>Anomaly Radar</Link>
                    <Link to="/command-center" className={`nav-link ${isActive('/command-center')}`}>Command Center</Link>
                    <Link to="/maintenance" className={`nav-link ${isActive('/maintenance')}`}>Maintenance</Link>
                    <Link to="/sla-tracker" className={`nav-link ${isActive('/sla-tracker')}`}>SLA Monitor</Link>
                    <Link to="/knowledge-base" className={`nav-link ${isActive('/knowledge-base')}`}>Knowledge Base</Link>
                    <Link to="/mail-center" className={`nav-link ${isActive('/mail-center')}`}>Mail Center</Link>
                    <Link to="/chatbot" className={`nav-link ${isActive('/chatbot')}`}>AI Assistant</Link>
                    <Link to="/excel-upload" className={`nav-link ${isActive('/excel-upload')}`}>Excel Upload</Link>
                </div>
                <div className="nav-actions">
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            window.location.href = '/login';
                        }}
                        className="logout-btn"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
