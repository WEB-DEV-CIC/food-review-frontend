// Authentication functionality
const auth = {
    // Initialize auth functionality
    init() {
        // Check authentication status first
        this.checkAuthStatus();
        
        // Redirect if on login/register page while logged in
        this.checkPageRedirect();
        
        // Check if we're on the register page
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }

        // Check if we're on the login page
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }
    },
    
    // Check if we need to redirect based on current page
    checkPageRedirect() {
        const user = localStorage.getItem('user');
        const currentPage = window.location.pathname.split('/').pop();
        
        // If user is logged in and on login/register page, redirect to home
        if (user && (currentPage === 'login.html' || currentPage === 'register.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // If user is not logged in and on profile/admin page, redirect to login
        if (!user && (currentPage === 'profile.html' || currentPage === 'admin.html')) {
            window.location.href = 'login.html';
            return;
        }
    },

    // Check if user is authenticated
    checkAuthStatus() {
        const user = localStorage.getItem('user');
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userDropdown = document.getElementById('userDropdown');
        const userName = document.getElementById('userName');

        if (!loginBtn || !registerBtn || !userDropdown || !userName) return;

        if (user) {
            // User is logged in
            const userData = JSON.parse(user);
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            userDropdown.style.display = 'block';
            userName.textContent = userData.name;
        } else {
            // User is not logged in
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            userDropdown.style.display = 'none';
        }
    },

    // Get the appropriate redirect URL after login/register
    getRedirectUrl() {
        // Check if there's a redirect parameter in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('redirect');
        
        // If there's a valid redirect parameter, use it
        if (redirectTo && ['profile.html', 'food.html', 'admin.html', 'index.html'].includes(redirectTo)) {
            return redirectTo;
        }
        
        // Check if we have a previous page stored
        const previousPage = sessionStorage.getItem('previousPage');
        if (previousPage && previousPage !== 'login.html' && previousPage !== 'register.html') {
            return previousPage;
        }
        
        // Default to home page
        return 'index.html';
    },

    // Handle registration
    handleRegister(event) {
        event.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
        
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        let isValid = true;
        
        // Validate name
        if (name.length < 2) {
            document.getElementById('nameError').textContent = 'Name must be at least 2 characters long';
            document.getElementById('name').classList.add('error');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('emailError').textContent = 'Please enter a valid email address';
            document.getElementById('email').classList.add('error');
            isValid = false;
        }
        
        // Validate password
        if (password.length < 6) {
            document.getElementById('passwordError').textContent = 'Password must be at least 6 characters long';
            document.getElementById('password').classList.add('error');
            isValid = false;
        }
        
        // Validate password confirmation
        if (password !== confirmPassword) {
            document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
            document.getElementById('confirmPassword').classList.add('error');
            isValid = false;
        }
        
        if (!isValid) {
            document.querySelector('.auth-container').classList.add('shake');
            setTimeout(() => {
                document.querySelector('.auth-container').classList.remove('shake');
            }, 500);
            return;
        }
        
        // Disable button and show loading state
        const button = document.getElementById('registerButton');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        
        // Store reference to this
        const self = this;
        
        // Send registration request
        fetch('http://localhost:5000/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies
            body: JSON.stringify({
                name,
                email,
                password
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Registration failed');
                });
            }
            return response.json();
        })
        .then(data => {
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to appropriate page
            window.location.href = self.getRedirectUrl();
        })
        .catch(error => {
            // Show error message
            const errorMessage = error.message || 'Registration failed. Please try again.';
            document.getElementById('emailError').textContent = errorMessage;
            document.getElementById('email').classList.add('error');
            
            // Reset button
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-user-plus"></i> Register';
        });
    },

    // Handle login
    handleLogin(event) {
        event.preventDefault();
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        let isValid = true;
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            document.getElementById('loginEmailError').textContent = 'Please enter a valid email address';
            document.getElementById('loginEmail').classList.add('error');
            isValid = false;
        }
        
        // Validate password
        if (password.length < 6) {
            document.getElementById('loginPasswordError').textContent = 'Password must be at least 6 characters long';
            document.getElementById('loginPassword').classList.add('error');
            isValid = false;
        }
        
        if (!isValid) {
            document.querySelector('.auth-container').classList.add('shake');
            setTimeout(() => {
                document.querySelector('.auth-container').classList.remove('shake');
            }, 500);
            return;
        }
        
        // Disable button and show loading state
        const button = document.getElementById('loginButton');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        
        // Store reference to this
        const self = this;
        
        // Send login request
        fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // Include cookies
            body: JSON.stringify({
                email,
                password
            })
        })
        .then(response => {
            console.log('Login response status:', response.status);
            if (!response.ok) {
                return response.json().then(data => {
                    console.error('Login error:', data);
                    throw new Error(data.message || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Login successful:', data);
            // Store user data
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to appropriate page
            window.location.href = self.getRedirectUrl();
        })
        .catch(error => {
            console.error('Login error:', error);
            // Show error message
            const errorMessage = error.message || 'Login failed. Please check your credentials.';
            document.getElementById('loginEmailError').textContent = errorMessage;
            document.getElementById('loginEmail').classList.add('error');
            
            // Reset button
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
        });
    },

    // Handle logout
    logout() {
        // Send logout request to clear server-side cookie
        fetch('http://localhost:5000/api/v1/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(() => {
            // Clear client-side storage
            localStorage.removeItem('user');
            this.checkAuthStatus();
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Logout error:', error);
            // Still clear client-side storage even if server request fails
            localStorage.removeItem('user');
            this.checkAuthStatus();
            window.location.href = 'index.html';
        });
    },

    // Navigate to login page with optional redirect parameter
    login(redirectTo = null) {
        console.log('Login function called with redirect:', redirectTo);
        
        // Store current page if not already a login/register page
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'login.html' && currentPage !== 'register.html') {
            sessionStorage.setItem('previousPage', currentPage);
        }
        
        let url = 'login.html';
        if (redirectTo) {
            url += `?redirect=${redirectTo}`;
        }
        console.log('Redirecting to:', url);
        window.location.href = url;
    },

    // Navigate to register page with optional redirect parameter
    register(redirectTo = null) {
        console.log('Register function called with redirect:', redirectTo);
        
        // Store current page if not already a login/register page
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'login.html' && currentPage !== 'register.html') {
            sessionStorage.setItem('previousPage', currentPage);
        }
        
        let url = 'register.html';
        if (redirectTo) {
            url += `?redirect=${redirectTo}`;
        }
        console.log('Redirecting to:', url);
        window.location.href = url;
    }
};

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Make auth functions available globally
    window.login = function(redirectTo = null) {
        console.log('Login function called with redirect:', redirectTo);
        let url = 'login.html';
        if (redirectTo) {
            url += `?redirect=${redirectTo}`;
        }
        console.log('Redirecting to:', url);
        window.location.href = url;
    };
    
    window.register = function(redirectTo = null) {
        console.log('Register function called with redirect:', redirectTo);
        let url = 'register.html';
        if (redirectTo) {
            url += `?redirect=${redirectTo}`;
        }
        console.log('Redirecting to:', url);
        window.location.href = url;
    };
    
    window.logout = auth.logout.bind(auth);
    
    // Initialize auth
    auth.init();
});