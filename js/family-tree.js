// Family Tree Builder with AI
import { getAllPersons, savePerson, deletePerson } from './data.js';
import { getCurrentUser, isLoggedIn, updateNavigation } from './auth.js';
import { showMessage, showLoading, hideLoading } from './utils.js';

let treeData = [];
let allTreeData = []; // Store all data for filtering
let draggedNode = null;
let selectedNodeId = null;
let zoomLevel = 1.0;
let panX = 0;
let panY = 0;
let isPanning = false;
let panStartX = 0;
let panStartY = 0;
let currentFilter = 'all'; // 'all', 'mother', 'father', 'both'

// API Key storage
const API_KEY_STORAGE = 'pastlife_openrouter_key';

// Default API key (can be overridden by user)
const DEFAULT_API_KEY = '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';

// Save API key to localStorage
function saveApiKey(apiKey) {
    if (apiKey) {
        localStorage.setItem(API_KEY_STORAGE, apiKey);
    } else {
        localStorage.removeItem(API_KEY_STORAGE);
    }
}

// Get saved API key or use default
function getSavedApiKey() {
    const saved = localStorage.getItem(API_KEY_STORAGE);
    return saved || DEFAULT_API_KEY;
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        showMessage('Please login to use the Family Tree Builder', 'error');
        setTimeout(() => window.location.href = 'login.html', 2000);
        return;
    }
    
    // Setup word count
    const textarea = document.getElementById('familyText');
    if (textarea) {
        textarea.addEventListener('input', updateWordCount);
    }
    
    // Load saved API key or use default
    const savedApiKey = getSavedApiKey();
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKeyInput) {
        // Use saved key if exists, otherwise use default
        const keyToUse = localStorage.getItem(API_KEY_STORAGE) || DEFAULT_API_KEY;
        apiKeyInput.value = keyToUse;
        // Auto-save default key if not already saved
        if (!localStorage.getItem(API_KEY_STORAGE)) {
            saveApiKey(DEFAULT_API_KEY);
        }
    }
    
    // Save API key when changed
    if (apiKeyInput) {
        apiKeyInput.addEventListener('blur', () => {
            const key = apiKeyInput.value.trim();
            if (key) {
                saveApiKey(key);
                showMessage('API-nøkkel lagret!', 'success', 2000);
            }
        });
    }
    
    // Load saved tree if exists
    loadSavedTree();
});

// Update word count
function updateWordCount() {
    const text = document.getElementById('familyText').value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    document.getElementById('wordCount').textContent = `${words.length} words`;
}

// Paste API key from clipboard or use default
window.pasteApiKey = async function() {
    const apiKeyInput = document.getElementById('apiKey');
    
    // Try to get from clipboard
    try {
        const text = await navigator.clipboard.readText();
        if (text.startsWith('sk-or-')) {
            apiKeyInput.value = text;
            saveApiKey(text);
            showMessage('API-nøkkel limt inn og lagret!', 'success');
            return;
        }
    } catch (err) {
        // Clipboard access denied or failed
    }
    
    // If clipboard doesn't work, prompt user
    const key = prompt('Lim inn din OpenRouter API-nøkkel (sk-or-...):');
    if (key && key.trim().startsWith('sk-or-')) {
        apiKeyInput.value = key.trim();
        saveApiKey(key.trim());
        showMessage('API-nøkkel lagret!', 'success');
    } else if (key) {
        showMessage('Ugyldig API-nøkkel format. Skal starte med sk-or-', 'error');
    }
};

// Clear API key
window.clearApiKey = function() {
    if (confirm('Er du sikker på at du vil slette API-nøkkelen?')) {
        const apiKeyInput = document.getElementById('apiKey');
        apiKeyInput.value = '';
        saveApiKey('');
        showMessage('API-nøkkel slettet', 'success');
    }
};

