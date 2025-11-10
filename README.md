# PastLife - Discover Your Ancestors

A social platform for discovering and sharing information about deceased ancestors from around the world. Search by name, location, or time period, and connect with others who share information about the same people.

## Features

### Core Functionality
- **Advanced Search**: Search by name, country, city, year range, tags, description, comments, relationships, and location radius
- **User Registration & Login**: Secure account system with localStorage-based authentication
- **Photo Upload & Gallery**: Upload multiple photos per person, set main image, tag who is in each photo
- **Tagging System**: Add tags to make entries easily searchable (e.g., "Christiania 1910", "morsside", "farsside")
- **Social Features**: Comment on entries with @mentions, clickable links, and email links
- **AI-Powered Family Tree Builder**: Upload large text (10,000+ words) and let AI extract family members and relationships automatically
- **Edit & Delete**: Manage your own contributions - edit or delete your entries and comments
- **Export/Import**: Export to JSON or CSV/Excel, import from JSON or CSV files
- **Share & Link**: Share ancestors with others via copy link or native share API
- **International Support**: Search and discover ancestors from anywhere in the world
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile devices

### Advanced Features
- **Family Tree Visualization**: Interactive family tree with automatic layout, zoom, pan, and timeline view
- **Relationship Search**: Find relatives (siblings, parents, children, spouses) based on family tree data
- **Relatives Display**: View all relatives grouped by relationship type on person pages
- **Statistics Dashboard**: View comprehensive statistics including birth year distribution graphs
- **Bulk Operations**: Bulk import from CSV/Excel, bulk edit (tags, country, city), bulk export
- **Image Gallery**: Multiple images per person with tagging support (who is in the picture)
- **Profile Settings**: Customize username, bio, and profile picture
- **Dark Mode**: Toggle between light and dark themes
- **Timeline View**: Interactive timeline showing persons by birth year with decade markers
- **PDF/PNG Export**: Export family tree to PDF or PNG format
- **Location Radius Search**: Find persons near a specific location
- **Full-text Comment Search**: Search within all comments across all persons
- **Autocomplete Suggestions**: Smart search suggestions with history, names, countries, and cities
- **Keyboard Navigation**: Navigate search results with arrow keys
- **Backup & Restore**: Complete backup and restore functionality for all data

## Progressive Web App (PWA)

PastLife er en fullverdig Progressive Web App som kan installeres på mobile enheter og desktop!

### PWA Features
- ✅ **Installable** - Installer appen på hjem-skjermen (Android, iOS, Desktop)
- ✅ **Offline Support** - Fungerer offline med Service Worker caching
- ✅ **App-like Experience** - Standalone mode uten browser UI
- ✅ **Fast Loading** - Cache-first strategi for rask oppstart
- ✅ **Responsive** - Optimalisert for alle skjermstørrelser

### Installer Appen

#### Android (Chrome)
1. Åpne PastLife i Chrome
2. Klikk på install-knappen som vises
3. Eller: Meny → "Install app"
4. Appen installeres på hjem-skjermen

#### iOS (Safari eller Brave)
**Med Safari:**
1. Åpne PastLife i Safari
2. Trykk Share-knappen (📤) nederst
3. Velg "Legg til på hjem-skjerm" eller "Add to Home Screen"
4. Bekreft og legg til

**Med Brave:**
1. Åpne PastLife i Brave
2. Trykk på meny-knappen (☰) nederst
3. Velg "Share" eller "Del"
4. Scroll ned og velg "Legg til på hjem-skjerm"
5. Bekreft og legg til

#### Desktop (Chrome, Edge eller Brave)
1. Klikk på install-ikonet i adresselinjen
2. Eller: Meny → "Install PastLife"
3. Appen åpnes i eget vindu (standalone mode)

**Brave på Windows:**
- Brave støtter PWA-installasjon på samme måte som Chrome
- Install-ikonet vises automatisk i adresselinjen
- Fungerer identisk med Chrome-installasjon

### Offline-funksjonalitet
- ✅ Fungerer offline etter installasjon
- ✅ Automatisk caching av alle sider
- ✅ Offline-indikator vises når du er offline
- ✅ Offline queue tracker handlinger når offline
- ✅ Automatisk sync når du kommer online igjen

