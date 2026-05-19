import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Clock } from 'lucide-react';
import './components.css';

const TicketCard = ({ ticket }) => {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'URGENT': return '#dc2626'; // Red
      case 'HIGH': return '#ea580c'; // Orange
      case 'MEDIUM': return '#2563eb'; // Blue
      case 'LOW': return '#64748b'; // Slate
      default: return '#64748b';
    }
  };

  return (
    <Link to={`/ticket/${ticket.id}`} className="ticket-card glass-panel group">
      <div className="ticket-card-content">
        <div className="ticket-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="ticket-id-badge">#{ticket.id}</div>
            <h3 className="ticket-title group-hover:text-primary transition-colors">{ticket.title}</h3>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        
        <p className="ticket-desc">
          {ticket.description.length > 120 
            ? ticket.description.substring(0, 120) + '...' 
            : ticket.description}
        </p>

        <div className="ticket-badges">
          <span className="badge-category">
            {ticket.category ? ticket.category.replace('_', ' ') : 'GENERAL'}
          </span>
          <span className="badge-priority" style={{
            color: getPriorityColor(ticket.priority),
            backgroundColor: getPriorityColor(ticket.priority) + '15',
            borderColor: getPriorityColor(ticket.priority) + '30'
          }}>
            {ticket.priority || 'MEDIUM'}
          </span>
        </div>
      </div>
      
      <div className="ticket-footer">
        <div className="ticket-meta">
          <Clock size={14} className="text-muted" />
          <span>{new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="ticket-assignee">
          <div className="assignee-avatar">
            {ticket.agent ? ticket.agent.name.charAt(0).toUpperCase() : '?'}
          </div>
          <span>{ticket.agent ? ticket.agent.name : 'Unassigned'}</span>
        </div>
      </div>
    </Link>
  );
};

export default TicketCard;
