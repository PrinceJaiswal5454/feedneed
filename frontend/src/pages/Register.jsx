import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'individual',
    city: '',
    neighborhood: '',
    exactAddress: '',
    phone: '',
    organizationName: '',
    registrationNumber: '',
    beneficiaryFocus: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container page-section" style={{ maxWidth: '640px' }}>
      <div className="card card-body">
        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Join FeedNeed</h1>
        <p style={{ color: 'var(--text-700)', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
          Register as an Individual Neighbor/Volunteer, an NGO Partner Organization, or a Platform Admin.
        </p>

        {error && (
          <div style={{ background: 'var(--danger-100)', color: 'var(--danger-600)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Role *</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="individual">Individual User (Food Donor / Recipient / Volunteer)</option>
              <option value="ngo">NGO / Community Organization (Food Drives & Relief)</option>
              <option value="admin">Admin / Platform Moderator</option>
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name / Contact Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password (min 6 chars) *</label>
              <input
                type="password"
                minLength="6"
                className="form-input"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">🔒 Protected Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 98200 00000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g., Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Public Neighborhood / Area *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g., Bandra West"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">🔒 Protected Exact Pickup/Drop-Off Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Flat/Building number, Street, Pin Code"
              value={formData.exactAddress}
              onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
            />
          </div>

          {formData.role === 'ngo' && (
            <div style={{ background: 'var(--green-50)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
              <h4 style={{ marginBottom: '0.6rem' }}>NGO Verification Details</h4>
              <div className="form-group">
                <label className="form-label">Official Organization Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Trust / Society / NGO Registration Number *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Primary Beneficiary Communities *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g., Night shelters, school children, daily-wage families"
                  value={formData.beneficiaryFocus}
                  onChange={(e) => setFormData({ ...formData, beneficiaryFocus: e.target.value })}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Create FeedNeed Account
          </button>
        </form>

        <p style={{ marginTop: '1rem', fontSize: '0.88rem', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--green-800)', fontWeight: 700 }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
