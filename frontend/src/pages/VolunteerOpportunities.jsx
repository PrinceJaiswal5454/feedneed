import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function VolunteerOpportunities() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [preferredRole, setPreferredRole] = useState('Food Pickup & Transport');
  const [availability, setAvailability] = useState('Weekends, 4:00 PM - 8:00 PM');
  const [hasVehicle, setHasVehicle] = useState(false);
  const [experienceNote, setExperienceNote] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/campaigns?status=Active').then((data) => {
      const list = data.campaigns || [];
      setCampaigns(list);
      if (list.length > 0) setSelectedCampaignId(list[0]._id);
    });
  }, []);

  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    try {
      const res = await apiRequest('/volunteers/apply', {
        method: 'POST',
        body: {
          campaignId: selectedCampaignId,
          preferredRole,
          availability,
          hasVehicle,
          experienceNote,
        },
      });
      setFeedback(res.message);
      setExperienceNote('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container page-section">
      <div className="section-header">
        <div>
          <h1 className="section-title">Volunteer Opportunities with Verified NGOs</h1>
          <p className="section-subtitle">
            Help rescue surplus meals, sort dry rations, or distribute food packages (+50 Impact
            Points per verified shift).
          </p>
        </div>
      </div>

      {feedback && (
        <div className="card card-body" style={{ background: 'var(--green-100)', marginBottom: '1rem' }}>
          <strong>✅ {feedback}</strong>
        </div>
      )}
      {error && (
        <div className="card card-body" style={{ background: 'var(--danger-100)', marginBottom: '1rem' }}>
          <strong>⚠️ {error}</strong>
        </div>
      )}

      <div className="grid-2">
        <div>
          {campaigns.map((c) => (
            <div key={c._id} className="card card-body" style={{ marginBottom: '1rem' }}>
              <span className="badge badge-green">
                {c.ngo?.ngoDetails?.organizationName || c.ngo?.name}
              </span>
              <h3 style={{ marginTop: '0.4rem' }}>{c.title}</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-700)', margin: '0.4rem 0' }}>
                📍 {c.dropoffArea}, {c.city} | 🕒 {c.scheduleWindow}
              </p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {(c.volunteerRoles || []).map((r, i) => (
                  <span key={i} className="badge badge-orange">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card card-body">
          <h3>Submit Volunteer Application</h3>
          {!user ? (
            <p style={{ marginTop: '0.5rem' }}>Please log in to apply as a volunteer.</p>
          ) : (
            <form onSubmit={handleVolunteerSubmit} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select NGO Campaign</label>
                <select
                  className="form-select"
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                >
                  {campaigns.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Volunteer Role</label>
                <select
                  className="form-select"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                >
                  <option value="Food Pickup & Transport">Food Pickup & Transport</option>
                  <option value="Meal Sorting & Hygiene Check">Meal Sorting & Hygiene Check</option>
                  <option value="Community Distribution">Community Distribution</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Your Availability</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={hasVehicle}
                    onChange={(e) => setHasVehicle(e.target.checked)}
                  />
                  <span>I have a bicycle/two-wheeler/car for food pickup transport</span>
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">How You Can Help / Experience</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  required
                  placeholder="Share your neighborhood and any volunteering experience..."
                  value={experienceNote}
                  onChange={(e) => setExperienceNote(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Submit Volunteer Offer
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
