import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import SafetyBanner from '../components/SafetyBanner';

const FOOD_CARD_IMAGE_PRESETS = [
  { label: 'Homestyle Dal, Rice & Rotis', url: '/images/veg_meal.jpg', category: 'Cooked Meal' },
  { label: 'Bakery Loaves & Fruit Crate', url: '/images/bakery_crate.jpg', category: 'Bakery & Bread' },
  { label: 'Catered Pulao & Paneer Trays', url: '/images/catering_pulao.jpg', category: 'Event Surplus' },
  { label: 'Organic Farm Veggie Basket', url: '/images/produce_basket.jpg', category: 'Fresh Produce' },
  { label: 'Packed Meal Containers', url: '/images/volunteer_delivery.jpg', category: 'Packaged / Dry Goods' },
];

export default function CreateFoodPost() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const nowIso = new Date().toISOString().slice(0, 16);
  const sixHoursLaterIso = new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photoUrl: '/images/veg_meal.jpg',
    category: 'Cooked Meal',
    dietaryType: 'Vegetarian',
    quantity: '',
    servingsEstimate: 4,
    preparedAt: nowIso,
    expiresAt: sixHoursLaterIso,
    storageCondition: 'Refrigerated',
    allergens: 'None specified',
    pickupCity: user?.city || 'Mumbai',
    pickupArea: user?.neighborhood || '',
    exactPickupAddress: user?.exactAddress || '',
    pickupInstructions: 'Please bring clean reusable containers.',
    contactPreference: 'approval_only',
    donorPhoneConsent: false,
    safetyDeclarationAccepted: false,
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      apiRequest(`/food/${id}`).then((data) => {
        const p = data.foodPost;
        setFormData({
          title: p.title || '',
          description: p.description || '',
          photoUrl: p.photoUrl || '/images/veg_meal.jpg',
          category: p.category || 'Cooked Meal',
          dietaryType: p.dietaryType || 'Vegetarian',
          quantity: p.quantity || '',
          servingsEstimate: p.servingsEstimate || 4,
          preparedAt: p.preparedAt ? new Date(p.preparedAt).toISOString().slice(0, 16) : nowIso,
          expiresAt: p.expiresAt ? new Date(p.expiresAt).toISOString().slice(0, 16) : sixHoursLaterIso,
          storageCondition: p.storageCondition || 'Refrigerated',
          allergens: p.allergens || '',
          pickupCity: p.pickupCity || '',
          pickupArea: p.pickupArea || '',
          exactPickupAddress: p.exactPickupAddress || '',
          pickupInstructions: p.pickupInstructions || '',
          contactPreference: p.contactPreference || 'approval_only',
          donorPhoneConsent: Boolean(p.donorPhoneConsent),
          safetyDeclarationAccepted: true,
        });
      });
    }
  }, [id, isEditMode]);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, photoUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const endpoint = isEditMode ? `/food/${id}` : '/food';
      const method = isEditMode ? 'PUT' : 'POST';
      const res = await apiRequest(endpoint, {
        method,
        body: formData,
      });
      await refreshUser();
      navigate(`/food/${res.foodPost._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container page-section">
      <div className="section-header">
        <div>
          <h1 className="section-title">
            {isEditMode ? 'Edit Food Donation Listing & Card Photo' : 'Share Surplus Household or Event Food'}
          </h1>
          <p className="section-subtitle">
            Upload a photo or select a food card image below. Earn +15 Impact Points when you post
            fresh surplus food and +40 Points when pickup is completed.
          </p>
        </div>
      </div>

      <SafetyBanner />

      {error && (
        <div className="card card-body" style={{ background: 'var(--danger-100)', marginBottom: '1rem' }}>
          <strong>⚠️ {error}</strong>
        </div>
      )}

      <form className="card card-body" onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Food Name / Listing Title *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g., Freshly Cooked Veg Pulao & Dal (6 Meal Boxes)"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => {
                const cat = e.target.value;
                const match = FOOD_CARD_IMAGE_PRESETS.find((p) => p.category === cat);
                setFormData({
                  ...formData,
                  category: cat,
                  photoUrl: match ? match.url : formData.photoUrl,
                });
              }}
            >
              <option value="Cooked Meal">Cooked Meal</option>
              <option value="Fresh Produce">Fresh Produce</option>
              <option value="Bakery & Bread">Bakery & Bread</option>
              <option value="Packaged / Dry Goods">Packaged / Dry Goods</option>
              <option value="Dairy & Beverages">Dairy & Beverages</option>
              <option value="Event Surplus">Event Surplus</option>
            </select>
          </div>
        </div>

        {/* Food Card Photo Upload, URL & Preset Gallery */}
        <div
          style={{
            background: 'var(--cream-50)',
            border: '1px solid var(--cream-200)',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.2rem',
          }}
        >
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <label className="form-label">📸 Upload Food Card Photo (JPG/PNG/WEBP)</label>
              <input
                type="file"
                accept="image/*"
                className="form-input"
                onChange={handleFileChange}
              />
              <label className="form-label" style={{ marginTop: '0.6rem' }}>
                Or Paste Image URL
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="/images/veg_meal.jpg or https://..."
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              />
              <div style={{ marginTop: '0.65rem' }}>
                <span className="form-label">Or Quick-Select a Preset Food Card Image:</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                  {FOOD_CARD_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{
                        borderColor:
                          formData.photoUrl === preset.url ? 'var(--orange-500)' : undefined,
                      }}
                      onClick={() => setFormData({ ...formData, photoUrl: preset.url })}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <span className="form-label">Live Card Image Preview:</span>
              <div className="card" style={{ maxWidth: '320px', overflow: 'hidden' }}>
                <img
                  src={formData.photoUrl || '/images/veg_meal.jpg'}
                  alt="Food Card Preview"
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Vegetarian / Non-Veg Status *</label>
            <select
              className="form-select"
              value={formData.dietaryType}
              onChange={(e) => setFormData({ ...formData, dietaryType: e.target.value })}
            >
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Jain">Jain</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Quantity Description *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g., 6 containers (~2.5 kg)"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Estimated Servings *</label>
            <input
              type="number"
              min="1"
              className="form-input"
              required
              value={formData.servingsEstimate}
              onChange={(e) => setFormData({ ...formData, servingsEstimate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Preparation / Packing Time *</label>
            <input
              type="datetime-local"
              className="form-input"
              required
              value={formData.preparedAt}
              onChange={(e) => setFormData({ ...formData, preparedAt: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Safe-Consumption Deadline (Expiry) *</label>
            <input
              type="datetime-local"
              className="form-input"
              required
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Storage Condition *</label>
            <select
              className="form-select"
              value={formData.storageCondition}
              onChange={(e) => setFormData({ ...formData, storageCondition: e.target.value })}
            >
              <option value="Refrigerated">Refrigerated</option>
              <option value="Hot / Insulated">Hot / Insulated</option>
              <option value="Room Temperature (Dry)">Room Temperature (Dry)</option>
              <option value="Frozen">Frozen</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Description & Packaging Details *</label>
          <textarea
            className="form-textarea"
            rows="3"
            required
            placeholder="Describe ingredients, freshness, and how it is packed..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Pickup City *</label>
            <input
              type="text"
              className="form-input"
              required
              value={formData.pickupCity}
              onChange={(e) => setFormData({ ...formData, pickupCity: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Public Neighborhood / Landmark *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g., Bandra West (Near Hill Road)"
              value={formData.pickupArea}
              onChange={(e) => setFormData({ ...formData, pickupArea: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Preference *</label>
            <select
              className="form-select"
              value={formData.contactPreference}
              onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value })}
            >
              <option value="approval_only">Reveal Phone & Address Only After I Accept Request</option>
              <option value="immediate_consent">Allow Immediate Phone Visibility</option>
              <option value="in_app_only">In-App Coordination Only</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            🔒 Protected Exact Pickup Address (Hidden from public until you accept a request) *
          </label>
          <input
            type="text"
            className="form-input"
            required
            placeholder="Flat/Building number, Street, Pin Code"
            value={formData.exactPickupAddress}
            onChange={(e) => setFormData({ ...formData, exactPickupAddress: e.target.value })}
          />
        </div>

        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontWeight: 600 }}>
            <input
              type="checkbox"
              required
              checked={formData.safetyDeclarationAccepted}
              onChange={(e) =>
                setFormData({ ...formData, safetyDeclarationAccepted: e.target.checked })
              }
            />
            <span>
              I confirm this food is freshly prepared/packed, hygienically stored, not expired, and
              safe for human consumption.
            </span>
          </label>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Publish Food Listing'}
        </button>
      </form>
    </div>
  );
}
