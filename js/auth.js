// Auth state management
const auth = {
    isAuthenticated: false,
    user: null,

    init() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            this.isAuthenticated = true;
            this.user = JSON.parse(user);
            this.updateUI();
        }
    },

    async login(email, password) {
        try {
            const response = await window.api.auth.login(email, password);
            this.setSession(response.token, response.user);
            return response;
        } catch (error) {
            console.error('Login error:', error.message);
            throw new Error('Failed to login. Please check your credentials.');
        }
    },

    async register(name, email, password) {
        try {
            const response = await window.api.auth.register(name, email, password);
            this.setSession(response.token, response.user);
            return response;
        } catch (error) {
            console.error('Registration error:', error.message);
            throw new Error('Failed to register. Please try again.');
        }
    },

    async logout() {
        try {
            await window.api.auth.logout();
            this.clearSession();
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    setSession(token, user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.isAuthenticated = true;
        this.user = user;
        this.updateUI();
    },

    clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isAuthenticated = false;
        this.user = null;
        this.updateUI();
    },

    updateUI() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const logoutBtn = document.getElementById('logoutBtn');

        if (!loginBtn || !registerBtn || !logoutBtn) {
            console.warn('UI elements for auth not found.');
            return;
        }

        if (this.isAuthenticated) {
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'block';
        } else {
            loginBtn.style.display = 'block';
            registerBtn.style.display = 'block';
            logoutBtn.style.display = 'none';
        }
    }
};

// Modal handling
const modal = {
    loginModal: document.getElementById('loginModal'),
    registerModal: document.getElementById('registerModal'),
    closeButtons: document.getElementsByClassName('close'),

    init() {
        // Add event listeners for modal triggers
        document.getElementById('loginBtn').addEventListener('click', () => this.show('login'));
        document.getElementById('registerBtn').addEventListener('click', () => this.show('register'));
        document.getElementById('logoutBtn').addEventListener('click', () => auth.logout());

        // Add event listeners for close buttons
        Array.from(this.closeButtons).forEach(button => {
            button.addEventListener('click', () => this.hideAll());
        });

        // Close modals when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal')) {
                this.hideAll();
            }
        });

        // Handle form submissions
        document.getElementById('loginForm').addEventListener('submit', this.handleLogin.bind(this));
        document.getElementById('registerForm').addEventListener('submit', this.handleRegister.bind(this));
    },

    show(type) {
        if (type === 'login') {
            this.loginModal.style.display = 'block';
        } else if (type === 'register') {
            this.registerModal.style.display = 'block';
        }
    },

    hideAll() {
        this.loginModal.style.display = 'none';
        this.registerModal.style.display = 'none';
    },

    async handleLogin(event) {
        event.preventDefault();
        const form = event.target;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            await auth.login(email, password);
            this.hideAll();
            form.reset();
        } catch (error) {
            alert(error.message);
        }
    },

    async handleRegister(event) {
        event.preventDefault();
        const form = event.target;
        const name = form.querySelector('input[type="text"]').value;
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;

        try {
            await auth.register(name, email, password);
            this.hideAll();
            form.reset();
        } catch (error) {
            alert(error.message);
        }
    }
};

// Initialize auth and modal when the page loads
document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    modal.init();
});