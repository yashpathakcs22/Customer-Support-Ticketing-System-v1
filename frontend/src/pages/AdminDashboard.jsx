import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, CheckCircle, Clock, Download } from 'lucide-react';
import './pages.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    fetch('http://localhost:8080/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Failed to load users", err));
  };

  useEffect(() => {
    fetch('http://localhost:8080/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load admin stats", err);
        setLoading(false);
      });
    fetchUsers();
  }, []);

  const handleSoftDelete = (userId) => {
    if (!window.confirm("Are you sure you want to disable this user? They will not be able to log in.")) return;
    fetch(`http://localhost:8080/api/users/${userId}/soft-delete`, { method: 'PUT' })
      .then(() => fetchUsers())
      .catch(err => console.error(err));
  };

  const handleHardDelete = (userId) => {
    if (!window.confirm("WARNING: This will permanently erase this user and ALL of their tickets, comments, and history. This cannot be undone. Proceed?")) return;
    fetch(`http://localhost:8080/api/users/${userId}/hard-delete`, { method: 'DELETE' })
      .then(() => fetchUsers())
      .catch(err => console.error(err));
  };

  if (loading) return <div className="page-container">Loading analytics...</div>;
  if (!stats) return <div className="page-container">Failed to load analytics.</div>;

  // Format data for Recharts
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#64748b'];
  const PRIORITY_COLORS = { URGENT: '#dc2626', HIGH: '#ea580c', MEDIUM: '#2563eb', LOW: '#64748b', UNASSIGNED: '#cbd5e1' };

  const statusData = Object.keys(stats.byStatus).map(key => ({
    name: key,
    value: stats.byStatus[key]
  }));

  const priorityData = Object.keys(stats.byPriority).map(key => ({
    name: key,
    value: stats.byPriority[key]
  }));

  const categoryData = Object.keys(stats.byCategory).map(key => ({
    name: key,
    value: stats.byCategory[key]
  }));

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">System overview and ticket metrics</p>
        </div>
        <a 
          href="http://localhost:8080/api/admin/export" 
          download 
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={18} /> Export to CSV
        </a>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#e0e7ff', borderRadius: '12px', color: '#4f46e5' }}>
            <Activity size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Tickets</p>
            <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>{stats.totalTickets}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '12px', color: '#16a34a' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Resolved</p>
            <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>
              {stats.byStatus['RESOLVED'] || 0}
            </h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '12px', color: '#d97706' }}>
            <Clock size={28} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pending</p>
            <h2 style={{ margin: 0, fontSize: '2rem', color: 'var(--text-primary)' }}>
              {(stats.byStatus['OPEN'] || 0) + (stats.byStatus['IN_PROGRESS'] || 0)}
            </h2>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Tickets by Status</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Tickets by Priority</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#64748b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
          <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>Tickets by Category</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>User Management</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', opacity: u.active ? 1 : 0.5 }}>
                  <td style={{ padding: '1rem' }}>#{u.id}</td>
                  <td style={{ padding: '1rem' }}>{u.name}</td>
                  <td style={{ padding: '1rem' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`status-badge ${u.role === 'ADMIN' ? 'status-closed' : u.role === 'AGENT' ? 'status-progress' : 'status-open'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {u.active ? <span style={{ color: '#10b981', fontWeight: '500' }}>Active</span> : <span style={{ color: '#ef4444', fontWeight: '500' }}>Disabled</span>}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {u.role !== 'ADMIN' && (
                      <>
                        <button 
                          onClick={() => handleSoftDelete(u.id)} 
                          className="btn btn-secondary" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                          disabled={!u.active}
                        >
                          Disable
                        </button>
                        <button 
                          onClick={() => handleHardDelete(u.id)} 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
