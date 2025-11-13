// Person detail page functionality
import { getPersonById, getCommentsForPerson, addComment, deleteComment, searchByRelationship, getAllPersons, rotateImage } from './data.js';
import { getCurrentUser, isLoggedIn, updateNavigation } from './auth.js';
import { copyToClipboard, showMessage, formatDate, logError, confirmAction, initKeyboardShortcuts, initBreadcrumbs, sanitizeInput, sanitizeURL, enhanceKeyboardNavigation, escapeHtml, showLoadingOverlay, hideLoadingOverlay } from './utils.js';
import { loadTheme, toggleDarkMode } from './theme.js';

let currentPersonId = null;

// Dark mode functions imported from theme.js

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    updateNavigation();
    initKeyboardShortcuts(); // Initialize keyboard shortcuts help
    
    // Get person ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentPersonId = urlParams.get('id');
    
    if (!currentPersonId) {
        document.getElementById('personDetailContent').innerHTML = 
            '<p style="text-align: center; padding: 2rem;">Person not found</p>';
        return;
    }
    
    // Initialize breadcrumbs (will be updated when person is loaded)
    initBreadcrumbs([
        { label: 'Home', url: 'index.html' },
        { label: 'Search', url: 'search.html' },
        { label: 'Person Details', url: '#' }
    ]);
    
    loadPersonDetails();
    updateFavoriteButton();
    checkPersonInTree();
    
    // Lazy load comments when they come into view
    setupLazyLoading();
    
    // Enhance keyboard navigation
    enhanceKeyboardNavigation();
    
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
    
    // Update breadcrumbs with person name
    initBreadcrumbs([
        { label: 'Home', url: 'index.html' },
        { label: 'Search', url: 'search.html' },
        { label: sanitizeInput(person.name), url: '#' }
    ]);
    
    // Use mainImage if available, otherwise photo, otherwise default
    const mainPhoto = person.mainImage || person.photo || 'assets/images/oldphoto2.jpg';
    const allImages = person.images && person.images.length > 0 ? person.images : (person.photo ? [person.photo] : []);
    const tags = (person.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('');
    
    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('no-NO', options);
    };
    
    const createdAt = person.createdAt ? formatDate(person.createdAt) : '';
    const addedByText = person.createdBy ? `${escapeHtml(person.createdBy)}${createdAt ? ` - ${createdAt}` : ''}` : '';
    
    // Format sources
    const sourcesHtml = person.sources && person.sources.length > 0 ? `
        <div class="sources-section">
            <h3>📚 Kilder</h3>
            ${person.sources.map(source => {
                const isUrl = source.startsWith('http://') || source.startsWith('https://');
                return `<div class="source-item">${isUrl ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source)}</a>` : escapeHtml(source)}</div>`;
            }).join('')}
        </div>
    ` : '';
    
    // Check if user is owner
    const user = getCurrentUser();
    const isOwner = user && person.createdBy === user.username;
    
    // Image gallery with add/remove functionality
    const galleryHtml = `
        <div class="image-gallery-section" style="margin-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="color: var(--turquoise-dark); margin: 0;">📷 Bildegalleri</h3>
                ${isOwner ? `
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn-edit" onclick="addImageToGallery('${currentPersonId}')" style="font-size: 0.9rem; padding: 0.5rem 1rem;">
                            ➕ Legg til bilde
                        </button>
                    </div>
                ` : ''}
            </div>
            ${allImages.length > 0 ? `
                <div class="image-gallery">
                    ${allImages.map((img, idx) => {
                        const isMain = img === mainPhoto || (idx === 0 && !person.mainImage);
                        // Escape single quotes in image URL for onclick
                        const escapedImg = img.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        const imageTags = (person.imageTags && person.imageTags[img]) || [];
                        const tagsDisplay = imageTags.length > 0 ? `
                            <div class="image-tags-display" style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.7); padding: 0.5rem; border-radius: 0 0 8px 8px; color: white; font-size: 0.8rem;">
                                <strong>På bildet:</strong> ${imageTags.map(tag => escapeHtml(tag)).join(', ')}
                            </div>
                        ` : '';
                        return `
                            <div class="gallery-item" style="position: relative;">
                                <img src="${img}" alt="${escapeHtml(person.name)} - Image ${idx + 1}" 
                                     class="gallery-image ${isMain ? 'main' : ''} lazy-gallery-image" 
                                     onclick="setMainImage('${escapedImg}', '${currentPersonId}')" 
                                     onerror="this.src='assets/images/oldphoto2.jpg'"
                                     title="${isMain ? 'Hovedbilde (klikk for å endre)' : 'Klikk for å sette som hovedbilde'}"
                                     loading="lazy">
                                ${isMain ? '<span class="main-badge">Hovedbilde</span>' : ''}
                                ${imageMeta ? `
                                    <div class="image-metadata" style="position: absolute; top: 0.5rem; right: 0.5rem; background: rgba(0,0,0,0.7); color: white; padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.7rem; max-width: 150px; cursor: pointer;" 
                                         onclick="showImageMetadata('${escapedImg}', '${currentPersonId}')" 
                                         title="Klikk for å se bildeinformasjon">
                                        📷 Info
                                    </div>
                                ` : ''}
                                ${isOwner ? `
                                    <div style="position: absolute; bottom: ${imageTags.length > 0 ? '2.5rem' : '0.5rem'}; left: 0.5rem; display: flex; gap: 0.3rem; z-index: 20;">
                                        <button class="gallery-tag-btn" onclick="editImageTags('${escapedImg}', '${currentPersonId}')" title="Tagge hvem som er på bildet" style="background: var(--turquoise-primary); color: white; border: none; border-radius: 4px; padding: 0.3rem 0.6rem; font-size: 0.75rem; cursor: pointer;">
                                            🏷️ Tag
                                        </button>
                                        <button class="gallery-rotate-btn" onclick="rotateImageInGallery('${escapedImg}', '${currentPersonId}')" title="Roter bilde 90°" style="background: var(--orange-primary); color: white; border: none; border-radius: 4px; padding: 0.3rem 0.6rem; font-size: 0.75rem; cursor: pointer;">
                                            🔄 Roter
                                        </button>
                                    </div>
                                ` : ''}
                                ${isOwner && allImages.length > 1 ? `
                                    <button class="gallery-delete-btn" onclick="removeImageFromGallery('${escapedImg}', '${currentPersonId}')" title="Slett bilde">
                                        ✕
                                    </button>
                                ` : ''}
                                ${tagsDisplay}
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `
                <p style="color: var(--gray-dark); text-align: center; padding: 2rem;">
                    ${isOwner ? 'Ingen bilder ennå. Klikk "Legg til bilde" for å legge til bilder.' : 'Ingen bilder tilgjengelig.'}
                </p>
            `}
            <input type="file" id="galleryImageInput" accept="image/*" multiple style="display: none;" onchange="handleGalleryImageUpload(event, '${currentPersonId}')">
        </div>
    `;
    
    const html = `
        <div class="person-detail-header">
            <img src="${mainPhoto}" alt="${escapeHtml(person.name)}" class="person-detail-image" onerror="this.src='assets/images/oldphoto2.jpg'">
            <div class="person-detail-info">
                <h1>${escapeHtml(person.name)}</h1>
                ${person.birthYear ? `<p><span class="info-label">Born:</span> ${person.birthYear}</p>` : ''}
                ${person.deathYear ? `<p><span class="info-label">Died:</span> ${person.deathYear}</p>` : ''}
                ${person.birthPlace ? `<p><span class="info-label">Birth Place:</span> ${escapeHtml(person.birthPlace)}</p>` : ''}
                ${person.deathPlace ? `<p><span class="info-label">Death Place:</span> ${escapeHtml(person.deathPlace)}</p>` : ''}
                ${person.country ? `<p><span class="info-label">Country:</span> ${escapeHtml(person.country)}</p>` : ''}
                ${person.city ? `<p><span class="info-label">City:</span> ${escapeHtml(person.city)}</p>` : ''}
                ${person.description ? `<div style="margin-top: 1.5rem;"><p><span class="info-label">About:</span></p><p style="line-height: 1.6;">${escapeHtml(person.description)}</p></div>` : ''}
                ${tags ? `<div class="person-tags" style="margin-top: 1.5rem;">${tags}</div>` : ''}
                ${addedByText ? `<p style="margin-top: 1.5rem; color: var(--gray-dark); font-size: 0.9rem;">
                    <span class="info-label">Added by:</span> ${addedByText}
                </p>` : ''}
            </div>
        </div>
        ${galleryHtml}
        ${sourcesHtml}
        ${loadRelativesSection(person)}
    `;
    
    document.getElementById('personDetailContent').innerHTML = html;
}

// Load and display relatives section
function loadRelativesSection(person) {
    // Get all relatives using searchByRelationship
    const allRelatives = searchByRelationship(person.name, 'all');
    
    if (allRelatives.length === 0) {
        return `
            <div class="relatives-section" style="margin-top: 2rem;">
                <h3 style="color: var(--turquoise-dark); margin-bottom: 1rem;">👨‍👩‍👧‍👦 Slektninger</h3>
                <p style="color: var(--gray-dark); text-align: center; padding: 2rem;">
                    Ingen slektninger funnet i familietreet. Legg til relasjoner i familietreet for å se slektninger her.
                </p>
            </div>
        `;
    }
    
    // Group relatives by relationship type
    const relativesByType = {
        parents: [],
        siblings: [],
        children: [],
        spouses: [],
        other: []
    };
    
    // Get relationships from tree data to categorize
    const user = getCurrentUser();
    if (user) {
        const treeKey = `pastlife_tree_${user.username}`;
        const savedTree = localStorage.getItem(treeKey);
        
        if (savedTree) {
            try {
                const treeInfo = JSON.parse(savedTree);
                const relationships = treeInfo.relationships || [];
                const treePersons = Array.isArray(treeInfo) ? treeInfo : (treeInfo.persons || []);
                
                const targetInTree = treePersons.find(p => 
                    p.name.toLowerCase() === person.name.toLowerCase()
                );
                
                if (targetInTree) {
                    const personRelations = relationships.filter(rel => 
                        rel.person1 === targetInTree.name || rel.person2 === targetInTree.name
                    );
                    
                    allRelatives.forEach(relative => {
                        const rel = personRelations.find(r => {
                            const relatedName = r.person1 === targetInTree.name ? r.person2 : r.person1;
                            return relatedName.toLowerCase() === relative.name.toLowerCase() ||
                                   (relatedName.toLowerCase().includes(relative.name.toLowerCase().split(' ')[0]) &&
                                    relative.name.toLowerCase().includes(relatedName.toLowerCase().split(' ')[0]));
                        });
                        
                        if (rel) {
                            const relType = rel.type;
                            if (relType === 'parent') {
                                relativesByType.parents.push(relative);
                            } else if (relType === 'sibling' || relType === 'half-sibling') {
                                relativesByType.siblings.push(relative);
                            } else if (relType === 'child') {
                                relativesByType.children.push(relative);
                            } else if (relType === 'spouse') {
                                relativesByType.spouses.push(relative);
                            } else {
                                relativesByType.other.push(relative);
                            }
                        } else {
                            relativesByType.other.push(relative);
                        }
                    });
                } else {
                    // If person not in tree, put all in "other"
                    allRelatives.forEach(rel => relativesByType.other.push(rel));
                }
            } catch (e) {
                console.error('Error parsing tree data:', e);
                allRelatives.forEach(rel => relativesByType.other.push(rel));
            }
        } else {
            allRelatives.forEach(rel => relativesByType.other.push(rel));
        }
    } else {
        allRelatives.forEach(rel => relativesByType.other.push(rel));
    }
    
    // Build HTML for each category
    const buildCategoryHtml = (title, icon, relatives, type) => {
        if (relatives.length === 0) return '';
        
        const typeLabels = {
            parents: 'Foreldre',
            siblings: 'Søsken',
            children: 'Barn',
            spouses: 'Ektefelle(r)',
            other: 'Andre slektninger'
        };
        
        return `
            <div class="relatives-category" style="margin-bottom: 1.5rem;">
                <h4 style="color: var(--turquoise-dark); margin-bottom: 0.75rem; font-size: 1.1rem;">
                    ${icon} ${typeLabels[type]} (${relatives.length})
                </h4>
                <div class="relatives-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                    ${relatives.map(rel => {
                        const photo = rel.photo || rel.mainImage || 'assets/images/oldphoto2.jpg';
                        return `
                            <div class="relative-card" onclick="viewPerson('${rel.id}')" style="
                                background: var(--white);
                                border: 2px solid var(--turquoise-primary);
                                border-radius: 8px;
                                padding: 1rem;
                                cursor: pointer;
                                transition: all 0.3s;
                                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                            " onmouseenter="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 5px rgba(0,0,0,0.1)';">
                                <div style="display: flex; gap: 1rem; align-items: center;">
                                    <img src="${photo}" alt="${escapeHtml(rel.name)}" 
                                         style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid var(--turquoise-primary);"
                                         onerror="this.src='assets/images/oldphoto2.jpg'">
                                    <div style="flex: 1;">
                                        <div style="font-weight: bold; color: var(--turquoise-dark); margin-bottom: 0.25rem;">
                                            ${escapeHtml(rel.name)}
                                        </div>
                                        ${rel.birthYear ? `<div style="font-size: 0.85rem; color: var(--gray-dark);">Født: ${rel.birthYear}</div>` : ''}
                                        ${rel.birthPlace ? `<div style="font-size: 0.8rem; color: var(--gray-dark);">📍 ${escapeHtml(rel.birthPlace)}</div>` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    };
    
    // Filter buttons
    const filterButtons = `
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <button onclick="filterRelatives('all')" class="relative-filter-btn active" data-filter="all" style="
                padding: 0.5rem 1rem;
                border: 2px solid var(--turquoise-primary);
                background: var(--turquoise-primary);
                color: white;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s;
            ">Alle (${allRelatives.length})</button>
            <button onclick="filterRelatives('parents')" class="relative-filter-btn" data-filter="parents" style="
                padding: 0.5rem 1rem;
                border: 2px solid var(--turquoise-primary);
                background: transparent;
                color: var(--turquoise-primary);
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s;
            ">👴👵 Foreldre (${relativesByType.parents.length})</button>
            <button onclick="filterRelatives('siblings')" class="relative-filter-btn" data-filter="siblings" style="
                padding: 0.5rem 1rem;
                border: 2px solid var(--turquoise-primary);
                background: transparent;
                color: var(--turquoise-primary);
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s;
            ">👫 Søsken (${relativesByType.siblings.length})</button>
            <button onclick="filterRelatives('children')" class="relative-filter-btn" data-filter="children" style="
                padding: 0.5rem 1rem;
                border: 2px solid var(--turquoise-primary);
                background: transparent;
                color: var(--turquoise-primary);
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s;
            ">👶 Barn (${relativesByType.children.length})</button>
            <button onclick="filterRelatives('spouses')" class="relative-filter-btn" data-filter="spouses" style="
                padding: 0.5rem 1rem;
                border: 2px solid var(--turquoise-primary);
                background: transparent;
                color: var(--turquoise-primary);
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s;
            ">💑 Ektefelle(r) (${relativesByType.spouses.length})</button>
            ${relativesByType.other.length > 0 ? `
            <button onclick="filterRelatives('other')" class="relative-filter-btn" data-filter="other" style="
                padding: 0.5rem 1rem;
                border: 2px solid var(--turquoise-primary);
                background: transparent;
                color: var(--turquoise-primary);
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s;
            ">🔗 Andre (${relativesByType.other.length})</button>
            ` : ''}
        </div>
    `;
    
    return `
        <div class="relatives-section" style="margin-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <h3 style="color: var(--turquoise-dark); margin: 0;">👨‍👩‍👧‍👦 Slektninger (${allRelatives.length})</h3>
            </div>
            ${filterButtons}
            <div id="relativesContent">
                ${buildCategoryHtml('Foreldre', '👴👵', relativesByType.parents, 'parents')}
                ${buildCategoryHtml('Søsken', '👫', relativesByType.siblings, 'siblings')}
                ${buildCategoryHtml('Barn', '👶', relativesByType.children, 'children')}
                ${buildCategoryHtml('Ektefelle(r)', '💑', relativesByType.spouses, 'spouses')}
                ${buildCategoryHtml('Andre slektninger', '🔗', relativesByType.other, 'other')}
            </div>
        </div>
    `;
}

// Filter relatives by type
window.filterRelatives = function(filterType) {
    // Update button states
    document.querySelectorAll('.relative-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filterType) {
            btn.classList.add('active');
            btn.style.background = 'var(--turquoise-primary)';
            btn.style.color = 'white';
        } else {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--turquoise-primary)';
        }
    });
    
    // Show/hide categories
    const categories = document.querySelectorAll('.relatives-category');
    categories.forEach(category => {
        if (filterType === 'all') {
            category.style.display = 'block';
        } else {
            const categoryType = category.querySelector('h4')?.textContent || '';
            const shouldShow = 
                (filterType === 'parents' && categoryType.includes('Foreldre')) ||
                (filterType === 'siblings' && categoryType.includes('Søsken')) ||
                (filterType === 'children' && categoryType.includes('Barn')) ||
                (filterType === 'spouses' && categoryType.includes('Ektefelle')) ||
                (filterType === 'other' && categoryType.includes('Andre'));
            category.style.display = shouldShow ? 'block' : 'none';
        }
    });
}

// Load comments (can be called lazily)
function loadComments() {
    const comments = getCommentsForPerson(currentPersonId);
    const container = document.getElementById('commentsContainer');
    
    if (!container) return;
    
    if (comments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-dark); padding: 2rem;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    // Show loading indicator first
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="spinner" style="margin: 0 auto;"></div><p style="margin-top: 1rem; color: var(--gray-dark);">Loading comments...</p></div>';
    
    // Load comments with a small delay to allow UI to update
    setTimeout(() => {
        container.innerHTML = comments.map(comment => createCommentHTML(comment)).join('');
    }, 100);
}

// Setup lazy loading for comments and relatives
function setupLazyLoading() {
    if (!('IntersectionObserver' in window)) {
        // Fallback: load immediately if IntersectionObserver not supported
        loadComments();
        return;
    }
    
    // Lazy load comments
    const commentsSection = document.querySelector('.comments-section');
    if (commentsSection) {
        const commentsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const container = document.getElementById('commentsContainer');
                    if (container && !container.dataset.loaded) {
                        container.dataset.loaded = 'true';
                        loadComments();
                        commentsObserver.unobserve(entry.target);
                    }
                }
            });
        }, {
            rootMargin: '200px' // Start loading 200px before section comes into view
        });
        
        commentsObserver.observe(commentsSection);
    }
    
    // Relatives are already loaded in loadPersonDetails, no need for lazy loading
}

// Process comment text (mentions, links, emojis, etc.)
function processCommentText(text) {
    // escapeHtml preserves Unicode emojis correctly, so we can use it directly
    // Emojis are valid Unicode characters and will display correctly
    text = escapeHtml(text);
    
    // Convert @mentions to highlighted text (sanitize mention name)
    text = text.replace(/@(\w+)/g, (match, name) => {
        const sanitizedName = escapeHtml(name);
        return `<span style="background: var(--orange-light); padding: 0.2rem 0.4rem; border-radius: 3px; font-weight: bold; color: var(--orange-dark);">@${sanitizedName}</span>`;
    });
    
    // Convert URLs to clickable links (with validation)
    const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
    text = text.replace(urlRegex, (match) => {
        const safeUrl = sanitizeURL(match);
        if (safeUrl) {
            const displayUrl = escapeHtml(match);
            return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="color: var(--turquoise-primary); text-decoration: underline;">${displayUrl}</a>`;
        }
        return escapeHtml(match); // If URL is invalid, just escape it
    });
    
    // Convert email addresses to mailto links (with validation)
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    text = text.replace(emailRegex, (match) => {
        const safeEmail = escapeHtml(match);
        return `<a href="mailto:${safeEmail}" style="color: var(--turquoise-primary); text-decoration: underline;">${safeEmail}</a>`;
    });
    
    // Emojis are already supported - escapeHtml preserves Unicode characters
    // Users can type emojis directly (😀, ❤️, 🌳, etc.) and they will display correctly
    
    return text;
}

