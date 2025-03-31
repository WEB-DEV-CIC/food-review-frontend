/* JavaScript File: script.js */

function toggleForms() {
    document.getElementById('register-container').classList.toggle('hidden');
    document.getElementById('login-container').classList.toggle('hidden');
}

function register() {
    let fullName = document.getElementById('full-name').value;
    let email = document.getElementById('reg-email').value;
    let username = document.getElementById('reg-username').value;
    let password = document.getElementById('reg-password').value;
    
    if (fullName === "" || email === "" || username === "" || password === "") {
        alert("Please fill in all fields");
        return;
    }
    
    if (localStorage.getItem(username)) {
        alert("User already exists");
    } else {
        let userData = { fullName, email, password };
        localStorage.setItem(username, JSON.stringify(userData));
        alert("Registration successful");
        toggleForms();
    }
}

function login() {
    let username = document.getElementById('login-username').value;
    let password = document.getElementById('login-password').value;
    
    let userData = JSON.parse(localStorage.getItem(username));
    if (userData && userData.password === password) {
        alert("Login successful");
    } else {
        alert("Invalid credentials");
    }
}
