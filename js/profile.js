// Profile page functionality
import { savePerson, imageToBase64, getPersonsByCreator, deletePerson, getPersonById, getAllPersons } from './data.js';
import { getCurrentUser, isLoggedIn, updateNavigation } from './auth.js';
import { showMessage, showLoading, hideLoading, validateYear, validateDateRange, showErrorWithSuggestion } from './utils.js';

let tags = [];
let photoFile = null;
let allContributions = []; // Store all user contributions
let currentFilter = 'all'; // 'all', 'morsside', 'farsside', 'both'
let currentSort = 'newest'; // Sort option

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

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    updateNavigation();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Setup form
    setupForm();
    loadMyContributions();
    loadUserStatistics();
    loadMyFavorites();
    
    // Setup search and filter
    setupSearchAndFilter();
    
    // Check for notifications
    checkNotifications();
});

// Setup form handlers
function setupForm() {
    const form = document.getElementById('ancestorForm');
    const tagsInput = document.getElementById('tagsInput');
    const photoInput = document.getElementById('photo');
    
    // Tags input handler
    tagsInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const tag = tagsInput.value.trim();
            if (tag && !tags.includes(tag)) {
                tags.push(tag);
                updateTagsDisplay();
                tagsInput.value = '';
            }
        }
    });
    
    // Photo preview
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            photoFile = file;
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = document.getElementById('photoPreview');
                preview.innerHTML = `
                    <img src="${event.target.result}" alt="Preview" style="max-width: 300px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                `;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Form submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitForm();
    });
}

// Update tags display
function updateTagsDisplay() {
    const container = document.getElementById('tagsDisplay');
    container.innerHTML = tags.map((tag, index) => `
        <span class="tag-input-item">
            ${escapeHtml(tag)}
            <button type="button" onclick="removeTag(${index})">×</button>
        </span>
    `).join('');
}

// Remove tag
window.removeTag = function(index) {
    tags.splice(index, 1);
    updateTagsDisplay();
};

// Check for duplicate person
function checkDuplicate(personData) {
    const allPersons = getAllPersons();
    const nameLower = personData.name.toLowerCase().trim();
    
    return allPersons.find(p => {
        const pNameLower = p.name.toLowerCase().trim();
        const nameSimilar = pNameLower === nameLower || 
                           pNameLower.includes(nameLower) || 
                           nameLower.includes(pNameLower);
        
        // Check if birth year matches (if provided)
        const yearMatch = !personData.birthYear || !p.birthYear || 
                         personData.birthYear === p.birthYear;
        
        return nameSimilar && yearMatch;
    });
}

