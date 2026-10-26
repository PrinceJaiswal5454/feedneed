import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--green-900)',
        color: '#e5f2ea',
        padding: '3rem 0 2rem',
        marginTop: '3rem',
      }}
    >
      <div className="container">
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div>
            <h3 style={{ color: '#fff', marginBottom: '0.6rem' }}>🌱 FeedNeed</h3>
            <p style={{ fontSize: '0.88rem', opacity: 0.85 }}>
              Connecting households with surplus food to neighbors in need and empowering verified
              NGOs with volunteers and donors.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '0.6rem' }}>Explore</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem' }}>
              <Link to="/explore">Browse Surplus Food</Link>
              <Link to="/create-food">Share Surplus Food</Link>
              <Link to="/campaigns">NGO Donation Drives</Link>
              <Link to="/volunteer">Volunteer Opportunities</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '0.6rem' }}>Community & Trust</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.88rem' }}>
              <Link to="/rewards">Impact Points & Badges</Link>
              <Link to="/dashboard">Role-Based Dashboard</Link>
              <Link to="/profile">Privacy & Contact Controls</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#fff', marginBottom: '0.6rem' }}>Food Safety & Privacy</h4>
            <p style={{ fontSize: '0.82rem', opacity: 0.85 }}>
              Phone numbers and exact pickup addresses remain protected until a donor consents or
              accepts a request. Never list expired or unsafe food.
            </p>
          </div>
        </div>
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.14)',
            paddingTop: '1.2rem',
            fontSize: '0.82rem',
            textAlign: 'center',
            opacity: 0.8,
          }}
        >
          © {new Date().getFullYear()} FeedNeed Social Food-Sharing Platform. Built with the MERN
          Stack (MongoDB, Express, React, Node.js).
        </div>
      </div>
    </footer>
  );
}
