import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Send } from 'lucide-react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './pages.css';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchData = async () => {
    try {
      const [ticketRes, commentsRes, logsRes] = await Promise.all([
        fetch(`http://localhost:8080/api/tickets/${id}`),
        fetch(`http://localhost:8080/api/tickets/${id}/comments`),
        fetch(`http://localhost:8080/api/audit-logs/ticket/${id}`)
      ]);
      
      if (ticketRes.ok) setTicket(await ticketRes.json());
      if (commentsRes.ok) setComments(await commentsRes.json());
      if (logsRes.ok) setAuditLogs(await logsRes.json());

      // If admin, fetch agents to allow assignment
      if (user?.role === 'ADMIN') {
        const usersRes = await fetch('http://localhost:8080/api/users');
        if (usersRes.ok) {
          const allUsers = await usersRes.json();
          setAgents(allUsers.filter(u => u.role === 'AGENT' && u.active));
        }
      }
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user?.role]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(`/topic/ticket/${id}`, (message) => {
          if (message.body) {
            const newComment = JSON.parse(message.body);
            setComments(prev => {
              if (prev.find(c => c.id === newComment.id)) return prev;
              return [...prev, newComment];
            });
          }
        });
      }
    });
    client.activate();

    return () => {
      client.deactivate();
    };
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, content: newComment })
      });
      if (res.ok) {
        setNewComment('');
      }
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgent) return;
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${id}/assign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent })
      });
      if (res.ok) fetchData(); // Refresh
    } catch (err) {
      console.error("Failed to assign agent", err);
    }
  };

  const handleResolveTicket = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESOLVED' })
      });
      if (res.ok) fetchData(); // Refresh
    } catch (err) {
      console.error("Failed to resolve ticket", err);
    }
  };

  if (loading) return <div className="page-container">Loading...</div>;
  if (!ticket) return <div className="page-container">Ticket not found</div>;

  return (
    <div className="page-container animate-fade-in-up">
      <button className="btn btn-secondary back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={16} style={{marginRight: '8px'}} /> Back to Dashboard
      </button>

      <div className="details-layout">
        <div className="main-content">
          <div className="glass-panel ticket-view">
            <div className="ticket-view-header">
              <h1 className="ticket-view-title">{ticket.title}</h1>
              <StatusBadge status={ticket.status} />
            </div>
            <p className="ticket-view-desc">{ticket.description}</p>
            {ticket.attachmentUrl && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>Attachment</h4>
                {ticket.attachmentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                  <img src={`http://localhost:8080${ticket.attachmentUrl}`} alt="Attachment" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid var(--border-light)' }} />
                ) : (
                  <a href={`http://localhost:8080${ticket.attachmentUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                    View Attachment
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="glass-panel comments-section">
            <h3>Comments</h3>
            <div className="comments-list">
              {comments.map(c => (
                <div key={c.id} className="comment-bubble">
                  <div className="comment-author">{c.user?.name || 'User'} <span style={{fontWeight:'normal', opacity:0.7}}>({c.user?.role})</span></div>
                  <div className="comment-text">{c.content}</div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-muted">No comments yet.</p>}
            </div>
            
            {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
              <form onSubmit={handleAddComment} className="comment-form">
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Type a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button type="submit" className="btn btn-primary icon-btn">
                  <Send size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="sidebar-content">
          <div className="glass-panel details-panel">
            <h3>Details</h3>
            <div className="detail-item">
              <label>Ticket ID</label>
              <span>#{ticket.id}</span>
            </div>
            <div className="detail-item">
              <label>Created</label>
              <span>{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <label>Customer</label>
              <span>{ticket.customer?.name || 'Unknown'}</span>
            </div>
            <div className="detail-item">
              <label>Assigned Agent</label>
              <span>{ticket.agent?.name || 'Unassigned'}</span>
            </div>
            
            <div style={{marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem'}}></div>
            
            <div className="detail-item">
              <label>Priority</label>
              <span style={{
                color: ticket.priority === 'URGENT' ? '#dc2626' : 
                       ticket.priority === 'HIGH' ? '#ea580c' : 
                       ticket.priority === 'MEDIUM' ? '#2563eb' : '#64748b',
                fontWeight: '700'
              }}>
                {ticket.priority || 'MEDIUM'}
              </span>
            </div>
            <div className="detail-item">
              <label>Category</label>
              <span>{ticket.category ? ticket.category.replace('_', ' ') : 'GENERAL'}</span>
            </div>
            <div className="detail-item">
              <label>SLA Deadline</label>
              <span style={{ 
                color: new Date(ticket.slaDeadline) < new Date() && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' ? '#dc2626' : 'inherit'
              }}>
                {ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleString() : 'N/A'}
              </span>
            </div>

            {/* Admin Controls */}
            {user?.role === 'ADMIN' && (
              <div style={{marginTop: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem'}}>
                <label className="form-label">Assign to Agent</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <select 
                    className="form-select" 
                    value={selectedAgent} 
                    onChange={(e) => setSelectedAgent(e.target.value)}
                  >
                    <option value="">Select an agent...</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <button className="btn btn-secondary" onClick={handleAssignAgent} disabled={!selectedAgent}>Assign</button>
                </div>
              </div>
            )}

            {/* Agent Controls */}
            {user?.role === 'AGENT' && ticket.agent?.id === user.id && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
              <div style={{marginTop: '2rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem'}}>
                <button className="btn btn-primary" style={{width: '100%'}} onClick={handleResolveTicket}>
                  Mark as Resolved
                </button>
              </div>
            )}
          </div>

          <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Audit Logs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflowY: 'auto' }}>
              {auditLogs.length === 0 ? (
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>No activity yet.</p>
              ) : (
                auditLogs.map(log => (
                  <div key={log.id} style={{ 
                    padding: '0.75rem', 
                    background: '#f8fafc', 
                    borderRadius: '8px',
                    borderLeft: '3px solid var(--primary-color)' 
                  }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {log.action}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      <span>{log.actor ? log.actor.name : 'System'}</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
