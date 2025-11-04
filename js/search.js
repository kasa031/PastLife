// Search page functionality
import { searchPersons } from './data.js';
import { updateNavigation } from './auth.js';
import { showMessage } from './utils.js';

let currentResults = [];

// Save search history
function saveSearchHistory(filters) {
    const historyKey = 'pastlife_search_history';
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Create search string
    const searchStr = Object.entries(filters)
        .filter(([k, v]) => v && v.trim())
        .map(([k, v]) => `${k}:${v}`)
        .join(', ');
    
    if (searchStr) {
        // Remove if exists, add to front
        history = history.filter(h => h !== searchStr);
        history.unshift(searchStr);
        // Keep only last 10
        history = history.slice(0, 10);
        localStorage.setItem(historyKey, JSON.stringify(history));
    }
}

// Perform search
function performSearch() {
    const filters = {
        name: document.getElementById('searchName').value.trim(),
        country: document.getElementById('searchCountry').value.trim(),
        city: document.getElementById('searchCity').value.trim(),
        yearFrom: document.getElementById('searchYearFrom').value.trim(),
        yearTo: document.getElementById('searchYearTo').value.trim(),
        tags: document.getElementById('searchTags').value.trim(),
        description: document.getElementById('searchDescription').value.trim()
    };
    
    // Save to history
    saveSearchHistory(filters);
    
    // Reload history dropdown
    loadSearchHistory();
    
    const results = searchPersons(filters);
    displaySearchResults(results);
}

// Clear all filters
window.clearAllFilters = function() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchCountry').value = '';
    document.getElementById('searchCity').value = '';
    document.getElementById('searchYearFrom').value = '';
    document.getElementById('searchYearTo').value = '';
    document.getElementById('searchTags').value = '';
    document.getElementById('searchDescription').value = '';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('resultsTitle').textContent = '';
    showMessage('All filters cleared', 'info');
}

// Display search results
function displaySearchResults(results) {
    const container = document.getElementById('searchResults');
    const title = document.getElementById('resultsTitle');
    
    if (!container || !title) return;
    
    currentResults = results;
    
    if (results.length === 0) {
        title.textContent = 'No results found';
        container.innerHTML = '<p style="text-align: center; color: var(--gray-dark); padding: 2rem;">Try adjusting your search criteria.</p>';
        return;
    }
    
    title.textContent = `Found ${results.length} result${results.length !== 1 ? 's' : ''}`;
    applySorting();
}

