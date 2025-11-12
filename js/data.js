// Data management for persons, comments, and images
export const PERSONS_KEY = 'pastlife_persons';
export const COMMENTS_KEY = 'pastlife_comments';

// Cache for performance optimization
let personsCache = null;
let personsCacheTimestamp = null;
let searchIndexCache = null;
const CACHE_DURATION = 5000; // 5 seconds cache

// Initialize data storage
function initData() {
    if (!localStorage.getItem(PERSONS_KEY)) {
        localStorage.setItem(PERSONS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(COMMENTS_KEY)) {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify([]));
    }
}

// Invalidate cache (call when data changes)
function invalidateCache() {
    personsCache = null;
    personsCacheTimestamp = null;
    searchIndexCache = null;
}

// Get all persons with caching
export function getAllPersons(forceRefresh = false) {
    initData();
    
    // Check if cache is valid
    const now = Date.now();
    if (!forceRefresh && personsCache && personsCacheTimestamp && (now - personsCacheTimestamp) < CACHE_DURATION) {
        return personsCache;
    }
    
    // Load from localStorage
    const persons = JSON.parse(localStorage.getItem(PERSONS_KEY) || '[]');
    
    // Update cache
    personsCache = persons;
    personsCacheTimestamp = now;
    
    return persons;
}

// Build search index for faster searching
function buildSearchIndex(persons) {
    const index = {
        byName: new Map(), // name -> [person, ...]
        byCountry: new Map(), // country -> [person, ...]
        byCity: new Map(), // city -> [person, ...]
        byTag: new Map(), // tag -> [person, ...]
        byYear: new Map(), // year -> [person, ...]
        byNameLower: new Map() // lowercase name -> [person, ...] for case-insensitive search
    };
    
    persons.forEach(person => {
        // Index by name
        const name = person.name || '';
        if (name) {
            if (!index.byName.has(name)) {
                index.byName.set(name, []);
            }
            index.byName.get(name).push(person);
            
            // Also index by lowercase for case-insensitive search
            const nameLower = name.toLowerCase();
            if (!index.byNameLower.has(nameLower)) {
                index.byNameLower.set(nameLower, []);
            }
            index.byNameLower.get(nameLower).push(person);
        }
        
        // Index by country
        const country = person.country || '';
        if (country) {
            const countryLower = country.toLowerCase();
            if (!index.byCountry.has(countryLower)) {
                index.byCountry.set(countryLower, []);
            }
            index.byCountry.get(countryLower).push(person);
        }
        
        // Index by city
        const city = person.city || '';
        if (city) {
            const cityLower = city.toLowerCase();
            if (!index.byCity.has(cityLower)) {
                index.byCity.set(cityLower, []);
            }
            index.byCity.get(cityLower).push(person);
        }
        
        // Index by tags
        (person.tags || []).forEach(tag => {
            const tagLower = tag.toLowerCase();
            if (!index.byTag.has(tagLower)) {
                index.byTag.set(tagLower, []);
            }
            index.byTag.get(tagLower).push(person);
        });
        
        // Index by years
        if (person.birthYear) {
            if (!index.byYear.has(person.birthYear)) {
                index.byYear.set(person.birthYear, []);
            }
            index.byYear.get(person.birthYear).push(person);
        }
        if (person.deathYear) {
            if (!index.byYear.has(person.deathYear)) {
                index.byYear.set(person.deathYear, []);
            }
            index.byYear.get(person.deathYear).push(person);
        }
    });
    
    return index;
}

// Get or build search index
function getSearchIndex() {
    const persons = getAllPersons();
    
    // Check if index is still valid (same number of persons)
    if (searchIndexCache && searchIndexCache.personCount === persons.length) {
        return searchIndexCache.index;
    }
    
    // Build new index
    const index = buildSearchIndex(persons);
    searchIndexCache = {
        index: index,
        personCount: persons.length
    };
    
    return index;
}

