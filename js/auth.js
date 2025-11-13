// Authentication and user management
export const AUTH_KEY = 'pastlife_auth';
export const USERS_KEY = 'pastlife_users';

// Initialize users if not exists
function initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
}

// Hash password using Web Crypto API (SHA-256 with salt)
async function hashPassword(password, salt = null) {
    // Generate salt if not provided
    if (!salt) {
        const saltArray = new Uint8Array(16);
        crypto.getRandomValues(saltArray);
        salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Convert password and salt to ArrayBuffer
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password + salt);
    
    // Hash with SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return { hash: hashHex, salt: salt };
}

// Verify password against stored hash
async function verifyPassword(password, storedHash, salt) {
    const { hash } = await hashPassword(password, salt);
    return hash === storedHash;
}

// Migrate existing users with plaintext passwords to hashed passwords
async function migrateUserPasswords() {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    let needsMigration = false;
    
    for (const user of users) {
        // Check if password is already hashed (has hash and salt properties)
        if (!user.passwordHash || !user.salt) {
            needsMigration = true;
            // Hash the plaintext password
            const { hash, salt } = await hashPassword(user.password);
            user.passwordHash = hash;
            user.salt = salt;
            // Remove plaintext password
            delete user.password;
        }
    }
    
    if (needsMigration) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
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

// Login user (accepts both username and email)
export async function loginUser(usernameOrEmail, password) {
    initUsers();
    await migrateUserPasswords(); // Ensure all passwords are hashed
    
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    // Try to find user by username OR email
    const user = users.find(u => 
        u.username === usernameOrEmail || u.email === usernameOrEmail
    );
    
    if (!user) {
        return false;
    }
    
    // Verify password - handle both old plaintext and new hashed passwords
    let passwordValid = false;
    
    if (user.passwordHash && user.salt) {
        // New hashed password
        passwordValid = await verifyPassword(password, user.passwordHash, user.salt);
    } else if (user.password) {
        // Old plaintext password - verify it matches, then migrate
        if (user.password === password) {
            // Password matches, migrate to hashed version
            const { hash, salt } = await hashPassword(password);
            user.passwordHash = hash;
            user.salt = salt;
            delete user.password;
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            passwordValid = true;
        } else {
            // Password doesn't match
            passwordValid = false;
        }
    }
    
    if (passwordValid) {
        localStorage.setItem(AUTH_KEY, JSON.stringify({ username: user.username, email: user.email }));
        return true;
    }
    
    return false;
}

// Register user
export async function registerUser(username, email, password) {
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
    
    // Hash the password
    const { hash, salt } = await hashPassword(password);
    
    const newUser = {
        username,
        email,
        passwordHash: hash,
        salt: salt,
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
// Check for notifications and show badge
export function checkAndShowNotifications() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Get user's persons
    const personsKey = 'pastlife_persons';
    const allPersons = JSON.parse(localStorage.getItem(personsKey) || '[]');
    const myPersons = allPersons.filter(p => p.createdBy === user.username);
    const lastCheckKey = `pastlife_notifications_lastcheck_${user.username}`;
    const lastCheck = localStorage.getItem(lastCheckKey);
    
    // Get all comments
    const commentsKey = 'pastlife_comments';
    const allComments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
    
    // Find new comments on user's persons since last check
    const myPersonIds = myPersons.map(p => p.id);
    const newComments = allComments.filter(comment => {
        if (!myPersonIds.includes(comment.personId)) return false;
        if (comment.author === user.username) return false;
        
        if (lastCheck) {
            return new Date(comment.createdAt) > new Date(lastCheck);
        }
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(comment.createdAt) > oneDayAgo;
    });
    
    // Get @mention notifications
    const notificationsKey = 'pastlife_notifications';
    const allNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    const userNotifications = allNotifications.filter(n => {
        if (n.userId !== user.username) return false;
        if (n.read) return false;
        
        if (lastCheck) {
            return new Date(n.createdAt) > new Date(lastCheck);
        }
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(n.createdAt) > oneDayAgo;
    });
    
    const totalCount = newComments.length + userNotifications.length;
    
    if (totalCount > 0) {
        const profileLink = document.getElementById('profileLink');
        if (profileLink) {
            // Remove existing badge
            const existing = profileLink.querySelector('#notificationBadge');
            if (existing) existing.remove();
            
            const badge = document.createElement('span');
            badge.id = 'notificationBadge';
            badge.textContent = totalCount > 9 ? '9+' : totalCount;
            badge.style.cssText = 'position: absolute; background: #c62828; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; margin-left: -10px; margin-top: -5px; z-index: 1000;';
            profileLink.style.position = 'relative';
            profileLink.appendChild(badge);
        }
    }
}

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
