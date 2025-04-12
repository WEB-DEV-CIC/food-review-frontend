// Admin test functionality
const adminTest = {
    async testAdminFunctionality() {
        try {
            console.log('=== Starting Admin Panel Test ===');
            
            // Check authentication
            const token = localStorage.getItem('token');
            console.log('Authentication Status:', token ? 'Authenticated' : 'Not Authenticated');
            
            // Test user data loading
            console.log('\n1. Testing User Management...');
            try {
                const users = await window.api.admin.getUsers();
                console.log('Users loaded successfully:', users.users.length, 'users found');
                console.log('Sample user data:', users.users[0]);
            } catch (error) {
                console.error('Error loading users:', error);
            }
            
            // Test food data loading
            console.log('\n2. Testing Food Management...');
            try {
                const foods = await window.api.admin.getFoods();
                console.log('Foods loaded successfully:', foods.foods.length, 'foods found');
                console.log('Sample food data:', foods.foods[0]);
            } catch (error) {
                console.error('Error loading foods:', error);
            }
            
            // Test review data loading
            console.log('\n3. Testing Review Management...');
            try {
                const reviews = await window.api.admin.getReviews();
                console.log('Reviews loaded successfully:', reviews.reviews.length, 'reviews found');
                console.log('Sample review data:', reviews.reviews[0]);
            } catch (error) {
                console.error('Error loading reviews:', error);
            }
            
            // Test report data loading
            console.log('\n4. Testing Report Management...');
            try {
                const reports = await window.api.admin.getReports();
                console.log('Reports loaded successfully:', reports.reports.length, 'reports found');
                console.log('Sample report data:', reports.reports[0]);
            } catch (error) {
                console.error('Error loading reports:', error);
            }
            
            // Test dashboard stats
            console.log('\n5. Testing Dashboard Statistics...');
            try {
                const stats = await window.api.admin.getStats();
                console.log('Dashboard stats loaded successfully:', stats);
            } catch (error) {
                console.error('Error loading dashboard stats:', error);
            }
            
            // Test recent activity
            console.log('\n6. Testing Recent Activity...');
            try {
                const activity = await window.api.admin.getRecentActivity();
                console.log('Recent activity loaded successfully:', activity.activities.length, 'activities found');
                console.log('Sample activity data:', activity.activities[0]);
            } catch (error) {
                console.error('Error loading recent activity:', error);
            }
            
            console.log('\n=== Admin Panel Test Completed ===');
            console.log('Please check the console for any errors or issues.');
            
        } catch (error) {
            console.error('Critical error in admin functionality test:', error);
        }
    }
};

// Run tests when admin page loads
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        console.log('Admin page loaded, starting tests...');
        adminTest.testAdminFunctionality();
    }
}); 