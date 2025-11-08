// Data management for persons, comments, and images
export const PERSONS_KEY = 'pastlife_persons';
export const COMMENTS_KEY = 'pastlife_comments';

// Initialize data storage
function initData() {
    if (!localStorage.getItem(PERSONS_KEY)) {
        localStorage.setItem(PERSONS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(COMMENTS_KEY)) {
        localStorage.setItem(COMMENTS_KEY, JSON.stringify([]));
    }
}

// Get all persons
export function getAllPersons() {
    initData();
    return JSON.parse(localStorage.getItem(PERSONS_KEY));
}

// Save person (new or update)
export function savePerson(personData, personId = null) {
    initData();
    const persons = getAllPersons();
    
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
                lastModified: new Date().toISOString()
            };
            localStorage.setItem(PERSONS_KEY, JSON.stringify(persons));
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
        createdBy: personData.createdBy,
        createdAt: personData.createdAt || new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    persons.push(person);
    localStorage.setItem(PERSONS_KEY, JSON.stringify(persons));
    return person;
}

// Delete person
export function deletePerson(personId) {
    initData();
    const persons = getAllPersons();
    const filtered = persons.filter(p => p.id !== personId);
    localStorage.setItem(PERSONS_KEY, JSON.stringify(filtered));
    
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

// Search persons with improved fuzzy search
export function searchPersons(filters) {
    const persons = getAllPersons();
    
    return persons.filter(person => {
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
        
        if (filters.tags) {
            const tagSearch = filters.tags.toLowerCase();
            const tagMatch = person.tags.some(tag => 
                tag.toLowerCase().includes(tagSearch)
            );
            matches = matches && tagMatch;
        }
        
        // Search in description
        if (filters.description) {
            const descMatch = person.description.toLowerCase().includes(filters.description.toLowerCase());
            matches = matches && descMatch;
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
export function imageToBase64(file, maxWidth = 800, quality = 0.75) {
    return new Promise((resolve, reject) => {
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
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                // Use better image rendering
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression
                // Use JPEG for better compression, but preserve quality
                const compressed = canvas.toDataURL('image/jpeg', quality);
                
                // Log compression info (for debugging)
                const originalSizeKB = (file.size / 1024).toFixed(2);
                const compressedSizeKB = ((compressed.length * 3) / 4 / 1024).toFixed(2);
                const compressionRatio = ((1 - (compressed.length * 3) / 4 / file.size) * 100).toFixed(1);
                console.log(`Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB (${compressionRatio}% reduction)`);
                
                resolve(compressed);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Get persons by creator
export function getPersonsByCreator(username) {
    const persons = getAllPersons();
    return persons.filter(p => p.createdBy === username);
}
