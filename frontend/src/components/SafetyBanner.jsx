import React from 'react';

export default function SafetyBanner() {
  return (
    <aside className="safety-banner" role="note" aria-label="Food Safety Disclaimer">
      <div style={{ fontSize: '1.5rem', lineHeight: 1 }}>⚠️</div>
      <div>
        <strong style={{ color: '#9a3f07', display: 'block', marginBottom: '0.2rem' }}>
          Community Food-Safety Notice & Disclaimer
        </strong>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-700)' }}>
          Donors must provide accurate preparation times, allergen details, and storage conditions.{' '}
          <strong>Expired, spoiled, or unhygienically stored food must never be listed.</strong>{' '}
          FeedNeed is a community connection platform and does not inspect or guarantee food safety—recipients
          should verify freshness, smell, and temperature upon pickup.
        </p>
      </div>
    </aside>
  );
}