// Create comment HTML
function createCommentHTML(comment) {
    const date = formatDate(comment.createdAt);
    const user = getCurrentUser();
    const isOwner = user && comment.author === user.username;
    const processedText = processCommentText(comment.text);
    
    return `
        <div class="comment" style="transition: all 0.3s;" onmouseenter="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';" onmouseleave="this.style.boxShadow='none';">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div class="comment-author" style="font-weight: bold; color: var(--turquoise-dark);">${escapeHtml(comment.author)}</div>
                    <div class="comment-date" style="color: var(--gray-dark); font-size: 0.85rem; margin-top: 0.25rem;">${date}</div>
                </div>
                ${isOwner ? `
                    <button class="btn-delete" style="padding: 0.3rem 0.8rem; font-size: 0.8rem;" onclick="deleteCommentConfirm('${comment.id}')" title="Slett denne kommentaren">✕</button>
                ` : ''}
            </div>
            <div class="comment-text" style="margin-top: 0.75rem; line-height: 1.6; white-space: pre-wrap;">${processedText}</div>
        </div>
    `;
}

// Delete comment with confirmation
window.deleteCommentConfirm = async function(commentId) {
    const confirmed = await confirmAction(
        'Slett kommentar?',
        'Er du sikker på at du vil slette denne kommentaren? Denne handlingen kan ikke angres.',
        'Slett',
        'Avbryt',
        true
    );
    
    if (confirmed) {
        try {
            deleteComment(commentId);
            showMessage('Kommentar slettet', 'success');
            loadComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            logError('Comment Deletion Error', {
                error: error.message,
                stack: error.stack,
                commentId: commentId
            });
            showMessage('Feil ved sletting av kommentar: ' + error.message, 'error');
        }
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

// Setup @mention autocomplete
function setupMentionAutocomplete() {
    const commentTextarea = document.getElementById('commentText');
    const suggestionsDiv = document.getElementById('mentionSuggestions');
    
    if (!commentTextarea || !suggestionsDiv) return;
    
    let mentionStartPos = -1;
    let selectedSuggestionIndex = -1;
    let mentionSuggestions = [];
    
    commentTextarea.addEventListener('input', (e) => {
        const text = e.target.value;
        const cursorPos = e.target.selectionStart;
        
        // Find @mention pattern before cursor
        const textBeforeCursor = text.substring(0, cursorPos);
        const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
        
        if (mentionMatch) {
            mentionStartPos = cursorPos - mentionMatch[0].length;
            const query = mentionMatch[1].toLowerCase();
            
            // Get all persons for autocomplete
            const allPersons = getAllPersons();
            const currentUser = getCurrentUser();
            
            // Filter persons (exclude private ones if not owner)
            const availablePersons = allPersons.filter(p => {
                if (p.isPrivate && currentUser && p.createdBy !== currentUser.username) {
                    return false;
                }
                return true;
            });
            
            // Get matching names
            mentionSuggestions = availablePersons
                .map(p => p.name)
                .filter(name => {
                    const nameLower = name.toLowerCase();
                    return nameLower.includes(query) || query.length === 0;
                })
                .slice(0, 5) // Limit to 5 suggestions
                .map(name => ({ name: name, display: name }));
            
            if (mentionSuggestions.length > 0) {
                showMentionSuggestions(mentionSuggestions, mentionStartPos);
                selectedSuggestionIndex = -1;
            } else {
                hideMentionSuggestions();
            }
        } else {
            hideMentionSuggestions();
        }
    });
    
    commentTextarea.addEventListener('keydown', (e) => {
        if (mentionSuggestions.length > 0 && suggestionsDiv.style.display !== 'none') {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, mentionSuggestions.length - 1);
                updateMentionSelection();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
                updateMentionSelection();
            } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
                e.preventDefault();
                insertMention(mentionSuggestions[selectedSuggestionIndex].name);
            } else if (e.key === 'Escape') {
                hideMentionSuggestions();
            }
        }
    });
    
    function showMentionSuggestions(suggestions, startPos) {
        suggestionsDiv.innerHTML = suggestions.map((suggestion, index) => `
            <div class="mention-suggestion ${index === selectedSuggestionIndex ? 'selected' : ''}" 
                 data-index="${index}" 
                 role="option"
                 aria-selected="${index === selectedSuggestionIndex}"
                 onclick="insertMentionFromSuggestion('${suggestion.name.replace(/'/g, "\\'")}')">
                @${escapeHtml(suggestion.display)}
            </div>
        `).join('');
        
        suggestionsDiv.style.display = 'block';
        suggestionsDiv.setAttribute('aria-expanded', 'true');
    }
    
    function hideMentionSuggestions() {
        suggestionsDiv.style.display = 'none';
        suggestionsDiv.setAttribute('aria-expanded', 'false');
        mentionSuggestions = [];
        selectedSuggestionIndex = -1;
    }
    
    function updateMentionSelection() {
        const items = suggestionsDiv.querySelectorAll('.mention-suggestion');
        items.forEach((item, index) => {
            if (index === selectedSuggestionIndex) {
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
            } else {
                item.classList.remove('selected');
                item.setAttribute('aria-selected', 'false');
            }
        });
    }
    
    function insertMention(name) {
        const textarea = commentTextarea;
        const text = textarea.value;
        const beforeMention = text.substring(0, mentionStartPos);
        const afterMention = text.substring(textarea.selectionStart);
        const newText = beforeMention + '@' + name + ' ' + afterMention;
        
        textarea.value = newText;
        const newCursorPos = mentionStartPos + name.length + 2; // +2 for '@' and space
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
        
        hideMentionSuggestions();
    }
    
    window.insertMentionFromSuggestion = function(name) {
        insertMention(name);
    };
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!suggestionsDiv.contains(e.target) && e.target !== commentTextarea) {
            hideMentionSuggestions();
        }
    });
}

