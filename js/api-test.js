// API Test Script
console.log('API Test Script loaded');

async function testApiConnection() {
    console.log('Testing API connection...');
    try {
        const response = await fetch('http://localhost:3002/api/v1/foods?limit=1');
        console.log('API Response status:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('API Response data:', data);
            console.log('API connection successful!');
            return true;
        } else {
            console.error('API connection failed with status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('API connection error:', error);
        return false;
    }
}

// Run the test when the script loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, running API test');
    testApiConnection();
});