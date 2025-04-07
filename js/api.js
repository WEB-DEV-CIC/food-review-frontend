const API_BASE_URL = 'http://localhost:5000/api/v1';

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    try {
        const data = await response.json();
        return data;
    } catch (error) {
        throw new Error('Invalid JSON response from server');
    }
};

// Auth API
const authApi = {
    login: async (email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(response);
    },

    register: async (name, email, password) => {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        });
        return handleResponse(response);
    },

    logout: async () => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return handleResponse(response);
    },
};

// Food API
const foodApi = {
    getAll: async (params = {}) => {
        try {
            console.log('Food API: getAll called with params:', params);
            const queryString = new URLSearchParams({
                page: params.page || 1,
                limit: params.limit || 10,
                ...params
            }).toString();
            console.log('Food API: Request URL:', `${API_BASE_URL}/foods?${queryString}`);
            const response = await fetch(`${API_BASE_URL}/foods?${queryString}`);
            const data = await handleResponse(response);
            console.log('Food API: Response data:', data);
            if (!data || !data.foods) {
                throw new Error('Invalid response format: missing foods array');
            }
            return data;
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/foods/${id}`);
            const data = await handleResponse(response);
            if (!data) {
                throw new Error('Food not found');
            }
            return data;
        } catch (error) {
            console.error('Error in getById:', error);
            throw error;
        }
    },

    getReviews: async (foodId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/foods/${foodId}/reviews`);
            return handleResponse(response);
        } catch (error) {
            console.error('Error in getReviews:', error.message);
            return { reviews: [] };
        }
    },

    addReview: async (foodId, rating, comment) => {
        try {
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
                body: JSON.stringify({ rating, comment }),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error in addReview:', error);
            throw error;
        }
    },
};

// User API
const userApi = {
    getProfile: async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error in getProfile:', error);
            throw error;
        }
    },
    
    updateProfile: async (userId, profileData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(profileData),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error in updateProfile:', error);
            throw error;
        }
    },
    
    getReviews: async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/${userId}/reviews`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error in getReviews:', error);
            return { reviews: [] };
        }
    },
    
    getActivity: async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/users/${userId}/activity`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error in getActivity:', error);
            return [];
        }
    },
    
    uploadProfilePicture: async (userId, file) => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('profilePicture', file);
            
            const response = await fetch(`${API_BASE_URL}/users/${userId}/profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Error in uploadProfilePicture:', error);
            throw error;
        }
    }
};

// Expose API to window object
window.api = {
    auth: authApi,
    food: foodApi,
    user: userApi
};

console.log('API module loaded and exposed to window.api');