// Authentication and user management
export const AUTH_KEY = 'pastlife_auth';
export const USERS_KEY = 'pastlife_users';

// Initialize users if not exists
function initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
}

// Get current user
export function getCurrentUser() {
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth) {
        return JSON.parse(auth);
    }
    return null;
}

// Check if user is logged in
export function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Login user
export function loginUser(username, password) {
    initUsers();
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify({ username: user.username, email: user.email }));
        return true;
    }
    return false;
}

// Register user
export function registerUser(username, email, password) {
    initUsers();
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
        return { success: false, message: 'Username already exists' };
    }
    
    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already exists' };
    }
    
    const newUser = {
        username,
        email,
        password, // In production, hash this password
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(AUTH_KEY, JSON.stringify({ username, email }));
    
    return { success: true };
}

// Logout user
export function logoutUser() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
}

// Update navigation based on auth status
export function updateNavigation() {
    const isLogged = isLoggedIn();
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const profileLink = document.getElementById('profileLink');
    
    if (loginLink) loginLink.style.display = isLogged ? 'none' : 'block';
    if (logoutLink) {
        logoutLink.style.display = isLogged ? 'block' : 'none';
        logoutLink.classList.toggle('hidden', !isLogged);
        if (isLogged) {
            logoutLink.onclick = (e) => {
                e.preventDefault();
                logoutUser();
            };
        }
    }
    if (profileLink) profileLink.style.display = isLogged ? 'block' : 'none';
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNavigation);
} else {
    updateNavigation();
}
