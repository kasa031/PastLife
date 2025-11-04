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

// Create person card HTML
function createPersonCard(person) {
    const photo = person.photo || 'assets/images/oldphoto2.jpg';
    const tags = person.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    return `
        <div class="person-card" onclick="viewPerson('${person.id}')">
            <img src="${photo}" alt="${person.name}" class="person-card-image" onerror="this.src='assets/images/oldphoto2.jpg'">
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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadRecentPersons();
    updateNavigation();
    preloadHeroImage(); // Preload hero image
    
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