// Submit comment
window.submitComment = async function() {
    if (!isLoggedIn()) {
        showMessage('Please login to leave comments', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    // Check rate limit for comments
    const { checkRateLimit, recordAction } = await import('./rate-limiter.js');
    const rateLimitCheck = checkRateLimit('commentPosting');
    
    if (!rateLimitCheck.allowed) {
        showMessage(rateLimitCheck.message || 'Rate limit exceeded. Please try again later.', 'error');
        return;
    }
    
    const text = document.getElementById('commentText').value.trim();
    
    if (!text) {
        showMessage('Please enter a comment', 'error');
        return;
    }
    
    // Validate @mentions (check if mentioned persons exist)
    const mentionMatches = text.match(/@(\w+)/g);
    if (mentionMatches) {
        const allPersons = getAllPersons();
        const allNames = allPersons.map(p => p.name.toLowerCase());
        const invalidMentions = mentionMatches
            .map(m => m.substring(1).toLowerCase())
            .filter(name => !allNames.includes(name));
        
        if (invalidMentions.length > 0) {
            showMessage(`Warning: @mentions not found: ${invalidMentions.join(', ')}. They will still be highlighted.`, 'info', 3000);
        }
    }
    
    const user = getCurrentUser();
    addComment(currentPersonId, text, user.username);
    
    // Record comment action
    recordAction('commentPosting');
    
    // Clear textarea
    document.getElementById('commentText').value = '';
    
    // Show success and reload comments
    showMessage('Comment posted successfully!', 'success');
    
    // Announce to screen readers
    const { announceToScreenReader } = await import('./utils.js');
    announceToScreenReader('Comment posted successfully', 'polite');
    
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

// Set main image
window.setMainImage = function(imageUrl, personId) {
    const person = getPersonById(personId);
    if (!person) return;
    
    // Update person with new main image
    const updatedPerson = {
        ...person,
        mainImage: imageUrl,
        photo: imageUrl // Also update photo for backward compatibility
    };
    
    // Save updated person
    import('./data.js').then(({ savePerson }) => {
        savePerson(updatedPerson, personId);
        showMessage('Hovedbilde oppdatert!', 'success');
        loadPersonDetails(); // Reload to show new main image
    });
};

// Show image consent dialog
function showImageConsentDialog() {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        `;
        
        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;
        
        modal.innerHTML = `
            <h2 style="color: var(--turquoise-dark); margin-top: 0;">⚠️ Image Consent Required</h2>
            <div style="background: #f8d7da; border-left: 4px solid #dc3545; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                <p style="margin: 0; color: #721c24;">
                    <strong>Legal Notice:</strong> By uploading images, you confirm that you have obtained proper consent from all identifiable individuals in the photos, 
                    or that you have the legal right to share these images.
                </p>
            </div>
            <div style="margin: 1.5rem 0;">
                <p><strong>You must ensure:</strong></p>
                <ul style="line-height: 1.8;">
                    <li>You have obtained explicit consent from all identifiable individuals</li>
                    <li>For minors, you have parental/guardian consent</li>
                    <li>You have the legal right to share the images</li>
                    <li>The images do not violate privacy rights or GDPR regulations</li>
                </ul>
            </div>
            <div style="margin: 1.5rem 0;">
                <label style="display: flex; align-items: start; cursor: pointer; gap: 0.75rem;">
                    <input type="checkbox" id="imageConsentCheckbox" required style="margin-top: 0.25rem; width: 20px; height: 20px; cursor: pointer;">
                    <span style="line-height: 1.6;">
                        I confirm that I have obtained all necessary consents and have the legal right to upload these images. 
                        I understand that I am legally responsible for ensuring compliance with privacy laws and GDPR.
                    </span>
                </label>
            </div>
            <div style="margin-top: 1.5rem;">
                <a href="terms.html#image-consent" target="_blank" style="color: var(--turquoise-primary); text-decoration: underline;">
                    Read full Terms of Service regarding image consent
                </a>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                <button id="consentCancel" style="
                    flex: 1;
                    padding: 0.875rem 1.5rem;
                    background: var(--gray-medium);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 1rem;
                ">Cancel</button>
                <button id="consentConfirm" style="
                    flex: 1;
                    padding: 0.875rem 1.5rem;
                    background: var(--turquoise-primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    font-size: 1rem;
                ">I Agree & Continue</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Handle confirm
        const confirmBtn = modal.querySelector('#consentConfirm');
        const cancelBtn = modal.querySelector('#consentCancel');
        const checkbox = modal.querySelector('#imageConsentCheckbox');
        
        confirmBtn.addEventListener('click', () => {
            if (!checkbox.checked) {
                showMessage('Please check the consent box to continue', 'error');
                return;
            }
            overlay.remove();
            resolve(true);
        });
        
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });
    });
}

