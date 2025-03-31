document.addEventListener('DOMContentLoaded', () => {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('#navbarNavAltMarkup');

    navbarToggler.addEventListener('click', () => {
        navbarCollapse.classList.toggle('show');
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992) {
            navbarCollapse.classList.remove('show');
        }
    });
});

function login() {
    window.location.href = 'login.html';
}

// Attach the login function to the button
document.getElementById('login')?.addEventListener('click', login);

function digIn() {
    document.getElementById('digIn')?.addEventListener('click', () => {
        window.location.href = 'foodlist.html';
    });
}

// Attach the digIn function to the button
digIn();