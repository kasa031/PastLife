// Family Tree Builder with AI
import { getAllPersons, savePerson, deletePerson } from './data.js';
import { getCurrentUser, isLoggedIn, updateNavigation } from './auth.js';
import { showMessage, showLoading, hideLoading } from './utils.js';

let treeData = [];
let draggedNode = null;
let selectedNodeId = null;

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
    
    // Load saved tree if exists
    loadSavedTree();
});

// Update word count
function updateWordCount() {
    const text = document.getElementById('familyText').value;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    document.getElementById('wordCount').textContent = `${words.length} words`;
}

// Analyze family text with AI
window.analyzeFamilyText = async function() {
    const text = document.getElementById('familyText').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    
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
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = 'Analyzing...';
    
    try {
        statusText.textContent = 'Connecting to AI...';
        
        let extractedData;
        
        if (apiKey) {
            // Use OpenRouter API
            extractedData = await analyzeWithOpenRouter(text, apiKey);
        } else {
            // Use basic text analysis (fallback)
            extractedData = await basicTextAnalysis(text);
        }
        
        statusText.textContent = 'Building family tree...';
        
        // Build tree from extracted data
        treeData = extractedData.persons || [];
        
        // Add relationships
        if (extractedData.relationships) {
            treeData = treeData.map(person => {
                const rels = extractedData.relationships.filter(r => 
                    r.person1 === person.name || r.person2 === person.name
                );
                person.relationships = rels;
                return person;
            });
        }
        
        // Render tree
        renderTree();
        
        showMessage(`Successfully extracted ${treeData.length} family members!`, 'success');
        
    } catch (error) {
        console.error('Analysis error:', error);
        showMessage(error.message || 'Error analyzing text. Try again or use manual entry.', 'error');
    } finally {
        statusDiv.classList.add('hidden');
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = 'Analyze with AI & Build Tree';
    }
};

// Analyze with OpenRouter API
async function analyzeWithOpenRouter(text, apiKey) {
    const prompt = `Analyze the following family information text and extract all family members with their details and relationships. 
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
            generation: determineGeneration(person, extracted.relationships || [])
        }));
        
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
function determineGeneration(person, relationships) {
    // Simple heuristic: if person has children, they're generation 0
    // If they have parents, add to generation
    const hasChildren = relationships.some(r => 
        (r.person1 === person.name && r.type === 'parent') ||
        (r.person2 === person.name && r.type === 'child')
    );
    
    if (hasChildren) return 0;
    
    const hasParents = relationships.some(r => 
        (r.person1 === person.name && r.type === 'child') ||
        (r.person2 === person.name && r.type === 'parent')
    );
    
    if (hasParents) return 1;
    
    return 0;
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
    
    treeData = myPersons.map((person, index) => ({
        ...person,
        x: 0,
        y: 0,
        generation: 0
    }));
    
    renderTree();
    showMessage(`Loaded ${treeData.length} family members from your data`, 'success');
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
    
    // Render nodes
    treeData.forEach(person => {
        const node = createTreeNode(person);
        container.appendChild(node);
        updateNodePosition(node, person);
    });
    
    // Draw connections
    drawConnections();
}

// Create tree node element
function createTreeNode(person) {
    const node = document.createElement('div');
    node.className = 'tree-node';
    node.id = `node_${person.id}`;
    node.dataset.personId = person.id;
    
    node.innerHTML = `
        <div class="tree-node-header">
            <h3 class="tree-node-name">${escapeHtml(person.name)}</h3>
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
    const spacing = 250;
    const verticalSpacing = 200;
    
    genNumbers.forEach((gen, genIndex) => {
        const persons = generations[gen];
        const startY = genIndex * verticalSpacing + 50;
        const totalWidth = (persons.length - 1) * spacing;
        const startX = (window.innerWidth - totalWidth) / 2;
        
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
    const person = treeData.find(p => p.id === nodeId);
    if (!person) return;
    
    if (confirm(`Delete "${person.name}" from tree?`)) {
        treeData = treeData.filter(p => p.id !== nodeId);
        const node = document.getElementById(`node_${nodeId}`);
        if (node) node.remove();
        saveTreeToStorage();
        showMessage('Node removed from tree', 'success');
    }
};

// Save tree to storage
function saveTreeToStorage() {
    const user = getCurrentUser();
    if (!user) return;
    
    localStorage.setItem(`pastlife_tree_${user.username}`, JSON.stringify(treeData));
}

// Load saved tree
function loadSavedTree() {
    const user = getCurrentUser();
    if (!user) return;
    
    const saved = localStorage.getItem(`pastlife_tree_${user.username}`);
    if (saved) {
        try {
            treeData = JSON.parse(saved);
            if (treeData.length > 0) {
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
    
    if (treeData.length === 0) {
        showMessage('No tree to save', 'error');
        return;
    }
    
    const loading = showLoading(document.body);
    
    try {
        // Save each person
        for (const person of treeData) {
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
        
        showMessage(`Saved ${treeData.length} family members to your profile!`, 'success');
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
    const dataStr = JSON.stringify(treeData, null, 2);
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
                treeData = JSON.parse(event.target.result);
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
