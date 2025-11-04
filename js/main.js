// Main page functionality
import { getAllPersons } from './data.js';
import { updateNavigation } from './auth.js';
import { escapeHtml } from './utils.js';

// Load recent persons
function loadRecentPersons() {
    const persons = getAllPersons();
    const recentPersons = persons
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    
    const container = document.getElementById('recentPersons');
    if (!container) return;
    
    if (recentPersons.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-dark);">No ancestors added yet. Be the first to share!</p>';
        return;
    }
    
    container.innerHTML = recentPersons.map(person => createPersonCard(person)).join('');
}

// Create person card HTML with lazy loading
function createPersonCard(person) {
    const photo = person.photo || 'assets/images/oldphoto2.jpg';
    const tags = person.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    return `
        <div class="person-card" onclick="viewPerson('${person.id}')">
            <img src="assets/images/oldphoto2.jpg" data-src="${photo}" alt="${person.name}" class="person-card-image lazy-load" onerror="this.src='assets/images/oldphoto2.jpg'">
            <div class="person-card-info">
                <h3>${escapeHtml(person.name)}</h3>
                ${person.birthYear ? `<p><span class="info-label">Born:</span> ${person.birthYear}</p>` : ''}
                ${person.birthPlace ? `<p><span class="info-label">From:</span> ${escapeHtml(person.birthPlace)}</p>` : ''}
                ${person.country ? `<p><span class="info-label">Country:</span> ${escapeHtml(person.country)}</p>` : ''}
                <div class="person-tags">${tags}</div>
            </div>
        </div>
    `;
}

// Lazy load images
function setupLazyLoading() {
    const lazyImages = document.querySelectorAll('img.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy-load');
        });
    }
}

// View person details
window.viewPerson = function(id) {
    window.location.href = `person.html?id=${id}`;
}

// Handle hero search
window.handleHeroSearch = function() {
    const searchTerm = document.getElementById('heroSearch').value.trim();
    if (searchTerm) {
        // Pre-fill name field in search page
        window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
    } else {
        // Just go to search page
        window.location.href = 'search.html';
    }
}


// Preload hero background image to prevent FOUC
function preloadHeroImage() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const img = new Image();
    img.onload = function() {
        hero.classList.add('image-loaded');
    };
    img.src = 'assets/images/doors.jpg';
}

// Toggle mobile menu
window.toggleMobileMenu = function() {
    const menu = document.getElementById('navMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
};

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('navMenu');
    const toggle = document.querySelector('.menu-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
    }
});

// Dark mode toggle
window.toggleDarkMode = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pastlife_theme', newTheme);
    
    // Update toggle button
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        toggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        toggle.title = newTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
    });
};

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('pastlife_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update toggle buttons
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        toggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        toggle.title = savedTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadTheme(); // Load saved theme
    loadRecentPersons();
    updateNavigation();
    preloadHeroImage(); // Preload hero image
    setupLazyLoading(); // Setup lazy loading for images
    
    // Handle Enter key in hero search
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) {
        heroSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleHeroSearch();
            }
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Esc key - close any open modals/messages
        if (e.key === 'Escape') {
            const message = document.getElementById('globalMessage');
            if (message) {
                message.classList.remove('show');
                setTimeout(() => message.remove(), 300);
            }
        }
        
        // Ctrl/Cmd + K for quick search (focus search box)
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (heroSearch) {
                heroSearch.focus();
            }
        }
    });
});