// Add image to gallery
window.addImageToGallery = function(personId) {
    const input = document.getElementById('galleryImageInput');
    if (input) {
        input.click();
    }
};

// Handle gallery image upload
window.handleGalleryImageUpload = async function(event, personId) {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    const person = getPersonById(personId);
    if (!person) {
        showMessage('Person ikke funnet', 'error');
        return;
    }
    
    // Check if user is owner
    const user = getCurrentUser();
    if (!user || person.createdBy !== user.username) {
        showMessage('Du kan bare legge til bilder til dine egne personer', 'error');
        return;
    }
    
    // Show consent dialog before uploading
    const consentGiven = await showImageConsentDialog();
    if (!consentGiven) {
        // Reset input
        event.target.value = '';
        return;
    }
    
    // Check rate limit for image uploads
    const { checkRateLimit, recordAction } = await import('./rate-limiter.js');
    const rateLimitCheck = checkRateLimit('imageUploads');
    
    if (!rateLimitCheck.allowed) {
        showMessage(rateLimitCheck.message || 'Rate limit exceeded. Please try again later.', 'error');
        event.target.value = '';
        return;
    }
    
    const loadingOverlay = showLoadingOverlay(`Laster opp ${files.length} bilde(r)...`);
    
    try {
        
        const { imageToBase64 } = await import('./data.js');
        const newImages = [];
        
        // Process all files
        for (const file of files) {
            // Record image upload action
            recordAction('imageUploads');
            // Validate file type
            if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
                showMessage(`Ugyldig bildeformat: ${file.name}. Bruk JPEG, PNG, GIF eller WebP.`, 'error');
                continue;
            }
            
            // Validate file size
            if (file.size > 10 * 1024 * 1024) {
                showMessage(`Bildet ${file.name} er for stort. Maksimal størrelse er 10MB.`, 'error');
                continue;
            }
            
            // Compress and convert to base64
            const base64 = await imageToBase64(file, 800, 0.75);
            
            // Get and store image metadata
            const { getImageMetadata } = await import('./data.js');
            const metadata = await getImageMetadata(file, base64, user.username);
            
            // Store metadata with image URL (base64)
            if (!person.imageMetadata) person.imageMetadata = {};
            person.imageMetadata[base64] = metadata;
            
            newImages.push(base64);
        }
        
        if (newImages.length === 0) {
            showMessage('Ingen bilder ble lastet opp', 'error');
            return;
        }
        
        // Update person with new images
        const currentImages = person.images || (person.photo ? [person.photo] : []);
        const updatedImages = [...currentImages, ...newImages];
        
        const updatedPerson = {
            ...person,
            images: updatedImages,
            // Set first new image as main if no main image exists
            mainImage: person.mainImage || newImages[0],
            photo: person.photo || newImages[0] // Also update photo for backward compatibility
        };
        
        // Save updated person
        const { savePerson } = await import('./data.js');
        savePerson(updatedPerson, personId);
        
        hideLoadingOverlay();
        showMessage(`${newImages.length} bilde(r) lagt til i galleriet!`, 'success');
        loadPersonDetails(); // Reload to show new images
        
        // Reset input
        event.target.value = '';
    } catch (error) {
        hideLoadingOverlay();
        console.error('Error uploading images:', error);
        showMessage('Feil ved opplasting av bilder: ' + error.message, 'error');
    }
};