// Submit form
async function submitForm() {
    const user = getCurrentUser();
    if (!user) {
        showMessage('Please login to submit ancestor information', 'error');
        return;
    }
    
    const formData = {
        name: document.getElementById('personName').value.trim(),
        birthYear: document.getElementById('birthYear').value ? parseInt(document.getElementById('birthYear').value) : null,
        deathYear: document.getElementById('deathYear').value ? parseInt(document.getElementById('deathYear').value) : null,
        birthPlace: document.getElementById('birthPlace').value.trim(),
        deathPlace: document.getElementById('deathPlace').value.trim(),
        country: document.getElementById('country').value.trim(),
        city: document.getElementById('city').value.trim(),
        description: document.getElementById('description').value.trim(),
        tags: tags,
        createdBy: user.username
    };
    
    if (!formData.name) {
        showErrorWithSuggestion(
            'Name is required',
            'Please enter the ancestor\'s full name (e.g., "Edvard Jensen")'
        );
        return;
    }
    
    // Validate years
    if (formData.birthYear) {
        const birthValidation = validateYear(formData.birthYear, 'Birth year');
        if (!birthValidation.valid) {
            showErrorWithSuggestion(birthValidation.message, birthValidation.suggestion);
            return;
        }
    }
    
    if (formData.deathYear) {
        const deathValidation = validateYear(formData.deathYear, 'Death year');
        if (!deathValidation.valid) {
            showErrorWithSuggestion(deathValidation.message, deathValidation.suggestion);
            return;
        }
    }
    
    // Validate date range
    if (formData.birthYear && formData.deathYear) {
        const dateValidation = validateDateRange(formData.birthYear, formData.deathYear);
        if (!dateValidation.valid) {
            showErrorWithSuggestion(dateValidation.message, dateValidation.suggestion);
            return;
        }
    }
    
    // Check for duplicates (skip if editing)
    const editingId = window.currentEditingId;
    if (!editingId) {
        const duplicate = checkDuplicate(formData);
        if (duplicate) {
            const confirmMsg = `A similar person already exists: "${duplicate.name}"${duplicate.birthYear ? ` (born ${duplicate.birthYear})` : ''}.\n\nDo you want to continue anyway?`;
            if (!confirm(confirmMsg)) {
                return;
            }
        }
    }
    
    // Handle photo
    if (photoFile) {
        try {
            const loading = showLoading(document.getElementById('ancestorForm'));
            formData.photo = await imageToBase64(photoFile);
            hideLoading(document.getElementById('ancestorForm'), loading);
        } catch (error) {
            console.error('Error converting image:', error);
            showMessage(error.message || 'Error processing image. Please try again.', 'error');
            return;
        }
    }
    
    // Save person (update if editing)
    const editingId = window.currentEditingId;
    const person = savePerson(formData, editingId);
    
    // Reset form
    document.getElementById('ancestorForm').reset();
    tags = [];
    photoFile = null;
    updateTagsDisplay();
    document.getElementById('photoPreview').innerHTML = '';
    window.currentEditingId = null;
    
    // Reset submit button text
    const submitBtn = document.querySelector('#ancestorForm .submit-btn');
    if (submitBtn) submitBtn.textContent = 'Submit Ancestor Information';
    
    // Show success message
    showMessage(editingId ? 'Ancestor information updated successfully!' : 'Ancestor information submitted successfully!', 'success');
    
    // Reload contributions
    loadMyContributions();
}

// Setup search and filter
function setupSearchAndFilter() {
    const searchInput = document.getElementById('contributionsSearch');
    const sortSelect = document.getElementById('contributionsSort');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            filterAndDisplayContributions();
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            filterAndDisplayContributions();
        });
    }
}

// Load my contributions
function loadMyContributions() {
    const user = getCurrentUser();
    if (!user) return;
    
    allContributions = getPersonsByCreator(user.username);
    filterAndDisplayContributions();
}

// Filter and display contributions
function filterAndDisplayContributions() {
    const searchInput = document.getElementById('contributionsSearch');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Filter by search term
    let filtered = allContributions.filter(person => {
        return person.name.toLowerCase().includes(searchTerm);
    });
    
    // Filter by side (morsside/farsside)
    if (currentFilter === 'morsside') {
        filtered = filtered.filter(person => 
            person.tags && person.tags.includes('morsside')
        );
    } else if (currentFilter === 'farsside') {
        filtered = filtered.filter(person => 
            person.tags && person.tags.includes('farsside')
        );
    } else if (currentFilter === 'both') {
        filtered = filtered.filter(person => 
            person.tags && 
            (person.tags.includes('morsside') || person.tags.includes('farsside'))
        );
    }
    // 'all' shows everything
    
    // Sort
    filtered.sort((a, b) => {
        switch(currentSort) {
            case 'newest':
                // Sort by creation date (newest first) - use ID timestamp if available
                return (b.id || '').localeCompare(a.id || '');
            case 'oldest':
                return (a.id || '').localeCompare(b.id || '');
            case 'name-asc':
                return (a.name || '').localeCompare(b.name || '');
            case 'name-desc':
                return (b.name || '').localeCompare(a.name || '');
            case 'year-asc':
                const yearA = a.birthYear || 0;
                const yearB = b.birthYear || 0;
                return yearA - yearB;
            case 'year-desc':
                const yearA2 = a.birthYear || 0;
                const yearB2 = b.birthYear || 0;
                return yearB2 - yearA2;
            default:
                return 0;
        }
    });
    
    // Update count
    const countDiv = document.getElementById('contributionsCount');
    if (countDiv) {
        const total = allContributions.length;
        const showing = filtered.length;
        countDiv.textContent = `Showing ${showing} of ${total} ${total === 1 ? 'ancestor' : 'ancestors'}`;
    }
    
    // Display
    const container = document.getElementById('myContributions');
    if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-dark);">No ancestors found matching your filters.</p>';
        return;
    }
    
    container.innerHTML = filtered.map(person => createPersonCard(person)).join('');
}

