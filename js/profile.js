// Profile functionality
const profile = {
    // Initialize profile functionality
    async init() {
        try {
            console.log('Initializing profile...');
            await this.loadUserData();
        } catch (error) {
            console.error('Error initializing profile:', error);
        }
    },
    
    // Load user data from API
    async loadUserData() {
        try {
            console.log('Loading user data...');
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.id) {
                console.error('No user data found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            console.log('User data loaded:', data);

            // Update profile header
            document.getElementById('full-name').textContent = data.username;
            document.getElementById('user-role').textContent = data.role || 'Food Enthusiast';
            
            // Update personal information
            document.getElementById('email').textContent = data.email;

        } catch (error) {
            console.error('Error loading user data:', error);
            // Fallback to localStorage data if API fails
            const fallbackData = JSON.parse(localStorage.getItem('user'));
            if (fallbackData) {
                document.getElementById('full-name').textContent = fallbackData.username;
                document.getElementById('email').textContent = fallbackData.email;
            }
        }
    },
    
    // Load user reviews
    async loadUserReviews() {
        try {
            console.log('Loading user reviews...');
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.id) {
                console.error('No user data found');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/users/${userData.id}/reviews`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user reviews');
            }

            const reviews = await response.json();
            console.log('User reviews loaded:', reviews);

            // Update review count
            document.querySelector('.stat:nth-child(1) .stat-value').textContent = reviews.length;

            // Update recent activity
            const activityList = document.querySelector('.activity-list');
            if (reviews.length > 0) {
                activityList.innerHTML = reviews.slice(0, 5).map(review => `
                    <div class="activity-item">
                        <i class="fas fa-utensils"></i>
                        <div class="activity-content">
                            <p>Reviewed ${review.food_name}</p>
                            <small class="text-muted">${new Date(review.created_at).toLocaleDateString()}</small>
                        </div>
                    </div>
                `).join('');
            } else {
                activityList.innerHTML = '<p class="text-muted">No recent activity</p>';
            }

        } catch (error) {
            console.error('Error loading user reviews:', error);
            document.querySelector('.activity-list').innerHTML = '<p class="text-muted">Error loading activity</p>';
        }
    },
    
    // Update profile statistics
    updateProfileStats(userData) {
        try {
            // Update review count
            const reviewCount = userData.reviews ? userData.reviews.length : 0;
            document.querySelector('.stat:nth-child(1) .stat-value').textContent = reviewCount;
        } catch (error) {
            console.error('Error updating profile stats:', error);
            // Set default value in case of error
            document.querySelector('.stat:nth-child(1) .stat-value').textContent = '0';
        }
    },
    
    // Save profile changes
    async saveProfileChanges(formData) {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData.id) {
                throw new Error('No user data found');
            }

            const response = await fetch(`${API_BASE_URL}/users/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Reload user data after successful update
            await this.loadUserData();
        } catch (error) {
            console.error('Error saving profile changes:', error);
            alert('Failed to save profile changes. Please try again.');
        }
    },
    
    // Upload profile picture
    async uploadProfilePicture(userId, file) {
        try {
            // Check if API is available
            if (!window.api || !window.api.user) {
                console.error('User API not available');
                return false;
            }
            
            // Upload profile picture
            const response = await window.api.user.uploadProfilePicture(userId, file);
            console.log('Profile picture upload response:', response);
            
            // Update localStorage with new user data
            if (response && response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                this.loadUserData();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            return false;
        }
    }
};

// Initialize profile when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('profile.html')) {
        profile.init();
    }
}); 