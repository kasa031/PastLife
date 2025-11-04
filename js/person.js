// Person detail page functionality
import { getPersonById, getCommentsForPerson, addComment, deleteComment } from './data.js';
import { getCurrentUser, isLoggedIn, updateNavigation } from './auth.js';
import { copyToClipboard, showMessage, formatDate } from './utils.js';

let currentPersonId = null;

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
    // Check for saved preference first
    let savedTheme = localStorage.getItem('pastlife_theme');
    
    // If no saved preference, detect system preference
    if (!savedTheme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            savedTheme = 'dark';
        } else {
            savedTheme = 'light';
        }
    }
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        toggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
        toggle.title = savedTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
    });
    
    // Listen for system theme changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('pastlife_theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                toggles.forEach(toggle => {
                    toggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
                    toggle.title = newTheme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
                });
            }
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    updateNavigation();
    
    // Get person ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPersonId = urlParams.get('id');
    
    if (!currentPersonId) {
        document.getElementById('personDetailContent').innerHTML = 
            '<p style="text-align: center; padding: 2rem;">Person not found</p>';
        return;
    }
    
    loadPersonDetails();
    loadComments();
    updateFavoriteButton();
    checkPersonInTree();
    
    // Setup comment form
    const commentForm = document.getElementById('commentFormSection');
    if (!isLoggedIn()) {
        commentForm.innerHTML = '<p style="text-align: center; color: var(--gray-dark);">Please <a href="login.html">login</a> to leave comments.</p>';
        const favoriteBtn = document.getElementById('favoriteBtn');
        const addToTreeBtn = document.getElementById('addToTreeBtn');
        if (favoriteBtn) favoriteBtn.style.display = 'none';
        if (addToTreeBtn) addToTreeBtn.style.display = 'none';
    }
});

// Check if person is in family tree
function checkPersonInTree() {
    if (!isLoggedIn()) return;
    
    // Use same key as family-tree.js
    const user = getCurrentUser();
    const treeDataKey = user ? `pastlife_tree_${user.username}` : null;
    if (!treeDataKey) return false;
    
    const savedTree = localStorage.getItem(treeDataKey);
    
    if (savedTree) {
        try {
            const allTreePersons = JSON.parse(savedTree);
            
            // Check if current person exists in tree (by name match)
            const person = getPersonById(currentPersonId);
            if (person) {
                const inTree = allTreePersons.some(p => 
                    p.name === person.name && 
                    (!person.birthYear || !p.birthYear || p.birthYear === person.birthYear)
                );
                
                const viewBtn = document.getElementById('viewInTreeBtn');
                if (viewBtn) {
                    if (inTree) {
                        viewBtn.style.display = 'block';
                    } else {
                        viewBtn.style.display = 'none';
                    }
                }
            }
        } catch (e) {
            console.error('Error checking tree:', e);
        }
    }
}

// View person in family tree
window.viewInFamilyTree = function() {
    window.location.href = 'family-tree.html?highlight=' + encodeURIComponent(currentPersonId);
};

