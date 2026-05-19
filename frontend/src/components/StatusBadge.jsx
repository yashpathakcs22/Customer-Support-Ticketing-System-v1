import React from 'react';

const StatusBadge = ({ status }) => {
  let bgColor = 'var(--status-open)';
  
  switch(status) {
    case 'OPEN': bgColor = 'var(--status-open)'; break;
    case 'IN_PROGRESS': bgColor = 'var(--status-progress)'; break;
    case 'RESOLVED': bgColor = 'var(--status-resolved)'; break;
    case 'CLOSED': bgColor = 'var(--status-closed)'; break;
    default: bgColor = 'var(--status-open)';
  }

  return (
    <span 
      style={{
        backgroundColor: `${bgColor}20`,
        color: bgColor,
        border: `1px solid ${bgColor}40`,
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        display: 'inline-block',
        textTransform: 'capitalize'
      }}
    >
      {status ? status.replace('_', ' ').toLowerCase() : 'Open'}
    </span>
  );
};

export default StatusBadge;
