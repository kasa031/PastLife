// Main page functionality
import { getAllPersons } from './data.js';
import { updateNavigation, getCurrentUser } from './auth.js';
import { escapeHtml, initKeyboardShortcuts, enhanceKeyboardNavigation } from './utils.js';
import { initLazyLoading, refreshLazyLoading } from './lazy-load.js';
import { loadTheme, toggleDarkMode } from './theme.js';

// Load recent persons
function loadRecentPersons() {
    const currentUser = getCurrentUser();
    let persons = getAllPersons();
    
    // Filter out private persons that don't belong to current user
    if (currentUser) {
        persons = persons.filter(person => 
            !person.isPrivate || person.createdBy === currentUser.username
        );
    } else {
        // If not logged in, hide all private persons
        persons = persons.filter(person => !person.isPrivate);
    }
    
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

// Create person card HTML with lazy loading and skeleton
function createPersonCard(person) {
    const photo = person.photo || 'assets/images/oldphoto2.jpg';
    const tags = person.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const privateIndicator = person.isPrivate ? '<span style="color: var(--turquoise-primary); font-size: 1.2rem; margin-left: 0.5rem;" title="Privat - kun synlig for deg">🔒</span>' : '';
    
    return `
        <div class="person-card" onclick="viewPerson('${person.id}')">
            <img src="assets/images/oldphoto2.jpg" data-src="${photo}" alt="${person.name}" class="person-card-image lazy-load loading" onerror="this.src='assets/images/oldphoto2.jpg'; this.classList.remove('loading');" onload="this.classList.remove('loading');">
            <div class="person-card-info">
                <h3>${escapeHtml(person.name)}${privateIndicator}</h3>
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
window.toggleMobileMenu = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const menu = document.getElementById('navMenu');
    const toggle = document.querySelector('.menu-toggle');
    if (menu && toggle) {
        const isActive = menu.classList.toggle('active');
        toggle.classList.toggle('active');
        // Update aria-expanded for accessibility
        toggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    }
};

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('navMenu');
    const toggle = document.querySelector('.menu-toggle');
    if (menu && toggle && !menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
    }
});

// Dark mode functions imported from theme.js

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize lazy loading
    initLazyLoading();
    loadTheme(); // Load saved theme
    loadRecentPersons();
    updateNavigation();
    preloadHeroImage(); // Preload hero image
    initKeyboardShortcuts(); // Initialize keyboard shortcuts help
    enhanceKeyboardNavigation(); // Enhance keyboard navigation
    // Refresh lazy loading after content is loaded
    setTimeout(() => refreshLazyLoading(), 100);
    
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
