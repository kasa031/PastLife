// Login page functionality
import { loginUser, registerUser, updateNavigation } from './auth.js';

let isLoginMode = true;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    
    // Setup forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    const messageDiv = document.getElementById('loginMessage');
    
    if (!username || !password) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    if (loginUser(username, password)) {
        showMessage(messageDiv, 'Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    } else {
        showMessage(messageDiv, 'Invalid username or password', 'error');
    }
}

// Handle register
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    const messageDiv = document.getElementById('registerMessage');
    
    if (!username || !email || !password || !passwordConfirm) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showMessage(messageDiv, 'Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage(messageDiv, 'Password must be at least 6 characters', 'error');
        return;
    }
    
    const result = registerUser(username, email, password);
    
    if (result.success) {
        showMessage(messageDiv, 'Registration successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    } else {
        showMessage(messageDiv, result.message || 'Registration failed', 'error');
    }
}

// Show message
function showMessage(container, message, type) {
    container.innerHTML = `<div class="${type === 'error' ? 'error-message' : 'success-message'}">${message}</div>`;
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
}

// Show register form
window.showRegister = function() {
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('registerBox').classList.remove('hidden');
    isLoginMode = false;
};

// Show login form
window.showLogin = function() {
    document.getElementById('registerBox').classList.add('hidden');
    document.getElementById('loginBox').classList.remove('hidden');
    isLoginMode = true;
};