// Rotate image in gallery
window.rotateImageInGallery = async function(imageUrl, personId) {
    const person = getPersonById(personId);
    if (!person) {
        showMessage('Person ikke funnet', 'error');
        return;
    }
    
    // Check if user is owner
    const user = getCurrentUser();
    if (!user || person.createdBy !== user.username) {
        showMessage('Du kan bare rotere bilder fra dine egne personer', 'error');
        return;
    }
    
    try {
        showMessage('Roterer bilde...', 'info');
        
        // Rotate image 90 degrees
        const rotatedImage = await rotateImage(imageUrl, 90);
        
        // Update image in array
        const currentImages = person.images || (person.photo ? [person.photo] : []);
        const imageIndex = currentImages.indexOf(imageUrl);
        
        if (imageIndex === -1) {
            showMessage('Bilde ikke funnet i galleriet', 'error');
            return;
        }
        
        // Replace old image with rotated version
        const updatedImages = [...currentImages];
        updatedImages[imageIndex] = rotatedImage;
        
        // Update main image if it was the rotated one
        let newMainImage = person.mainImage;
        if (person.mainImage === imageUrl) {
            newMainImage = rotatedImage;
        }
        
        // Update person
        const updatedPerson = {
            ...person,
            images: updatedImages,
            mainImage: newMainImage,
            photo: person.photo === imageUrl ? rotatedImage : person.photo
        };
        
        // Save updated person
        const { savePerson } = await import('./data.js');
        savePerson(updatedPerson, personId);
        
        showMessage('Bilde rotert!', 'success');
        loadPersonDetails(); // Reload to show rotated image
    } catch (error) {
        console.error('Error rotating image:', error);
        showMessage('Feil ved rotasjon av bilde: ' + error.message, 'error');
    }
};