// Save person (new or update)
export function savePerson(personData, personId = null) {
    initData();
    const persons = getAllPersons(true); // Force refresh to get latest data
    
    if (personId) {
        // Update existing person
        const index = persons.findIndex(p => p.id === personId);
        if (index !== -1) {
            persons[index] = {
                ...persons[index],
                name: personData.name,
                birthYear: personData.birthYear !== undefined ? personData.birthYear : persons[index].birthYear,
                deathYear: personData.deathYear !== undefined ? personData.deathYear : persons[index].deathYear,
                birthPlace: personData.birthPlace !== undefined ? personData.birthPlace : persons[index].birthPlace,
                deathPlace: personData.deathPlace !== undefined ? personData.deathPlace : persons[index].deathPlace,
                country: personData.country !== undefined ? personData.country : persons[index].country,
                city: personData.city !== undefined ? personData.city : persons[index].city,
                description: personData.description !== undefined ? personData.description : persons[index].description,
                photo: personData.photo !== undefined ? personData.photo : persons[index].photo,
                images: personData.images !== undefined ? personData.images : (persons[index].images || (persons[index].photo ? [persons[index].photo] : [])),
                imageTags: personData.imageTags !== undefined ? personData.imageTags : (persons[index].imageTags || {}),
                mainImage: personData.mainImage !== undefined ? personData.mainImage : (persons[index].mainImage || persons[index].photo),
                sources: personData.sources !== undefined ? personData.sources : (persons[index].sources || []),
                tags: personData.tags !== undefined ? personData.tags : persons[index].tags,
                isPrivate: personData.isPrivate !== undefined ? personData.isPrivate : (persons[index].isPrivate || false),
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(PERSONS_KEY, JSON.stringify(persons));
            invalidateCache(); // Invalidate cache after update
            return persons[index];
        }
    }
    
    // Create new person
    const person = {
        id: personId || (Date.now().toString() + Math.random().toString(36).substr(2, 9)),
        name: personData.name,
        birthYear: personData.birthYear || null,
        deathYear: personData.deathYear || null,
        birthPlace: personData.birthPlace || '',
        deathPlace: personData.deathPlace || '',
        country: personData.country || '',
        city: personData.city || '',
        description: personData.description || '',
        photo: personData.photo || null,
        images: personData.images || (personData.photo ? [personData.photo] : []), // Support multiple images
        imageTags: personData.imageTags || {}, // Tags per image: { imageUrl: ['person1', 'person2'] }
        mainImage: personData.mainImage || personData.photo || null, // Main image for display
        sources: personData.sources || [], // Sources array
        tags: personData.tags || [],
        isPrivate: personData.isPrivate || false, // Private mode flag
        createdBy: personData.createdBy,
        createdAt: personData.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    persons.push(person);
    localStorage.setItem(PERSONS_KEY, JSON.stringify(persons));
    invalidateCache(); // Invalidate cache after adding new person
    return person;
}

// Delete person
export function deletePerson(personId) {
    initData();
    const persons = getAllPersons(true); // Force refresh
    const filtered = persons.filter(p => p.id !== personId);
    localStorage.setItem(PERSONS_KEY, JSON.stringify(filtered));
    invalidateCache(); // Invalidate cache after deletion
    
    // Also delete associated comments
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY));
    const filteredComments = comments.filter(c => c.personId !== personId);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(filteredComments));
}

// Delete comment
export function deleteComment(commentId) {
    initData();
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY));
    const filtered = comments.filter(c => c.id !== commentId);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));
}

// Export all data
export function exportData() {
    return {
        persons: getAllPersons(),
        comments: JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]'),
        exportDate: new Date().toISOString()
    };
}

// Import data
export function importData(data) {
    if (data.persons && Array.isArray(data.persons)) {
        localStorage.setItem(PERSONS_KEY, JSON.stringify(data.persons));
    }
    if (data.comments && Array.isArray(data.comments)) {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(data.comments));
    }
}

// Get person by ID
export function getPersonById(id) {
    const persons = getAllPersons();
    return persons.find(p => p.id === id);
}