// Load example text
window.loadExampleText = function() {
    const exampleText = `FAMILIEHISTORIE - JENSEN FAMILIEN

MIN MORSLEDN - JENSEN FAMILIEN

Min oldefar Edvard Jensen ble født den 15. mars 1885 i Christiania (som nå er Oslo), Norge. 
Han var sønn av Jens Edvardsen (1850-1920) og Ingeborg Nilsdatter (1855-1930). 
Edvard jobbet som skomaker og hadde sin egen butikk i Karl Johans gate i Oslo.

Edvard giftet seg med Anna Maria Larsen den 12. juni 1910 i Vår Frelsers kirke i Oslo. 
Anna ble født i 1888 i Drammen, Norge, og døde i 1965 i Oslo.

Edvard og Anna fikk tre barn:
1. Olav Edvard Jensen (født 1912, død 1975) - gift med Maria Hansen (1914-1990)
2. Inger Jensen (født 1915, død 2001) - gift med Per Berg (1910-1985)
3. Knut Jensen (født 1918, død 1989) - gift med Solveig Andersen (1920-2010)

Edvard Jensen døde i 1950 i Oslo.

OLAV EDVARD JENSEN (1912-1975)
Min bestefar Olav Edvard Jensen ble født i 1912 i Oslo. 
Han jobbet som murer og giftet seg med Maria Hansen i 1935.
Maria ble født i 1914 og døde i 1990.

Olav og Maria fikk to barn:
- Erik Olsen (født 1938) - gift med Kari Johansen (født 1940)
- Liv Olsen (født 1942) - gift med Lars Nilsen (født 1940)

Olav døde i 1975 i Oslo.

ERIK OLSEN (1938-)
Min far Erik Olsen ble født i 1938 i Oslo. 
Han giftet seg med Kari Johansen i 1960.
Kari ble født i 1940 i Bergen, Norge.

Erik og Kari fikk meg (født 1970) og min søster Anne (født 1972).`;

    document.getElementById('familyText').value = exampleText;
    updateWordCount();
    showMessage('Eksempeltekst lastet inn! Du kan redigere eller erstatte den.', 'info');
};

// Analyze family text with AI (replace existing)
window.analyzeFamilyText = async function() {
    if (allTreeData.length > 0) {
        if (!confirm('Dette vil erstatte eksisterende tre. Vil du heller legge til i stedet? (Klikk Cancel og bruk "Legg til i eksisterende tre" i stedet)')) {
            return;
        }
    }
    
    await performAnalysis(false);
};

// Analyze and merge with existing tree
window.analyzeAndMerge = async function() {
    await performAnalysis(true);
};

// Perform analysis (internal function)
async function performAnalysis(mergeMode = false) {
    const text = document.getElementById('familyText').value.trim();
    let apiKey = document.getElementById('apiKey').value.trim();
    
    // If no API key in input, try saved one
    if (!apiKey) {
        apiKey = getSavedApiKey();
        if (apiKey) {
            document.getElementById('apiKey').value = apiKey;
            showMessage('Bruker lagret API-nøkkel', 'info', 2000);
        }
    } else {
        // Save the API key if entered
        saveApiKey(apiKey);
    }
    
    if (!text) {
        showMessage('Please enter some family information', 'error');
        return;
    }
    
    if (text.split(/\s+/).length < 10) {
        showMessage('Please provide more detailed information (at least 10 words)', 'error');
        return;
    }
    
    // Show loading
    const statusDiv = document.getElementById('aiStatus');
    statusDiv.classList.remove('hidden');
    const statusText = document.getElementById('aiStatusText');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const mergeBtn = document.getElementById('mergeBtn');
    analyzeBtn.disabled = true;
    mergeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    mergeBtn.textContent = 'Analyzing...';
    
    try {
        statusText.textContent = mergeMode ? 'Connecting to AI (will merge with existing tree)...' : 'Connecting to AI...';
        
        let extractedData;
        
        if (apiKey) {
            // Use OpenRouter API
            extractedData = await analyzeWithOpenRouter(text, apiKey);
        } else {
            // Use basic text analysis (fallback)
            extractedData = await basicTextAnalysis(text);
        }
        
        statusText.textContent = mergeMode ? 'Merging with existing tree...' : 'Building family tree...';
        
        const newPersons = extractedData.persons || [];
        
        // Detect side (mother/father) from text
        const text = document.getElementById('familyText').value.toLowerCase();
        const isMotherSide = text.includes('mor') || text.includes('mother') || text.includes('morsside') || text.includes('morsledn');
        const isFatherSide = text.includes('far') || text.includes('father') || text.includes('farsside') || text.includes('farsledn');
        
        // Add side tag to persons
        newPersons.forEach(person => {
            if (!person.tags) person.tags = [];
            if (isMotherSide && !person.tags.includes('morsside')) {
                person.tags.push('morsside');
            }
            if (isFatherSide && !person.tags.includes('farsside')) {
                person.tags.push('farsside');
            }
            // If neither detected, try to infer from context
            if (!isMotherSide && !isFatherSide) {
                // Check if this is a merge - if so, ask user
                if (mergeMode && allTreeData.length > 0) {
                    // If we already have persons tagged, don't add new tags
                    // User can manually tag later
                }
            }
        });
        
        // Store all relationships for generation calculation
        const allRelationships = extractedData.relationships || [];
        
        if (mergeMode) {
            // Merge mode: Add new persons without replacing existing
            const existingNames = new Set(allTreeData.map(p => p.name.toLowerCase()));
            const uniqueNewPersons = newPersons.filter(p => !existingNames.has(p.name.toLowerCase()));
            
            if (uniqueNewPersons.length === 0) {
                showMessage('Ingen nye personer funnet. Alle personene fra teksten finnes allerede i treet.', 'info');
            } else {
                // Add new persons to existing tree
                allTreeData = [...allTreeData, ...uniqueNewPersons];
                
                // Merge relationships
                if (extractedData.relationships) {
                    uniqueNewPersons.forEach(person => {
                        const rels = extractedData.relationships.filter(r => 
                            r.person1 === person.name || r.person2 === person.name
                        );
                        person.relationships = rels;
                    });
                }
                
                // Recalculate generations for all persons including new ones
                const allRels = allTreeData.flatMap(p => p.relationships || []).filter((r, i, arr) => 
                    arr.findIndex(a => a.person1 === r.person1 && a.person2 === r.person2 && a.type === r.type) === i
                );
                calculateAllGenerations(allTreeData, allRels);
                
                showMessage(`La til ${uniqueNewPersons.length} nye personer til eksisterende tre! (${allTreeData.length} totalt)`, 'success');
            }
        } else {
            // Replace mode: Replace entire tree
            allTreeData = newPersons;
            
            // Add relationships
            if (extractedData.relationships) {
                allTreeData = allTreeData.map(person => {
                    const rels = extractedData.relationships.filter(r => 
                        r.person1 === person.name || r.person2 === person.name
                    );
                    person.relationships = rels;
                    return person;
                });
            }
            
            // Calculate generations (already done in analyzeWithOpenRouter, but ensure it's correct)
            calculateAllGenerations(allTreeData, allRelationships);
            
            showMessage(`Successfully extracted ${allTreeData.length} family members!`, 'success');
        }
        
        // Apply current filter and render
        applyFilter(currentFilter);
        renderTree();
        fitToScreen(); // Auto-fit after render
        
    } catch (error) {
        console.error('Analysis error:', error);
        showMessage(error.message || 'Error analyzing text. Try again or use manual entry.', 'error');
    } finally {
        statusDiv.classList.add('hidden');
        analyzeBtn.disabled = false;
        mergeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze with AI & Build Tree';
        mergeBtn.textContent = '➕ Legg til i eksisterende tre';
    }
}

