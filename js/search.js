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
    const relationshipName = document.getElementById('searchRelationship') ? document.getElementById('searchRelationship').value.trim() : '';
    const relationshipType = document.getElementById('relationshipType') ? document.getElementById('relationshipType').value : 'all';
    
    // If searching by relationship, use that instead
    if (relationshipName) {
        const relatedResults = searchByRelationship(relationshipName, relationshipType);
        if (relatedResults.length === 0) {
            const typeLabel = relationshipType === 'all' ? 'related persons' : 
                             relationshipType === 'sibling' ? 'siblings' :
                             relationshipType === 'parent' ? 'parents' :
                             relationshipType === 'child' ? 'children' :
                             relationshipType === 'spouse' ? 'spouses' : 'relatives';
            showMessage(`No ${typeLabel} found for "${relationshipName}"`, 'info');
            document.getElementById('searchResults').innerHTML = '';
            document.getElementById('resultsTitle').textContent = '';
        } else {
            displaySearchResults(relatedResults);
            const typeLabel = relationshipType === 'all' ? 'related persons' : 
                             relationshipType === 'sibling' ? 'siblings' :
                             relationshipType === 'parent' ? 'parents' :
                             relationshipType === 'child' ? 'children' :
                             relationshipType === 'spouse' ? 'spouses' : 'relatives';
            document.getElementById('resultsTitle').textContent = `Found ${relatedResults.length} ${typeLabel} for "${relationshipName}"`;
        }
        currentResultIndex = -1;
        return;
    }
    
    const filters = {
        name: document.getElementById('searchName').value.trim(),
        country: document.getElementById('searchCountry').value.trim(),
        city: document.getElementById('searchCity').value.trim(),
        yearFrom: document.getElementById('searchYearFrom').value.trim(),
        yearTo: document.getElementById('searchYearTo').value.trim(),
        tags: document.getElementById('searchTags') ? document.getElementById('searchTags').value.trim().split(',').map(t => t.trim()).filter(t => t) : [],
        description: document.getElementById('searchDescription').value.trim(),
        comments: document.getElementById('searchComments') ? document.getElementById('searchComments').value.trim() : '',
        locationCenter: document.getElementById('searchLocationCenter') ? document.getElementById('searchLocationCenter').value.trim() : '',
        locationRadius: document.getElementById('searchLocationRadius') ? document.getElementById('searchLocationRadius').value : ''
    };
    
    // Save to history
    saveSearchHistory(filters);
    
    // Reload history dropdown
    loadSearchHistory();
    
    const results = searchPersons(filters);
    displaySearchResults(results);
    
    // Reset navigation index
    currentResultIndex = -1;
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

