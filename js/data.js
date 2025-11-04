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
                birthYear: personData.birthYear || null,
                deathYear: personData.deathYear || null,
                birthPlace: personData.birthPlace || '',
                deathPlace: personData.deathPlace || '',
                country: personData.country || '',
                city: personData.city || '',
                description: personData.description || '',
                photo: personData.photo !== undefined ? personData.photo : persons[index].photo,
                tags: personData.tags || [],
                updatedAt: new Date().toISOString()
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
        tags: personData.tags || [],
        createdBy: personData.createdBy,
        createdAt: new Date().toISOString()
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
        
        return matches;
    });
}

// Search for persons by relationship (e.g., find all siblings of X)
export function searchByRelationship(personName, relationshipType) {
    const allPersons = getAllPersons();
    const targetPerson = allPersons.find(p => p.name.toLowerCase() === personName.toLowerCase());
    
    if (!targetPerson) return [];
    
    // For now, we'll search by tags that indicate relationships
    // In a full implementation, we'd use the relationships array from family tree
    const results = [];
    
    // Try to find relationships from family tree data
    const user = JSON.parse(localStorage.getItem('pastlife_auth') || 'null');
    if (user) {
        const treeKey = `pastlife_tree_${user.username}`;
        const treeData = JSON.parse(localStorage.getItem(treeKey) || '[]');
        
        // This is a simplified version - in a full implementation,
        // we'd need to store relationships in the main persons data
        // For now, return persons with similar last names or tags
        const lastName = targetPerson.name.split(' ').pop()?.toLowerCase() || '';
        if (lastName) {
            return allPersons.filter(p => {
                if (p.id === targetPerson.id) return false;
                const pLastName = p.name.split(' ').pop()?.toLowerCase() || '';
                
                // Same last name could indicate family relationship
                if (pLastName === lastName) return true;
                
                // Same tags (excluding morsside/farsside)
                const targetTags = (targetPerson.tags || []).filter(t => t !== 'morsside' && t !== 'farsside');
                const pTags = (p.tags || []).filter(t => t !== 'morsside' && t !== 'farsside');
                if (targetTags.length > 0 && pTags.some(t => targetTags.includes(t))) return true;
                
                return false;
            });
        }
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
export function imageToBase64(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        // Validate file type
        if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
            reject(new Error('Invalid image format. Please use JPEG, PNG, GIF, or WebP.'));
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            reject(new Error('Image is too large. Maximum size is 5MB.'));
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression
                const compressed = canvas.toDataURL('image/jpeg', quality);
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