// Remove image from gallery
window.removeImageFromGallery = async function(imageUrl, personId) {
    const confirmed = await confirmAction(
        'Delete Image?',
        'Are you sure you want to delete this image? This action cannot be undone.',
        'Delete',
        'Cancel',
        true
    );
    
    if (!confirmed) {
        return;
    }
    
    const person = getPersonById(personId);
    if (!person) {
        showMessage('Person ikke funnet', 'error');
        return;
    }
    
    // Check if user is owner
    const user = getCurrentUser();
    if (!user || person.createdBy !== user.username) {
        showMessage('Du kan bare slette bilder fra dine egne personer', 'error');
        return;
    }
    
    const currentImages = person.images || (person.photo ? [person.photo] : []);
    
    // Don't allow deleting if it's the only image
    if (currentImages.length <= 1) {
        showMessage('Du kan ikke slette det eneste bildet. Legg til et nytt bilde først.', 'error');
        return;
    }
    
    // Remove image from array
    const updatedImages = currentImages.filter(img => img !== imageUrl);
    
    // If deleted image was main image, set first remaining image as main
    let newMainImage = person.mainImage;
    if (person.mainImage === imageUrl) {
        newMainImage = updatedImages[0];
    }
    
    const updatedPerson = {
        ...person,
        images: updatedImages,
        mainImage: newMainImage,
        photo: newMainImage // Also update photo for backward compatibility
    };
    
    // Save updated person
    const { savePerson } = await import('./data.js');
    savePerson(updatedPerson, personId);
    
    showMessage('Bilde slettet', 'success');
    loadPersonDetails(); // Reload to show updated gallery
};

