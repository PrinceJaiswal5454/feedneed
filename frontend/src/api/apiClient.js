/**
 * FeedNeed Centralized REST API Client
 * Automatically attaches JWT Bearer token from localStorage and parses JSON responses.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function apiRequest(endpoint, { method = 'GET', body = null, isFormData = false } = {}) {
  const token = localStorage.getItem('feedneed_token');
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : null,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong while communicating with the server.');
  }

  return data;
}
