import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient';
import FoodCard from '../components/FoodCard';
import SafetyBanner from '../components/SafetyBanner';

export default function ExploreFood() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    dietaryType: 'All',
    status: 'Available',
    city: '',
  });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category !== 'All') params.set('category', filters.category);
      if (filters.dietaryType !== 'All') params.set('dietaryType', filters.dietaryType);
      if (filters.status !== 'All') params.set('status', filters.status);
      if (filters.city) params.set('city', filters.city);

      const data = await apiRequest(`/food?${params.toString()}`);
      setPosts(data.foodPosts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters.category, filters.dietaryType, filters.status]);

  return (
    <div className="container page-section">
      <div className="section-header">
        <div>
          <h1 className="section-title">Explore Surplus Food Donations</h1>
          <p className="section-subtitle">
            Filter by category, dietary preference, availability, or neighborhood.
          </p>
        </div>
      </div>

      <SafetyBanner />

      <form
        className="card card-body"
        style={{ marginBottom: '2rem' }}
        onSubmit={(e) => {
          e.preventDefault();
          fetchPosts();
        }}
      >
        <div className="grid-4">
          <div>
            <label className="form-label">Search Food or Area</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Dal, Bread, Bandra..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="All">All Categories</option>
              <option value="Cooked Meal">Cooked Meal</option>
              <option value="Fresh Produce">Fresh Produce</option>
              <option value="Bakery & Bread">Bakery & Bread</option>
              <option value="Packaged / Dry Goods">Packaged / Dry Goods</option>
              <option value="Event Surplus">Event Surplus</option>
            </select>
          </div>
          <div>
            <label className="form-label">Dietary Type</label>
            <select
              className="form-select"
              value={filters.dietaryType}
              onChange={(e) => setFilters({ ...filters, dietaryType: e.target.value })}
            >
              <option value="All">All Dietary Types</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Jain">Jain</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>
          </div>
          <div>
            <label className="form-label">Availability Status</label>
            <select
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="Available">Available Now</option>
              <option value="Requested">Requested</option>
              <option value="Completed">Completed</option>
              <option value="All">All Statuses</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary btn-sm">
            Apply Search Filters
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() =>
              setFilters({
                search: '',
                category: 'All',
                dietaryType: 'All',
                status: 'Available',
                city: '',
              })
            }
          >
            Reset
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading food listings...</p>
      ) : posts.length === 0 ? (
        <div className="card card-body" style={{ textAlign: 'center', padding: '3rem' }}>
          <h3>No matching food listings found</h3>
          <p style={{ color: 'var(--text-700)', marginTop: '0.4rem' }}>
            Try adjusting your filters or share surplus food with your neighborhood!
          </p>
        </div>
      ) : (
        <div className="grid-3">
          {posts.map((post) => (
            <FoodCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