// Analyze with OpenRouter API
async function analyzeWithOpenRouter(text, apiKey) {
    // Detect side from text
    const textLower = text.toLowerCase();
    const isMotherSide = textLower.includes('mor') || textLower.includes('mother') || textLower.includes('morsside') || textLower.includes('morsledn');
    const isFatherSide = textLower.includes('far') || textLower.includes('father') || textLower.includes('farsside') || textLower.includes('farsledn');
    
    const sideInfo = isMotherSide ? ' (morsside/mother side)' : isFatherSide ? ' (farsside/father side)' : '';
    
    const prompt = `Analyze the following family information text and extract all family members with their details and relationships.${sideInfo}
Return a JSON object with this structure:
{
  "persons": [
    {
      "name": "Full Name",
      "birthYear": year or null,
      "deathYear": year or null,
      "birthPlace": "place",
      "country": "country",
      "city": "city",
      "description": "biography",
      "tags": ["tag1", "tag2"]
    }
  ],
  "relationships": [
    {
      "person1": "Name",
      "person2": "Name",
      "type": "parent|child|spouse|sibling"
    }
  ]
}

${isMotherSide ? 'Add "morsside" to the tags array for all persons from the mother side.' : ''}
${isFatherSide ? 'Add "farsside" to the tags array for all persons from the father side.' : ''}

Text to analyze:
${text.substring(0, 40000)}`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'PastLife Family Tree Builder'
            },
            body: JSON.stringify({
                model: 'openai/gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a helpful assistant that extracts family information from text and returns structured JSON data.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 4000
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0]?.message?.content || '';
        
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Could not parse AI response. Using basic analysis instead.');
        }
        
        const extracted = JSON.parse(jsonMatch[0]);
        
        // Validate and clean data
        if (!extracted.persons || !Array.isArray(extracted.persons)) {
            extracted.persons = [];
        }
        
        // Add IDs and metadata
        extracted.persons = extracted.persons.map((person, index) => ({
            ...person,
            id: `tree_${Date.now()}_${index}`,
            x: 0,
            y: 0,
            tags: person.tags || []
        }));
        
        // Calculate generations for all persons
        calculateAllGenerations(extracted.persons, extracted.relationships || []);
        
        return extracted;
        
    } catch (error) {
        console.error('OpenRouter error:', error);
        // Fallback to basic analysis
        showMessage('AI analysis failed, using basic text extraction...', 'info');
        return await basicTextAnalysis(text);
    }
}