// Create person card HTML with lazy loading and skeleton
function createPersonCard(person) {
    const photo = person.photo || 'assets/images/oldphoto2.jpg';
    const tags = person.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    return `
        <div class="person-card" onclick="viewPerson('${person.id}')">
            <img src="assets/images/oldphoto2.jpg" data-src="${photo}" alt="${person.name}" class="person-card-image lazy-load loading" onerror="this.src='assets/images/oldphoto2.jpg'; this.classList.remove('loading');" onload="this.classList.remove('loading');">
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

let currentResultIndex = -1;

// Setup keyboard navigation for search results
function setupResultNavigation() {
    document.addEventListener('keydown', (e) => {
        const results = document.querySelectorAll('.person-card');
        if (results.length === 0) return;
        
        // Only navigate if search results are visible and user is not typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentResultIndex = Math.min(currentResultIndex + 1, results.length - 1);
            results[currentResultIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            results[currentResultIndex].style.outline = '3px solid var(--turquoise-primary)';
            // Remove outline from previous
            if (currentResultIndex > 0) {
                results[currentResultIndex - 1].style.outline = '';
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentResultIndex = Math.max(currentResultIndex - 1, 0);
            results[currentResultIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            results[currentResultIndex].style.outline = '3px solid var(--turquoise-primary)';
            // Remove outline from next
            if (currentResultIndex < results.length - 1) {
                results[currentResultIndex + 1].style.outline = '';
            }
        } else if (e.key === 'Enter' && currentResultIndex >= 0) {
            e.preventDefault();
            results[currentResultIndex].click();
        }
    });
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
        
        const allPersons = getAllPersons();
        
        // Get suggestions from search history first (prioritize recent searches)
        const historyKey = 'pastlife_search_history';
        const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
        const historySuggestions = history
            .filter(h => {
                // Extract name from history string (format: "name:value, ...")
                const nameMatch = h.match(/name:([^,]+)/);
                if (nameMatch) {
                    const historyName = nameMatch[1].trim().toLowerCase();
                    return historyName.includes(value.toLowerCase());
                }
                return h.toLowerCase().includes(value.toLowerCase());
            })
            .slice(0, 3)
            .map(h => {
                // Extract name from history string
                const nameMatch = h.match(/name:([^,]+)/);
                const displayName = nameMatch ? nameMatch[1].trim() : h;
                return { text: displayName, type: 'history', fullHistory: h };
            });
        
        // Get all unique names from persons
        const uniqueNames = [...new Set(allPersons.map(p => p.name))];
        
        // Filter names that match (fuzzy)
        const nameSuggestions = uniqueNames
            .filter(name => {
                const nameLower = name.toLowerCase();
                const valueLower = value.toLowerCase();
                return nameLower.includes(valueLower) || 
                       nameLower.split(' ').some(part => part.startsWith(valueLower));
            })
            .slice(0, 7 - historySuggestions.length)
            .map(name => ({ text: name, type: 'name' }));
        
        // Get country suggestions if input looks like a country
        const countries = [...new Set(allPersons.map(p => p.country).filter(c => c))];
        const countrySuggestions = countries
            .filter(country => country.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 2)
            .map(country => ({ text: country, type: 'country' }));
        
        // Get city suggestions
        const cities = [...new Set(allPersons.map(p => p.city).filter(c => c))];
        const citySuggestions = cities
            .filter(city => city.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 2)
            .map(city => ({ text: city, type: 'city' }));
        
        // Combine all suggestions (history first, then names, then locations)
        suggestions = [
            ...historySuggestions,
            ...nameSuggestions,
            ...countrySuggestions,
            ...citySuggestions
        ].slice(0, 10); // Limit to 10 total
        
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

function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById('nameSuggestions');
    if (!suggestionsDiv) return;
    
    // Group suggestions by type
    const grouped = {
        history: suggestions.filter(s => s.type === 'history'),
        name: suggestions.filter(s => s.type === 'name'),
        country: suggestions.filter(s => s.type === 'country'),
        city: suggestions.filter(s => s.type === 'city')
    };
    
    let html = '';
    let globalIndex = 0;
    
    // History suggestions
    if (grouped.history.length > 0) {
        html += `<div class="suggestion-group-header">🕐 Recent Searches</div>`;
        grouped.history.forEach(item => {
            html += `<div class="autocomplete-suggestion suggestion-history" data-index="${globalIndex++}">
                <span class="suggestion-text">${escapeHtml(item.text)}</span>
                <span class="suggestion-hint">Click to reuse search</span>
            </div>`;
        });
    }
    
    // Name suggestions
    if (grouped.name.length > 0) {
        html += `<div class="suggestion-group-header">👤 Names</div>`;
        grouped.name.forEach(item => {
            html += `<div class="autocomplete-suggestion suggestion-name" data-index="${globalIndex++}">${escapeHtml(item.text)}</div>`;
        });
    }
    
    // Country suggestions
    if (grouped.country.length > 0) {
        html += `<div class="suggestion-group-header">🌍 Countries</div>`;
        grouped.country.forEach(item => {
            html += `<div class="autocomplete-suggestion suggestion-country" data-index="${globalIndex++}">${escapeHtml(item.text)}</div>`;
        });
    }
    
    // City suggestions
    if (grouped.city.length > 0) {
        html += `<div class="suggestion-group-header">📍 Cities</div>`;
        grouped.city.forEach(item => {
            html += `<div class="autocomplete-suggestion suggestion-city" data-index="${globalIndex++}">${escapeHtml(item.text)}</div>`;
        });
    }
    
    suggestionsDiv.innerHTML = html;
    
    // Add click handlers
    suggestionsDiv.querySelectorAll('.autocomplete-suggestion').forEach((suggestion, index) => {
        suggestion.addEventListener('click', () => {
            const item = suggestions[index];
            if (item.type === 'history' && item.fullHistory) {
                // Load full search from history
                loadSearchFromHistoryString(item.fullHistory);
            } else {
                selectSuggestion(item.text);
            }
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

function selectSuggestion(nameOrItem) {
    const nameInput = document.getElementById('searchName');
    const suggestionsDiv = document.getElementById('nameSuggestions');
    
    // Handle both string and object
    const name = typeof nameOrItem === 'string' ? nameOrItem : nameOrItem.text;
    
    if (nameInput) {
        nameInput.value = name;
    }
    if (suggestionsDiv) {
        suggestionsDiv.classList.remove('show');
    }
    selectedSuggestionIndex = -1;
    suggestions = [];
}

// Load search from history string
function loadSearchFromHistoryString(historyString) {
    // Parse history string (format: "name:value, country:value, ...")
    const parts = historyString.split(', ');
    const filters = {};
    
    parts.forEach(part => {
        const [key, ...valueParts] = part.split(':');
        if (key && valueParts.length > 0) {
            filters[key.trim()] = valueParts.join(':').trim();
        }
    });
    
    // Fill in form fields
    if (filters.name) document.getElementById('searchName').value = filters.name;
    if (filters.country) document.getElementById('searchCountry').value = filters.country;
    if (filters.city) document.getElementById('searchCity').value = filters.city;
    if (filters.yearFrom) document.getElementById('searchYearFrom').value = filters.yearFrom;
    if (filters.yearTo) document.getElementById('searchYearTo').value = filters.yearTo;
    if (filters.tags) document.getElementById('searchTags').value = filters.tags;
    if (filters.description) document.getElementById('searchDescription').value = filters.description;
    
    // Hide suggestions
    const suggestionsDiv = document.getElementById('nameSuggestions');
    if (suggestionsDiv) {
        suggestionsDiv.classList.remove('show');
    }
    
    // Perform search
    performSearch();
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

// Setup lazy loading for images
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
    
    // Setup autocomplete
    setupAutocomplete();
    
    // Setup result navigation
    setupResultNavigation();
    
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
    
    // Setup lazy loading after results are displayed
    setTimeout(() => setupLazyLoading(), 100);
    
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
            // Reset result navigation
            currentResultIndex = -1;
            document.querySelectorAll('.person-card').forEach(card => {
                card.style.outline = '';
            });
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

// Update displaySearchResults to trigger lazy loading
const originalDisplayResults = displaySearchResults;
window.displaySearchResults = function(results) {
    originalDisplayResults(results);
    setTimeout(() => setupLazyLoading(), 100);
    currentResultIndex = -1; // Reset navigation index
};
