import React, { useState, useEffect } from 'react';
import TicketCard from '../components/TicketCard';
import { RefreshCw } from 'lucide-react';
import './pages.css';

const Dashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      let url = 'http://localhost:8080/api/tickets';
      if (user.role === 'CUSTOMER') url = `http://localhost:8080/api/tickets/customer/${user.id}`;
      if (user.role === 'AGENT') url = `http://localhost:8080/api/tickets/agent/${user.id}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of all support tickets</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchTickets}>
          <RefreshCw size={16} style={{marginRight: '8px'}} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading tickets...</div>
      ) : tickets.length === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No tickets found</h3>
          <p>You're all caught up! There are no open tickets at the moment.</p>
        </div>
      ) : (
        <div className="ticket-grid">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
