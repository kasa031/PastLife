// Person detail page functionality
import { getPersonById, getCommentsForPerson, addComment, deleteComment } from './data.js';
import { getCurrentUser, isLoggedIn, updateNavigation } from './auth.js';
import { copyToClipboard, showMessage, formatDate } from './utils.js';

let currentPersonId = null;

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Setup comment form
    const commentForm = document.getElementById('commentFormSection');
    if (!isLoggedIn()) {
        commentForm.innerHTML = '<p style="text-align: center; color: var(--gray-dark);">Please <a href="login.html">login</a> to leave comments.</p>';
        const favoriteBtn = document.getElementById('favoriteBtn');
        if (favoriteBtn) favoriteBtn.style.display = 'none';
    }
});

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

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
