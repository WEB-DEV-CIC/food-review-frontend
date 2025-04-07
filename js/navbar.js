// Load navbar
document.addEventListener('DOMContentLoaded', () => {
    fetch('components/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-placeholder').innerHTML = html;
            // Check auth status after navbar is loaded
            if (typeof auth !== 'undefined') {
                auth.checkAuthStatus();
            }
        })
        .catch(error => console.error('Error loading navbar:', error));
}); 