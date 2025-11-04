// Login page functionality
import { loginUser, registerUser, updateNavigation } from './auth.js';

// Helper to access localStorage (for checking if user exists)
function initUsers() {
    if (!localStorage.getItem('pastlife_users')) {
        localStorage.setItem('pastlife_users', JSON.stringify([]));
    }
}

let isLoginMode = true;

// Initialize page
// Dark mode functions (shared)
window.toggleDarkMode = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pastlife_theme', newTheme);
    
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        toggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        toggle.title = newTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
    });
};

function loadTheme() {
    const savedTheme = localStorage.getItem('pastlife_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        toggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        toggle.title = savedTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    updateNavigation();
    
    // Setup forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

// Handle login
function handleLogin(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    const messageDiv = document.getElementById('loginMessage');
    
    if (!username || !password) {
        showMessage(messageDiv, 'Please fill in all fields', 'error');
        return;
    }
    
    // Check if user exists in database
    initUsers();
    const users = JSON.parse(localStorage.getItem('pastlife_users') || '[]');
    const userExists = users.some(u => u.username === username || u.email === username);
    
    if (loginUser(username, password)) {
        showMessage(messageDiv, 'Login successful! Redirecting...', 'success');
        // Don't clear fields on success - let user see they logged in
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1000);
    } else {
        // Give more helpful error message
        if (!userExists) {
            showMessage(messageDiv, 'User not found. Please register first or check your username/email.', 'error');
        } else {
            showMessage(messageDiv, 'Invalid password. Please try again.', 'error');
        }
        // Only clear password field on error, keep username for retry
        passwordInput.value = '';
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
