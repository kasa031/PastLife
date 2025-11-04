// Profile page functionality
import { savePerson, imageToBase64, getPersonsByCreator, deletePerson, getPersonById, getAllPersons } from './data.js';
import { getCurrentUser, isLoggedIn, updateNavigation } from './auth.js';
import { showMessage, showLoading, hideLoading } from './utils.js';

let tags = [];
let photoFile = null;
let allContributions = []; // Store all user contributions
let currentFilter = 'all'; // 'all', 'morsside', 'farsside', 'both'
let currentSort = 'newest'; // Sort option

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Setup form
    setupForm();
    loadMyContributions();
    
    // Setup search and filter
    setupSearchAndFilter();
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
        showMessage('Name is required. Please enter the ancestor\'s full name.', 'error');
        return;
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
    
    // Get existing tree data
    const treeDataKey = 'pastlife_family_tree_data';
    const savedTree = localStorage.getItem(treeDataKey);
    let treeData = { persons: [], relationships: [] };
    
    if (savedTree) {
        try {
            treeData = JSON.parse(savedTree);
        } catch (e) {
            console.error('Error loading tree:', e);
        }
    }
    
    // Check if already in tree
    const alreadyInTree = (treeData.persons || []).some(p => 
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
    
    if (!treeData.persons) treeData.persons = [];
    treeData.persons.push(treePerson);
    
    // Save tree
    localStorage.setItem(treeDataKey, JSON.stringify(treeData));
    
    showMessage('Person added to family tree! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'family-tree.html';
    }, 1500);
};

// Make functions globally available
window.viewPerson = viewPerson;