// Search persons with improved fuzzy search and indexing
export function searchPersons(filters, currentUser = null) {
    // Use index for simple exact matches to improve performance
    const index = getSearchIndex();
    let candidates = null;
    
    // If we have simple filters that can use index, start with indexed results
    if (filters.name && !filters.country && !filters.city && !filters.tags && !filters.description && !filters.comments && !filters.yearFrom && !filters.yearTo && !filters.year) {
        const nameLower = filters.name.toLowerCase().trim();
        // Try exact match first
        if (index.byNameLower.has(nameLower)) {
            candidates = index.byNameLower.get(nameLower);
        } else {
            // For fuzzy search, we still need to check all persons
            candidates = getAllPersons();
        }
    } else if (filters.country && !filters.name && !filters.city && !filters.tags && !filters.description && !filters.comments && !filters.yearFrom && !filters.yearTo && !filters.year) {
        const countryLower = filters.country.toLowerCase().trim();
        if (index.byCountry.has(countryLower)) {
            candidates = index.byCountry.get(countryLower);
        } else {
            candidates = getAllPersons();
        }
    } else if (filters.city && !filters.name && !filters.country && !filters.tags && !filters.description && !filters.comments && !filters.yearFrom && !filters.yearTo && !filters.year) {
        const cityLower = filters.city.toLowerCase().trim();
        if (index.byCity.has(cityLower)) {
            candidates = index.byCity.get(cityLower);
        } else {
            candidates = getAllPersons();
        }
    } else {
        // Complex search - use all persons
        candidates = getAllPersons();
    }
    
    return candidates.filter(person => {
        let matches = true;
        
        if (filters.name) {
            const nameSearch = filters.name.toLowerCase().trim();
            const personName = person.name.toLowerCase();
            
            // Exact match or contains match
            let nameMatch = personName.includes(nameSearch) || 
                           personName.split(' ').some(part => part.startsWith(nameSearch));
            
            // Fuzzy search - handle common name variations
            if (!nameMatch) {
                // Common letter substitutions (Norwegian/English)
                const variations = {
                    'edvard': ['edward', 'edvart', 'edvards'],
                    'edward': ['edvard', 'edvart'],
                    'kristian': ['christian', 'kristan', 'kristian'],
                    'christian': ['kristian', 'kristan'],
                    'johan': ['johannes', 'johan', 'johann'],
                    'anders': ['andreas', 'andré', 'andrew'],
                    'marie': ['maria', 'mary'],
                    'anna': ['anne', 'annah'],
                    'ole': ['ole', 'ola', 'olav'],
                    'hans': ['johannes', 'johan']
                };
                
                // Check if search term has known variations
                for (const [key, variants] of Object.entries(variations)) {
                    if (nameSearch.includes(key) || variants.some(v => nameSearch.includes(v))) {
                        const searchVariations = [key, ...variants];
                        nameMatch = searchVariations.some(variant => 
                            personName.includes(variant) || 
                            personName.split(' ').some(part => part.startsWith(variant))
                        );
                        if (nameMatch) break;
                    }
                }
                
                // Levenshtein-like fuzzy matching (simple version)
                if (!nameMatch && nameSearch.length >= 3) {
                    const nameParts = personName.split(' ');
                    const searchParts = nameSearch.split(' ');
                    
                    for (const searchPart of searchParts) {
                        for (const namePart of nameParts) {
                            // Check if strings are similar (1-2 character difference)
                            if (namePart.length >= 3 && searchPart.length >= 3) {
                                const diff = Math.abs(namePart.length - searchPart.length);
                                if (diff <= 2 && namePart.slice(0, 3) === searchPart.slice(0, 3)) {
                                    nameMatch = true;
                                    break;
                                }
                            }
                        }
                        if (nameMatch) break;
                    }
                }
            }
            
            matches = matches && nameMatch;
        }
        
        if (filters.country) {
            const countryMatch = person.country.toLowerCase().includes(filters.country.toLowerCase());
            matches = matches && countryMatch;
        }
        
        if (filters.city) {
            const cityMatch = person.city.toLowerCase().includes(filters.city.toLowerCase());
            matches = matches && cityMatch;
        }
        
        // Date range search (from year - to year)
        if (filters.yearFrom || filters.yearTo) {
            const yearFrom = filters.yearFrom ? parseInt(filters.yearFrom) : null;
            const yearTo = filters.yearTo ? parseInt(filters.yearTo) : null;
            
            let yearMatch = false;
            
            if (yearFrom && yearTo) {
                // Search in range - matches if person lived during any part of range
                yearMatch = (person.birthYear && person.birthYear <= yearTo && (!person.deathYear || person.deathYear >= yearFrom)) ||
                           (person.deathYear && person.deathYear >= yearFrom && (!person.birthYear || person.birthYear <= yearTo)) ||
                           (person.birthYear && person.deathYear && person.birthYear <= yearTo && person.deathYear >= yearFrom);
            } else if (yearFrom) {
                // From year onwards
                yearMatch = (person.birthYear && person.birthYear >= yearFrom) ||
                           (person.deathYear && person.deathYear >= yearFrom);
            } else if (yearTo) {
                // Up to year
                yearMatch = (person.birthYear && person.birthYear <= yearTo) ||
                           (person.deathYear && person.deathYear <= yearTo);
            }
            
            matches = matches && yearMatch;
        }
        
        // Search in description
        if (filters.description) {
            const descSearch = filters.description.toLowerCase().trim();
            const personDesc = (person.description || '').toLowerCase();
            if (!personDesc.includes(descSearch)) {
                matches = false;
            }
        }
        
        // Search by tags
        if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
            const personTags = (person.tags || []).map(t => t.toLowerCase());
            const searchTags = filters.tags.map(t => t.toLowerCase());
            const hasMatchingTag = searchTags.some(st => personTags.some(pt => pt.includes(st) || st.includes(pt)));
            if (!hasMatchingTag) {
                matches = false;
            }
        }
        
        // Legacy single year search (for backwards compatibility)
        if (filters.year && !filters.yearFrom && !filters.yearTo) {
            const year = parseInt(filters.year);
            const yearMatch = (person.birthYear && person.birthYear === year) ||
                             (person.deathYear && person.deathYear === year) ||
                             (person.birthYear && person.deathYear && 
                              person.birthYear <= year && person.deathYear >= year);
            matches = matches && yearMatch;
        }
        
        // Search in comments (full-text search)
        if (filters.comments) {
            const commentSearch = filters.comments.toLowerCase().trim();
            const personComments = getCommentsForPerson(person.id);
            const commentMatch = personComments.some(comment => 
                comment.text.toLowerCase().includes(commentSearch) ||
                (comment.author && comment.author.toLowerCase().includes(commentSearch))
            );
            if (!commentMatch) {
                matches = false;
            }
        }
        
        // Location radius search
        if (filters.locationCenter && filters.locationRadius) {
            const center = filters.locationCenter.toLowerCase().trim();
            const radius = filters.locationRadius;
            
            let locationMatch = false;
            
            // Get person's locations (birth place, death place, city, country)
            const personLocations = [
                person.birthPlace?.toLowerCase() || '',
                person.deathPlace?.toLowerCase() || '',
                person.city?.toLowerCase() || '',
                person.country?.toLowerCase() || ''
            ].filter(loc => loc);
            
            if (radius === 'exact') {
                // Exact match: same city or place name
                locationMatch = personLocations.some(loc => 
                    loc === center || 
                    loc.includes(center) || 
                    center.includes(loc) ||
                    loc.split(',').some(part => part.trim() === center) ||
                    center.split(',').some(part => part.trim() === loc)
                );
            } else if (radius === 'nearby') {
                // Nearby: same country
                const centerCountry = center.split(',').pop()?.trim() || center;
                locationMatch = personLocations.some(loc => {
                    const locCountry = loc.split(',').pop()?.trim() || loc;
                    return locCountry === centerCountry || 
                           locCountry.includes(centerCountry) || 
                           centerCountry.includes(locCountry);
                });
            } else if (radius === 'region') {
                // Region: similar place names (fuzzy match)
                locationMatch = personLocations.some(loc => {
                    // Check if any word in center matches any word in location
                    const centerWords = center.split(/[\s,]+/).filter(w => w.length > 2);
                    const locWords = loc.split(/[\s,]+/).filter(w => w.length > 2);
                    
                    return centerWords.some(cw => 
                        locWords.some(lw => 
                            lw.includes(cw) || 
                            cw.includes(lw) ||
                            (cw.length >= 4 && lw.length >= 4 && 
                             cw.slice(0, 4) === lw.slice(0, 4))
                        )
                    );
                });
            }
            
            if (!locationMatch) {
                matches = false;
            }
        }
        
        // Filter private persons: only show if user is the creator or if person is not private
        if (person.isPrivate) {
            const currentUsername = currentUser?.username || currentUser;
            if (person.createdBy !== currentUsername) {
                matches = false; // Hide private person from other users
            }
        }
        
        return matches;
    });
}

