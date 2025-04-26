// Authentication functionality

const auth = {
    // Initialize auth functionality
    async init() {
        try {
            console.log('Starting auth initialization...');
            
            // Check if user is already logged in
            const user = this.getCurrentUser();
            const currentPage = window.location.pathname.split('/').pop();
            
            if (user) {
                console.log('User already logged in:', user);
                
                // If on login/register page, redirect based on role
                if (currentPage === 'login.html' || currentPage === 'register.html') {
                    if (user.role === 'admin') {
                        window.location.href = 'admin.html';
                        return;
                    }
                    window.location.href = 'index.html';
                    return;
                }
                
                // If on admin page, verify admin role
                if (currentPage === 'admin.html' && user.role !== 'admin') {
                    window.location.href = 'index.html';
                    return;
                }
            } else {
                console.log('No user logged in');
                // If on protected pages, redirect to login
                if (currentPage === 'admin.html' || currentPage === 'profile.html') {
                    window.location.href = 'login.html';
                    return;
                }
            }

            // Initialize event listeners
            this.initializeEventListeners();
            console.log('Auth initialization complete');
        } catch (error) {
            console.error('Error initializing auth:', error);
            this.showError('Failed to initialize authentication');
        }
    },
    
    // Get current user from localStorage
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },
    
    // Check if we need to redirect based on current page
    checkPageRedirect() {
        const user = this.getCurrentUser();
        const currentPage = window.location.pathname.split('/').pop();
        
        // If user is logged in and on login/register page, redirect to home
        if (user && (currentPage === 'login.html' || currentPage === 'register.html')) {
            window.location.href = 'index.html';
            return;
        }
        
        // If user is not logged in and on profile page, redirect to login
        if (!user && currentPage === 'profile.html') {
            window.location.href = 'login.html';
            return;
        }

        // For admin page, let the checkAdminAccess function handle it
        if (currentPage === 'admin.html') {
            return;
        }
    },

    // Check if user is authenticated
    checkAuthStatus() {
        const user = this.getCurrentUser();
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userDropdown = document.getElementById('userDropdown');
        const userName = document.getElementById('userName');

        // Only update UI if we're on a page with auth elements
        if (loginBtn || registerBtn || userDropdown || userName) {
            if (user) {
                // User is logged in
                console.log('User is logged in, updating UI...');
                if (loginBtn) loginBtn.style.display = 'none';
                if (registerBtn) registerBtn.style.display = 'none';
                if (userDropdown) userDropdown.style.display = 'block';
                if (userName) userName.textContent = user.name;
            } else {
                // User is not logged in
                console.log('User is not logged in, updating UI...');
                if (loginBtn) loginBtn.style.display = 'block';
                if (registerBtn) registerBtn.style.display = 'block';
                if (userDropdown) userDropdown.style.display = 'none';
            }
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
    async handleRegister(event) {
        event.preventDefault();
        console.log('Registration started');
        
        // Reset error messages
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        console.log('Form values:', { username, email, password, confirmPassword });
        
        let isValid = true;
        
        // Validate username
        if (username.length < 2) {
            document.getElementById('usernameError').textContent = 'Username must be at least 2 characters long';
            document.getElementById('username').classList.add('error');
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
            console.log('Form validation failed');
            return;
        }

        // Disable button and show loading state
        const button = document.getElementById('registerButton');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
        
        try {
            console.log('Sending registration request to:', `${API_BASE_URL}/auth/register`);
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store user data
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect to appropriate page
            window.location.href = this.getRedirectUrl();
        } catch (error) {
            console.error('Registration error:', error);
            // Show error message
            const errorMessage = error.message || 'Registration failed. Please try again.';
            document.getElementById('emailError').textContent = errorMessage;
            document.getElementById('email').classList.add('error');
            
            // Reset button
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-user-plus"></i> Register';
        }
    },

    // Handle login
    async handleLogin(event) {
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
        
        try {
            // Send login request
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store user data and token
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            
            console.log('Login successful, user role:', data.user.role);
            
            // Get redirect URL from query parameter or default
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect');
            
            // If there's a valid redirect parameter, use it
            if (redirectTo && ['profile.html', 'food.html', 'admin.html', 'index.html'].includes(redirectTo)) {
                window.location.href = redirectTo;
                return;
            }
            
            // Otherwise, redirect based on role
            if (data.user.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            // Show error message
            const errorMessage = error.message || 'Login failed. Please try again.';
            document.getElementById('loginEmailError').textContent = errorMessage;
            document.getElementById('loginEmail').classList.add('error');
            
            // Reset button
            button.disabled = false;
            button.innerHTML = 'Login';
        }
    },

    // Handle logout
    logout() {
        // Send logout request to clear server-side cookie
        fetch(`${API_BASE_URL}/auth/logout`, {
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
    },

    // Check if user has admin access
    async checkAdminAccess(event) {
        if (event) {
        event.preventDefault();
        }
        
        const user = this.getCurrentUser();
        console.log('Checking admin access for user:', user);
        
        if (!user) {
            console.log('No user logged in, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        if (user.role !== 'admin') {
            console.log('User is not admin, redirecting to home');
            window.location.href = 'index.html';
            return;
        }
        
        console.log('User is admin, redirecting to admin page');
        window.location.href = 'admin.html';
    },

    // Initialize event listeners
    initializeEventListeners() {
        console.log('Initializing event listeners...');
        
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

        // Check if we're on the profile page
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }

        // Check if we're on the admin page
        const adminLinks = document.querySelectorAll('[data-admin]');
        if (adminLinks.length > 0) {
            adminLinks.forEach(link => {
                link.addEventListener('click', this.checkAdminAccess.bind(this));
            });
        }

        // Update auth status immediately
        this.checkAuthStatus();

        // Update auth status when storage changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'user') {
                this.checkAuthStatus();
            }
        });

        console.log('Event listeners initialized');
    },

    // Show error message
    showError(message) {
        console.error('Error:', message);
        const errorModal = document.getElementById('errorModal');
        if (errorModal) {
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            const modal = new bootstrap.Modal(errorModal);
            modal.show();
        } else {
            alert(message);
        }
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
    
    // Make auth object available globally
    window.auth = auth;
    
    // Initialize auth
    auth.init();
});