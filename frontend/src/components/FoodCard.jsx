import React from 'react';
import { Link } from 'react-router-dom';

const CATEGORY_FALLBACK_IMAGES = {
  'Cooked Meal': '/images/veg_meal.jpg',
  'Bakery & Bread': '/images/bakery_crate.jpg',
  'Event Surplus': '/images/catering_pulao.jpg',
  'Fresh Produce': '/images/produce_basket.jpg',
  'Packaged / Dry Goods': '/images/volunteer_delivery.jpg',
  'Dairy & Beverages': '/images/produce_basket.jpg',
};

export default function FoodCard({ post }) {
  const isVeg = post.dietaryType !== 'Non-Vegetarian';
  const cardImg = post.photoUrl || CATEGORY_FALLBACK_IMAGES[post.category] || '/images/veg_meal.jpg';

  return (
    <article className="card">
      <div style={{ height: '195px', overflow: 'hidden', background: 'var(--cream-100)', position: 'relative' }}>
        <img
          src={cardImg}
          alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            display: 'flex',
            gap: '0.4rem',
            flexWrap: 'wrap',
          }}
        >
          <span className={`badge ${isVeg ? 'badge-green' : 'badge-orange'}`}>
            {isVeg ? '🟢' : '🔴'} {post.dietaryType}
          </span>
          <span className="badge badge-warning">{post.category}</span>
        </div>
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          <span
            className={`badge ${
              post.status === 'Available'
                ? 'badge-green'
                : post.status === 'Completed'
                ? 'badge-orange'
                : 'badge-warning'
            }`}
          >
            {post.status}
          </span>
        </div>
      </div>

      <div className="card-body">
        <h3 style={{ fontSize: '1.12rem', fontWeight: 700, marginBottom: '0.45rem' }}>
          {post.title}
        </h3>

        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-700)',
            marginBottom: '0.9rem',
          }}
        >
          {post.description?.slice(0, 115)}
          {post.description?.length > 115 ? '...' : ''}
        </p>

        <div
          style={{
            fontSize: '0.83rem',
            color: 'var(--text-700)',
            background: 'var(--cream-50)',
            padding: '0.7rem',
            borderRadius: '8px',
            marginBottom: '1rem',
          }}
        >
          <div>
            <strong>🍱 Quantity:</strong> {post.quantity} (~{post.servingsEstimate} servings)
          </div>
          <div>
            <strong>📍 Public Area:</strong> {post.pickupArea}, {post.pickupCity}
          </div>
          <div>
            <strong>⏳ Safe Until:</strong> {new Date(post.expiresAt).toLocaleString()}
          </div>
        </div>

        <Link to={`/food/${post._id}`} className="btn btn-primary" style={{ width: '100%' }}>
          View Details & Request Pickup
        </Link>
      </div>
    </article>
  );
}