// Apply sorting
window.applySorting = function() {
    const sortBy = document.getElementById('sortBy').value;
    let sorted = [...currentResults];
    
    switch(sortBy) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'name-asc':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'year-asc':
            sorted.sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0));
            break;
        case 'year-desc':
            sorted.sort((a, b) => (b.birthYear || 9999) - (a.birthYear || 9999));
            break;
    }
    
    const container = document.getElementById('searchResults');
    container.innerHTML = sorted.map(person => createPersonCard(person)).join('');
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
                ${person.deathYear ? `<p><span class="info-label">Died:</span> ${person.deathYear}</p>` : ''}
                ${person.birthPlace ? `<p><span class="info-label">From:</span> ${escapeHtml(person.birthPlace)}</p>` : ''}
                ${person.country ? `<p><span class="info-label">Country:</span> ${escapeHtml(person.country)}</p>` : ''}
                ${person.city ? `<p><span class="info-label">City:</span> ${escapeHtml(person.city)}</p>` : ''}
                <div class="person-tags">${tags}</div>
            </div>
        </div>
    `;
}

// View person details
function viewPerson(id) {
    window.location.href = `person.html?id=${id}`;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Check URL parameters for search query
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    if (query) {
        document.getElementById('searchName').value = query;
        performSearch();
    }
}

// Make functions globally available
window.performSearch = performSearch;
window.viewPerson = viewPerson;

// Autocomplete for name search
let selectedSuggestionIndex = -1;
let suggestions = [];

function setupAutocomplete() {
    const nameInput = document.getElementById('searchName');
    const suggestionsDiv = document.getElementById('nameSuggestions');
    
    if (!nameInput || !suggestionsDiv) return;
    
    nameInput.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        
        if (value.length < 2) {
            suggestionsDiv.classList.remove('show');
            suggestions = [];
            return;
        }
        
        // Get all unique names from persons
        const allPersons = getAllPersons();
        const uniqueNames = [...new Set(allPersons.map(p => p.name))];
        
        // Filter names that match (fuzzy)
        suggestions = uniqueNames
            .filter(name => {
                const nameLower = name.toLowerCase();
                const valueLower = value.toLowerCase();
                return nameLower.includes(valueLower) || 
                       nameLower.split(' ').some(part => part.startsWith(valueLower));
            })
            .slice(0, 5); // Limit to 5 suggestions
        
        if (suggestions.length > 0) {
            displaySuggestions(suggestions);
        } else {
            suggestionsDiv.classList.remove('show');
        }
    });
    
    nameInput.addEventListener('blur', () => {
        // Delay to allow click on suggestion
        setTimeout(() => {
            suggestionsDiv.classList.remove('show');
        }, 200);
    });
    
    nameInput.addEventListener('keydown', (e) => {
        if (!suggestionsDiv.classList.contains('show') || suggestions.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
            updateSuggestionSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            updateSuggestionSelection();
        } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
            e.preventDefault();
            selectSuggestion(suggestions[selectedSuggestionIndex]);
        }
    });
}

function displaySuggestions(names) {
    const suggestionsDiv = document.getElementById('nameSuggestions');
    if (!suggestionsDiv) return;
    
    suggestionsDiv.innerHTML = names.map((name, index) => 
        `<div class="autocomplete-suggestion" data-index="${index}">${escapeHtml(name)}</div>`
    ).join('');
    
    // Add click handlers
    suggestionsDiv.querySelectorAll('.autocomplete-suggestion').forEach((suggestion, index) => {
        suggestion.addEventListener('click', () => {
            selectSuggestion(names[index]);
        });
    });
    
    suggestionsDiv.classList.add('show');
    selectedSuggestionIndex = -1;
}

function updateSuggestionSelection() {
    const suggestionsDiv = document.getElementById('nameSuggestions');
    if (!suggestionsDiv) return;
    
    suggestionsDiv.querySelectorAll('.autocomplete-suggestion').forEach((suggestion, index) => {
        if (index === selectedSuggestionIndex) {
            suggestion.classList.add('selected');
        } else {
            suggestion.classList.remove('selected');
        }
    });
}

function selectSuggestion(name) {
    const nameInput = document.getElementById('searchName');
    const suggestionsDiv = document.getElementById('nameSuggestions');
    
    if (nameInput) {
        nameInput.value = name;
    }
    if (suggestionsDiv) {
        suggestionsDiv.classList.remove('show');
    }
    selectedSuggestionIndex = -1;
    suggestions = [];
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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    
    // Setup autocomplete
    setupAutocomplete();
    
    // Load search history
    loadSearchHistory();
    
    // Check URL params for search query
    checkUrlParams();
    
    // Setup Enter key handlers
    document.querySelectorAll('.search-filters input').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Esc key - clear search
        if (e.key === 'Escape') {
            const message = document.getElementById('globalMessage');
            if (message) {
                message.classList.remove('show');
                setTimeout(() => message.remove(), 300);
            }
            const suggestionsDiv = document.getElementById('nameSuggestions');
            if (suggestionsDiv) {
                suggestionsDiv.classList.remove('show');
            }
        }
        
        // Ctrl/Cmd + / to focus search name field
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            const nameInput = document.getElementById('searchName');
            if (nameInput) {
                nameInput.focus();
            }
        }
    });
});