### PWA-dokumentasjon
- **`PWA_STATUS.md`** - Detaljert status
- **`WEB_APP_KONVERTERING.md`** - Teknisk dokumentasjon
- **`START_GUIDE.md`** - Komplett start-guide
- **`BRAVE_IPHONE_GUIDE.md`** - Guide for Brave på iPhone
- **`DEPLOYMENT.md`** - Deploy-instruksjoner

## Technology

- Pure HTML, CSS, and JavaScript
- LocalStorage for data persistence
- ES6 Modules for code organization
- Responsive design with modern CSS
- **Service Worker** for offline support
- **PWA Manifest** for installability

## Color Palette

- **Warm Brown**: Primary brand color (#8B6F47, #6B4E2F, #B8956A)
- **Golden/Amber**: Accent color (#C9A961, #A6894F, #E5C97A)
- **Warm Neutrals**: Off-white, warm grays, and dark text colors

## Project Structure

```
PastLife/
├── index.html          # Home page
├── search.html         # Search page
├── profile.html        # User profile and submission page
├── login.html          # Login and registration
├── person.html         # Individual person detail page
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   ├── auth.js         # Authentication functions
│   ├── data.js         # Data management (localStorage)
│   ├── main.js         # Home page functionality
│   ├── search.js       # Search functionality with autocomplete
│   ├── profile.js      # Profile page functionality
│   ├── login.js        # Login/register functionality
│   ├── person.js       # Person detail page functionality
│   ├── family-tree.js  # Family tree builder and visualization
│   └── utils.js        # Utility functions
├── css/
│   ├── style.css       # Main stylesheet
│   └── family-tree.css # Family tree specific styles
└── assets/
    └── images/         # Image assets
```

## Getting Started

1. Clone or download this repository
2. Open `index.html` in a web browser
3. No server required - runs entirely in the browser using localStorage

## Usage

### For Users

1. **Register**: Create an account on the login page
2. **Search**: Use the search page to find ancestors by various criteria
3. **Contribute**: Add information and photos about your ancestors
4. **Tag**: Add tags to make entries searchable (e.g., "Oslo 1920", "family")
5. **Comment**: Leave comments on entries to share stories and connect

### For Developers

- All data is stored in browser localStorage
- To reset data, clear browser localStorage
- Images are stored as base64 strings in localStorage
- The site is ready for GitHub Pages deployment

## GitHub Pages Deployment

1. Push this repository to GitHub
2. Go to repository Settings > Pages
3. Select the branch (usually `main` or `master`)
4. Select `/ (root)` as the source
5. Your site will be available at `https://[username].github.io/[repository-name]`

## Browser Support

- Modern browsers with ES6 module support
- Chrome, Firefox, Safari, Edge (latest versions)

## Notes

- Data is stored locally in the browser (localStorage)
- Images are automatically compressed and converted to base64 for storage
- No backend server required - fully client-side
- For production use, consider migrating to a proper database and backend
- AI features require OpenRouter API key (optional - basic analysis available without)

## 🔒 Security

**IMPORTANT**: Never commit API keys, passwords, or other sensitive information to git. See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## Recent Updates

### Major Features
- ✨ **Rebranded to PastLife** - Complete rebranding from F³ with new logo and color scheme
- ✨ **AI-powered family tree builder** - Upload text and AI extracts family members and relationships
- ✨ **Timeline View** - Interactive timeline showing persons by birth year
- ✨ **PDF/PNG Export** - Export family tree to PDF or PNG format
- ✨ **Image Gallery** - Multiple images per person with tagging support
- ✨ **Relationship Search** - Find relatives based on family tree data
- ✨ **Location Radius Search** - Find persons near a specific location
- ✨ **Statistics Dashboard** - Comprehensive statistics with birth year distribution graphs
- ✨ **Bulk Operations** - Import from CSV/Excel, bulk edit, bulk export
- ✨ **Profile Settings** - Customize username, bio, and profile picture
- ✨ **Dark Mode** - Toggle between light and dark themes
- ✨ **Enhanced Comments** - @mentions, clickable links, email links
- ✨ **Autocomplete Search** - Smart suggestions with history, names, locations
- ✨ **Keyboard Navigation** - Navigate search results with arrow keys
- ✨ **Improved Mobile Experience** - Better responsive design for mobile and tablets
- ✨ **Better Error Handling** - Improved error messages and validation
- ✨ **Tooltips** - Helpful tooltips throughout the application
- ✨ **FAQ Section** - Frequently asked questions on homepage

## License

This project is open source and available for personal use.

---

**PastLife** - Connecting generations through time.