// Basic text analysis (fallback)
async function basicTextAnalysis(text) {
    // Extract names (simple pattern matching)
    const namePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/g;
    const matches = [...new Set(text.match(namePattern) || [])];
    
    // Extract years
    const yearPattern = /\b(1[89]\d{2}|20[0-2]\d)\b/g;
    const years = [...new Set(text.match(yearPattern) || [])];
    
    const persons = matches.slice(0, 50).map((name, index) => {
        // Try to find related information
        const nameContext = text.substring(
            Math.max(0, text.indexOf(name) - 200),
            Math.min(text.length, text.indexOf(name) + 500)
        );
        
        const birthYear = years.find(y => 
            nameContext.includes(y) && 
            (nameContext.includes('born') || nameContext.includes('født') || nameContext.includes('birth'))
        );
        
        return {
            id: `tree_${Date.now()}_${index}`,
            name: name.trim(),
            birthYear: birthYear ? parseInt(birthYear) : null,
            birthPlace: extractPlace(nameContext),
            description: nameContext.substring(0, 200).trim(),
            tags: [],
            x: 0,
            y: 0,
            generation: 0
        };
    });
    
    return { persons, relationships: [] };
}

// Extract place from context
function extractPlace(context) {
    const placePatterns = [
        /(?:in|fra|from|born in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
        /([A-Z][a-z]+(?:,\s*[A-Z][a-z]+)?)/g
    ];
    
    for (const pattern of placePatterns) {
        const match = context.match(pattern);
        if (match && match[0]) {
            return match[0].replace(/^(in|fra|from|born in)\s+/i, '').trim();
        }
    }
    
    return '';
}

// Determine generation based on relationships
function determineGeneration(person, relationships, allPersons = []) {
    if (!relationships || relationships.length === 0) {
        return 0; // Default generation if no relationships
    }
    
    // Build a graph of relationships
    const personRelations = relationships.filter(r => 
        r.person1 === person.name || r.person2 === person.name
    );
    
    // Find the oldest generation (persons with no parents)
    const hasParents = personRelations.some(r => {
        if (r.type === 'child') {
            return r.person1 === person.name; // person is child, person2 is parent
        }
        return false;
    });
    
    // If person has parents, recursively find their generation
    if (hasParents) {
        const parentRels = personRelations.filter(r => 
            r.type === 'child' && r.person1 === person.name
        );
        
        if (parentRels.length > 0) {
            // Find parent's generation
            const parentName = parentRels[0].person2;
            const parentPerson = allPersons.find(p => p.name === parentName);
            
            if (parentPerson && parentPerson.generation !== undefined) {
                return parentPerson.generation + 1;
            }
            
            // Recursively calculate parent's generation
            const parentGen = determineGeneration(
                { name: parentName },
                relationships,
                allPersons
            );
            return parentGen + 1;
        }
    }
    
    // If person has children, they're generation 0 or 1
    const hasChildren = personRelations.some(r => 
        (r.person1 === person.name && r.type === 'parent') ||
        (r.person2 === person.name && r.type === 'child')
    );
    
    // If no parents and has children, likely generation 0 (oldest)
    if (!hasParents && hasChildren) {
        return 0;
    }
    
    // Default: generation 0
    return 0;
}

// Calculate generations for all persons in tree
function calculateAllGenerations(persons, relationships) {
    // First pass: find persons with no parents (generation 0)
    const personsWithNoParents = persons.filter(person => {
        if (!relationships || relationships.length === 0) return true;
        
        const personRels = relationships.filter(r => 
            (r.person1 === person.name || r.person2 === person.name) &&
            r.type === 'child' &&
            r.person1 === person.name
        );
        
        return personRels.length === 0;
    });
    
    // Set generation 0 for oldest generation
    personsWithNoParents.forEach(p => {
        p.generation = 0;
    });
    
    // Second pass: calculate generations for others
    let changed = true;
    let iterations = 0;
    const maxIterations = persons.length;
    
    while (changed && iterations < maxIterations) {
        changed = false;
        iterations++;
        
        persons.forEach(person => {
            if (person.generation !== undefined) return;
            
            if (!relationships || relationships.length === 0) {
                person.generation = 0;
                changed = true;
                return;
            }
            
            // Find parent relationships
            const parentRels = relationships.filter(r => 
                r.type === 'child' &&
                r.person1 === person.name &&
                r.person2
            );
            
            if (parentRels.length > 0) {
                // Find parent
                const parentName = parentRels[0].person2;
                const parent = persons.find(p => p.name === parentName);
                
                if (parent && parent.generation !== undefined) {
                    person.generation = parent.generation + 1;
                    changed = true;
                }
            } else {
                // No parents found, default to 0
                person.generation = 0;
                changed = true;
            }
        });
    }
    
    // Set default for any remaining
    persons.forEach(person => {
        if (person.generation === undefined) {
            person.generation = 0;
        }
    });
    
    return persons;
}

// Build tree from existing data
window.buildTreeFromExisting = function() {
    const existingPersons = getAllPersons();
    const user = getCurrentUser();
    
    // Filter to user's persons
    const myPersons = existingPersons.filter(p => p.createdBy === user.username);
    
    if (myPersons.length === 0) {
        showMessage('No existing family data found. Please add some ancestors first.', 'info');
        return;
    }
    
    allTreeData = myPersons.map((person, index) => ({
        ...person,
        x: 0,
        y: 0,
        tags: person.tags || []
    }));
    
    // Try to extract relationships from existing data or calculate from person descriptions
    // For now, set all to generation 0, but user can manually organize
    allTreeData.forEach(p => {
        if (p.generation === undefined) {
            p.generation = 0;
        }
    });
    
    // Apply current filter and render
    applyFilter(currentFilter);
    renderTree();
    showMessage(`Loaded ${allTreeData.length} family members from your data`, 'success');
};

// Apply filter to tree data
function applyFilter(filter) {
    currentFilter = filter;
    
    if (filter === 'all') {
        treeData = [...allTreeData];
    } else if (filter === 'mother') {
        treeData = allTreeData.filter(p => 
            p.tags && (p.tags.includes('morsside') || p.tags.includes('mother'))
        );
    } else if (filter === 'father') {
        treeData = allTreeData.filter(p => 
            p.tags && (p.tags.includes('farsside') || p.tags.includes('father'))
        );
    } else if (filter === 'both') {
        // Show persons that are tagged with both or have relationships to both sides
        const motherSideNames = new Set(
            allTreeData
                .filter(p => p.tags && (p.tags.includes('morsside') || p.tags.includes('mother')))
                .map(p => p.name.toLowerCase())
        );
        const fatherSideNames = new Set(
            allTreeData
                .filter(p => p.tags && (p.tags.includes('farsside') || p.tags.includes('father')))
                .map(p => p.name.toLowerCase())
        );
        
        treeData = allTreeData.filter(p => {
            const name = p.name.toLowerCase();
            // Show if person has both tags, or has relationships to both sides
            const hasBothTags = p.tags && 
                (p.tags.includes('morsside') || p.tags.includes('mother')) &&
                (p.tags.includes('farsside') || p.tags.includes('father'));
            
            // Check relationships
            const hasMotherRel = p.relationships && p.relationships.some(r => 
                motherSideNames.has(r.person1.toLowerCase()) || motherSideNames.has(r.person2.toLowerCase())
            );
            const hasFatherRel = p.relationships && p.relationships.some(r => 
                fatherSideNames.has(r.person1.toLowerCase()) || fatherSideNames.has(r.person2.toLowerCase())
            );
            
            return hasBothTags || (hasMotherRel && hasFatherRel) || 
                   (motherSideNames.has(name) && fatherSideNames.has(name));
        });
    }
    
    // Update filter button states
    updateFilterButtons();
}

// Update filter button active states
function updateFilterButtons() {
    ['all', 'mother', 'father', 'both'].forEach(filter => {
        const btn = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
        if (btn) {
            btn.classList.toggle('active', currentFilter === filter);
        }
    });
}

// Filter tree
window.filterTree = function(filter) {
    applyFilter(filter);
    renderTree();
    fitToScreen();
    
    const filterNames = {
        'all': 'Alle',
        'mother': 'Morsside',
        'father': 'Farsside',
        'both': 'Begge sider'
    };
    
    showMessage(`Viser: ${filterNames[filter]} (${treeData.length} personer)`, 'success', 2000);
};

// Render family tree
function renderTree() {
    const container = document.getElementById('treeContainer');
    const wrapper = document.getElementById('treeWrapper');
    const controls = document.getElementById('treeControls');
    
    if (treeData.length === 0) {
        showMessage('No family members to display', 'info');
        return;
    }
    
    wrapper.style.display = 'block';
    controls.style.display = 'block';
    container.innerHTML = '';
    
    // Auto-layout tree
    layoutTree();
    
    // Calculate container size based on tree bounds
    const bounds = calculateTreeBounds();
    container.style.width = `${bounds.maxX + 300}px`;
    container.style.height = `${bounds.maxY + 200}px`;
    
    // Render nodes
    treeData.forEach(person => {
        const node = createTreeNode(person);
        container.appendChild(node);
        updateNodePosition(node, person);
    });
    
    // Draw connections
    drawConnections();
    
    // Setup pan and zoom
    setupPanAndZoom();
}

// Calculate tree bounds
function calculateTreeBounds() {
    if (treeData.length === 0) {
        return { minX: 0, minY: 0, maxX: 100, maxY: 100 };
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    treeData.forEach(person => {
        minX = Math.min(minX, person.x);
        minY = Math.min(minY, person.y);
        maxX = Math.max(maxX, person.x + 250); // node width
        maxY = Math.max(maxY, person.y + 150); // node height
    });
    
    return { minX, minY, maxX, maxY };
}

// Setup pan and zoom
function setupPanAndZoom() {
    const wrapper = document.getElementById('treeWrapper');
    const container = document.getElementById('treeContainer');
    
    if (!wrapper || !container) return;
    
    // Remove old event listeners by cloning
    const newWrapper = wrapper.cloneNode(true);
    wrapper.parentNode.replaceChild(newWrapper, wrapper);
    const newContainer = document.getElementById('treeContainer');
    
    // Reset pan and zoom
    panX = 0;
    panY = 0;
    zoomLevel = 1.0;
    updateTransform();
    
    // Mouse wheel zoom
    newWrapper.addEventListener('wheel', (e) => {
        if (e.target.closest('.tree-node')) return; // Don't zoom when over node
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        zoomLevel = Math.max(0.3, Math.min(3.0, zoomLevel * delta));
        updateTransform();
    }, { passive: false });
    
    // Pan with mouse drag (on empty space)
    newWrapper.addEventListener('mousedown', (e) => {
        // Only pan if clicking on wrapper background or container
        if (e.target === newWrapper || (e.target === newContainer && !e.target.closest('.tree-node'))) {
            isPanning = true;
            panStartX = e.clientX - panX;
            panStartY = e.clientY - panY;
            newWrapper.classList.add('panning');
            newWrapper.style.cursor = 'grabbing';
            e.preventDefault();
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isPanning) {
            panX = e.clientX - panStartX;
            panY = e.clientY - panStartY;
            updateTransform();
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isPanning) {
            isPanning = false;
            const currentWrapper = document.getElementById('treeWrapper');
            if (currentWrapper) {
                currentWrapper.classList.remove('panning');
                currentWrapper.style.cursor = 'grab';
            }
        }
    });
}

// Update transform
function updateTransform() {
    const container = document.getElementById('treeContainer');
    if (container) {
        container.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomLevel})`;
    }
}

// Zoom in
window.zoomIn = function() {
    zoomLevel = Math.min(3.0, zoomLevel * 1.2);
    updateTransform();
};

// Zoom out
window.zoomOut = function() {
    zoomLevel = Math.max(0.3, zoomLevel / 1.2);
    updateTransform();
};

// Fit to screen
window.fitToScreen = function() {
    const bounds = calculateTreeBounds();
    const wrapper = document.getElementById('treeWrapper');
    if (!wrapper) return;
    
    const wrapperWidth = wrapper.clientWidth - 40;
    const wrapperHeight = wrapper.clientHeight - 40;
    
    const treeWidth = bounds.maxX - bounds.minX;
    const treeHeight = bounds.maxY - bounds.minY;
    
    const scaleX = wrapperWidth / treeWidth;
    const scaleY = wrapperHeight / treeHeight;
    zoomLevel = Math.min(scaleX, scaleY, 1.0) * 0.9; // 90% for padding
    
    // Center the tree
    panX = (wrapperWidth - treeWidth * zoomLevel) / 2 - bounds.minX * zoomLevel;
    panY = (wrapperHeight - treeHeight * zoomLevel) / 2 - bounds.minY * zoomLevel;
    
    updateTransform();
    showMessage('Treet tilpasset skjermen', 'success', 2000);
};

// Reset view
window.resetView = function() {
    zoomLevel = 1.0;
    panX = 0;
    panY = 0;
    updateTransform();
    showMessage('Visning tilbakestilt', 'success', 2000);
};

// Get generation label text
function getGenerationLabel(generation) {
    const genNum = generation || 0;
    if (genNum === 0) return 'Generasjon 1 (Eldste)';
    if (genNum === 1) return 'Generasjon 2';
    if (genNum === 2) return 'Generasjon 3';
    if (genNum === 3) return 'Generasjon 4';
    if (genNum === 4) return 'Generasjon 5';
    return `Generasjon ${genNum + 1}`;
}

// Create tree node element
function createTreeNode(person) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    node.id = `node_${person.id}`;
    node.dataset.personId = person.id;
    
    const generation = person.generation !== undefined ? person.generation : 0;
    const generationText = getGenerationLabel(generation);
    
    node.innerHTML = `
        <div class="tree-node-header">
            <div>
                <div class="tree-generation-badge generation-${generation}">${generationText}</div>
                <h3 class="tree-node-name">${escapeHtml(person.name)}</h3>
            </div>
            <div class="tree-node-actions">
                <button class="tree-node-btn" onclick="editTreeNode('${person.id}')" title="Edit">✏️</button>
                <button class="tree-node-btn" onclick="deleteTreeNode('${person.id}')" title="Delete">🗑️</button>
            </div>
        </div>
        ${person.birthYear ? `<div class="tree-node-info"><strong>Born:</strong> ${person.birthYear}</div>` : ''}
        ${person.birthPlace ? `<div class="tree-node-info"><strong>From:</strong> ${escapeHtml(person.birthPlace)}</div>` : ''}
        ${person.country ? `<div class="tree-node-info"><strong>Country:</strong> ${escapeHtml(person.country)}</div>` : ''}
        ${person.tags && person.tags.length > 0 ? `<div class="person-tags" style="margin-top: 0.5rem;">${person.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
    `;
    
    // Add generation class to node for styling
    node.classList.add(`generation-${generation}`);
    
    // Make draggable
    makeNodeDraggable(node, person);
    
    // Click to select
    node.addEventListener('click', (e) => {
        if (!e.target.closest('.tree-node-btn')) {
            selectNode(person.id);
        }
    });
    
    return node;
}

// Make node draggable
function makeNodeDraggable(node, person) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    node.addEventListener('mousedown', (e) => {
        if (e.target.closest('.tree-node-btn')) return;
        
        isDragging = true;
        node.classList.add('dragging');
        startX = e.clientX;
        startY = e.clientY;
        initialX = person.x;
        initialY = person.y;
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    function onMouseMove(e) {
        if (!isDragging) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        person.x = initialX + deltaX;
        person.y = initialY + deltaY;
        
        updateNodePosition(node, person);
    }
    
    function onMouseUp() {
        isDragging = false;
        node.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        saveTreeToStorage();
    }
}

// Update node position
function updateNodePosition(node, person) {
    node.style.left = `${person.x}px`;
    node.style.top = `${person.y}px`;
}

// Select node
function selectNode(nodeId) {
    selectedNodeId = nodeId;
    
    // Update visual selection
    document.querySelectorAll('.tree-node').forEach(n => {
        n.classList.remove('selected');
    });
    
    const node = document.getElementById(`node_${nodeId}`);
    if (node) {
        node.classList.add('selected');
    }
}

// Layout tree automatically
function layoutTree() {
    // Group by generation
    const generations = {};
    treeData.forEach(person => {
        if (!generations[person.generation]) {
            generations[person.generation] = [];
        }
        generations[person.generation].push(person);
    });
    
    // Calculate positions
    const genNumbers = Object.keys(generations).map(Number).sort((a, b) => a - b);
    const spacing = 280; // Increased spacing
    const verticalSpacing = 220; // Increased vertical spacing
    
    // Calculate minimum width needed
    const maxPersonsInGen = Math.max(...genNumbers.map(gen => generations[gen].length));
    const minWidth = maxPersonsInGen * spacing + 200;
    
    genNumbers.forEach((gen, genIndex) => {
        const persons = generations[gen];
        const startY = genIndex * verticalSpacing + 50;
        const totalWidth = (persons.length - 1) * spacing;
        const startX = Math.max(100, (minWidth - totalWidth) / 2);
        
        persons.forEach((person, index) => {
            person.x = startX + index * spacing;
            person.y = startY;
        });
    });
}

// Draw connections between related nodes
function drawConnections() {
    // Remove existing connections
    document.querySelectorAll('.tree-connection').forEach(c => c.remove());
    
    const container = document.getElementById('treeContainer');
    
    treeData.forEach(person => {
        if (person.relationships) {
            person.relationships.forEach(rel => {
                const otherPerson = treeData.find(p => 
                    (p.name === rel.person1 && person.name === rel.person2) ||
                    (p.name === rel.person2 && person.name === rel.person1)
                );
                
                if (otherPerson) {
                    drawConnection(person, otherPerson, container);
                }
            });
        }
    });
}

// Draw connection line
function drawConnection(person1, person2, container) {
    const x1 = person1.x + 125; // Center of node
    const y1 = person1.y + 50;
    const x2 = person2.x + 125;
    const y2 = person2.y + 50;
    
    // Horizontal line
    const hLine = document.createElement('div');
    hLine.className = 'tree-connection horizontal';
    hLine.style.left = `${Math.min(x1, x2)}px`;
    hLine.style.top = `${y1}px`;
    hLine.style.width = `${Math.abs(x2 - x1)}px`;
    container.appendChild(hLine);
    
    // Vertical line
    const vLine = document.createElement('div');
    vLine.className = 'tree-connection vertical';
    vLine.style.left = `${x2}px`;
    vLine.style.top = `${Math.min(y1, y2)}px`;
    vLine.style.height = `${Math.abs(y2 - y1)}px`;
    container.appendChild(vLine);
}

// Edit tree node
window.editTreeNode = function(nodeId) {
    const person = treeData.find(p => p.id === nodeId);
    if (!person) return;
    
    // Open edit modal or redirect to profile
    const confirmed = confirm(`Edit "${person.name}"? This will open the profile page.`);
    if (confirmed) {
        // You could open a modal here, or redirect
        window.location.href = `profile.html?edit=${nodeId}`;
    }
};

// Delete tree node
window.deleteTreeNode = function(nodeId) {
    const person = allTreeData.find(p => p.id === nodeId);
    if (!person) return;
    
    if (confirm(`Delete "${person.name}" from tree?`)) {
        // Remove from both allTreeData and treeData
        allTreeData = allTreeData.filter(p => p.id !== nodeId);
        treeData = treeData.filter(p => p.id !== nodeId);
        saveTreeToStorage();
        // Reapply filter to update view
        applyFilter(currentFilter);
        renderTree();
        showMessage('Node removed from tree', 'success');
    }
};

// Save tree to storage
function saveTreeToStorage() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Always save allTreeData, not filtered treeData
    localStorage.setItem(`pastlife_tree_${user.username}`, JSON.stringify(allTreeData));
}

// Load saved tree
function loadSavedTree() {
    const user = getCurrentUser();
    if (!user) return;
    
    const saved = localStorage.getItem(`pastlife_tree_${user.username}`);
    if (saved) {
        try {
            allTreeData = JSON.parse(saved);
            if (allTreeData.length > 0) {
                // Apply current filter
                applyFilter(currentFilter);
                renderTree();
                showMessage('Loaded saved family tree', 'info');
            }
        } catch (e) {
            console.error('Error loading tree:', e);
        }
    }
}

// Save tree (save all persons to database)
window.saveTree = async function() {
    const user = getCurrentUser();
    if (!user) return;
    
    if (allTreeData.length === 0) {
        showMessage('No tree to save', 'error');
        return;
    }
    
    const loading = showLoading(document.body);
    
    try {
        // Save each person (save allTreeData, not filtered treeData)
        for (const person of allTreeData) {
            const personData = {
                name: person.name,
                birthYear: person.birthYear || null,
                deathYear: person.deathYear || null,
                birthPlace: person.birthPlace || '',
                deathPlace: person.deathPlace || '',
                country: person.country || '',
                city: person.city || '',
                description: person.description || '',
                photo: person.photo || null,
                tags: person.tags || [],
                createdBy: user.username
            };
            
            // Only save if not already saved
            if (!person.id || person.id.startsWith('tree_')) {
                savePerson(personData);
            }
        }
        
        showMessage(`Saved ${allTreeData.length} family members to your profile!`, 'success');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 2000);
        
    } catch (error) {
        showMessage('Error saving tree', 'error');
        console.error(error);
    } finally {
        hideLoading(document.body, loading);
    }
};

// Export tree
window.exportTree = function() {
    // Export allTreeData, not filtered treeData
    const dataStr = JSON.stringify(allTreeData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family-tree-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage('Tree exported!', 'success');
};

// Import tree
window.importTree = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                allTreeData = JSON.parse(event.target.result);
                // Ensure all persons have tags array
                allTreeData = allTreeData.map(p => ({
                    ...p,
                    tags: p.tags || []
                }));
                // Apply current filter and render
                applyFilter(currentFilter);
                renderTree();
                showMessage('Tree imported!', 'success');
            } catch (error) {
                showMessage('Error importing tree file', 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
};

// Clear tree
window.clearTree = function() {
    if (confirm('Clear the entire family tree? This cannot be undone.')) {
        treeData = [];
        allTreeData = [];
        document.getElementById('treeContainer').innerHTML = '';
        document.getElementById('treeWrapper').style.display = 'none';
        document.getElementById('treeControls').style.display = 'none';
        saveTreeToStorage();
        showMessage('Tree cleared', 'success');
    }
};

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
