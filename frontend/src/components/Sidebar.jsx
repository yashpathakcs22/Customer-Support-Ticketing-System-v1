import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Settings, Users, Clock, Archive } from 'lucide-react';
import './components.css';

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-menu">
        {user?.role !== 'AGENT' && (
          <NavLink to="/" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
        )}
        
        {user?.role === 'AGENT' && (
          <>
            <NavLink to="/agent/pending" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <Clock size={20} />
              <span>Pending Tickets</span>
            </NavLink>
            <NavLink to="/agent/history" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <Archive size={20} />
              <span>History</span>
            </NavLink>
          </>
        )}

        {user?.role === 'CUSTOMER' && (
          <NavLink to="/new-ticket" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <PlusCircle size={20} />
            <span>New Ticket</span>
          </NavLink>
        )}

        {user?.role === 'ADMIN' && (
          <>
            <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <LayoutDashboard size={20} />
              <span>Analytics</span>
            </NavLink>
            <NavLink to="/users" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
              <Users size={20} />
              <span>Users</span>
            </NavLink>
          </>
        )}

        <NavLink to="/settings" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