// Add person to family tree
window.addToFamilyTree = function() {
    if (!isLoggedIn()) {
        showMessage('Please login to add to family tree', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    const person = getPersonById(currentPersonId);
    if (!person) return;
    
    // Get existing tree data
    // Use same key as family-tree.js
    const user = getCurrentUser();
    const treeDataKey = user ? `pastlife_tree_${user.username}` : null;
    if (!treeDataKey) return false;
    
    const savedTree = localStorage.getItem(treeDataKey);
    let treeData = { persons: [], relationships: [] };
    
    if (savedTree) {
        try {
            allTreePersons = JSON.parse(savedTree);
        } catch (e) {
            console.error('Error loading tree:', e);
            allTreePersons = [];
        }
    }
    
    // Check if already in tree
    const alreadyInTree = allTreePersons.some(p => 
        p.name === person.name && 
        (!person.birthYear || !p.birthYear || p.birthYear === person.birthYear)
    );
    
    if (alreadyInTree) {
        showMessage('This person is already in your family tree', 'info');
        setTimeout(() => {
            window.location.href = 'family-tree.html';
        }, 1500);
        return;
    }
    
    // Add person to tree
    const treePerson = {
        ...person,
        id: person.id || `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: 0,
        y: 0,
        generation: 0 // Default generation, can be adjusted
    };
    
    allTreePersons.push(treePerson);
    
    // Save tree
    localStorage.setItem(treeDataKey, JSON.stringify(allTreePersons));
    
    showMessage('Person added to family tree! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'family-tree.html';
    }, 1500);
};

// Load person details
function loadPersonDetails() {
    const person = getPersonById(currentPersonId);
    
    if (!person) {
        document.getElementById('personDetailContent').innerHTML = 
            '<p style="text-align: center; padding: 2rem;">Person not found</p>';
        return;
    }
    
    const photo = person.photo || 'assets/images/oldphoto2.jpg';
    const tags = person.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    const html = `
        <div class="person-detail-header">
            <img src="${photo}" alt="${escapeHtml(person.name)}" class="person-detail-image" onerror="this.src='assets/images/oldphoto2.jpg'">
            <div class="person-detail-info">
                <h1>${escapeHtml(person.name)}</h1>
                ${person.birthYear ? `<p><span class="info-label">Born:</span> ${person.birthYear}</p>` : ''}
                ${person.deathYear ? `<p><span class="info-label">Died:</span> ${person.deathYear}</p>` : ''}
                ${person.birthPlace ? `<p><span class="info-label">Birth Place:</span> ${escapeHtml(person.birthPlace)}</p>` : ''}
                ${person.deathPlace ? `<p><span class="info-label">Death Place:</span> ${escapeHtml(person.deathPlace)}</p>` : ''}
                ${person.country ? `<p><span class="info-label">Country:</span> ${escapeHtml(person.country)}</p>` : ''}
                ${person.city ? `<p><span class="info-label">City:</span> ${escapeHtml(person.city)}</p>` : ''}
                ${person.description ? `<div style="margin-top: 1.5rem;"><p><span class="info-label">About:</span></p><p>${escapeHtml(person.description)}</p></div>` : ''}
                <div class="person-tags" style="margin-top: 1.5rem;">${tags}</div>
                <p style="margin-top: 1.5rem; color: var(--gray-dark); font-size: 0.9rem;">
                    <span class="info-label">Added by:</span> ${escapeHtml(person.createdBy)}
                </p>
            </div>
        </div>
    `;
    
    document.getElementById('personDetailContent').innerHTML = html;
}

// Load comments
function loadComments() {
    const comments = getCommentsForPerson(currentPersonId);
    const container = document.getElementById('commentsContainer');
    
    if (comments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-dark); padding: 2rem;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    container.innerHTML = comments.map(comment => createCommentHTML(comment)).join('');
}

// Create comment HTML
function createCommentHTML(comment) {
    const date = formatDate(comment.createdAt);
    const user = getCurrentUser();
    const isOwner = user && comment.author === user.username;
    
    return `
        <div class="comment">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div class="comment-author">${escapeHtml(comment.author)}</div>
                    <div class="comment-date">${date}</div>
                </div>
                ${isOwner ? `
                    <button class="btn-delete" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick="deleteCommentConfirm('${comment.id}')">Delete</button>
                ` : ''}
            </div>
            <div class="comment-text">${escapeHtml(comment.text)}</div>
        </div>
    `;
}

// Delete comment with confirmation
window.deleteCommentConfirm = function(commentId) {
    if (confirm('Are you sure you want to delete this comment?')) {
        deleteComment(commentId);
        showMessage('Comment deleted', 'success');
        loadComments();
    }
};

// Share person (smart - uses native share if available, otherwise copies)
window.sharePerson = function() {
    const url = window.location.href;
    const personName = document.querySelector('.person-detail-info h1')?.textContent || 'Ancestor';
    
    if (navigator.share) {
        navigator.share({
            title: personName,
            text: `Check out ${personName} on F³ - Family Tree`,
            url: url
        }).catch(() => {
            copyToClipboard(url);
            showMessage('Link copied to clipboard!', 'success');
        });
    } else {
        copyToClipboard(url);
        showMessage('Link copied to clipboard!', 'success');
    }
};

// Toggle favorite
window.toggleFavorite = function() {
    if (!isLoggedIn()) {
        showMessage('Please login to add favorites', 'error');
        return;
    }
    
    const user = getCurrentUser();
    const favoritesKey = `pastlife_favorites_${user.username}`;
    let favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    const btn = document.getElementById('favoriteBtn');
    
    if (favorites.includes(currentPersonId)) {
        favorites = favorites.filter(id => id !== currentPersonId);
        btn.textContent = '⭐ Favorite';
        btn.title = 'Add to favorites';
        showMessage('Removed from favorites', 'info');
    } else {
        favorites.push(currentPersonId);
        btn.textContent = '★ Favorited';
        btn.title = 'Remove from favorites';
        showMessage('Added to favorites!', 'success');
    }
    
    localStorage.setItem(favoritesKey, JSON.stringify(favorites));
    updateFavoriteButton();
};

// Update favorite button state
function updateFavoriteButton() {
    if (!isLoggedIn()) return;
    
    const user = getCurrentUser();
    const favoritesKey = `pastlife_favorites_${user.username}`;
    const favorites = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    const btn = document.getElementById('favoriteBtn');
    
    if (btn && favorites.includes(currentPersonId)) {
        btn.textContent = '★ Favorited';
        btn.title = 'Remove from favorites';
    }
}

// Submit comment
window.submitComment = function() {
    if (!isLoggedIn()) {
        showMessage('Please login to leave comments', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    const text = document.getElementById('commentText').value.trim();
    
    if (!text) {
        showMessage('Please enter a comment', 'error');
        return;
    }
    
    const user = getCurrentUser();
    addComment(currentPersonId, text, user.username);
    
    // Clear textarea
    document.getElementById('commentText').value = '';
    
    // Show success and reload comments
    showMessage('Comment posted successfully!', 'success');
    loadComments();
};

// Get related persons (same last name, tags, or places)
function getRelatedPersons(person) {
    const allPersons = getAllPersons();
    const personLastName = person.name.split(' ').pop()?.toLowerCase() || '';
    
    return allPersons.filter(p => {
        if (p.id === person.id) return false; // Exclude self
        
        // Same last name
        const pLastName = p.name.split(' ').pop()?.toLowerCase() || '';
        if (personLastName && pLastName && personLastName === pLastName) return true;
        
        // Same tags (excluding morsside/farsside)
        const personTags = (person.tags || []).filter(t => t !== 'morsside' && t !== 'farsside');
        const pTags = (p.tags || []).filter(t => t !== 'morsside' && t !== 'farsside');
        if (personTags.length > 0 && pTags.some(t => personTags.includes(t))) return true;
        
        // Same city or country
        if (person.city && p.city && person.city.toLowerCase() === p.city.toLowerCase()) return true;
        if (person.country && p.country && person.country.toLowerCase() === p.country.toLowerCase()) return true;
        
        return false;
    }).slice(0, 10); // Limit to 10
}

// Get all persons (helper)
function getAllPersons() {
    const personsKey = 'pastlife_persons';
    return JSON.parse(localStorage.getItem(personsKey) || '[]');
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
