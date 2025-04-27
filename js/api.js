// API module
const api = {
    // Base URL
    baseUrl: 'http://localhost:3002/api',

    // Headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // 添加认证令牌（如果有）
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userData.token) {
                    headers['Authorization'] = `Bearer ${userData.token}`;
                }
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
        
        return headers;
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
            const response = await fetch(`${api.baseUrl}/admin/foods/${id}`, {
                method: 'DELETE',
                headers: api.getHeaders()
            });
            if (!response.ok) throw new Error('Failed to delete food');
            return response.json();
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
        },

        async addFood(foodData) {
            try {
                const response = await fetch(`${api.baseUrl}/admin/foods`, {
                    method: 'POST',
                    headers: api.getHeaders(),
                    body: JSON.stringify(foodData)
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `Failed with status: ${response.status}`);
                }
                
                const data = await response.json();
                return {
                    success: true,
                    food: data
                };
            } catch (error) {
                console.error('Error adding food:', error);
                return {
                    success: false,
                    message: error.message
                };
            }
        }
    },

    // Food endpoints
    food: {
        async getAll() {
            try {
                console.log('Fetching all foods...');
                const response = await fetch(`${api.baseUrl}/foods`, {
                    headers: api.getHeaders()
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Foods data:', data);
                return data;
            } catch (error) {
                console.error('Error fetching foods:', error);
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
                // 检查用户是否已登录
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) {
                    throw new Error('You must be logged in to add a review');
                }

                console.log('Submitting review for food:', foodId);
                const response = await fetch(`${api.baseUrl}/reviews`, {
                    method: 'POST',
                    headers: api.getHeaders(),
                    body: JSON.stringify({ 
                        food_id: foodId, 
                        user_id: user.id,
                        rating, 
                        comment 
                    })
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

// Make api object globally available
window.api = api;

console.log('API module loaded and exposed to window.api');