import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './pages.css';

const NewTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    category: 'GENERAL',
    customerId: user?.id
  });

  const [file, setFile] = useState(null);
  const [suggestedArticles, setSuggestedArticles] = useState([]);

  React.useEffect(() => {
    if (formData.title.length >= 3) {
      const timer = setTimeout(() => {
        fetch(`http://localhost:8080/api/articles/search?query=${encodeURIComponent(formData.title)}`)
          .then(res => res.json())
          .then(data => setSuggestedArticles(data))
          .catch(err => console.error(err));
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestedArticles([]);
    }
  }, [formData.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let attachmentUrl = null;
    
    try {
      if (file) {
        const fileData = new FormData();
        fileData.append('file', file);
        const uploadRes = await fetch('http://localhost:8080/api/files/upload', {
          method: 'POST',
          body: fileData
        });
        if (uploadRes.ok) {
          attachmentUrl = await uploadRes.text();
        } else {
          console.error("File upload failed");
        }
      }

      const res = await fetch('http://localhost:8080/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, attachmentUrl })
      });
      if (res.ok) {
        navigate('/');
      }
    } catch (err) {
      console.error("Failed to create ticket", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Create New Ticket</h1>
          <p className="page-subtitle">Submit a new support request</p>
        </div>
      </div>

      <div className="glass-panel form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Ticket Title</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Cannot connect to database"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
            
            {suggestedArticles.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                  Suggested Solutions (Knowledge Base)
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {suggestedArticles.map(article => (
                    <li key={article.id} style={{ marginBottom: '0.25rem' }}>
                      <strong style={{ color: 'var(--primary-color)' }}>{article.title}</strong>: {article.content}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label className="form-label">Category</label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="GENERAL">General Inquiry</option>
                <option value="TECHNICAL">Technical Support</option>
                <option value="BILLING">Billing Issue</option>
                <option value="FEATURE_REQUEST">Feature Request</option>
              </select>
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select 
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              rows="6"
              placeholder="Please describe the issue in detail..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            ></textarea>
          </div>

          <div className="form-group">
            <label className="form-label">Attachment (Optional)</label>
            <input 
              type="file" 
              className="form-input" 
              style={{ padding: '0.5rem' }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTicket;
