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
            const nameMatch = personName.includes(nameSearch) || 
                           personName.split(' ').some(part => part.startsWith(nameSearch));
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
        
        if (filters.year) {
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
