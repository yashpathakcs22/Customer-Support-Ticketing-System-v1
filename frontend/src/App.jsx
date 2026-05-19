import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import NewTicket from './pages/NewTicket';
import TicketDetails from './pages/TicketDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Users from './pages/Users';

import AgentDashboard from './pages/AgentDashboard';
import SearchResults from './pages/SearchResults';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const RoleBasedHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.role === 'AGENT') {
    return <Navigate to="/agent/pending" replace />;
  }
  return <Dashboard />;
};

function App() {
  return (
    <Router>
      <div className="app-layout">
        <Navbar />
        <div style={{ display: 'flex' }}>
          {localStorage.getItem('user') && <Sidebar />}
          <main style={{ marginLeft: localStorage.getItem('user') ? '240px' : '0', width: '100%', minHeight: 'calc(100vh - 73px)' }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><RoleBasedHome /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/agent/pending" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
              <Route path="/agent/history" element={<ProtectedRoute><AgentDashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/new-ticket" element={<ProtectedRoute><NewTicket /></ProtectedRoute>} />
              <Route path="/ticket/:id" element={<ProtectedRoute><TicketDetails /></ProtectedRoute>} />
              <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
