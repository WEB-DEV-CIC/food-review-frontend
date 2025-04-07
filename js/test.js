// Test script to verify navigation
console.log('Test script loaded');

// Function to test navigation
function testNavigation() {
    console.log('Running navigation test...');
    
    // Find login and register buttons
    const loginBtn = document.querySelector('a[href="login-redirect.html"]');
    const registerBtn = document.querySelector('a[href="register-redirect.html"]');
    
    if (loginBtn) {
        console.log('Login button found');
        loginBtn.addEventListener('click', (e) => {
            console.log('Login button clicked');
            // Let the default navigation happen
        });
    } else {
        console.error('Login button not found');
    }
    
    if (registerBtn) {
        console.log('Register button found');
        registerBtn.addEventListener('click', (e) => {
            console.log('Register button clicked');
            // Let the default navigation happen
        });
    } else {
        console.error('Register button not found');
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the navbar to load
    setTimeout(testNavigation, 1000);
}); 