// Filter contributions by side
window.filterContributions = function(filter) {
    currentFilter = filter;
    
    // Update button states
    document.querySelectorAll('.profile-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    filterAndDisplayContributions();
}

// Create person card HTML
function createPersonCard(person) {
    const photo = person.photo || 'assets/images/oldphoto2.jpg';
    const tags = person.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    const user = getCurrentUser();
    const isOwner = user && person.createdBy === user.username;
    
    return `
        <div class="person-card">
            <img src="${photo}" alt="${person.name}" class="person-card-image" onclick="viewPerson('${person.id}')" onerror="this.src='assets/images/oldphoto2.jpg'" style="cursor: pointer;">
            <div class="person-card-info">
                <h3 onclick="viewPerson('${person.id}')" style="cursor: pointer;">${escapeHtml(person.name)}</h3>
                ${person.birthYear ? `<p><span class="info-label">Born:</span> ${person.birthYear}</p>` : ''}
                ${person.birthPlace ? `<p><span class="info-label">From:</span> ${escapeHtml(person.birthPlace)}</p>` : ''}
                <div class="person-tags">${tags}</div>
                ${isOwner ? `
                    <div class="action-buttons">
                        <input type="checkbox" class="person-checkbox" data-person-id="${person.id}" style="margin-right: 0.5rem;" title="Select for bulk export">
                        <button class="btn-edit" onclick="editPerson('${person.id}')" title="Edit this ancestor's information">✏️ Edit</button>
                        <button class="btn-edit" onclick="quickAddToTree('${person.id}')" title="Quick add to family tree" style="background: var(--turquoise-primary);">🌳 Add to Tree</button>
                        <button class="btn-delete" onclick="deletePersonConfirm('${person.id}')" title="⚠️ Delete this ancestor (will ask for confirmation)">🗑️ Delete</button>
                    </div>
                ` : ''}
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

// Edit person
window.editPerson = function(id) {
    const person = getPersonById(id);
    if (!person) return;
    
    // Populate form with person data
    document.getElementById('personName').value = person.name;
    document.getElementById('birthYear').value = person.birthYear || '';
    document.getElementById('deathYear').value = person.deathYear || '';
    document.getElementById('birthPlace').value = person.birthPlace || '';
    document.getElementById('deathPlace').value = person.deathPlace || '';
    document.getElementById('country').value = person.country || '';
    document.getElementById('city').value = person.city || '';
    document.getElementById('description').value = person.description || '';
    tags = person.tags || [];
    updateTagsDisplay();
    
    if (person.photo) {
        document.getElementById('photoPreview').innerHTML = `
            <img src="${person.photo}" alt="Current photo" style="max-width: 300px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        `;
    }
    
    // Store editing state
    window.currentEditingId = id;
    
    // Scroll to form
    document.getElementById('ancestorForm').scrollIntoView({ behavior: 'smooth' });
    
    // Change submit button text
    const submitBtn = document.querySelector('#ancestorForm .submit-btn');
    if (submitBtn) submitBtn.textContent = 'Update Ancestor Information';
};

// Delete person with confirmation
window.deletePersonConfirm = function(id) {
    if (confirm('Are you sure you want to delete this ancestor entry? This action cannot be undone.')) {
        deletePerson(id);
        showMessage('Ancestor entry deleted successfully', 'success');
        loadMyContributions();
    }
};

