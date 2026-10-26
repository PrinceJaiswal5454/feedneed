import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container page-section" style={{ maxWidth: '520px' }}>
      <div className="card card-body">
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Log In to FeedNeed</h1>
        <p style={{ color: 'var(--text-700)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
          Access your food donations, NGO campaigns, rewards, and protected pickup requests.
        </p>

        {error && (
          <div style={{ background: 'var(--danger-100)', color: 'var(--danger-600)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>

        <p style={{ marginTop: '1.2rem', fontSize: '0.88rem', textAlign: 'center' }}>
          New to FeedNeed?{' '}
          <Link to="/register" style={{ color: 'var(--green-800)', fontWeight: 700 }}>
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
