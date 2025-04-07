// Admin Dashboard functionality
const admin = {
    // State management
    state: {
        currentSection: 'dashboard',
        dateRange: 'month',
        charts: {},
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
            // Check admin authorization
            const user = await window.auth.getCurrentUser();
            if (!user || user.role !== 'admin') {
                window.location.href = 'index.html';
                return;
            }

            // Initialize components
            this.initializeSidebar();
            this.initializeCharts();
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

    // Initialize charts
    initializeCharts() {
        // User Growth Chart
        const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
        this.state.charts.userGrowth = new Chart(userGrowthCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'New Users',
                    data: [],
                    borderColor: '#3498db',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

        // Review Activity Chart
        const reviewActivityCtx = document.getElementById('reviewActivityChart').getContext('2d');
        this.state.charts.reviewActivity = new Chart(reviewActivityCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Reviews',
                    data: [],
                    backgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    // Load dashboard data
    async loadDashboardData() {
        try {
            // Load statistics
            const stats = await this.fetchDashboardStats();
            this.updateDashboardStats(stats);

            // Load chart data
            const chartData = await this.fetchChartData();
            this.updateCharts(chartData);

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
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalFoods').textContent = stats.totalFoods;
        document.getElementById('totalReviews').textContent = stats.totalReviews;
        document.getElementById('activeReports').textContent = stats.activeReports;
    },

    // Fetch chart data
    async fetchChartData() {
        try {
            const response = await window.api.admin.getChartData(this.state.dateRange);
            return response.data;
        } catch (error) {
            console.error('Error fetching chart data:', error);
            throw error;
        }
    },

    // Update charts with new data
    updateCharts(data) {
        // Update User Growth Chart
        this.state.charts.userGrowth.data.labels = data.userGrowth.labels;
        this.state.charts.userGrowth.data.datasets[0].data = data.userGrowth.data;
        this.state.charts.userGrowth.update();

        // Update Review Activity Chart
        this.state.charts.reviewActivity.data.labels = data.reviewActivity.labels;
        this.state.charts.reviewActivity.data.datasets[0].data = data.reviewActivity.data;
        this.state.charts.reviewActivity.update();
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

    // Format date for display
    formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Load section data
    async loadSectionData(section) {
        try {
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
        } catch (error) {
            console.error(`Error loading ${section} data:`, error);
            this.showError(`Failed to load ${section} data`);
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
        document.getElementById('dateRange').addEventListener('change', (e) => {
            this.state.dateRange = e.target.value;
            this.loadDashboardData();
        });

        // Search inputs
        document.getElementById('userSearch').addEventListener('input', this.handleSearch.bind(this, 'users'));
        document.getElementById('foodSearch').addEventListener('input', this.handleSearch.bind(this, 'foods'));
        document.getElementById('reviewSearch').addEventListener('input', this.handleSearch.bind(this, 'reviews'));

        // Filter dropdowns
        document.getElementById('reviewFilter').addEventListener('change', this.handleFilter.bind(this, 'reviews'));
        document.getElementById('reportStatus').addEventListener('change', this.handleFilter.bind(this, 'reports'));

        // Settings forms
        document.getElementById('generalSettingsForm').addEventListener('submit', this.handleSettingsSubmit.bind(this, 'general'));
        document.getElementById('securitySettingsForm').addEventListener('submit', this.handleSettingsSubmit.bind(this, 'security'));

        // Add buttons
        document.getElementById('addUserBtn').addEventListener('click', () => this.showModal('addUserModal'));
        document.getElementById('addFoodBtn').addEventListener('click', () => this.showModal('addFoodModal'));
    },

    // Handle search functionality
    handleSearch(type, e) {
        const searchTerm = e.target.value.toLowerCase();
        const items = this.state.data[type];
        
        const filteredItems = items.filter(item => {
            switch (type) {
                case 'users':
                    return item.name.toLowerCase().includes(searchTerm) ||
                           item.email.toLowerCase().includes(searchTerm);
                case 'foods':
                    return item.name.toLowerCase().includes(searchTerm) ||
                           item.region.toLowerCase().includes(searchTerm);
                case 'reviews':
                    return item.user.name.toLowerCase().includes(searchTerm) ||
                           item.food.name.toLowerCase().includes(searchTerm);
                default:
                    return true;
            }
        });

        this[`render${type.charAt(0).toUpperCase() + type.slice(1)}`](filteredItems);
    },

    // Handle filter functionality
    handleFilter(type, e) {
        const filterValue = e.target.value;
        const items = this.state.data[type];
        
        const filteredItems = filterValue === 'all' ? items : items.filter(item => item.status === filterValue);
        this[`render${type.charAt(0).toUpperCase() + type.slice(1)}`](filteredItems);
    },

    // Handle settings form submission
    async handleSettingsSubmit(type, e) {
        e.preventDefault();
        try {
            const formData = new FormData(e.target);
            const settings = Object.fromEntries(formData.entries());
            
            await window.api.admin.updateSettings(type, settings);
            this.showSuccess(`${type} settings updated successfully`);
        } catch (error) {
            console.error(`Error updating ${type} settings:`, error);
            this.showError(`Failed to update ${type} settings`);
        }
    },

    // Show modal
    showModal(modalId) {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    },

    // Show success message
    showSuccess(message) {
        // Implement your preferred notification system
        alert(message);
    },

    // Show error message
    showError(message) {
        // Implement your preferred notification system
        alert(message);
    }
};

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    admin.init();
}); 