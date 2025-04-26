// API Test Script
console.log('API Test Script loaded');

// Define the test function
async function testApiConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/foods?limit=1`);
        const data = await response.json();
        console.log('API Test Result:', data);
    } catch (error) {
        console.error('API Test Error:', error);
    }
}

// Run test when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, running API test');
    testApiConnection();
}); 