// Search for persons by relationship (e.g., find all siblings of X)
export function searchByRelationship(personName, relationshipType = 'all') {
    const allPersons = getAllPersons();
    const targetPerson = allPersons.find(p => p.name.toLowerCase() === personName.toLowerCase());
    
    if (!targetPerson) return [];
    
    const results = [];
    const foundIds = new Set();
    
    // Try to find relationships from family tree data
    const user = JSON.parse(localStorage.getItem('pastlife_auth') || 'null');
    if (user) {
        const treeKey = `pastlife_tree_${user.username}`;
        const savedTree = localStorage.getItem(treeKey);
        
        if (savedTree) {
            try {
                const treeInfo = JSON.parse(savedTree);
                const relationships = treeInfo.relationships || [];
                const treePersons = Array.isArray(treeInfo) ? treeInfo : (treeInfo.persons || []);
                
                // Find target person in tree (by name match)
                const targetInTree = treePersons.find(p => 
                    p.name.toLowerCase() === personName.toLowerCase() ||
                    (targetPerson.birthYear && p.birthYear && p.birthYear === targetPerson.birthYear && 
                     p.name.toLowerCase().includes(personName.toLowerCase().split(' ')[0]))
                );
                
                if (targetInTree) {
                    // Find all relationships for this person
                    const personRelations = relationships.filter(rel => 
                        rel.person1 === targetInTree.name || rel.person2 === targetInTree.name
                    );
                    
                    // Find related persons based on relationship type
                    personRelations.forEach(rel => {
                        const relatedName = rel.person1 === targetInTree.name ? rel.person2 : rel.person1;
                        const relType = rel.type;
                        
                        // Filter by relationship type if specified
                        if (relationshipType === 'all' || 
                            (relationshipType === 'sibling' && (relType === 'sibling' || relType === 'half-sibling')) ||
                            (relationshipType === 'parent' && relType === 'parent') ||
                            (relationshipType === 'child' && relType === 'child') ||
                            (relationshipType === 'spouse' && relType === 'spouse')) {
                            
                            // Find person in main database
                            const relatedPerson = allPersons.find(p => 
                                p.name.toLowerCase() === relatedName.toLowerCase() ||
                                (p.name.toLowerCase().includes(relatedName.toLowerCase().split(' ')[0]) &&
                                 relatedName.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]))
                            );
                            
                            if (relatedPerson && !foundIds.has(relatedPerson.id)) {
                                results.push(relatedPerson);
                                foundIds.add(relatedPerson.id);
                            }
                        }
                    });
                    
                    // If we found relationships, return them
                    if (results.length > 0) {
                        return results;
                    }
                }
            } catch (e) {
                console.error('Error parsing tree data:', e);
            }
        }
    }
    
    // Fallback: search by last name and tags if no tree relationships found
    const lastName = targetPerson.name.split(' ').pop()?.toLowerCase() || '';
    if (lastName) {
        const fallbackResults = allPersons.filter(p => {
            if (p.id === targetPerson.id || foundIds.has(p.id)) return false;
            const pLastName = p.name.split(' ').pop()?.toLowerCase() || '';
            
            // Same last name could indicate family relationship
            if (pLastName === lastName) return true;
            
            // Same tags (excluding morsside/farsside)
            const targetTags = (targetPerson.tags || []).filter(t => t !== 'morsside' && t !== 'farsside');
            const pTags = (p.tags || []).filter(t => t !== 'morsside' && t !== 'farsside');
            if (targetTags.length > 0 && pTags.some(t => targetTags.includes(t))) return true;
            
            return false;
        });
        
        return [...results, ...fallbackResults];
    }
    
    return results;
}

