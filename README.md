# PastLife - Discover Your Ancestors

A social platform for discovering and sharing information about deceased ancestors from around the world. Search by name, location, or time period, and connect with others who share information about the same people.

## Features

- **Search Functionality**: Advanced search by name, country, city, year, tags, or description with sorting options
- **User Registration & Login**: Secure account system with localStorage-based authentication
- **Photo Upload**: Upload and compress photos of ancestors with detailed information
- **Tagging System**: Add tags to make entries easily searchable (e.g., "Christiania 1910")
- **Social Features**: Comment on entries, share stories, and connect with others
- **AI-Powered Family Tree Builder**: Upload large text (10,000+ words) and let AI extract family members and relationships automatically
- **Edit & Delete**: Manage your own contributions - edit or delete your entries and comments
- **Export/Import**: Export your data as JSON or import from files
- **Share & Link**: Share ancestors with others via copy link or native share API
- **International Support**: Search and discover ancestors from anywhere in the world
- **Responsive Design**: Works beautifully on both desktop and mobile devices

## Technology

- Pure HTML, CSS, and JavaScript
- LocalStorage for data persistence
- ES6 Modules for code organization
- Responsive design with modern CSS

## Color Palette

- **Turquoise**: Primary brand color (#00CED1, #008B8B, #AFEEEE)
- **Orange**: Accent color (#FF8C00, #FF6347, #FFA500)

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
│   ├── search.js       # Search functionality
│   ├── profile.js      # Profile page functionality
│   ├── login.js        # Login/register functionality
│   └── person.js       # Person detail page functionality
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

- ✨ AI-powered family tree builder with text analysis
- ✨ Edit and delete your own contributions
- ✨ Export/import functionality
- ✨ Share and copy link features
- ✨ Improved search with sorting and filtering
- ✨ Image compression to save storage space
- ✨ Better UX with loading states and notifications

## License

This project is open source and available for personal use.

---

**PastLife** - Connecting generations through time.
