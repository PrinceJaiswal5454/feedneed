import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, unreadCount, notifications, markAllNotificationsRead, logout } = useAuth();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand-logo">
          <span className="brand-badge">🌱</span>
          <span>
            Feed<span style={{ color: 'var(--orange-500)' }}>Need</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Main Navigation">
          <NavLink to="/" end className="nav-link">
            Home
          </NavLink>
          <NavLink to="/explore" className="nav-link">
            Explore Food
          </NavLink>
          <NavLink to="/create-food" className="nav-link">
            + Share Food
          </NavLink>
          <NavLink to="/campaigns" className="nav-link">
            NGO Campaigns
          </NavLink>
          <NavLink to="/volunteer" className="nav-link">
            Volunteer
          </NavLink>
          <NavLink to="/rewards" className="nav-link">
            Rewards
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className="nav-link">
              Dashboard
            </NavLink>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {user ? (
            <>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setShowNotifDropdown((prev) => !prev);
                    if (unreadCount > 0) markAllNotificationsRead();
                  }}
                >
                  🔔 {unreadCount > 0 && <span className="badge badge-orange">{unreadCount}</span>}
                </button>
                {showNotifDropdown && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '44px',
                      width: '320px',
                      maxHeight: '360px',
                      overflowY: 'auto',
                      zIndex: 200,
                      padding: '0.85rem',
                    }}
                  >
                    <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
                      Recent Notifications
                    </strong>
                    {notifications.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-500)' }}>
                        No notifications yet.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          style={{
                            padding: '0.55rem 0',
                            borderBottom: '1px solid var(--cream-200)',
                            fontSize: '0.83rem',
                          }}
                        >
                          <div style={{ fontWeight: 700, color: 'var(--green-800)' }}>
                            {n.title}
                          </div>
                          <div>{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <Link to="/profile" className="btn btn-outline btn-sm">
                👤 {user.name.split(' ')[0]} ({user.points} pts)
              </Link>
              <button type="button" onClick={handleLogout} className="btn btn-sm btn-danger">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-orange btn-sm">
                Join FeedNeed
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
