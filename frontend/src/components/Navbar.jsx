import React from 'react';
import { Bell, Search, User, LogOut, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './components.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showProfilePopup, setShowProfilePopup] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(localStorage.getItem('theme') === 'dark');

  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:8080/api/notifications/user/${user.id}`)
        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error(err));
    }
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-brand">
        <h2>SupportDesk</h2>
      </div>
      <div className="navbar-actions">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search tickets... (Press Enter)" 
            className="form-input" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
        
        <div style={{ position: 'relative', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="icon-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px', background: '#dc2626', color: 'white', 
                fontSize: '0.6rem', padding: '2px 5px', borderRadius: '999px', fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute', top: '100%', right: '0', width: '300px', marginTop: '0.5rem',
              zIndex: 50, padding: '1rem', maxHeight: '400px', overflowY: 'auto'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>Notifications</h4>
              {notifications.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No notifications.</p>
              ) : (
                notifications.map(n => (
                  <div key={n.id} style={{ 
                    padding: '0.75rem', marginBottom: '0.5rem', borderRadius: '8px',
                    background: n.read ? 'transparent' : '#f1f5f9', cursor: 'pointer'
                  }} onClick={() => markAsRead(n.id)}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: n.read ? 'var(--text-secondary)' : 'var(--text-primary)' }}>{n.message}</p>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                ))
              )}
            </div>
          )}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            className="icon-btn profile-btn" 
            onClick={() => setShowProfilePopup(!showProfilePopup)}
            style={{ 
              width: '36px', height: '36px', borderRadius: '50%', padding: 0, 
              background: 'var(--primary-color)', color: 'white', fontWeight: 'bold' 
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </button>

          {showProfilePopup && (
            <div className="glass-panel" style={{
              position: 'absolute', top: '100%', right: '0', width: '280px', marginTop: '0.5rem',
              zIndex: 50, padding: '1.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', 
                  background: 'var(--primary-color)', color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.25rem', fontWeight: 'bold' 
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{user?.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user?.email}</span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.role}</span>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>User ID</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>#{user?.id}</span>
                </div>
              </div>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                onClick={handleLogout}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
