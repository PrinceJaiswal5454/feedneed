import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function CampaignDetails() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const [pledgeForm, setPledgeForm] = useState({
    itemName: '',
    quantityPledged: 10,
    unit: 'kg',
    deliveryNote: 'Will drop off during scheduled afternoon hours.',
  });

  const loadCampaign = async () => {
    try {
      const data = await apiRequest(`/campaigns/${id}`);
      setCampaign(data.campaign);
      if (data.campaign.requiredItems?.length > 0) {
        setPledgeForm((prev) => ({
          ...prev,
          itemName: data.campaign.requiredItems[0].itemName,
          unit: data.campaign.requiredItems[0].unit,
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const handlePledge = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiRequest(`/campaigns/${id}/pledge`, {
        method: 'POST',
        body: pledgeForm,
      });
      setFeedback(res.message);
      setCampaign(res.campaign);
      await refreshUser();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container page-section">Loading campaign...</div>;
  if (!campaign) return <div className="container page-section">Campaign not found.</div>;

  return (
    <div className="container page-section">
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
        <div className="card card-body">
          <span className="badge badge-green" style={{ marginBottom: '0.6rem' }}>
            🏛️ {campaign.ngo?.ngoDetails?.organizationName || campaign.ngo?.name}
          </span>
          <h1 style={{ fontSize: '1.7rem', marginBottom: '0.65rem' }}>{campaign.title}</h1>
          <p style={{ color: 'var(--text-700)', marginBottom: '1.1rem' }}>{campaign.description}</p>

          <h4 style={{ marginBottom: '0.5rem' }}>Required Food & Supplies Checklist</h4>
          <div style={{ marginBottom: '1.25rem' }}>
            {campaign.requiredItems?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.55rem 0.75rem',
                  background: 'var(--cream-50)',
                  borderRadius: '8px',
                  marginBottom: '0.45rem',
                  fontSize: '0.9rem',
                }}
              >
                <strong>{item.itemName}</strong>
                <span>
                  {item.quantityFulfilled} / {item.quantityNeeded} {item.unit} fulfilled
                </span>
              </div>
            ))}
          </div>

          <div className="card card-body" style={{ background: 'var(--green-50)' }}>
            <h4>Protected Drop-Off & Coordinator Contact</h4>
            <p style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>
              <strong>Public Area:</strong> {campaign.dropoffArea}, {campaign.city}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Exact Drop-Off Address:</strong> {campaign.exactDropoffAddress}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Schedule Window:</strong> {campaign.scheduleWindow}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Coordinator Phone:</strong> {campaign.ngo?.phone}
            </p>
          </div>
        </div>

        <div className="card card-body">
          <h3>Pledge Food or Supplies (+35 Impact Points)</h3>
          {!user ? (
            <p style={{ marginTop: '0.6rem' }}>
              Please <Link to="/login" style={{ color: 'var(--green-800)', fontWeight: 700 }}>log in</Link> to support this drive.
            </p>
          ) : (
            <form onSubmit={handlePledge} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select Item to Contribute</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={pledgeForm.itemName}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, itemName: e.target.value })}
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    required
                    value={pledgeForm.quantityPledged}
                    onChange={(e) =>
                      setPledgeForm({ ...pledgeForm, quantityPledged: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={pledgeForm.unit}
                    onChange={(e) => setPledgeForm({ ...pledgeForm, unit: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery / Drop-Off Note</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={pledgeForm.deliveryNote}
                  onChange={(e) => setPledgeForm({ ...pledgeForm, deliveryNote: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-orange" style={{ width: '100%' }}>
                Confirm Campaign Contribution
              </button>
            </form>
          )}

          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--cream-200)' }}>
            <h4>Want to Volunteer Time Instead?</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-700)', margin: '0.4rem 0 0.85rem' }}>
              Verified volunteer shifts earn +50 Impact Points and help transport and distribute
              meals.
            </p>
            <Link to="/volunteer" className="btn btn-outline" style={{ width: '100%' }}>
              🤝 Apply as a Campaign Volunteer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
