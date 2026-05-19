import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TicketCard from '../components/TicketCard';
import { Search } from 'lucide-react';
import './pages.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q');
  const user = JSON.parse(localStorage.getItem('user'));
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (query) {
      setLoading(true);
      fetch(`http://localhost:8080/api/tickets/search?query=${encodeURIComponent(query)}&userId=${user.id}&role=${user.role}`)
        .then(res => res.json())
        .then(data => {
          setResults(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Search failed", err);
          setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query, navigate, user]);

  return (
    <div className="page-container animate-fade-in-up">
      <div className="page-header">
        <div>
          <h1 className="page-title">Search Results</h1>
          <p className="page-subtitle">Showing results for "{query}"</p>
        </div>
      </div>

      {loading ? (
        <div>Searching...</div>
      ) : results.length > 0 ? (
        <div className="ticket-grid">
          {results.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3>No tickets found</h3>
          <p>We couldn't find any tickets matching "{query}". Try different keywords.</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
