import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users as UsersIcon } from 'lucide-react';
import './pages.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole, userName) => {
    const action = newRole === 'AGENT' ? 'promote' : 'demote';
    const keyword = action.toUpperCase();
    const userInput = window.prompt(`SECURITY CHECK: You are about to ${action} ${userName}.\n\nTo confirm this sensitive action, please type the word: ${keyword}`);
    
    if (userInput !== keyword) {
      if (userInput !== null) { // don't alert if they just clicked Cancel
        alert(`Action cancelled. You must type exactly "${keyword}" to confirm.`);
      }
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update user role.');
      }
    } catch (err) {
      setError('Failed to connect to server');
    }
  };


  const currentUser = JSON.parse(localStorage.getItem('user'));
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '10vh' }}>
        <ShieldAlert size={48} color="var(--danger-color)" style={{ margin: '0 auto 1rem' }} />
        <h2>Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage agents and view all users</p>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div className="glass-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <UsersIcon size={20} /> All Users
          </h3>
          {error && (
            <div className="error-alert" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}
            {loading ? (
              <div>Loading users...</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Name</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Email</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>Role</th>
                      <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>{user.name}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>{user.email}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{
                            padding: '4px 8px', 
                            borderRadius: '12px', 
                            fontSize: '0.8rem',
                            backgroundColor: user.role === 'ADMIN' ? 'var(--danger-color)' : user.role === 'AGENT' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                            color: '#fff'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                          {user.role === 'CUSTOMER' && (
                            <button 
                              className="btn" 
                              style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: 'none' }}
                              onClick={() => handleRoleChange(user.id, 'AGENT', user.name)}
                            >
                              Promote to Agent
                            </button>
                          )}
                          {user.role === 'AGENT' && (
                            <button 
                              className="btn" 
                              style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none' }}
                              onClick={() => handleRoleChange(user.id, 'CUSTOMER', user.name)}
                            >
                              Demote to Customer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Users;
