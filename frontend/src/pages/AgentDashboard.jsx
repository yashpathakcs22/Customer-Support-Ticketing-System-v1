import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import TicketCard from '../components/TicketCard';
import { RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import './pages.css';

const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;
  
  const location = useLocation();
  const isHistory = location.pathname.includes('/history');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const endpoint = isHistory ? 'history' : 'pending';
      const url = `http://localhost:8080/api/tickets/agent/${user.id}/${endpoint}?page=${page}&size=${size}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTickets(data.content || []);
        setTotalPages(data.totalPages || 0);
      }
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 0 when switching between pending and history
    setPage(0);
  }, [isHistory]);

  useEffect(() => {
    fetchTickets();
  }, [page, isHistory]);

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isHistory ? 'Ticket History' : 'Pending Tickets'}</h1>
          <p className="page-subtitle">
            {isHistory 
              ? 'A record of all resolved and closed tickets you have handled.' 
              : 'Active tickets currently assigned to you.'}
          </p>
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
          <p>
            {isHistory 
              ? "You haven't resolved any tickets yet." 
              : "You're all caught up! There are no open tickets assigned to you at the moment."}
          </p>
        </div>
      ) : (
        <>
          <div className="ticket-grid">
            {tickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ color: 'var(--text-secondary)' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button 
                className="btn btn-secondary" 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AgentDashboard;
