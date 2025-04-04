function login() {
    window.location.href = './register/index.html';
}

// Attach the login function to the button
document.getElementById('login')?.addEventListener('click', login);

function digIn() {
    document.getElementById('digIn')?.addEventListener('click', () => {
        window.location.href = 'food.html';
    });
}

// Attach the digIn function to the button
digIn();