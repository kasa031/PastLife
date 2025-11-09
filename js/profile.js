// Profile page functionality
import { savePerson, imageToBase64, getPersonsByCreator, deletePerson, getPersonById, getAllPersons } from './data.js';
import { getCommentsForPerson } from './data.js';
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
    
    // Load profile settings
    loadProfileSettings();
    
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
    
    // Photo preview with loading indicator
    photoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
                showMessage('Ugyldig bildeformat. Bruk JPEG, PNG, GIF eller WebP.', 'error');
                photoInput.value = '';
                return;
            }
            
            // Validate file size
            if (file.size > 10 * 1024 * 1024) {
                showMessage('Bildet er for stort. Maksimal størrelse er 10MB.', 'error');
                photoInput.value = '';
                return;
            }
            
            photoFile = file;
            const preview = document.getElementById('photoPreview');
            
            // Show loading indicator
            preview.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--gray-light); border-radius: 5px;">
                    <div class="spinner" style="width: 30px; height: 30px;"></div>
                    <span>Laster opp og komprimerer bilde...</span>
                </div>
            `;
            
            try {
                // Show file size info
                const fileSizeKB = (file.size / 1024).toFixed(2);
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.innerHTML = `
                        <div style="margin-top: 0.5rem;">
                            <img src="${event.target.result}" alt="Preview" style="max-width: 300px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <p style="font-size: 0.85rem; color: var(--gray-dark); margin-top: 0.5rem;">
                                Original størrelse: ${fileSizeKB} KB<br>
                                Bildet vil bli komprimert ved lagring
                            </p>
                        </div>
                    `;
                };
                reader.readAsDataURL(file);
            } catch (error) {
                preview.innerHTML = '<p style="color: var(--orange-dark);">Feil ved lasting av bilde</p>';
                console.error('Error loading image preview:', error);
            }
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
                        <input type="checkbox" class="person-checkbox" data-person-id="${person.id}" style="margin-right: 0.5rem;" title="Velg for bulk-eksport eller bulk-redigering">
                        <button class="btn-edit" onclick="editPerson('${person.id}')" title="Rediger denne forfedrens informasjon">✏️ Edit</button>
                        <button class="btn-edit" onclick="quickAddToTree('${person.id}')" title="Legg raskt til i familietreet" style="background: var(--turquoise-primary);">🌳 Add to Tree</button>
                        <button class="btn-delete" onclick="deletePersonConfirm('${person.id}')" title="⚠️ Slett denne forfedren (vil spørre om bekreftelse)">🗑️ Delete</button>
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

// Load profile settings
export function loadProfileSettings() {
    const user = getCurrentUser();
    if (!user) return;
    
    const profileKey = `pastlife_profile_${user.username}`;
    const profile = JSON.parse(localStorage.getItem(profileKey) || '{}');
    
    const userNameInput = document.getElementById('userName');
    const userBioInput = document.getElementById('userBio');
    const userProfileImage = document.getElementById('userProfileImage');
    
    if (userNameInput && profile.userName) {
        userNameInput.value = profile.userName;
    }
    
    if (userBioInput && profile.bio) {
        userBioInput.value = profile.bio;
    }
    
    if (userProfileImage && profile.profileImage) {
        userProfileImage.src = profile.profileImage;
    }
}

// Save profile settings
window.saveProfileSettings = async function() {
    const user = getCurrentUser();
    if (!user) {
        showMessage('Du må være innlogget for å lagre profilinstillinger', 'error');
        return;
    }
    
    const userName = document.getElementById('userName').value.trim();
    const bio = document.getElementById('userBio').value.trim();
    
    const profileKey = `pastlife_profile_${user.username}`;
    const profile = {
        userName: userName || user.username,
        bio: bio,
        profileImage: document.getElementById('userProfileImage').src,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(profileKey, JSON.stringify(profile));
    
    // Update user object if username changed
    if (userName && userName !== user.username) {
        user.username = userName;
        localStorage.setItem('pastlife_auth', JSON.stringify(user));
    }
    
    showMessage('Profilinstillinger lagret!', 'success');
};

// Handle profile image upload
window.handleProfileImageUpload = async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        showMessage('Ugyldig bildeformat. Bruk JPEG, PNG, GIF eller WebP.', 'error');
        return;
    }
    
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
        showMessage('Bildet er for stort. Maksimal størrelse er 10MB.', 'error');
        return;
    }
    
    try {
        const base64 = await imageToBase64(file, 300, 0.8);
        
        document.getElementById('userProfileImage').src = base64;
        
        // Auto-save
        const user = getCurrentUser();
        if (user) {
            const profileKey = `pastlife_profile_${user.username}`;
            const profile = JSON.parse(localStorage.getItem(profileKey) || '{}');
            profile.profileImage = base64;
            profile.updatedAt = new Date().toISOString();
            localStorage.setItem(profileKey, JSON.stringify(profile));
            showMessage('Profilbilde oppdatert!', 'success');
        }
    } catch (error) {
        console.error('Error uploading profile image:', error);
        showMessage('Feil ved opplasting av bilde: ' + error.message, 'error');
    }
    
    // Reset input
    event.target.value = '';
};

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

// Import CSV/Excel data
window.importCSVData = async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const user = getCurrentUser();
    if (!user) {
        showMessage('Du må være innlogget for å importere data', 'error');
        return;
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    
    if (!isCSV && !isExcel) {
        showMessage('Ugyldig filformat. Bruk CSV eller Excel (.xlsx, .xls)', 'error');
        event.target.value = '';
        return;
    }
    
    try {
        showLoading('Laster inn fil...');
        
        let text = '';
        if (isCSV) {
            text = await file.text();
        } else {
            // For Excel files, we'll need to use a library or convert to CSV first
            showMessage('Excel-filer må konverteres til CSV først. Bruk "Lagre som CSV" i Excel.', 'info');
            hideLoading();
            event.target.value = '';
            return;
        }
        
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            showMessage('CSV-filen er tom eller mangler data', 'error');
            hideLoading();
            event.target.value = '';
            return;
        }
        
        // Parse header
        const header = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Expected columns (flexible mapping)
        const columnMap = {
            name: ['name', 'navn', 'full name', 'fullt navn'],
            birthyear: ['birthyear', 'birth year', 'fødselsår', 'født', 'born'],
            deathyear: ['deathyear', 'death year', 'dødsår', 'død', 'died'],
            birthplace: ['birthplace', 'birth place', 'fødselssted', 'born place'],
            deathplace: ['deathplace', 'death place', 'dødssted', 'died place'],
            country: ['country', 'land'],
            city: ['city', 'by'],
            description: ['description', 'beskrivelse', 'bio', 'biography'],
            tags: ['tags', 'tagger', 'tag']
        };
        
        // Find column indices
        const colIndices = {};
        Object.keys(columnMap).forEach(key => {
            const possibleNames = columnMap[key];
            for (const name of possibleNames) {
                const index = header.findIndex(h => h === name);
                if (index !== -1) {
                    colIndices[key] = index;
                    break;
                }
            }
        });
        
        if (!colIndices.name) {
            showMessage('CSV-filen må ha en "name" eller "navn" kolonne', 'error');
            hideLoading();
            event.target.value = '';
            return;
        }
        
        // Parse data rows
        const importedPersons = [];
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                
                if (values.length < header.length) {
                    // Try to handle quoted values with commas
                    const regex = /(".*?"|[^,]+)(?=\s*,|\s*$)/g;
                    const matches = lines[i].match(regex);
                    if (matches) {
                        values.length = 0;
                        matches.forEach(m => values.push(m.trim().replace(/^"|"$/g, '')));
                    }
                }
                
                const name = values[colIndices.name] || '';
                if (!name) continue; // Skip empty rows
                
                const person = {
                    name: name,
                    birthYear: colIndices.birthyear !== undefined ? (values[colIndices.birthyear] || null) : null,
                    deathYear: colIndices.deathyear !== undefined ? (values[colIndices.deathyear] || null) : null,
                    birthPlace: colIndices.birthplace !== undefined ? (values[colIndices.birthplace] || '') : '',
                    deathPlace: colIndices.deathplace !== undefined ? (values[colIndices.deathplace] || '') : '',
                    country: colIndices.country !== undefined ? (values[colIndices.country] || '') : '',
                    city: colIndices.city !== undefined ? (values[colIndices.city] || '') : '',
                    description: colIndices.description !== undefined ? (values[colIndices.description] || '') : '',
                    tags: colIndices.tags !== undefined ? (values[colIndices.tags] || '').split(';').map(t => t.trim()).filter(t => t) : [],
                    createdBy: user.username,
                    createdAt: new Date().toISOString()
                };
                
                // Validate and clean data
                if (person.birthYear) {
                    const year = parseInt(person.birthYear);
                    if (!isNaN(year) && year > 1000 && year <= new Date().getFullYear() + 10) {
                        person.birthYear = year.toString();
                    } else {
                        person.birthYear = null;
                    }
                }
                
                if (person.deathYear) {
                    const year = parseInt(person.deathYear);
                    if (!isNaN(year) && year > 1000 && year <= new Date().getFullYear() + 10) {
                        person.deathYear = year.toString();
                    } else {
                        person.deathYear = null;
                    }
                }
                
                importedPersons.push(person);
                successCount++;
            } catch (error) {
                console.error(`Error parsing row ${i + 1}:`, error);
                errorCount++;
            }
        }
        
        if (importedPersons.length === 0) {
            showMessage('Ingen gyldige personer funnet i CSV-filen', 'error');
            hideLoading();
            event.target.value = '';
            return;
        }
        
        // Save imported persons
        const { savePerson } = await import('./data.js');
        let savedCount = 0;
        
        for (const person of importedPersons) {
            try {
                savePerson(person);
                savedCount++;
            } catch (error) {
                console.error('Error saving person:', error);
            }
        }
        
        hideLoading();
        showMessage(`Importert ${savedCount} av ${importedPersons.length} personer fra CSV! ${errorCount > 0 ? `(${errorCount} feil)` : ''}`, 'success');
        
        // Reload contributions
        loadMyContributions();
        
        // Reset input
        event.target.value = '';
    } catch (error) {
        hideLoading();
        console.error('Error importing CSV:', error);
        showMessage('Feil ved import av CSV: ' + error.message, 'error');
        event.target.value = '';
    }
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
// Bulk edit selected persons
window.bulkEditSelected = function() {
    const checkboxes = document.querySelectorAll('.person-checkbox:checked');
    if (checkboxes.length === 0) {
        showMessage('Velg minst én person å redigere', 'error');
        return;
    }
    
    const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.personId);
    window.bulkEditSelectedIds = selectedIds;
    
    // Show modal
    const modal = document.getElementById('bulkEditModal');
    const countText = document.getElementById('bulkEditCount');
    countText.textContent = `${selectedIds.length} person(er) valgt for bulk-redigering`;
    
    // Clear form
    document.getElementById('bulkAddTag').value = '';
    document.getElementById('bulkRemoveTag').value = '';
    document.getElementById('bulkSetCountry').value = '';
    document.getElementById('bulkSetCity').value = '';
    
    modal.style.display = 'flex';
};

// Close bulk edit modal
window.closeBulkEditModal = function() {
    const modal = document.getElementById('bulkEditModal');
    modal.style.display = 'none';
    window.bulkEditSelectedIds = null;
};

// Apply bulk edit changes
window.applyBulkEdit = async function() {
    if (!window.bulkEditSelectedIds || window.bulkEditSelectedIds.length === 0) {
        showMessage('Ingen personer valgt', 'error');
        return;
    }
    
    const { getPersonById, savePerson } = await import('./data.js');
    
    const addTag = document.getElementById('bulkAddTag').value.trim();
    const removeTag = document.getElementById('bulkRemoveTag').value.trim();
    const setCountry = document.getElementById('bulkSetCountry').value.trim();
    const setCity = document.getElementById('bulkSetCity').value.trim();
    
    if (!addTag && !removeTag && !setCountry && !setCity) {
        showMessage('Ingen endringer angitt', 'error');
        return;
    }
    
    let updatedCount = 0;
    
    window.bulkEditSelectedIds.forEach(personId => {
        const person = getPersonById(personId);
        if (!person) return;
        
        // Add tag
        if (addTag) {
            if (!person.tags) person.tags = [];
            if (!person.tags.includes(addTag)) {
                person.tags.push(addTag);
            }
        }
        
        // Remove tag
        if (removeTag) {
            if (person.tags) {
                person.tags = person.tags.filter(t => t !== removeTag);
            }
        }
        
        // Set country
        if (setCountry) {
            person.country = setCountry;
        }
        
        // Set city
        if (setCity) {
            person.city = setCity;
        }
        
        // Save updated person
        savePerson(person, personId);
        updatedCount++;
    });
    
    showMessage(`${updatedCount} person(er) oppdatert!`, 'success');
    closeBulkEditModal();
    loadMyContributions();
    
    // Uncheck all checkboxes
    document.querySelectorAll('.person-checkbox').forEach(cb => cb.checked = false);
};

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
    const withPhotos = myPersons.filter(p => p.photo || p.mainImage).length;
    const withBirthYear = myPersons.filter(p => p.birthYear).length;
    const withDeathYear = myPersons.filter(p => p.deathYear).length;
    const withDescription = myPersons.filter(p => p.description && p.description.trim()).length;
    const morsside = myPersons.filter(p => p.tags && p.tags.includes('morsside')).length;
    const farsside = myPersons.filter(p => p.tags && p.tags.includes('farsside')).length;
    const withSources = myPersons.filter(p => p.sources && p.sources.length > 0).length;
    const withComments = myPersons.filter(p => {
        const comments = getCommentsForPerson(p.id);
        return comments.length > 0;
    }).length;
    
    // Calculate date range
    const years = myPersons.filter(p => p.birthYear).map(p => parseInt(p.birthYear));
    const earliestYear = years.length > 0 ? Math.min(...years) : null;
    const latestYear = years.length > 0 ? Math.max(...years) : null;
    
    // Calculate birth year distribution for graph
    const yearDistribution = {};
    years.forEach(year => {
        const decade = Math.floor(year / 10) * 10;
        yearDistribution[decade] = (yearDistribution[decade] || 0) + 1;
    });
    
    // Generate bar chart HTML
    const maxCount = Math.max(...Object.values(yearDistribution), 1);
    const chartBars = Object.keys(yearDistribution).sort((a, b) => a - b).map(decade => {
        const count = yearDistribution[decade];
        const height = (count / maxCount) * 100;
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 0.3rem;">
                <div style="width: 30px; height: 120px; background: var(--gray-light); border-radius: 5px 5px 0 0; position: relative; display: flex; align-items: flex-end;">
                    <div style="width: 100%; height: ${height}%; background: linear-gradient(to top, var(--turquoise-primary), var(--orange-primary)); border-radius: 5px 5px 0 0; transition: all 0.3s;" title="${decade}s: ${count} personer"></div>
                </div>
                <div style="font-size: 0.75rem; color: var(--gray-dark); writing-mode: horizontal-tb; transform: rotate(-45deg); transform-origin: center; white-space: nowrap;">${decade}s</div>
                <div style="font-size: 0.7rem; color: var(--turquoise-dark); font-weight: bold;">${count}</div>
            </div>
        `;
    }).join('');
    
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
        <div class="stat-card" style="background: var(--gray-light); padding: 1.5rem; border-radius: 10px; text-align: center; border: 2px solid var(--gray-medium);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--text-dark);">${withBirthYear}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">With Birth Year</div>
        </div>
        <div class="stat-card" style="background: var(--gray-light); padding: 1.5rem; border-radius: 10px; text-align: center; border: 2px solid var(--gray-medium);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--text-dark);">${withDescription}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">With Description</div>
        </div>
        <div class="stat-card" style="background: var(--gray-light); padding: 1.5rem; border-radius: 10px; text-align: center; border: 2px solid var(--gray-medium);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--text-dark);">${withSources}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">With Sources</div>
        </div>
        <div class="stat-card" style="background: var(--gray-light); padding: 1.5rem; border-radius: 10px; text-align: center; border: 2px solid var(--gray-medium);">
            <div style="font-size: 2rem; font-weight: bold; color: var(--text-dark);">${withComments}</div>
            <div style="font-size: 0.9rem; color: var(--gray-dark);">With Comments</div>
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
        ${Object.keys(yearDistribution).length > 0 ? `
        <div class="stat-card" style="grid-column: 1 / -1; background: var(--white); padding: 2rem; border-radius: 10px; border: 2px solid var(--turquoise-primary);">
            <h3 style="color: var(--turquoise-dark); margin-bottom: 1.5rem; text-align: center;">📊 Fødselsår-fordeling (per tiår)</h3>
            <div style="display: flex; justify-content: center; align-items: flex-end; gap: 1rem; flex-wrap: wrap; padding: 1rem; min-height: 200px;">
                ${chartBars}
            </div>
            ${years.length > 0 ? `
            <p style="text-align: center; color: var(--gray-dark); margin-top: 1rem; font-size: 0.9rem;">
                Totalt ${years.length} personer med fødselsår registrert
            </p>
            ` : ''}
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

