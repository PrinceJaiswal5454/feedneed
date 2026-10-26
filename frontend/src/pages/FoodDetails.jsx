import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import SafetyBanner from '../components/SafetyBanner';

export default function FoodDetails() {
  const { id } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [viewerRequest, setViewerRequest] = useState(null);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const [requestForm, setRequestForm] = useState({
    requestedServings: 2,
    proposedPickupTime: 'Today within 2 hours',
    message: '',
  });

  const [reportReason, setReportReason] = useState('Expired or Unsafe Food');
  const [reportDetails, setReportDetails] = useState('');
  const [showReportBox, setShowReportBox] = useState(false);

  const loadPost = async () => {
    try {
      const data = await apiRequest(`/food/${id}`);
      setPost(data.foodPost);
      setViewerRequest(data.viewerRequest);
      setIncomingRequests(data.incomingRequests || []);
      setRequestForm((prev) => ({
        ...prev,
        requestedServings: data.foodPost.servingsEstimate || 2,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await apiRequest('/requests', {
        method: 'POST',
        body: {
          foodPostId: post._id,
          ...requestForm,
        },
      });
      setFeedback(res.message);
      await loadPost();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const res = await apiRequest(`/requests/${requestId}/status`, {
        method: 'PUT',
        body: { status },
      });
      setFeedback(res.message);
      await loadPost();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCompleteDonation = async (requestId) => {
    try {
      const res = await apiRequest(`/requests/${requestId}/complete`, {
        method: 'PUT',
        body: { completionNote: 'Handover verified safely.' },
      });
      setFeedback(res.message);
      await loadPost();
      await refreshUser();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePost = async () => {
    try {
      await apiRequest(`/food/${post._id}`, { method: 'DELETE' });
      navigate('/explore');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/admin/reports', {
        method: 'POST',
        body: {
          targetType: 'FoodPost',
          targetId: post._id,
          targetTitle: post.title,
          reason: reportReason,
          details: reportDetails,
        },
      });
      setFeedback(res.message);
      setShowReportBox(false);
      setReportDetails('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container page-section">Loading food listing...</div>;
  if (!post) return <div className="container page-section">Listing not found.</div>;

  const isOwner = user && String(post.donor?._id) === String(user._id);

  return (
    <div className="container page-section">
      <SafetyBanner />

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
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span className="badge badge-green">{post.dietaryType}</span>
            <span className="badge badge-warning">{post.category}</span>
            <span className="badge badge-orange">Status: {post.status}</span>
          </div>

          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.75rem' }}>{post.title}</h1>
          <p style={{ marginBottom: '1.25rem', color: 'var(--text-700)' }}>{post.description}</p>

          <div
            style={{
              background: 'var(--cream-50)',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.2rem',
              fontSize: '0.92rem',
            }}
          >
            <div><strong>Quantity:</strong> {post.quantity} (~{post.servingsEstimate} servings)</div>
            <div><strong>Prepared At:</strong> {new Date(post.preparedAt).toLocaleString()}</div>
            <div><strong>Safe Consumption Deadline:</strong> {new Date(post.expiresAt).toLocaleString()}</div>
            <div><strong>Storage Condition:</strong> {post.storageCondition}</div>
            <div><strong>Allergens:</strong> {post.allergens}</div>
            <div><strong>Public Area:</strong> {post.pickupArea}, {post.pickupCity}</div>
            <div style={{ marginTop: '0.45rem', color: 'var(--green-800)' }}>
              <strong>Protected Exact Pickup Address:</strong> {post.exactPickupAddress}
            </div>
            <div><strong>Pickup Instructions:</strong> {post.pickupInstructions}</div>
          </div>

          <div className="card card-body" style={{ background: 'var(--green-50)' }}>
            <h4>Donor Information & Protected Contact</h4>
            <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
              <strong>Name:</strong> {post.donor?.name} ({post.donor?.levelTitle || 'Member'})
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Phone:</strong> {post.donor?.phone}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              <strong>Email:</strong> {post.donor?.email}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            {isOwner && (
              <>
                <Link to={`/edit-food/${post._id}`} className="btn btn-outline btn-sm">
                  ✏️ Edit Listing
                </Link>
                <button type="button" onClick={handleDeletePost} className="btn btn-danger btn-sm">
                  🗑️ Delete Listing
                </button>
              </>
            )}
            {user && !isOwner && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowReportBox(!showReportBox)}
              >
                🚩 Report Listing
              </button>
            )}
          </div>

          {showReportBox && (
            <form onSubmit={handleReportSubmit} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Reason for Report</label>
                <select
                  className="form-select"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                >
                  <option value="Expired or Unsafe Food">Expired or Unsafe Food</option>
                  <option value="Misleading Information">Misleading Information</option>
                  <option value="Inappropriate Content / Spam">Inappropriate Content / Spam</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Details</label>
                <textarea
                  className="form-textarea"
                  required
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-danger btn-sm">
                Submit Report to Admin
              </button>
            </form>
          )}
        </div>

        <div>
          {!isOwner ? (
            <div className="card card-body">
              <h3>Request This Food Donation</h3>
              {!user ? (
                <p style={{ marginTop: '0.5rem' }}>
                  Please <Link to="/login" style={{ color: 'var(--green-800)', fontWeight: 700 }}>log in</Link> to request pickup.
                </p>
              ) : viewerRequest ? (
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="badge badge-orange">Your Request Status: {viewerRequest.status}</span>
                  <p style={{ marginTop: '0.6rem', fontSize: '0.9rem' }}>
                    Proposed Pickup: {viewerRequest.proposedPickupTime}
                  </p>
                  {viewerRequest.status === 'Accepted' && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ marginTop: '1rem' }}
                      onClick={() => handleCompleteDonation(viewerRequest._id)}
                    >
                      ✅ Confirm Pickup Completed
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Servings Needed</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input"
                      value={requestForm.requestedServings}
                      onChange={(e) =>
                        setRequestForm({ ...requestForm, requestedServings: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Proposed Pickup Window</label>
                    <input
                      type="text"
                      className="form-input"
                      value={requestForm.proposedPickupTime}
                      onChange={(e) =>
                        setRequestForm({ ...requestForm, proposedPickupTime: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message to Donor</label>
                    <textarea
                      className="form-textarea"
                      rows="3"
                      placeholder="Share who this food will help and how you will pick it up..."
                      value={requestForm.message}
                      onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                    Send Pickup Request
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="card card-body">
              <h3>Incoming Pickup Requests ({incomingRequests.length})</h3>
              {incomingRequests.length === 0 ? (
                <p style={{ color: 'var(--text-500)', marginTop: '0.5rem' }}>
                  No requests yet for this food post.
                </p>
              ) : (
                incomingRequests.map((reqItem) => (
                  <div
                    key={reqItem._id}
                    style={{
                      borderBottom: '1px solid var(--cream-200)',
                      padding: '0.9rem 0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{reqItem.requester?.name}</strong>
                      <span className="badge badge-orange">{reqItem.status}</span>
                    </div>
                    <p style={{ fontSize: '0.88rem', margin: '0.3rem 0' }}>{reqItem.message}</p>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-700)' }}>
                      Proposed Time: {reqItem.proposedPickupTime}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                      {reqItem.status === 'Pending' && (
                        <>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleStatusUpdate(reqItem._id, 'Accepted')}
                          >
                            Accept & Reveal Address
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => handleStatusUpdate(reqItem._id, 'Declined')}
                          >
                            Decline
                          </button>
                        </>
                      )}
                      {reqItem.status === 'Accepted' && (
                        <button
                          type="button"
                          className="btn btn-orange btn-sm"
                          onClick={() => handleCompleteDonation(reqItem._id)}
                        >
                          ✅ Mark Completed (+40 Pts)
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
