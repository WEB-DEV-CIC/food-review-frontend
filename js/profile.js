// Profile functionality
const profile = {
    // Initialize profile functionality
    init() {
        console.log('Initializing profile functionality');
        
        // Check if user is logged in
        const user = localStorage.getItem('user');
        if (!user) {
            console.error('User not logged in');
            window.location.href = 'login.html';
            return;
        }
        
        // Load user data
        this.loadUserData();
        
        // Load user reviews
        this.loadUserReviews();
        
        // Load user activity
        this.loadUserActivity();
    },
    
    // Load user data from localStorage
    loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            console.log('User data loaded:', userData);
            
            if (!userData) {
                console.error('No user data found');
                return;
            }
            
            // Update profile header
            document.getElementById('full-name').textContent = userData.name || 'User';
            
            // Update personal information
            document.getElementById('first-name').textContent = userData.firstName || 'Not provided';
            document.getElementById('last-name').textContent = userData.lastName || 'Not provided';
            document.getElementById('email').textContent = userData.email || 'Not provided';
            document.getElementById('phone').textContent = userData.phone || 'Not provided';
            document.getElementById('bio').textContent = userData.bio || 'No bio provided';
            
            // Update address information
            document.getElementById('country').textContent = userData.country || 'Not provided';
            document.getElementById('city-state').textContent = userData.city || 'Not provided';
            document.getElementById('postal-code').textContent = userData.postalCode || 'Not provided';
            
            // Update profile picture if available
            if (userData.profilePicture) {
                document.getElementById('profile-picture').src = userData.profilePicture;
            }
            
            // Update profile stats
            this.updateProfileStats(userData);
            
            // If API is not available, use fallback data
            if (!window.api || !window.api.user) {
                console.log('API not available, using fallback data');
                this.loadFallbackData();
            }
            
        } catch (error) {
            console.error('Error loading user data:', error);
            // Use fallback data in case of error
            this.loadFallbackData();
        }
    },
    
    // Load fallback data
    loadFallbackData() {
        // Set default profile stats
        document.querySelector('.stat:nth-child(1) .stat-value').textContent = '0';
        document.querySelector('.stat:nth-child(2) .stat-value').textContent = '0';
        document.querySelector('.stat:nth-child(3) .stat-value').textContent = '0';
        
        // Set default activity
        const activityList = document.querySelector('.activity-list');
        if (activityList) {
            activityList.innerHTML = '<p class="text-muted">No recent activity</p>';
        }
    },
    
    // Update profile statistics
    updateProfileStats(userData) {
        const reviewCount = userData.reviewCount || 0;
        const followingCount = userData.followingCount || 0;
        const followerCount = userData.followerCount || 0;
        
        document.querySelector('.stat:nth-child(1) .stat-value').textContent = reviewCount;
        document.querySelector('.stat:nth-child(2) .stat-value').textContent = followingCount;
        document.querySelector('.stat:nth-child(3) .stat-value').textContent = followerCount;
    },
    
    // Load user reviews
    async loadUserReviews() {
        try {
            // Check if API is available
            if (!window.api || !window.api.user) {
                console.error('User API not available');
                return;
            }
            
            // Get user ID from localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData._id) {
                console.error('User ID not found');
                return;
            }
            
            // Fetch user reviews
            const response = await window.api.user.getReviews(userData._id);
            console.log('User reviews:', response);
            
            // Update review count
            if (response && response.reviews) {
                document.querySelector('.stat:nth-child(1) .stat-value').textContent = response.reviews.length;
            }
            
        } catch (error) {
            console.error('Error loading user reviews:', error);
        }
    },
    
    // Load user activity
    async loadUserActivity() {
        try {
            // Check if API is available
            if (!window.api || !window.api.user) {
                console.error('User API not available');
                return;
            }
            
            // Get user ID from localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData._id) {
                console.error('User ID not found');
                return;
            }
            
            // Fetch user activity
            const response = await window.api.user.getActivity(userData._id);
            console.log('User activity:', response);
            
            // Update activity list
            this.renderActivityList(response);
            
        } catch (error) {
            console.error('Error loading user activity:', error);
        }
    },
    
    // Render activity list
    renderActivityList(activities) {
        const activityList = document.querySelector('.activity-list');
        if (!activityList) return;
        
        if (!activities || !Array.isArray(activities) || activities.length === 0) {
            activityList.innerHTML = '<p class="text-muted">No recent activity</p>';
            return;
        }
        
        activityList.innerHTML = activities.map(activity => {
            const date = new Date(activity.date).toLocaleDateString();
            return `
                <div class="activity-item">
                    <div class="activity-icon">
                        <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <p>${activity.description}</p>
                        <small class="text-muted">${date}</small>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    // Get activity icon based on activity type
    getActivityIcon(type) {
        switch (type) {
            case 'review':
                return 'fa-star';
            case 'favorite':
                return 'fa-heart';
            case 'follow':
                return 'fa-user-plus';
            default:
                return 'fa-info-circle';
        }
    },
    
    // Save profile changes
    async saveProfileChanges(formData) {
        try {
            // Check if API is available
            if (!window.api || !window.api.user) {
                console.error('User API not available');
                return false;
            }
            
            // Get user ID from localStorage
            const userData = JSON.parse(localStorage.getItem('user'));
            if (!userData || !userData._id) {
                console.error('User ID not found');
                return false;
            }
            
            // Update user profile
            const response = await window.api.user.updateProfile(userData._id, formData);
            console.log('Profile update response:', response);
            
            // Update localStorage with new user data
            if (response && response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
                this.loadUserData();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error saving profile changes:', error);
            return false;
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