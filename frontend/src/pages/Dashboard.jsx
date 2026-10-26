import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/apiClient';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [volData, setVolData] = useState({ myApplications: [], ngoIncomingApplications: [] });
  const [adminData, setAdminData] = useState(null);
  const [feedback, setFeedback] = useState('');

  // NGO Campaign creation state
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    summary: '',
    description: '',
    beneficiaryGroup: 'Daily-Wage Families',
    targetMeals: 200,
    city: user?.city || 'Mumbai',
    dropoffArea: user?.neighborhood || '',
    exactDropoffAddress: user?.exactAddress || '',
    scheduleWindow: 'Daily 10:00 AM - 7:00 PM',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  });

  const loadDashboard = async () => {
    if (!user) return;
    const [reqRes, volRes] = await Promise.all([
      apiRequest('/requests/my'),
      apiRequest('/volunteers/my'),
    ]);
    setIncomingRequests(reqRes.incomingRequests || []);
    setOutgoingRequests(reqRes.outgoingRequests || []);
    setVolData(volRes);

    if (user.role === 'admin') {
      const adm = await apiRequest('/admin/overview');
      setAdminData(adm);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const handleRequestAction = async (id, status) => {
    const res = await apiRequest(`/requests/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
    setFeedback(res.message);
    await loadDashboard();
  };

  const handleCompleteDonation = async (id) => {
    const res = await apiRequest(`/requests/${id}/complete`, {
      method: 'PUT',
      body: { completionNote: 'Completed from dashboard.' },
    });
    setFeedback(res.message);
    await loadDashboard();
    await refreshUser();
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    const res = await apiRequest('/campaigns', {
      method: 'POST',
      body: {
        ...campaignForm,
        requiredItems: [
          { itemName: 'Rice & Flour (Atta)', quantityNeeded: 100, unit: 'kg' },
          { itemName: 'Cooked Vegetarian Meal Boxes', quantityNeeded: 100, unit: 'boxes' },
        ],
      },
    });
    setFeedback(res.message);
    setShowNewCampaign(false);
    await loadDashboard();
  };

  const handleVolunteerAction = async (appId, status) => {
    const res = await apiRequest(`/volunteers/${appId}/status`, {
      method: 'PUT',
      body: { status, hoursContributed: 4 },
    });
    setFeedback(res.message);
    await loadDashboard();
  };

  const handleVerifyNgo = async (ngoId, status) => {
    const res = await apiRequest(`/admin/ngos/${ngoId}/verify`, {
      method: 'PUT',
      body: { status },
    });
    setFeedback(res.message);
    await loadDashboard();
  };

  const handleResolveReport = async (reportId, flagTargetPost) => {
    const res = await apiRequest(`/admin/reports/${reportId}`, {
      method: 'PUT',
      body: { status: 'Resolved', flagTargetPost },
    });
    setFeedback(res.message);
    await loadDashboard();
  };

  if (!user) return <div className="container page-section">Please log in to view your dashboard.</div>;

  return (
    <div className="container page-section">
      <div className="section-header">
        <div>
          <span className="badge badge-green" style={{ textTransform: 'uppercase' }}>
            {user.role} Account Dashboard
          </span>
          <h1 className="section-title" style={{ marginTop: '0.35rem' }}>
            Welcome back, {user.name}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <Link to="/create-food" className="btn btn-primary btn-sm">
            + Share Surplus Food
          </Link>
          {user.role === 'ngo' && (
            <button
              type="button"
              className="btn btn-orange btn-sm"
              onClick={() => setShowNewCampaign(!showNewCampaign)}
            >
              + Launch NGO Drive
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="card card-body" style={{ background: 'var(--green-100)', marginBottom: '1.25rem' }}>
          <strong>✅ {feedback}</strong>
        </div>
      )}

      {showNewCampaign && (
        <form className="card card-body" style={{ marginBottom: '2rem' }} onSubmit={handleCreateCampaign}>
          <h3>Publish New NGO Donation Drive</h3>
          <div className="grid-2" style={{ marginTop: '0.8rem' }}>
            <div className="form-group">
              <label className="form-label">Campaign Title *</label>
              <input
                type="text"
                className="form-input"
                required
                value={campaignForm.title}
                onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Beneficiary Group *</label>
              <input
                type="text"
                className="form-input"
                required
                value={campaignForm.beneficiaryGroup}
                onChange={(e) =>
                  setCampaignForm({ ...campaignForm, beneficiaryGroup: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Short Summary *</label>
            <input
              type="text"
              className="form-input"
              required
              value={campaignForm.summary}
              onChange={(e) => setCampaignForm({ ...campaignForm, summary: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              rows="2"
              required
              value={campaignForm.description}
              onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
            />
          </div>
          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Target Meals / Rations *</label>
              <input
                type="number"
                className="form-input"
                required
                value={campaignForm.targetMeals}
                onChange={(e) => setCampaignForm({ ...campaignForm, targetMeals: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Drop-Off Area *</label>
              <input
                type="text"
                className="form-input"
                required
                value={campaignForm.dropoffArea}
                onChange={(e) => setCampaignForm({ ...campaignForm, dropoffArea: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Exact Protected Drop-Off Address *</label>
              <input
                type="text"
                className="form-input"
                required
                value={campaignForm.exactDropoffAddress}
                onChange={(e) =>
                  setCampaignForm({ ...campaignForm, exactDropoffAddress: e.target.value })
                }
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">
            Publish Campaign
          </button>
        </form>
      )}

      {/* Incoming & Outgoing Donation Requests */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card card-body">
          <h3>Incoming Requests for Your Food Listings ({incomingRequests.length})</h3>
          {incomingRequests.length === 0 ? (
            <p style={{ color: 'var(--text-500)', marginTop: '0.5rem' }}>
              No incoming requests yet.
            </p>
          ) : (
            incomingRequests.map((req) => (
              <div key={req._id} style={{ padding: '0.85rem 0', borderBottom: '1px solid var(--cream-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{req.foodPost?.title}</strong>
                  <span className="badge badge-orange">{req.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Requester: <strong>{req.requester?.name}</strong> ({req.proposedPickupTime})
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-700)' }}>{req.message}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {req.status === 'Pending' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRequestAction(req._id, 'Accepted')}
                      >
                        Accept & Share Address
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRequestAction(req._id, 'Declined')}
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {req.status === 'Accepted' && (
                    <button
                      type="button"
                      className="btn btn-orange btn-sm"
                      onClick={() => handleCompleteDonation(req._id)}
                    >
                      ✅ Mark Completed (+40 Pts)
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card card-body">
          <h3>Your Outgoing Food Pickup Requests ({outgoingRequests.length})</h3>
          {outgoingRequests.length === 0 ? (
            <p style={{ color: 'var(--text-500)', marginTop: '0.5rem' }}>
              You have not requested any food listings yet.
            </p>
          ) : (
            outgoingRequests.map((req) => (
              <div key={req._id} style={{ padding: '0.85rem 0', borderBottom: '1px solid var(--cream-200)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{req.foodPost?.title}</strong>
                  <span className="badge badge-green">{req.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  <strong>Pickup Address:</strong> {req.foodPost?.exactPickupAddress}
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  <strong>Donor Phone:</strong> {req.donor?.phone}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* NGO Volunteer Management */}
      {(user.role === 'ngo' || user.role === 'admin') && (
        <div className="card card-body" style={{ marginBottom: '2rem' }}>
          <h3>Volunteer Applications for NGO Campaigns ({volData.ngoIncomingApplications.length})</h3>
          {volData.ngoIncomingApplications.map((app) => (
            <div key={app._id} style={{ padding: '0.85rem 0', borderBottom: '1px solid var(--cream-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <strong>{app.volunteer?.name}</strong> applied for <em>{app.preferredRole}</em> on{' '}
                <strong>{app.campaign?.title}</strong>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-700)' }}>
                  Availability: {app.availability} | Note: {app.experienceNote}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-orange">{app.status}</span>
                {app.status === 'Pending' && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleVolunteerAction(app._id, 'Accepted')}
                  >
                    Accept Volunteer
                  </button>
                )}
                {app.status === 'Accepted' && (
                  <button
                    type="button"
                    className="btn btn-orange btn-sm"
                    onClick={() => handleVolunteerAction(app._id, 'Completed')}
                  >
                    Verify Completed Shift (+50 Pts)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Moderation Panel */}
      {user.role === 'admin' && adminData && (
        <div className="card card-body">
          <h2>🛡️ Admin Trust, Safety & Moderation Center</h2>
          <div className="grid-2" style={{ marginTop: '1.25rem' }}>
            <div>
              <h4>NGO Verification Queue</h4>
              {adminData.users
                .filter((u) => u.role === 'ngo')
                .map((ngo) => (
                  <div key={ngo._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--cream-200)' }}>
                    <strong>{ngo.ngoDetails?.organizationName || ngo.name}</strong> (Reg:{' '}
                    {ngo.ngoDetails?.registrationNumber})
                    <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className="badge badge-warning">
                        Status: {ngo.ngoDetails?.verificationStatus}
                      </span>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => handleVerifyNgo(ngo._id, 'verified')}
                      >
                        ✅ Approve Verified Badge
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleVerifyNgo(ngo._id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div>
              <h4>Safety & Moderation Reports ({adminData.reports.length})</h4>
              {adminData.reports.map((rep) => (
                <div key={rep._id} style={{ padding: '0.75rem 0', borderBottom: '1px solid var(--cream-200)' }}>
                  <div>
                    <strong>{rep.reason}</strong> on <em>{rep.targetTitle}</em> ({rep.status})
                  </div>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-700)' }}>{rep.details}</p>
                  {rep.status === 'Open' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleResolveReport(rep._id, true)}
                      >
                        Flag Post & Resolve
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleResolveReport(rep._id, false)}
                      >
                        Dismiss Report
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
