import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient';

export default function Rewards() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/rewards/leaderboard')
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container page-section">Loading rewards & leaderboard...</div>;

  return (
    <div className="container page-section">
      <div className="section-header">
        <div>
          <h1 className="section-title">Impact Rewards, Badges & Community Leaderboard</h1>
          <p className="section-subtitle">
            Earn verified points for sharing food, completing pickups, volunteering, and backing
            NGO campaigns. Duplicate rewards for the same activity are strictly prevented.
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
        <div className="card card-body">
          <span className="badge badge-green">+15 Points</span>
          <h4 style={{ marginTop: '0.5rem' }}>Valid Food Post</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-700)' }}>
            Awarded once per valid surplus food listing with complete safety metadata.
          </p>
        </div>
        <div className="card card-body">
          <span className="badge badge-orange">+40 Points</span>
          <h4 style={{ marginTop: '0.5rem' }}>Completed Donation</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-700)' }}>
            Awarded when a food pickup handover is verified as completed.
          </p>
        </div>
        <div className="card card-body">
          <span className="badge badge-green">+50 Points</span>
          <h4 style={{ marginTop: '0.5rem' }}>Verified Volunteer Shift</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-700)' }}>
            Awarded when an NGO confirms your completed volunteer contribution.
          </p>
        </div>
        <div className="card card-body">
          <span className="badge badge-orange">+35 Points</span>
          <h4 style={{ marginTop: '0.5rem' }}>Campaign Support</h4>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-700)' }}>
            Awarded when you contribute required rations or meals to an NGO drive.
          </p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card card-body">
          <h3 style={{ marginBottom: '1rem' }}>🏆 Top Community Contributors</h3>
          {data?.leaderboard?.map((member, index) => (
            <div
              key={member._id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--cream-200)',
              }}
            >
              <div>
                <strong>
                  #{index + 1} {member.name}
                </strong>{' '}
                <span className="badge badge-green">{member.levelTitle}</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-500)' }}>
                  {member.city} • {member.impactStats?.mealsSharedEstimate || 0} meals shared
                </div>
              </div>
              <div style={{ fontWeight: 800, color: 'var(--orange-600)', fontSize: '1.05rem' }}>
                {member.points} pts
              </div>
            </div>
          ))}
        </div>

        <div className="card card-body">
          <h3 style={{ marginBottom: '1rem' }}>🎖️ Achievable Community Badges</h3>
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {data?.badgesCatalog?.map((b) => (
              <div
                key={b.code}
                style={{
                  background: 'var(--cream-50)',
                  padding: '0.85rem',
                  borderRadius: '10px',
                }}
              >
                <div style={{ fontSize: '1.5rem' }}>{b.icon}</div>
                <strong style={{ fontSize: '0.92rem' }}>{b.name}</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-700)', marginTop: '0.25rem' }}>
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