// Export data
window.exportData = function() {
    const user = getCurrentUser();
    if (!user) return;
    
    const myPersons = getPersonsByCreator(user.username);
    const data = {
        persons: myPersons,
        exportDate: new Date().toISOString(),
        exportedBy: user.username
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pastlife-export-${user.username}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showMessage('Data exported successfully!', 'success');
};

// Import data
window.importData = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.persons && Array.isArray(data.persons)) {
                const user = getCurrentUser();
                // Only import persons created by current user
                const myPersons = data.persons.filter(p => p.createdBy === user.username);
                if (myPersons.length > 0) {
                    // Import each person
                    myPersons.forEach(personData => {
                        savePerson(personData);
                    });
                    showMessage(`Imported ${myPersons.length} ancestor entries`, 'success');
                    loadMyContributions();
                } else {
                    showMessage('No matching data found in import file', 'error');
                }
            } else {
                showMessage('Invalid import file format', 'error');
            }
        } catch (error) {
            showMessage('Error reading import file', 'error');
            console.error(error);
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset file input
};

// Quick add to family tree from profile
window.quickAddToTree = function(personId) {
    const person = getPersonById(personId);
    if (!person) return;
    
    // Get existing tree data (use same key as family-tree.js)
    const user = getCurrentUser();
    if (!user) return;
    
    const treeDataKey = `pastlife_tree_${user.username}`;
    const savedTree = localStorage.getItem(treeDataKey);
    let allTreePersons = [];
    
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
        generation: 0
    };
    
    allTreePersons.push(treePerson);
    
    // Save tree
    localStorage.setItem(treeDataKey, JSON.stringify(allTreePersons));
    
    showMessage('Person added to family tree! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'family-tree.html';
    }, 1500);
};

