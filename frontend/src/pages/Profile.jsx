import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/apiClient';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    city: user?.city || '',
    neighborhood: user?.neighborhood || '',
    exactAddress: user?.exactAddress || '',
    phone: user?.phone || '',
    contactPreference: user?.contactPreference || 'approval_only',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        city: user.city || '',
        neighborhood: user.neighborhood || '',
        exactAddress: user.exactAddress || '',
        phone: user.phone || '',
        contactPreference: user.contactPreference || 'approval_only',
      });
      apiRequest('/rewards/my-transactions').then((res) =>
        setTransactions(res.transactions || [])
      );
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: formData,
    });
    setFeedback(res.message);
    await refreshUser();
  };

  if (!user) return <div className="container page-section">Please log in to view your profile.</div>;

  return (
    <div className="container page-section">
      {feedback && (
        <div className="card card-body" style={{ background: 'var(--green-100)', marginBottom: '1rem' }}>
          <strong>✅ {feedback}</strong>
        </div>
      )}

      <div className="grid-2">
        <div className="card card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{user.name}</h2>
            <span className="badge badge-orange">
              Level {user.level}: {user.levelTitle} ({user.points} pts)
            </span>
          </div>
          <p style={{ color: 'var(--text-700)', margin: '0.5rem 0 1.2rem' }}>{user.bio}</p>

          <h4>Your Impact Statistics</h4>
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '0.75rem 0 1.5rem' }}>
            <div style={{ background: 'var(--cream-50)', padding: '0.8rem', borderRadius: '10px' }}>
              <strong>{user.impactStats?.postsCreated || 0}</strong> Food Posts Shared
            </div>
            <div style={{ background: 'var(--cream-50)', padding: '0.8rem', borderRadius: '10px' }}>
              <strong>{user.impactStats?.donationsCompleted || 0}</strong> Completed Donations
            </div>
            <div style={{ background: 'var(--cream-50)', padding: '0.8rem', borderRadius: '10px' }}>
              <strong>{user.impactStats?.mealsSharedEstimate || 0}</strong> Estimated Meals Shared
            </div>
            <div style={{ background: 'var(--cream-50)', padding: '0.8rem', borderRadius: '10px' }}>
              <strong>{user.impactStats?.volunteerHours || 0} hrs</strong> Volunteer Service
            </div>
          </div>

          <h4>Earned Badges ({user.badges?.length || 0})</h4>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.6rem 0 1.5rem' }}>
            {user.badges?.map((b, i) => (
              <span key={i} className="badge badge-green">
                {b.icon} {b.name}
              </span>
            ))}
          </div>

          <h4>Reward Activity Ledger</h4>
          {transactions.map((tx) => (
            <div
              key={tx._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.55rem 0',
                borderBottom: '1px solid var(--cream-200)',
                fontSize: '0.85rem',
              }}
            >
              <span>{tx.description}</span>
              <strong style={{ color: 'var(--green-800)' }}>+{tx.pointsAwarded} pts</strong>
            </div>
          ))}
        </div>

        <form className="card card-body" onSubmit={handleSave}>
          <h3>Edit Profile & Privacy Preferences</h3>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Full Name / Organization Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-textarea"
              rows="2"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Public Neighborhood</label>
              <input
                type="text"
                className="form-input"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">🔒 Protected Exact Address</label>
            <input
              type="text"
              className="form-input"
              value={formData.exactAddress}
              onChange={(e) => setFormData({ ...formData, exactAddress: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">🔒 Protected Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Default Contact Privacy Rule</label>
            <select
              className="form-select"
              value={formData.contactPreference}
              onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value })}
            >
              <option value="approval_only">Reveal Phone & Address Only After Approval</option>
              <option value="in_app_only">In-App Messages Only</option>
              <option value="public_to_verified">Visible to Verified NGOs</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Save Profile & Privacy Settings
          </button>
        </form>
      </div>
    </div>
  );
}
