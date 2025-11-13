# 👨‍💻 PastLife Developer Guide

This guide is for developers who want to understand, modify, or contribute to the PastLife codebase.

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Key Components](#key-components)
5. [Data Storage](#data-storage)
6. [Development Setup](#development-setup)
7. [Code Style](#code-style)
8. [Testing](#testing)
9. [Adding New Features](#adding-new-features)
10. [Debugging](#debugging)

## 📁 Project Structure

```
PastLife/
├── index.html              # Homepage
├── search.html            # Search page
├── person.html            # Person detail page
├── family-tree.html       # Family tree visualization
├── profile.html           # User profile
├── login.html             # Login/registration
├── about.html             # About page
├── privacy.html           # Privacy policy
├── terms.html             # Terms of service
├── manifest.json          # PWA manifest
├── sw.js                  # Service Worker
├── assets/
│   ├── icons/             # PWA icons (PNG)
│   └── images/            # Images
├── css/
│   ├── style.css          # Main stylesheet
│   └── family-tree.css    # Family tree styles
├── js/
│   ├── main.js            # Main page logic
│   ├── data.js            # Data management
│   ├── search.js          # Search functionality
│   ├── person.js          # Person detail page
│   ├── family-tree.js     # Family tree logic
│   ├── profile.js         # Profile management
│   ├── auth.js            # Authentication
│   ├── login.js           # Login logic
│   ├── theme.js           # Dark mode
│   ├── install-prompt.js  # PWA install prompt
│   ├── update-manager.js  # PWA update manager
│   ├── offline-queue.js   # Offline queue
│   ├── offline-indicator.js # Offline indicator
│   ├── lazy-load.js       # Lazy loading
│   ├── navigation-utils.js # Navigation utilities
│   ├── auto-backup.js     # Automatic backup
│   ├── i18n.js            # Internationalization
│   └── utils.js           # Utility functions
├── scripts/               # Development scripts
├── tests/                 # Test files
└── docs/                  # Documentation
```

## 🛠 Technology Stack

- **Frontend**: Pure HTML, CSS, JavaScript (ES6+)
- **Modules**: ES6 Modules for code organization
- **Storage**: localStorage for data persistence
- **PWA**: Service Worker, Web App Manifest
- **AI**: OpenRouter API for family tree analysis
- **No Build Tools**: Runs directly in browser (no bundler required)

## 🏗 Architecture

### Client-Side Only

PastLife is a **fully client-side application** with no backend server:
- All data stored in browser localStorage
- No database required
- No server-side rendering
- Works offline after initial load

### Module System

The project uses ES6 modules:
- Each major feature has its own module file
- Modules export functions using `export`
- Modules import dependencies using `import`
- No global namespace pollution

### Data Flow

```
User Input → Validation → Sanitization → Storage (localStorage) → Display
```

## 🔑 Key Components

### 1. Data Management (`js/data.js`)

**Responsibilities:**
- CRUD operations for persons
- Comment management
- Image handling (compression, base64 conversion)
- Search indexing
- Import/export functionality

**Key Functions:**
- `getAllPersons()` - Get all persons
- `savePerson(personData, id)` - Save/update person
- `deletePerson(id)` - Delete person
- `getCommentsForPerson(personId)` - Get comments
- `addComment(personId, text, username)` - Add comment
- `searchPersons(query, filters)` - Search persons

### 2. Authentication (`js/auth.js`)

**Responsibilities:**
- User registration
- Login/logout
- Session management
- User data storage

**Key Functions:**
- `registerUser(username, password)` - Register new user
- `loginUser(username, password)` - Login user
- `logoutUser()` - Logout user
- `getCurrentUser()` - Get current logged-in user
- `isLoggedIn()` - Check if user is logged in

### 3. Family Tree (`js/family-tree.js`)

**Responsibilities:**
- AI-powered text analysis
- Tree visualization
- Relationship mapping
- Tree export (PDF, PNG, JSON)

**Key Functions:**
- `performAnalysis(text)` - Analyze text with AI
- `renderTree()` - Render tree visualization
- `layoutTree()` - Calculate tree layout
- `exportTreeToPDF()` - Export to PDF
- `exportTreeToPNG()` - Export to PNG

### 4. Search (`js/search.js`)

**Responsibilities:**
- Advanced search with filters
- Autocomplete suggestions
- Search history
- Result sorting

**Key Functions:**
- `performSearch(query, filters)` - Execute search
- `getAutocompleteSuggestions(query)` - Get suggestions
- `applySorting()` - Sort results

### 5. Utilities (`js/utils.js`)

**Responsibilities:**
- Common utility functions
- Error handling
- Message display
- Input validation
- XSS protection

**Key Functions:**
- `showMessage(message, type)` - Display message
- `escapeHtml(text)` - Escape HTML
- `sanitizeInput(input)` - Sanitize user input
- `sanitizeURL(url)` - Validate and sanitize URLs
- `validateAndSanitizeInput(value, type, options)` - Validate input

## 💾 Data Storage

### localStorage Structure

```
pastlife_persons_*          # All person data
pastlife_comments_*         # All comments
pastlife_users_*            # User accounts
pastlife_tree_{username}    # Family tree data
pastlife_profile_{username} # User profile
pastlife_backup_{username}  # Backup data
pastlife_theme             # Theme preference
pastlife_language          # Language preference
```

### Data Format

**Person Object:**
```javascript
{
  id: "unique-id",
  name: "John Doe",
  birthYear: 1900,
  deathYear: 1950,
  country: "Norway",
  city: "Oslo",
  description: "Description text",
  tags: ["tag1", "tag2"],
  photo: "data:image/jpeg;base64,...",
  images: ["data:image/jpeg;base64,..."],
  mainImage: "data:image/jpeg;base64,...",
  imageMetadata: {
    "data:image/jpeg;base64,...": {
      filename: "photo.jpg",
      originalSize: 1024000,
      dimensions: { width: 800, height: 600 },
      uploadedAt: "2025-01-01T00:00:00.000Z",
      uploadedBy: "username"
    }
  },
  sources: ["source1", "source2"],
  isPrivate: false,
  createdBy: "username",
  createdAt: "2025-01-01T00:00:00.000Z",
  lastModified: "2025-01-01T00:00:00.000Z"
}
```

## 🚀 Development Setup

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor or IDE
- (Optional) Local web server for testing

### Running Locally

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd PastLife
   ```

2. **Open in browser**
   - Simply open `index.html` in your browser
   - Or use a local server:
     ```bash
     # Python
     python -m http.server 8000
     
     # Node.js
     npx http-server
     
     # PHP
     php -S localhost:8000
     ```

3. **Access the app**
   - Open `http://localhost:8000` in your browser

### Development Workflow

1. Make changes to code
2. Refresh browser to see changes
3. Check browser console for errors
4. Test functionality
5. Commit changes

## 📝 Code Style

### JavaScript

- Use ES6+ features (arrow functions, const/let, template literals)
- Use meaningful variable names
- Add comments for complex logic
- Export functions that need to be used elsewhere
- Keep functions focused and small

**Example:**
```javascript
// Good
export function getUserById(id) {
    const users = getAllUsers();
    return users.find(user => user.id === id);
}

// Bad
function get(id) {
    return users.find(u => u.id === id);
}
```

### HTML

- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- Keep structure clean and organized

### CSS

- Use CSS custom properties (variables) for colors
- Follow BEM naming convention where appropriate
- Keep styles organized by component

## 🧪 Testing

### Manual Testing

1. **Test in multiple browsers**
   - Chrome
   - Firefox
   - Safari
   - Edge

2. **Test on different devices**
   - Desktop
   - Tablet
   - Mobile

3. **Test offline functionality**
   - Disable network
   - Verify app works offline
   - Test offline queue

### Browser DevTools

- **Console**: Check for errors and warnings
- **Application**: Inspect localStorage, Service Worker
- **Network**: Monitor API calls and resource loading
- **Lighthouse**: Run PWA audit

## ➕ Adding New Features

### Step-by-Step Guide

1. **Plan the feature**
   - What problem does it solve?
   - Where does it fit in the architecture?
   - What data does it need?

2. **Create/modify files**
   - Add new module if needed
   - Modify existing modules if appropriate
   - Update HTML if UI changes needed

3. **Update data storage**
   - Add new localStorage keys if needed
   - Update data structures if needed

4. **Add UI elements**
   - Update HTML
   - Add CSS styling
   - Add event listeners

5. **Test thoroughly**
   - Test happy path
   - Test error cases
   - Test edge cases

6. **Update documentation**
   - Update README if needed
   - Add comments in code
   - Update this guide if needed

### Example: Adding a New Feature

Let's say we want to add a "favorites" feature:

1. **Add data structure** (`js/data.js`):
   ```javascript
   export function addToFavorites(personId, username) {
       const key = `pastlife_favorites_${username}`;
       const favorites = JSON.parse(localStorage.getItem(key) || '[]');
       if (!favorites.includes(personId)) {
           favorites.push(personId);
           localStorage.setItem(key, JSON.stringify(favorites));
       }
   }
   ```

2. **Add UI** (`person.html`):
   ```html
   <button onclick="toggleFavorite('${personId}')">⭐ Favorite</button>
   ```

3. **Add functionality** (`js/person.js`):
   ```javascript
   window.toggleFavorite = function(personId) {
       const user = getCurrentUser();
       if (!user) return;
       addToFavorites(personId, user.username);
       showMessage('Added to favorites', 'success');
   };
   ```

## 🐛 Debugging

### Common Issues

1. **localStorage errors**
   - Check if storage quota exceeded
   - Clear localStorage if needed
   - Check for invalid JSON

2. **Module import errors**
   - Verify file paths are correct
   - Check for circular dependencies
   - Ensure exports are correct

3. **Service Worker issues**
   - Unregister old service workers
   - Clear cache
   - Check browser console

### Debugging Tools

- **Browser DevTools**: Primary debugging tool
- **Console.log**: Add logging for debugging
- **Breakpoints**: Use debugger statement
- **Network tab**: Monitor API calls

### Tips

- Use `console.log()` strategically
- Check browser console regularly
- Test in incognito mode to avoid cache issues
- Clear localStorage if data seems corrupted

## 📚 Additional Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## 🤝 Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

---

**Happy Coding! 🚀**