// Bulk export selected persons
window.bulkExportSelected = function() {
    const checkboxes = document.querySelectorAll('.person-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showMessage('Please select at least one person to export', 'error');
        return;
    }
    
    const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.personId);
    const allPersons = getAllPersons();
    const selectedPersons = allPersons.filter(p => selectedIds.includes(p.id));
    
    const dataStr = JSON.stringify(selectedPersons, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `selected-ancestors-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showMessage(`Exported ${selectedPersons.length} person(s)`, 'success');
    
    // Uncheck all
    checkboxes.forEach(cb => cb.checked = false);
};

// Load user statistics
function loadUserStatistics() {
    const user = getCurrentUser();
    if (!user) return;
    
    const myPersons = getPersonsByCreator(user.username);
    const statsContainer = document.getElementById('userStatistics');
    if (!statsContainer) return;
    
    // Calculate statistics
    const total = myPersons.length;
    const withPhotos = myPersons.filter(p => p.photo).length;
    const withBirthYear = myPersons.filter(p => p.birthYear).length;
    const withDeathYear = myPersons.filter(p => p.deathYear).length;
    const withDescription = myPersons.filter(p => p.description && p.description.trim()).length;
    const morsside = myPersons.filter(p => p.tags && p.tags.includes('morsside')).length;
    const farsside = myPersons.filter(p => p.tags && p.tags.includes('farsside')).length;
    
    // Calculate date range
    const years = myPersons.filter(p => p.birthYear).map(p => parseInt(p.birthYear));
    const earliestYear = years.length > 0 ? Math.min(...years) : null;
    const latestYear = years.length > 0 ? Math.max(...years) : null;
    
    // Countries
    const countries = [...new Set(myPersons.filter(p => p.country).map(p => p.country))];
    
    // Cities
    const cities = [...new Set(myPersons.filter(p => p.city).map(p => p.city))];
    
    statsContainer.innerHTML = `
        <div class="stat-card" style="background: linear-gradient(135deg, var(--turquoise-primary), var(--turquoise-dark)); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
            <div style="font-size: 2.5rem; font-weight: bold;">${total}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">Total Ancestors</div>
        </div>
        <div class="stat-card" style="background: linear-gradient(135deg, var(--orange-primary), var(--orange-dark)); color: white; padding: 1.5rem; border-radius: 10px; text-align: center;">
            <div style="font-size: 2.5rem; font-weight: bold;">${withPhotos}</div>
            <div style="font-size: 0.9rem; opacity: 0.9;">With Photos</div>
        </div>
        <div class="stat-card" style="background: var(--turquoise-light); padding: 1.5rem; border-radius: 10px; text-align: center; border: 2px solid var(--turquoise-primary);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--turquoise-dark);">${morsside}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">👩 Mother's Side</div>
        </div>
        <div class="stat-card" style="background: var(--orange-light); padding: 1.5rem; border-radius: 10px; text-align: center; border: 2px solid var(--orange-primary);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--orange-dark);">${farsside}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">👨 Father's Side</div>
        </div>
        ${earliestYear ? `
        <div class="stat-card" style="background: var(--gray-light); padding: 1.5rem; border-radius: 10px; text-align: center; border: 2px solid var(--gray-medium);">
            <div style="font-size: 1.8rem; font-weight: bold; color: var(--text-dark);">${earliestYear}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">Earliest Birth Year</div>
        </div>
        ` : ''}
        ${latestYear ? `
        <div class="stat-card" style="background: var(--gray-light); padding: 1.5rem; border-radius: 10px; text-align: center; border: 2px solid var(--gray-medium);">
            <div style="font-size: 1.8rem; font-weight: bold; color: var(--text-dark);">${latestYear}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">Latest Birth Year</div>
        </div>
        ` : ''}
        ${countries.length > 0 ? `
        <div class="stat-card" style="background: var(--gray-light); padding: 1.5rem; border-radius: 10px; border: 2px solid var(--gray-medium);">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-dark); margin-bottom: 0.5rem;">${countries.length}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">Countries Represented</div>
            <div style="font-size: 0.8rem; color: var(--gray-dark); margin-top: 0.5rem;">${countries.slice(0, 3).join(', ')}${countries.length > 3 ? '...' : ''}</div>
        </div>
        ` : ''}
        ${cities.length > 0 ? `
        <div class="stat-card" style="background: var(--gray-light); padding: 1.5rem; border-radius: 10px; border: 2px solid var(--gray-medium);">
            <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-dark); margin-bottom: 0.5rem;">${cities.length}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">Cities Represented</div>
            <div style="font-size: 0.8rem; color: var(--gray-dark); margin-top: 0.5rem;">${cities.slice(0, 3).join(', ')}${cities.length > 3 ? '...' : ''}</div>
        </div>
        ` : ''}
    `;
}

// Load my favorites
function loadMyFavorites() {
    const user = getCurrentUser();
    if (!user) return;
    
    const favoritesKey = `pastlife_favorites_${user.username}`;
    const favoriteIds = JSON.parse(localStorage.getItem(favoritesKey) || '[]');
    const allPersons = getAllPersons();
    const favorites = allPersons.filter(p => favoriteIds.includes(p.id));
    
    const container = document.getElementById('myFavorites');
    if (!container) return;
    
    if (favorites.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-dark);">No favorites yet. Click the ⭐ button on any person page to add them.</p>';
        return;
    }
    
    container.innerHTML = favorites.slice(0, 6).map(person => {
        const photo = person.photo || 'assets/images/oldphoto2.jpg';
        const tags = person.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        return `
            <div class="person-card" onclick="viewPerson('${person.id}')">
                <img src="${photo}" alt="${person.name}" class="person-card-image" onerror="this.src='assets/images/oldphoto2.jpg'" style="cursor: pointer;">
                <div class="person-card-info">
                    <h3 onclick="viewPerson('${person.id}')" style="cursor: pointer;">${escapeHtml(person.name)}</h3>
                    ${person.birthYear ? `<p><span class="info-label">Born:</span> ${person.birthYear}</p>` : ''}
                    ${person.birthPlace ? `<p><span class="info-label">From:</span> ${escapeHtml(person.birthPlace)}</p>` : ''}
                    <div class="person-tags">${tags}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Check for notifications (new comments on user's persons)
function checkNotifications() {
    const user = getCurrentUser();
    if (!user) return;
    
    const myPersons = getPersonsByCreator(user.username);
    const lastCheckKey = `pastlife_notifications_lastcheck_${user.username}`;
    const lastCheck = localStorage.getItem(lastCheckKey);
    
    // Get all comments
    const commentsKey = 'pastlife_comments';
    const allComments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
    
    // Find new comments on user's persons since last check
    const myPersonIds = myPersons.map(p => p.id);
    const newComments = allComments.filter(comment => {
        if (!myPersonIds.includes(comment.personId)) return false;
        if (comment.author === user.username) return false; // Don't notify about own comments
        
        if (lastCheck) {
            return new Date(comment.createdAt) > new Date(lastCheck);
        }
        // First time checking - only show comments from last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(comment.createdAt) > oneDayAgo;
    });
    
    // Update last check time
    localStorage.setItem(lastCheckKey, new Date().toISOString());
    
    // Show notification if there are new comments
    if (newComments.length > 0) {
        showNotificationBadge(newComments.length);
        // Don't show message on every page load - just show badge
    }
}

// Show notification badge
function showNotificationBadge(count) {
    // Remove existing badge
    const existing = document.getElementById('notificationBadge');
    if (existing) existing.remove();
    
    // Add badge to profile link in nav
    const profileLink = document.getElementById('profileLink');
    if (profileLink) {
        const badge = document.createElement('span');
        badge.id = 'notificationBadge';
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.cssText = 'position: absolute; background: #c62828; color: white; border-radius: 50%; width: 20px; height: 20px; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; margin-left: -10px; margin-top: -5px;';
        profileLink.style.position = 'relative';
        profileLink.appendChild(badge);
    }
}

// Backup all user data
window.backupAllData = function() {
    const user = getCurrentUser();
    if (!user) {
        showMessage('Please login to create a backup', 'error');
        return;
    }
    
    const backup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        username: user.username,
        data: {
            persons: getAllPersons().filter(p => p.createdBy === user.username),
            favorites: JSON.parse(localStorage.getItem(`pastlife_favorites_${user.username}`) || '[]'),
            tree: localStorage.getItem(`pastlife_tree_${user.username}`) ? JSON.parse(localStorage.getItem(`pastlife_tree_${user.username}`)) : null,
            searchHistory: JSON.parse(localStorage.getItem(`pastlife_search_history_${user.username}`) || '[]'),
            notifications: localStorage.getItem(`pastlife_notifications_lastcheck_${user.username}`) || null
        }
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `F3_backup_${user.username}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage('Backup created successfully!', 'success');
};

// Restore from backup
window.restoreBackup = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const user = getCurrentUser();
    if (!user) {
        showMessage('Please login to restore a backup', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backup = JSON.parse(e.target.result);
            
            if (!backup.version || !backup.data) {
                showMessage('Invalid backup file format', 'error');
                return;
            }
            
            if (!confirm(`This will restore data from backup created on ${backup.timestamp ? new Date(backup.timestamp).toLocaleDateString() : 'unknown date'}. This may overwrite existing data. Continue?`)) {
                return;
            }
            
            // Restore persons
            if (backup.data.persons && Array.isArray(backup.data.persons)) {
                const existingPersons = getAllPersons();
                const otherPersons = existingPersons.filter(p => p.createdBy !== user.username);
                const allPersons = [...otherPersons, ...backup.data.persons];
                localStorage.setItem('pastlife_persons', JSON.stringify(allPersons));
            }
            
            // Restore favorites
            if (backup.data.favorites) {
                localStorage.setItem(`pastlife_favorites_${user.username}`, JSON.stringify(backup.data.favorites));
            }
            
            // Restore tree
            if (backup.data.tree) {
                localStorage.setItem(`pastlife_tree_${user.username}`, JSON.stringify(backup.data.tree));
            }
            
            // Restore search history
            if (backup.data.searchHistory) {
                localStorage.setItem(`pastlife_search_history_${user.username}`, JSON.stringify(backup.data.searchHistory));
            }
            
            // Restore notifications timestamp
            if (backup.data.notifications) {
                localStorage.setItem(`pastlife_notifications_lastcheck_${user.username}`, backup.data.notifications);
            }
            
            showMessage('Backup restored successfully! Refreshing page...', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
        } catch (error) {
            console.error('Restore error:', error);
            showMessage('Error restoring backup: ' + error.message, 'error');
        }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Reset input
};

// Make functions globally available
window.viewPerson = viewPerson;

