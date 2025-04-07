const navbar= fetch('navbar.html')
               .then(response => {if(!response.ok){
                throw new Error('Failed to fetch navbar: ' + response.statusText)
               }
            return response.text();
        })
        .then(data =>{
            document.getElementById('navbar-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Error loading navbar:', error.message));

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    if (token) {
        // User is logged in
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        // User is not logged in
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

function login() {
    window.location.href = 'login.html';
}

function register() {
    window.location.href = 'register.html';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    checkAuthStatus();
    window.location.href = 'index.html';
}