// API module
const api = {
    // Base URL
    baseUrl: 'http://localhost:5000/api/v1',

    // Headers
    getHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    },

    // Admin endpoints
    admin: {
        async getStats() {
            const response = await fetch(`${api.baseUrl}/admin/stats`, {
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch stats');
            return response.json();
        },

        async getFoods() {
            try {
                console.log('Making request to:', `${api.baseUrl}/admin/foods`);
                const response = await fetch(`${api.baseUrl}/admin/foods`, {
                    headers: api.getHeaders()
                });
                
                console.log('Response status:', response.status);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`Failed to fetch foods: ${response.status} ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Parsed response data:', data);
                return data;
            } catch (error) {
                console.error('Error in getFoods:', error);
                throw error;
            }
        },

        async updateFood(id, foodData) {
            try {
                console.log('Updating food with ID:', id);
                console.log('Food data:', foodData);
                
                const response = await fetch(`${api.baseUrl}/admin/foods/${id}`, {
                    method: 'PUT',
                    headers: api.getHeaders(),
                    body: JSON.stringify(foodData)
                });
                
                console.log('Update response status:', response.status);
                const data = await response.json();
                console.log('Update response data:', data);
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to update food');
                }
                
                return {
                    success: true,
                    food: data
                };
            } catch (error) {
                console.error('Error updating food:', error);
                return {
                    success: false,
                    message: error.message
                };
            }
        },

        async deleteFood(id) {
            try {
                console.log('Deleting food with ID:', id);
                const response = await fetch(`${api.baseUrl}/admin/foods/${id}`, {
                    method: 'DELETE',
                    headers: api.getHeaders()
                });
                
                console.log('Delete response status:', response.status);
                const data = await response.json();
                console.log('Delete response data:', data);
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to delete food');
                }
                
                return {
                    success: true,
                    message: data.message
                };
            } catch (error) {
                console.error('Error deleting food:', error);
                return {
                    success: false,
                    message: error.message
                };
            }
        },

        async getReviews() {
            const response = await fetch(`${api.baseUrl}/admin/reviews`, {
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch reviews');
            return response.json();
        },

        async deleteReview(id) {
            const response = await fetch(`${api.baseUrl}/admin/reviews/${id}`, {
                method: 'DELETE',
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete review');
            return response.json();
        }
    },

    // Food endpoints
    food: {
        async getAll(params = {}) {
            try {
                const queryString = new URLSearchParams(params).toString();
                const url = `${api.baseUrl}/foods${queryString ? `?${queryString}` : ''}`;
                console.log('Making request to:', url);
                const response = await fetch(url, {
                    headers: api.getHeaders()
                });
                
                console.log('Response status:', response.status);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error(`Failed to fetch foods: ${response.status} ${errorText}`);
                }
                
                const data = await response.json();
                console.log('Parsed response data:', data);
                return data;
            } catch (error) {
                console.error('Error in getAll:', error);
                throw error;
            }
        },

        async getById(id) {
            const response = await fetch(`${api.baseUrl}/foods/${id}`, {
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch food');
            return response.json();
        },

        async addReview(foodId, rating, comment) {
            try {
                console.log('Submitting review for food:', foodId);
                const response = await fetch(`${api.baseUrl}/foods/${foodId}/reviews`, {
                    method: 'POST',
                    headers: api.getHeaders(),
                    body: JSON.stringify({ rating, comment })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to submit review');
                }
                
                const data = await response.json();
                console.log('Review submitted successfully:', data);
                return data;
            } catch (error) {
                console.error('Error submitting review:', error);
                throw error;
            }
        },

        async create(foodData) {
            const response = await fetch(`${api.baseUrl}/foods`, {
                method: 'POST',
                headers: api.getHeaders(),
                body: JSON.stringify(foodData)
            });
            if (!response.ok) throw new Error('Failed to create food');
            return response.json();
        },

        async update(id, foodData) {
            const response = await fetch(`${api.baseUrl}/foods/${id}`, {
                method: 'PUT',
                headers: api.getHeaders(),
                body: JSON.stringify(foodData)
            });
            if (!response.ok) throw new Error('Failed to update food');
            return response.json();
        },

        async delete(id) {
            const response = await fetch(`${api.baseUrl}/foods/${id}`, {
                method: 'DELETE',
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete food');
            return response.json();
        }
    },

    // Review endpoints
    review: {
        async getAll() {
            const response = await fetch(`${api.baseUrl}/reviews`, {
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch reviews');
            return response.json();
        },

        async getById(id) {
            const response = await fetch(`${api.baseUrl}/reviews/${id}`, {
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch review');
            return response.json();
        },

        async create(reviewData) {
            const response = await fetch(`${api.baseUrl}/reviews`, {
                method: 'POST',
                headers: api.getHeaders(),
                body: JSON.stringify(reviewData)
            });
            if (!response.ok) throw new Error('Failed to create review');
            return response.json();
        },

        async update(id, reviewData) {
            const response = await fetch(`${api.baseUrl}/reviews/${id}`, {
                method: 'PUT',
                headers: api.getHeaders(),
                body: JSON.stringify(reviewData)
            });
            if (!response.ok) throw new Error('Failed to update review');
            return response.json();
        },

        async delete(id) {
            const response = await fetch(`${api.baseUrl}/reviews/${id}`, {
                method: 'DELETE',
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete review');
            return response.json();
        }
    },

    // User endpoints
    user: {
        async getProfile(userId) {
            const response = await fetch(`${api.baseUrl}/users/${userId}`, {
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch user profile');
            return response.json();
        },

        async updateProfile(userId, profileData) {
            const response = await fetch(`${api.baseUrl}/users/${userId}`, {
                method: 'PUT',
                headers: api.getHeaders(),
                body: JSON.stringify(profileData)
            });
            if (!response.ok) throw new Error('Failed to update user profile');
            return response.json();
        },

        async getReviews(userId) {
            const response = await fetch(`${api.baseUrl}/users/${userId}/reviews`, {
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch user reviews');
            return response.json();
        },

        async getActivity(userId) {
            const response = await fetch(`${api.baseUrl}/users/${userId}/activity`, {
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to fetch user activity');
            return response.json();
        },

        async uploadProfilePicture(userId, file) {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await fetch(`${api.baseUrl}/users/${userId}/profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': api.getHeaders().Authorization
                },
                body: formData
            });
            if (!response.ok) throw new Error('Failed to upload profile picture');
            return response.json();
        }
    }
};

// Expose API module to window object
window.api = api;

console.log('API module loaded and exposed to window.api');