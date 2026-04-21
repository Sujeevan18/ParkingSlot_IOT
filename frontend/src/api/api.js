/**
 * API client module for handling all backend requests
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * GET request
 */
export const get = (endpoint) => apiCall(endpoint, { method: 'GET' });

/**
 * POST request
 */
export const post = (endpoint, data) =>
  apiCall(endpoint, { method: 'POST', body: JSON.stringify(data) });

/**
 * PUT request
 */
export const put = (endpoint, data) =>
  apiCall(endpoint, { method: 'PUT', body: JSON.stringify(data) });

/**
 * DELETE request
 */
export const deleteRequest = (endpoint) =>
  apiCall(endpoint, { method: 'DELETE' });

export default apiCall;