// Add comment
export function addComment(personId, text, author) {
    initData();
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY));
    
    const comment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        personId: personId,
        text: text,
        author: author,
        createdAt: new Date().toISOString()
    };
    
    comments.push(comment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    return comment;
}

// Get comments for person
export function getCommentsForPerson(personId) {
    initData();
    const comments = JSON.parse(localStorage.getItem(COMMENTS_KEY));
    return comments.filter(c => c.personId === personId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Compress and convert image to base64
// Optimized for different use cases: profile photos (800px), thumbnails (300px), full size (1200px)
// Improved compression: uses adaptive quality based on file size
export function imageToBase64(file, maxWidth = 800, quality = null) {
    // Adaptive quality based on original file size
    if (quality === null) {
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 5) {
            quality = 0.6; // More aggressive compression for large files
        } else if (fileSizeMB > 2) {
            quality = 0.7;
        } else {
            quality = 0.75; // Default quality
        }
    }
    return new Promise((resolve, reject) => {
        // Check if canvas is supported
        if (!document.createElement('canvas').getContext) {
            reject(new Error('Canvas is not supported in this browser. Please use a modern browser.'));
            return;
        }
        
        // Validate file type
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
            reject(new Error('Invalid image format. Please use JPEG, PNG, GIF, or WebP.'));
            return;
        }
        
        // Validate file size (max 10MB before compression)
        if (file.size > 10 * 1024 * 1024) {
            reject(new Error('Image is too large. Maximum size is 10MB before compression.'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions - maintain aspect ratio
                    if (width > maxWidth || height > maxWidth) {
                        const ratio = Math.min(maxWidth / width, maxWidth / height);
                        width = width * ratio;
                        height = height * ratio;
                    }
                    
                    // Ensure dimensions are even numbers for better compression
                    width = Math.round(width / 2) * 2;
                    height = Math.round(height / 2) * 2;
                    
                    // Validate dimensions
                    if (width <= 0 || height <= 0) {
                        reject(new Error('Invalid image dimensions.'));
                        return;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context.'));
                        return;
                    }
                    
                    // Use better image rendering
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64 with compression
                    // Try WebP first if supported, otherwise use JPEG for better compression
                    let compressed;
                    try {
                        // Try WebP for better compression (smaller file size)
                        compressed = canvas.toDataURL('image/webp', quality);
                        // If WebP fails or returns data URL that's too large, fall back to JPEG
                        if (!compressed || compressed.length === 0 || compressed === 'data:,') {
                            compressed = canvas.toDataURL('image/jpeg', quality);
                        }
                    } catch (e) {
                        // Fallback to JPEG if WebP is not supported
                        compressed = canvas.toDataURL('image/jpeg', quality);
                    }
                    
                    if (!compressed || compressed.length === 0) {
                        reject(new Error('Failed to compress image.'));
                        return;
                    }
                    
                    // Log compression info (for debugging)
                    const originalSizeKB = (file.size / 1024).toFixed(2);
                    const compressedSizeKB = ((compressed.length * 3) / 4 / 1024).toFixed(2);
                    const compressionRatio = ((1 - (compressed.length * 3) / 4 / file.size) * 100).toFixed(1);
                    console.log(`Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction)`);
                    
                    resolve(compressed);
                } catch (error) {
                    reject(new Error(`Error processing image: ${error.message}`));
                }
            };
            img.onerror = () => reject(new Error('Failed to load image. The file may be corrupted.'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file. Please try again.'));
        reader.readAsDataURL(file);
    });
}

// Get persons by creator
export function getPersonsByCreator(username) {
    const persons = getAllPersons();
    return persons.filter(p => p.createdBy === username);
}

// Check for duplicate person (similar name and birth year)
// Returns the duplicate person if found, null otherwise
export function checkDuplicatePerson(personData, excludePersonId = null) {
    const allPersons = getAllPersons();
    const nameLower = personData.name.toLowerCase().trim();
    
    return allPersons.find(p => {
        // Skip the person being edited
        if (excludePersonId && p.id === excludePersonId) {
            return false;
        }
        
        const pNameLower = p.name.toLowerCase().trim();
        const nameSimilar = pNameLower === nameLower || 
                           pNameLower.includes(nameLower) || 
                           nameLower.includes(pNameLower);
        
        // Check if birth year matches (if provided)
        const yearMatch = !personData.birthYear || !p.birthYear || 
                         personData.birthYear === p.birthYear;
        
        return nameSimilar && yearMatch;
    }) || null;
}
