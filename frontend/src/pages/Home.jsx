import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/apiClient';
import FoodCard from '../components/FoodCard';
import SafetyBanner from '../components/SafetyBanner';

export default function Home() {
  const [foodPosts, setFoodPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [foodRes, campRes, rewardRes] = await Promise.all([
          apiRequest('/food?status=Available'),
          apiRequest('/campaigns?status=Active'),
          apiRequest('/rewards/leaderboard'),
        ]);
        setFoodPosts((foodRes.foodPosts || []).slice(0, 3));
        setCampaigns((campRes.campaigns || []).slice(0, 2));
        setStats(rewardRes.platformStats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div>
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <span className="badge badge-orange" style={{ marginBottom: '1rem' }}>
              🌱 Community Food-Sharing & NGO Action Network
            </span>
            <h1
              style={{
                fontSize: '2.65rem',
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: '1.1rem',
              }}
            >
              Turn Surplus Household Meals Into Shared Community Nourishment.
            </h1>
            <p style={{ fontSize: '1.08rem', opacity: 0.92, marginBottom: '1.75rem' }}>
              FeedNeed connects neighbors who have wholesome extra food with people who need it,
              and empowers verified NGOs to run transparent food drives and volunteer rescues.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <Link to="/create-food" className="btn btn-orange">
                🍲 Share Surplus Food
              </Link>
              <Link to="/explore" className="btn btn-outline">
                🔍 Find Nearby Food
              </Link>
              <Link to="/campaigns" className="btn btn-outline">
                🏛️ Support NGO Drives
              </Link>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
            <div className="card-body">
              <h3 style={{ marginBottom: '0.85rem' }}>Live Community Impact</h3>
              <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.95rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffb27d' }}>
                    {stats ? stats.totalMealsShared : '...'}
                  </div>
                  <div style={{ fontSize: '0.82rem' }}>Meals & Rations Shared</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.95rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9ef0b8' }}>
                    {stats ? stats.availablePostsCount : '...'}
                  </div>
                  <div style={{ fontSize: '0.82rem' }}>Active Food Listings</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.95rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffb27d' }}>
                    {stats ? stats.activeCampaignsCount : '...'}
                  </div>
                  <div style={{ fontSize: '0.82rem' }}>Active NGO Campaigns</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.95rem', borderRadius: '12px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9ef0b8' }}>
                    {stats ? stats.totalVolunteerHours : '...'}h
                  </div>
                  <div style={{ fontSize: '0.82rem' }}>Verified Volunteer Hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container page-section">
        <SafetyBanner />

        <div className="section-header" style={{ marginTop: '2rem' }}>
          <div>
            <h2 className="section-title">How FeedNeed Works</h2>
            <p className="section-subtitle">
              Designed for privacy, food safety awareness, and measurable local impact.
            </p>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: '3rem' }}>
          <div className="card card-body">
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>1️⃣</div>
            <h4>Post Fresh Surplus</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-700)', marginTop: '0.35rem' }}>
              Upload a photo, enter servings, category, preparation time, and safe-consumption
              deadline (+15 pts).
            </p>
          </div>
          <div className="card card-body">
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>2️⃣</div>
            <h4>Protected Pickup Requests</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-700)', marginTop: '0.35rem' }}>
              Your exact address and phone stay masked until you approve a neighbor or NGO pickup
              request.
            </p>
          </div>
          <div className="card card-body">
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>3️⃣</div>
            <h4>Complete & Earn Rewards</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-700)', marginTop: '0.35rem' }}>
              Mark the handover complete to earn +40 impact points, unlock badges, and climb the
              leaderboard.
            </p>
          </div>
          <div className="card card-body">
            <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>4️⃣</div>
            <h4>Back NGO Drives</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-700)', marginTop: '0.35rem' }}>
              Pledge dry rations or volunteer with verified NGOs for large-scale community relief
              (+35 to +50 pts).
            </p>
          </div>
        </div>

        <div className="section-header">
          <div>
            <h2 className="section-title">Nearby Available Food Donations</h2>
            <p className="section-subtitle">
              Fresh household and event surplus ready for local pickup.
            </p>
          </div>
          <Link to="/explore" className="btn btn-outline">
            Explore All Listings →
          </Link>
        </div>

        {loading ? (
          <p>Loading available food donations...</p>
        ) : (
          <div className="grid-3" style={{ marginBottom: '3rem' }}>
            {foodPosts.map((post) => (
              <FoodCard key={post._id} post={post} />
            ))}
          </div>
        )}

        <div className="section-header">
          <div>
            <h2 className="section-title">Active NGO Donation Drives</h2>
            <p className="section-subtitle">
              Support verified community organizations with food supplies or volunteer time.
            </p>
          </div>
          <Link to="/campaigns" className="btn btn-outline">
            View All NGO Drives →
          </Link>
        </div>

        <div className="grid-2">
          {campaigns.map((camp) => (
            <div key={camp._id} className="card card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="badge badge-green">
                  🏛️ {camp.ngo?.ngoDetails?.organizationName || camp.ngo?.name}
                </span>
                <span className="badge badge-orange">
                  {camp.mealsCollected} / {camp.targetMeals} Meals Collected
                </span>
              </div>
              <h3 style={{ marginBottom: '0.4rem' }}>{camp.title}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-700)', marginBottom: '1rem' }}>
                {camp.summary}
              </p>
              <Link to={`/campaigns/${camp._id}`} className="btn btn-primary btn-sm">
                Support Drive or Volunteer
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
