const API_BASE_URL = 'http://localhost:5000/api/v1';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

export const foodApi = {
  // Get featured foods
  getFeaturedFoods: async () => {
    const response = await fetch(`${API_BASE_URL}/foods/featured`);
    return handleResponse(response);
  },

  // Get all foods with optional filters
  getFoods: async ({ page = 1, limit = 10, search = '', cuisine = '' } = {}) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(search && { search }),
      ...(cuisine && { cuisine }),
    });
    const response = await fetch(`${API_BASE_URL}/foods?${queryParams}`);
    return handleResponse(response);
  },

  // Get food by ID
  getFoodById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/foods/${id}`);
    return handleResponse(response);
  },

  // Get available cuisines
  getCuisines: async () => {
    const response = await fetch(`${API_BASE_URL}/foods/cuisines`);
    return handleResponse(response);
  },

  // Submit a review
  submitReview: async (foodId, reviewData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/foods/${foodId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });
    return handleResponse(response);
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },
}; 