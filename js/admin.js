// Admin Dashboard functionality
const admin = {
    // State management
    state: {
        currentSection: 'dashboard',
        dateRange: 'month',
        data: {
            users: [],
            foods: [],
            reviews: [],
            reports: []
        }
    },

    // Initialize the admin dashboard
    async init() {
        try {
            // Check if auth is available
            if (!window.auth) {
                console.error('Auth module not loaded');
                this.showError('Authentication module not loaded');
                return;
            }

            // Check if user is logged in
            const user = window.auth.getCurrentUser();
            if (!user) {
                console.log('No user found, redirecting to login page');
                window.location.href = 'login.html';
                return;
            }

            // TEMPORARY: Allow all logged-in users to access admin page
            // Set user role to admin if not already
            if (user.role !== 'admin') {
                user.role = 'admin';
                localStorage.setItem('user', JSON.stringify(user));
                console.log('User role updated to admin');
            }

            // Initialize components
            this.initializeSidebar();
            this.loadDashboardData();
            this.initializeEventListeners();
        } catch (error) {
            console.error('Error initializing admin dashboard:', error);
            this.showError('Failed to initialize admin dashboard');
        }
    },

    // Initialize sidebar navigation
    initializeSidebar() {
        const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section);
            });
        });
    },

    // Switch between sections
    switchSection(section) {
        // Update active states
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => link.classList.remove('active'));
        
        document.getElementById(section).classList.add('active');
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        this.state.currentSection = section;
        this.loadSectionData(section);
    },

    // Load dashboard data
    async loadDashboardData() {
        try {
            // Load statistics
            const stats = await this.fetchDashboardStats();
            this.updateDashboardStats(stats);

            // Load recent activity
            const activities = await this.fetchRecentActivity();
            this.updateRecentActivity(activities);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    },

    // Fetch dashboard statistics
    async fetchDashboardStats() {
        try {
            const response = await window.api.admin.getStats();
            return response.stats;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    },

    // Update dashboard statistics
    updateDashboardStats(stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
        document.getElementById('totalFoods').textContent = stats.totalFoods || 0;
        document.getElementById('totalReviews').textContent = stats.totalReviews || 0;
        document.getElementById('activeReports').textContent = stats.totalReports || 0;
    },

    // Fetch recent activity
    async fetchRecentActivity() {
        try {
            const response = await window.api.admin.getRecentActivity();
            return response.activities;
        } catch (error) {
            console.error('Error fetching recent activity:', error);
            throw error;
        }
    },

    // Update recent activity list
    updateRecentActivity(activities) {
        const container = document.getElementById('recentActivityList');
        if (!container) return;

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <p>${activity.description}</p>
                    <small>${this.formatDate(activity.timestamp)}</small>
                </div>
            </div>
        `).join('');
    },

    // Get icon for activity type
    getActivityIcon(type) {
        const icons = {
            user: 'fa-user',
            food: 'fa-utensils',
            review: 'fa-star',
            report: 'fa-flag'
        };
        return icons[type] || 'fa-info-circle';
    },

    // Format date
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Load section data
    async loadSectionData(section) {
        switch (section) {
            case 'users':
                await this.loadUsers();
                break;
            case 'foods':
                await this.loadFoods();
                break;
            case 'reviews':
                await this.loadReviews();
                break;
            case 'reports':
                await this.loadReports();
                break;
            case 'settings':
                await this.loadSettings();
                break;
        }
    },

    // Load users data
    async loadUsers() {
        try {
            const response = await window.api.admin.getUsers();
            this.state.data.users = response.users;
            this.renderUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            throw error;
        }
    },

    // Render users table
    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = this.state.data.users.map(user => `
            <tr>
                <td>${user._id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <span class="status-badge status-${user.status}">
                        ${user.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="admin.viewUser('${user._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="admin.editUser('${user._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deleteUser('${user._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Load foods data
    async loadFoods() {
        try {
            const response = await window.api.admin.getFoods();
            this.state.data.foods = response.foods;
            this.renderFoods();
        } catch (error) {
            console.error('Error loading foods:', error);
            throw error;
        }
    },

    // Render foods table
    renderFoods() {
        const tbody = document.getElementById('foodsTableBody');
        tbody.innerHTML = this.state.data.foods.map(food => `
            <tr>
                <td>${food._id}</td>
                <td>${food.name}</td>
                <td>${food.region}</td>
                <td>${food.rating.toFixed(1)}</td>
                <td>${food.reviewCount}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="admin.viewFood('${food._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="admin.editFood('${food._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deleteFood('${food._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Load reviews data
    async loadReviews() {
        try {
            const response = await window.api.admin.getReviews();
            this.state.data.reviews = response.reviews;
            this.renderReviews();
        } catch (error) {
            console.error('Error loading reviews:', error);
            throw error;
        }
    },

    // Render reviews table
    renderReviews() {
        const tbody = document.getElementById('reviewsTableBody');
        tbody.innerHTML = this.state.data.reviews.map(review => `
            <tr>
                <td>${review._id}</td>
                <td>${review.user.name}</td>
                <td>${review.food.name}</td>
                <td>${review.rating}</td>
                <td>
                    <span class="status-badge status-${review.status}">
                        ${review.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="admin.viewReview('${review._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="admin.editReview('${review._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deleteReview('${review._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Load reports data
    async loadReports() {
        try {
            const response = await window.api.admin.getReports();
            this.state.data.reports = response.reports;
            this.renderReports();
        } catch (error) {
            console.error('Error loading reports:', error);
            throw error;
        }
    },

    // Render reports table
    renderReports() {
        const tbody = document.getElementById('reportsTableBody');
        tbody.innerHTML = this.state.data.reports.map(report => `
            <tr>
                <td>${report._id}</td>
                <td>${report.type}</td>
                <td>${report.reportedBy.name}</td>
                <td>
                    <span class="status-badge status-${report.status}">
                        ${report.status}
                    </span>
                </td>
                <td>${this.formatDate(report.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="admin.viewReport('${report._id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="admin.handleReport('${report._id}')">
                            <i class="fas fa-check"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    },

    // Load settings data
    async loadSettings() {
        try {
            const response = await window.api.admin.getSettings();
            this.populateSettingsForms(response.settings);
        } catch (error) {
            console.error('Error loading settings:', error);
            throw error;
        }
    },

    // Populate settings forms
    populateSettingsForms(settings) {
        // General Settings
        document.getElementById('siteName').value = settings.siteName;
        document.getElementById('adminEmail').value = settings.adminEmail;

        // Security Settings
        document.getElementById('sessionTimeout').value = settings.sessionTimeout;
        document.getElementById('passwordPolicy').value = settings.passwordPolicy;
    },

    // Initialize event listeners
    initializeEventListeners() {
        // Date range selector
        const dateRange = document.getElementById('dateRange');
        if (dateRange) {
            dateRange.addEventListener('change', (e) => {
                this.state.dateRange = e.target.value;
                this.loadDashboardData();
            });
        }

        // Add User button
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
                modal.show();
            });
        }

        // Save User button
        const saveUserBtn = document.getElementById('saveUserBtn');
        if (saveUserBtn) {
            saveUserBtn.addEventListener('click', async () => {
                const form = document.getElementById('addUserForm');
                const formData = new FormData(form);
                try {
                    await window.api.admin.createUser(Object.fromEntries(formData));
                    this.showSuccess('User created successfully');
                    bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
                    form.reset();
                } catch (error) {
                    this.showError('Failed to create user');
                }
            });
        }
    },

    // Show success message
    showSuccess(message) {
        // Implement toast or alert for success message
        alert(message);
    },

    // Show error message
    showError(message) {
        // Implementation for showing error messages
        console.error(message);
    }
};

// Make admin object available globally
window.admin = admin;

// Initialize admin if on admin page
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        admin.init();
    }
}); 