// Show image metadata
window.showImageMetadata = function(imageUrl, personId) {
    const person = getPersonById(personId);
    if (!person) return;
    
    const metadata = (person.imageMetadata && person.imageMetadata[imageUrl]) || null;
    if (!metadata) {
        showMessage('No metadata available for this image', 'info');
        return;
    }
    
    // Create modal to display metadata
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
    `;
    
    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    
    modal.innerHTML = `
        <h2 style="color: var(--turquoise-dark); margin-top: 0;">📷 Image Information</h2>
        <div style="margin-top: 1.5rem;">
            <div style="margin-bottom: 1rem;">
                <strong>Filename:</strong> ${escapeHtml(metadata.filename || 'Unknown')}
            </div>
            ${metadata.dimensions ? `
                <div style="margin-bottom: 1rem;">
                    <strong>Dimensions:</strong> ${metadata.dimensions.width} × ${metadata.dimensions.height} pixels
                </div>
            ` : ''}
            <div style="margin-bottom: 1rem;">
                <strong>Original Size:</strong> ${formatSize(metadata.originalSize || 0)}
            </div>
            ${metadata.compressedSize ? `
                <div style="margin-bottom: 1rem;">
                    <strong>Compressed Size:</strong> ${formatSize(metadata.compressedSize)}
                    ${metadata.compressionRatio ? ` (${metadata.compressionRatio}% reduction)` : ''}
                </div>
            ` : ''}
            <div style="margin-bottom: 1rem;">
                <strong>Format:</strong> ${metadata.format || metadata.mimeType || 'Unknown'}
            </div>
            ${metadata.uploadedAt ? `
                <div style="margin-bottom: 1rem;">
                    <strong>Uploaded:</strong> ${new Date(metadata.uploadedAt).toLocaleString()}
                </div>
            ` : ''}
            ${metadata.uploadedBy ? `
                <div style="margin-bottom: 1rem;">
                    <strong>Uploaded by:</strong> ${escapeHtml(metadata.uploadedBy)}
                </div>
            ` : ''}
        </div>
        <button onclick="this.closest('.image-metadata-overlay').remove()" style="
            margin-top: 1.5rem;
            padding: 0.875rem 1.5rem;
            background: var(--turquoise-primary);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            width: 100%;
        ">Close</button>
    `;
    
    overlay.className = 'image-metadata-overlay';
    overlay.appendChild(modal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    document.body.appendChild(overlay);
};

// Edit image tags
window.editImageTags = async function(imageUrl, personId) {
    const person = getPersonById(personId);
    if (!person) {
        showMessage('Person ikke funnet', 'error');
        return;
    }
    
    // Check if user is owner
    const user = getCurrentUser();
    if (!user || person.createdBy !== user.username) {
        showMessage('Du kan bare tagge bilder for dine egne personer', 'error');
        return;
    }
    
    // Get current tags for this image
    const currentTags = (person.imageTags && person.imageTags[imageUrl]) || [];
    const tagsString = currentTags.join(', ');
    
    // Prompt for tags
    const newTagsString = prompt('Hvem er på bildet? (kommaseparert liste av navn):', tagsString);
    if (newTagsString === null) return; // User cancelled
    
    // Parse tags
    const newTags = newTagsString.split(',').map(t => t.trim()).filter(t => t);
    
    // Update person with new image tags
    if (!person.imageTags) person.imageTags = {};
    person.imageTags[imageUrl] = newTags;
    
    // Save updated person
    const { savePerson } = await import('./data.js');
    savePerson(person, personId);
    
    showMessage('Bildetagger oppdatert!', 'success');
    loadPersonDetails(); // Reload to show updated tags
};

// Get all persons (helper)
function getAllPersons() {
    const personsKey = 'pastlife_persons';
    return JSON.parse(localStorage.getItem(personsKey) || '[]');
}

// View person details
window.viewPerson = function(id) {
    window.location.href = `person.html?id=${id}`;
};
