// GEDCOM import/export functionality
// GEDCOM is a standard format for genealogy data exchange

import { getAllPersons, savePerson, getPersonById } from './data.js';
import { getCurrentUser } from './auth.js';
import { showMessage, escapeHtml } from './utils.js';

// Export persons to GEDCOM format
export function exportToGEDCOM() {
    const user = getCurrentUser();
    if (!user) {
        showMessage('Please login to export data', 'error');
        return;
    }
    
    const allPersons = getAllPersons();
    const myPersons = allPersons.filter(p => p.createdBy === user.username);
    
    if (myPersons.length === 0) {
        showMessage('No persons to export', 'error');
        return;
    }
    
    // Build GEDCOM content
    let gedcom = '0 HEAD\n';
    gedcom += '1 SOUR PastLife\n';
    gedcom += '2 VERS 1.0\n';
    gedcom += '1 GEDC\n';
    gedcom += '2 VERS 5.5.1\n';
    gedcom += '2 FORM LINEAGE-LINKED\n';
    gedcom += '1 CHAR UTF-8\n';
    gedcom += `1 DATE ${new Date().toISOString().split('T')[0].replace(/-/g, ' ')}\n`;
    gedcom += '1 SUBM @SUBM@\n';
    gedcom += '0 @SUBM@ SUBM\n';
    gedcom += `1 NAME ${user.username}\n`;
    gedcom += '\n';
    
    // Export each person
    myPersons.forEach((person, index) => {
        const indiId = `@I${index + 1}@`;
        gedcom += `0 ${indiId} INDI\n`;
        
        // Name
        const nameParts = person.name.split(' ');
        const givenName = nameParts[0] || '';
        const surname = nameParts.slice(1).join(' ') || '';
        gedcom += `1 NAME ${givenName} /${surname}/\n`;
        gedcom += '2 GIVN ' + givenName + '\n';
        if (surname) {
            gedcom += '2 SURN ' + surname + '\n';
        }
        
        // Sex (not available in our data, but GEDCOM requires it)
        gedcom += '1 SEX U\n'; // U = Unknown
        
        // Birth
        if (person.birthYear || person.birthPlace) {
            gedcom += '1 BIRT\n';
            if (person.birthYear) {
                gedcom += `2 DATE ${person.birthYear}\n`;
            }
            if (person.birthPlace) {
                gedcom += `2 PLAC ${person.birthPlace}\n`;
            }
        }
        
        // Death
        if (person.deathYear || person.deathPlace) {
            gedcom += '1 DEAT\n';
            if (person.deathYear) {
                gedcom += `2 DATE ${person.deathYear}\n`;
            }
            if (person.deathPlace) {
                gedcom += `2 PLAC ${person.deathPlace}\n`;
            }
        }
        
        // Residence
        if (person.city || person.country) {
            const residence = [person.city, person.country].filter(Boolean).join(', ');
            gedcom += `1 RESI\n`;
            gedcom += `2 PLAC ${residence}\n`;
        }
        
        // Notes (description)
        if (person.description) {
            // GEDCOM notes can be multi-line
            const noteLines = person.description.split('\n');
            noteLines.forEach((line, idx) => {
                if (idx === 0) {
                    gedcom += `1 NOTE ${line}\n`;
                } else {
                    gedcom += `2 CONT ${line}\n`;
                }
            });
        }
        
        // Sources
        if (person.sources && person.sources.length > 0) {
            person.sources.forEach((source, srcIdx) => {
                const sourceId = `@S${index + 1}_${srcIdx + 1}@`;
                gedcom += `1 SOUR ${sourceId}\n`;
                gedcom += `0 ${sourceId} SOUR\n`;
                gedcom += `1 TITL ${source}\n`;
            });
        }
        
        gedcom += '\n';
    });
    
    gedcom += '0 TRLR\n';
    
    // Download file
    const blob = new Blob([gedcom], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pastlife_export_${new Date().toISOString().split('T')[0]}.ged`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage(`Exported ${myPersons.length} person(s) to GEDCOM format`, 'success');
}

// Import from GEDCOM format
export function importFromGEDCOM(gedcomText) {
    const user = getCurrentUser();
    if (!user) {
        showMessage('Please login to import data', 'error');
        return { success: false, imported: 0, errors: [] };
    }
    
    const lines = gedcomText.split('\n');
    const persons = [];
    const errors = [];
    let currentPerson = null;
    let currentLevel = 0;
    let currentTag = '';
    let currentValue = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line === '0 HEAD' || line === '0 TRLR' || line.startsWith('0 @SUBM@')) {
            continue;
        }
        
        // Parse GEDCOM line: LEVEL TAG [VALUE] or LEVEL @ID@ TAG [VALUE]
        const match = line.match(/^(\d+)\s+(?:@(\w+)@\s+)?(\w+)(?:\s+(.+))?$/);
        if (!match) continue;
        
        const level = parseInt(match[1]);
        const id = match[2];
        const tag = match[3];
        const value = match[4] || '';
        
        // Start of new individual
        if (level === 0 && tag === 'INDI' && id) {
            // Save previous person if exists
            if (currentPerson && currentPerson.name) {
                persons.push(currentPerson);
            }
            
            // Start new person
            currentPerson = {
                name: '',
                birthYear: null,
                deathYear: null,
                birthPlace: '',
                deathPlace: '',
                city: '',
                country: '',
                description: '',
                sources: [],
                tags: [],
                createdBy: user.username,
                createdAt: new Date().toISOString()
            };
            currentLevel = 0;
        }
        
        // Parse person data
        if (currentPerson) {
            if (level === 1 && tag === 'NAME') {
                // Parse name: "Given /Surname/" or "Given Surname"
                const nameMatch = value.match(/^(.+?)\s+\/(.+?)\//) || value.match(/^(.+)$/);
                if (nameMatch) {
                    const given = nameMatch[1].trim();
                    const surname = nameMatch[2] ? nameMatch[2].trim() : '';
                    currentPerson.name = surname ? `${given} ${surname}` : given;
                }
            } else if (level === 2 && tag === 'GIVN' && !currentPerson.name) {
                // Given name
                const given = value.trim();
                currentPerson.name = given;
            } else if (level === 2 && tag === 'SURN' && currentPerson.name) {
                // Surname - append to name
                const surname = value.trim();
                if (surname) {
                    currentPerson.name = `${currentPerson.name} ${surname}`;
                }
            } else if (level === 1 && tag === 'BIRT') {
                currentLevel = 1;
            } else if (level === 1 && tag === 'DEAT') {
                currentLevel = 2;
            } else if (level === 2 && tag === 'DATE' && currentLevel === 1) {
                // Birth date
                const year = extractYear(value);
                if (year) currentPerson.birthYear = year;
            } else if (level === 2 && tag === 'DATE' && currentLevel === 2) {
                // Death date
                const year = extractYear(value);
                if (year) currentPerson.deathYear = year;
            } else if (level === 2 && tag === 'PLAC' && currentLevel === 1) {
                // Birth place
                currentPerson.birthPlace = value.trim();
            } else if (level === 2 && tag === 'PLAC' && currentLevel === 2) {
                // Death place
                currentPerson.deathPlace = value.trim();
            } else if (level === 1 && tag === 'RESI') {
                currentLevel = 3;
            } else if (level === 2 && tag === 'PLAC' && currentLevel === 3) {
                // Residence - try to parse city and country
                const place = value.trim();
                const parts = place.split(',').map(p => p.trim());
                if (parts.length >= 2) {
                    currentPerson.city = parts[0];
                    currentPerson.country = parts[parts.length - 1];
                } else if (parts.length === 1) {
                    currentPerson.city = parts[0];
                }
            } else if (level === 1 && tag === 'NOTE') {
                // Note/description
                currentPerson.description = value.trim();
            } else if (level === 2 && tag === 'CONT') {
                // Continuation of note
                if (currentPerson.description) {
                    currentPerson.description += '\n' + value.trim();
                } else {
                    currentPerson.description = value.trim();
                }
            } else if (level === 1 && tag === 'SOUR') {
                // Source reference
                // Note: We'll add the source title when we encounter it
            }
        }
    }
    
    // Save last person
    if (currentPerson && currentPerson.name) {
        persons.push(currentPerson);
    }
    
    // Import persons
    let imported = 0;
    persons.forEach(person => {
        try {
            if (person.name) {
                savePerson(person);
                imported++;
            }
        } catch (error) {
            errors.push(`Error importing ${person.name}: ${error.message}`);
        }
    });
    
    return {
        success: imported > 0,
        imported: imported,
        errors: errors
    };
}

// Extract year from GEDCOM date string
function extractYear(dateString) {
    // GEDCOM dates can be: "1885", "ABT 1885", "BET 1880 AND 1890", etc.
    const yearMatch = dateString.match(/\b(18|19|20)\d{2}\b/);
    if (yearMatch) {
        return parseInt(yearMatch[0]);
    }
    return null;
}

// Handle GEDCOM file import
window.importGEDCOM = async function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const user = getCurrentUser();
    if (!user) {
        showMessage('Please login to import data', 'error');
        return;
    }
    
    if (!file.name.toLowerCase().endsWith('.ged')) {
        showMessage('Please select a GEDCOM file (.ged)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const gedcomText = e.target.result;
            const { importFromGEDCOM } = await import('./gedcom.js');
            const result = importFromGEDCOM(gedcomText);
            
            if (result.success) {
                showMessage(`Successfully imported ${result.imported} person(s) from GEDCOM file`, 'success');
                if (result.errors.length > 0) {
                    console.warn('Import errors:', result.errors);
                }
                // Reload contributions
                if (typeof loadMyContributions === 'function') {
                    loadMyContributions();
                }
            } else {
                showMessage('No persons were imported from GEDCOM file', 'error');
            }
        } catch (error) {
            console.error('Error importing GEDCOM:', error);
            showMessage('Error importing GEDCOM file: ' + error.message, 'error');
        }
    };
    reader.onerror = () => {
        showMessage('Error reading GEDCOM file', 'error');
    };
    reader.readAsText(file);
};

// Export to GEDCOM
window.exportToGEDCOM = async function() {
    const { exportToGEDCOM } = await import('./gedcom.js');
    exportToGEDCOM();
};

