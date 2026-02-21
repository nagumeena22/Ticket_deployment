import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './MyTickets.css';

function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const baseUrl = process.env.REACT_APP_API_BASE_URL || '/api';
                const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
                const res = await fetch(`${cleanBaseUrl}/tickets/my-tickets`);
                const data = await res.json();
                setTickets(data);
            } catch (err) {
                console.error('Error fetching tickets:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    return (
        <div className="home-container">
            <div className="tickets-list-container">
                <div className="tickets-header">
                    <h2>My Tickets</h2>
                    <p>{tickets.length} tickets found</p>
                </div>

                {loading ? (
                    <p>Loading tickets...</p>
                ) : (
                    <div className="tickets-grid">
                        {tickets.length > 0 && (
                            <div className="tickets-columns" aria-hidden="true">
                                <span>Ticket ID</span>
                                <span>Problem</span>
                                <span>Category</span>
                                <span>Priority</span>
                                <span>Status</span>
                            </div>
                        )}

                        {tickets.map((ticket) => (
                            <div key={ticket._id} className="ticket-item">
                                <div className="ticket-id">#{ticket._id.toString().slice(-6).toUpperCase()}</div>
                                <div className="ticket-desc">{ticket.description}</div>
                                <div className={`badge badge-${ticket.category.toLowerCase()}`}>
                                    {ticket.category}
                                </div>
                                <div className={`priority-${ticket.priority.toLowerCase()}`}>
                                    {ticket.priority}
                                </div>
                                <div className="status-label">{ticket.status}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MyTickets;
