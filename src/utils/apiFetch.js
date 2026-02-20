// client/src/utils/apiFetch.js

// 1. Define the Base URL from Vite environment variables.
// In development, this might be empty (to use proxy) or http://localhost:5000
// In production (Vercel), this will be your Render URL.
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Custom fetch wrapper that automatically injects the auth token,
 * prepends the Base URL, and handles 401 Unauthorized responses globally.
 */
export const apiFetch = async (endpoint, options = {}) => {
  // 2. Get the token from localStorage
  const token = localStorage.getItem('token');

  // 3. Setup default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers, // Allow overriding headers if necessary
  };

  // 4. Inject the Authorization header if a token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 5. Construct the full URL
  const url = `${BASE_URL}${endpoint}`;

  // 6. Execute the actual fetch request
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 7. Global error handling for expired/invalid tokens
  if (response.status === 401) {
    console.warn("Unauthorized request. Token might be expired.");
    
    // Clear the invalid session
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page
    // Note: window.location.href causes a full page reload, 
    // which safely clears all React state.
    window.location.href = '/login'; 
  }

  return response;
};