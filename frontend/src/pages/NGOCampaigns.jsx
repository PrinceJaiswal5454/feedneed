import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/apiClient';

export default function NGOCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (city !== 'All') params.set('city', city);
      const data = await apiRequest(`/campaigns?${params.toString()}`);
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [city]);

  return (
    <div className="container page-section">
      <div className="section-header">
        <div>
          <h1 className="section-title">NGO Food Drives & Community Campaigns</h1>
          <p className="section-subtitle">
            Browse verified NGO campaigns, donate required food quantities & supplies, or join as a
            volunteer.
          </p>
        </div>
      </div>

      <form
        className="card card-body"
        style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
        onSubmit={(e) => {
          e.preventDefault();
          loadCampaigns();
        }}
      >
        <input
          type="text"
          className="form-input"
          style={{ flex: 1, minWidth: '240px' }}
          placeholder="Search campaigns by title, beneficiary group, or area..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="form-select" style={{ width: '200px' }} value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="All">All Cities</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Pune">Pune</option>
        </select>
        <button type="submit" className="btn btn-primary">
          Search Campaigns
        </button>
      </form>

      {loading ? (
        <p>Loading NGO campaigns...</p>
      ) : (
        <div className="grid-2">
          {campaigns.map((c) => {
            const pct = Math.min(100, Math.round((c.mealsCollected / c.targetMeals) * 100));
            const isVerified = c.ngo?.ngoDetails?.verificationStatus === 'verified';
            return (
              <article key={c._id} className="card">
                <div style={{ height: '195px', overflow: 'hidden', background: 'var(--cream-100)' }}>
                  <img
                    src={c.bannerUrl || '/images/ngo_drive.jpg'}
                    alt={c.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span className={`badge ${isVerified ? 'badge-green' : 'badge-warning'}`}>
                    {isVerified ? '✅ Verified NGO' : '⏳ Pending Verification'}:{' '}
                    {c.ngo?.ngoDetails?.organizationName || c.ngo?.name}
                  </span>
                  <span className="badge badge-orange">{c.city}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-700)', marginBottom: '0.9rem' }}>
                  {c.summary}
                </p>
                <div style={{ marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', fontWeight: 700 }}>
                    <span>Progress: {c.mealsCollected} / {c.targetMeals} Meals & Rations</span>
                    <span>{pct}%</span>
                  </div>
                  <div style={{ height: '10px', background: 'var(--cream-200)', borderRadius: '999px', overflow: 'hidden', marginTop: '0.35rem' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: 'var(--green-700)' }} />
                  </div>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-700)', marginBottom: '1rem' }}>
                  <div><strong>Beneficiaries:</strong> {c.beneficiaryGroup}</div>
                  <div><strong>Schedule:</strong> {c.scheduleWindow}</div>
                  <div><strong>Volunteers:</strong> {c.volunteersAccepted} / {c.volunteersNeeded} joined</div>
                </div>
                <Link to={`/campaigns/${c._id}`} className="btn btn-primary" style={{ width: '100%' }}>
                  View Required Supplies & Support Drive
                </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
