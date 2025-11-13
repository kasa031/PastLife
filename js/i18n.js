// Internationalization (i18n) module
// Supports English (default) and Norwegian

const I18N_STORAGE = 'pastlife_language';
const DEFAULT_LANGUAGE = 'en';

// Translation strings
const translations = {
    en: {
        // Navigation
        'nav.home': 'Home',
        'nav.search': 'Search',
        'nav.familyTree': 'Family Tree',
        'nav.profile': 'Profile',
        'nav.about': 'About',
        'nav.login': 'Login',
        'nav.logout': 'Logout',
        'nav.language': 'Language',
        
        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.close': 'Close',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.confirm': 'Confirm',
        'common.yes': 'Yes',
        'common.no': 'No',
        'common.search': 'Search',
        'common.clear': 'Clear',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.previous': 'Previous',
        
        // Family Tree
        'familyTree.title': 'AI-Powered Family Tree Builder',
        'familyTree.uploadSection': 'Upload Family Information',
        'familyTree.uploadDescription': 'Paste or type information about your family (up to 10,000+ words). Our AI will analyze the text and help build your family tree automatically.',
        'familyTree.tips': '💡 Tips: Include names, birth years, places and relationships (e.g., "son of", "married to"). The more detailed, the better results!',
        'familyTree.familyInformation': 'Family Information',
        'familyTree.pasteText': 'Paste your family information here',
        'familyTree.loadExample': '📝 Load Example',
        'familyTree.maxWords': 'Max: 10,000+ words',
        'familyTree.apiKey': 'OpenRouter API Key (Recommended for best results)',
        'familyTree.apiKeyPlaceholder': 'sk-or-...',
        'familyTree.paste': '📋 Paste',
        'familyTree.examplePlaceholder': 'Example:\n\nMy great-grandfather Edvard Jensen was born in 1885 in Christiania, Norway. He married Anna Larsen in 1910. They had three children: Olav Jensen (born 1912), Inger Jensen (born 1915), and Knut Jensen (born 1918).\n\nEdvard died in 1950 in Oslo. Anna survived him and died in 1965.\n\nOlav married Maria Hansen in 1935. They had two children: Erik Olsen (born 1938) and Liv Olsen (born 1942).',
        'familyTree.useExisting': 'Use Existing Data',
        'familyTree.share': '🔗 Share Family Tree',
        'familyTree.show': 'Show:',
        'familyTree.all': 'All',
        'familyTree.motherSide': '👩 Mother\'s Side',
        'familyTree.fatherSide': '👨 Father\'s Side',
        'familyTree.both': 'Both',
        'familyTree.apiKeyLoaded': '✅ API key is loaded ({masked}) and ready to use! You can overwrite it if you want to use a different one.',
        'familyTree.apiKeyUpdated': '✅ API key updated ({masked}) and ready to use!',
        'familyTree.noApiKey': '⚠️ No API key. Please enter your OpenRouter API key.',
        'familyTree.analyze': '🔍 Analyze & Build Tree',
        'familyTree.merge': '➕ Add to Existing Tree',
        'familyTree.exampleLoaded': 'Example text loaded! You can edit or replace it.',
        'familyTree.replaceWarning': 'This will replace the existing tree. Would you rather add to it instead? (Click Cancel and use "Add to Existing Tree" instead)',
        'familyTree.pleaseEnterApiKey': 'Please enter your OpenRouter API key first.',
        'familyTree.enterApiKeySuggestion': 'Enter your OpenRouter API key in the input field above. You can get a key from openrouter.ai',
        'familyTree.pleaseEnterFamilyInfo': 'Please enter some family information',
        'familyTree.enterFamilyInfoSuggestion': 'Enter details about your family members, their relationships, and important dates.',
        'familyTree.analyzing': 'Analyzing family information...',
        'familyTree.connecting': 'Connecting to AI...',
        'familyTree.connectingMerge': 'Connecting to AI (will merge with existing tree)...',
        'familyTree.building': 'Building family tree...',
        'familyTree.merging': 'Merging with existing tree...',
        'familyTree.apiKeyDeleted': 'API key deleted',
        
        // Search
        'search.title': 'Search Ancestors',
        'search.placeholder': 'Search by name, place, year, description...',
        'search.noResults': 'No results found',
        'search.results': 'Results',
        
        // Profile
        'profile.title': 'Profile',
        'profile.username': 'Username',
        'profile.bio': 'Bio',
        'profile.saveProfile': 'Save Profile',
        'profile.statistics': 'Statistics',
        'profile.totalPersons': 'Total Persons',
        
        // Person
        'person.addAncestor': 'Add Ancestor',
        'person.name': 'Name',
        'person.birthYear': 'Birth Year',
        'person.deathYear': 'Death Year',
        'person.birthPlace': 'Birth Place',
        'person.country': 'Country',
        'person.city': 'City',
        'person.description': 'Description',
        'person.tags': 'Tags',
        'person.mainImage': 'Main Image',
        'person.images': 'Images',
        'person.rotate': '🔄 Rotate',
        'person.delete': 'Delete',
        'person.save': 'Save',
        'person.comments': 'Comments',
        'person.addComment': 'Add Comment',
        'person.noComments': 'No comments yet',
        
        // About
        'about.title': 'About PastLife',
        'about.description': 'PastLife is a comprehensive web application for discovering, organizing, and sharing information about your ancestors.',
        
        // Login
        'login.title': 'Login',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.login': 'Login',
        'login.register': 'Register',
        
        // Errors
        'error.generic': 'An error occurred',
        'error.apiKeyInvalid': 'API key is invalid. Check your OpenRouter API key. Using basic analysis.',
        'error.network': 'Network error. Please check your connection.',
        
        // Success messages
        'success.saved': 'Saved successfully',
        'success.deleted': 'Deleted successfully',
        'success.updated': 'Updated successfully'
    },
    no: {
        // Navigation
        'nav.home': 'Hjem',
        'nav.search': 'Søk',
        'nav.familyTree': 'Familietre',
        'nav.profile': 'Profil',
        'nav.about': 'Om',
        'nav.login': 'Logg inn',
        'nav.logout': 'Logg ut',
        'nav.language': 'Språk',
        
        // Common
        'common.save': 'Lagre',
        'common.cancel': 'Avbryt',
        'common.delete': 'Slett',
        'common.edit': 'Rediger',
        'common.close': 'Lukk',
        'common.loading': 'Laster...',
        'common.error': 'Feil',
        'common.success': 'Vellykket',
        'common.confirm': 'Bekreft',
        'common.yes': 'Ja',
        'common.no': 'Nei',
        'common.search': 'Søk',
        'common.clear': 'Tøm',
        'common.back': 'Tilbake',
        'common.next': 'Neste',
        'common.previous': 'Forrige',
        
        // Family Tree
        'familyTree.title': 'AI-drevet Familietre Bygger',
        'familyTree.uploadSection': 'Last opp Familieinformasjon',
        'familyTree.uploadDescription': 'Lim inn eller skriv informasjon om familien din (opptil 10,000+ ord). AI-en vår vil analysere teksten og hjelpe deg med å bygge familietreet automatisk.',
        'familyTree.tips': '💡 Tips: Inkluder navn, fødselsår, steder og relasjoner (f.eks. "sønn av", "giftet seg med"). Jo mer detaljert, jo bedre resultat!',
        'familyTree.familyInformation': 'Familieinformasjon',
        'familyTree.pasteText': 'Lim inn tekst om familien din her',
        'familyTree.loadExample': '📝 Last Eksempel',
        'familyTree.maxWords': 'Maks: 10,000+ ord',
        'familyTree.apiKey': 'OpenRouter API-nøkkel (Anbefalt for best resultat)',
        'familyTree.apiKeyPlaceholder': 'sk-or-...',
        'familyTree.paste': '📋 Lim inn',
        'familyTree.examplePlaceholder': 'Eksempel:\n\nMin oldefar Edvard Jensen ble født i 1885 i Christiania, Norge. Han giftet seg med Anna Larsen i 1910. De fikk tre barn: Olav Jensen (født 1912), Inger Jensen (født 1915), og Knut Jensen (født 1918).\n\nEdvard døde i 1950 i Oslo. Anna overlevde ham og døde i 1965.\n\nOlav giftet seg med Maria Hansen i 1935. De fikk to barn: Erik Olsen (født 1938) og Liv Olsen (født 1942).',
        'familyTree.useExisting': 'Bruk Eksisterende Data',
        'familyTree.share': '🔗 Del Familietre',
        'familyTree.show': 'Vis:',
        'familyTree.all': 'Alle',
        'familyTree.motherSide': '👩 Morsside',
        'familyTree.fatherSide': '👨 Farsside',
        'familyTree.both': 'Begge',
        'familyTree.apiKeyLoaded': '✅ API-nøkkel er lastet ({masked}) og klar til bruk! Du kan overskrive den hvis du vil bruke en annen.',
        'familyTree.apiKeyUpdated': '✅ API-nøkkel oppdatert ({masked}) og klar til bruk!',
        'familyTree.noApiKey': '⚠️ Ingen API-nøkkel. Vennligst legg inn din OpenRouter API-nøkkel.',
        'familyTree.analyze': '🔍 Analyser & Bygg Tre',
        'familyTree.merge': '➕ Legg til i Eksisterende Tre',
        'familyTree.exampleLoaded': 'Eksempeltekst lastet inn! Du kan redigere eller erstatte den.',
        'familyTree.replaceWarning': 'Dette vil erstatte eksisterende tre. Vil du heller legge til i stedet? (Klikk Cancel og bruk "Legg til i eksisterende tre" i stedet)',
        'familyTree.pleaseEnterApiKey': 'Vennligst legg inn din OpenRouter API-nøkkel først.',
        'familyTree.enterApiKeySuggestion': 'Legg inn din OpenRouter API-nøkkel i feltet over. Du kan få en nøkkel fra openrouter.ai',
        'familyTree.pleaseEnterFamilyInfo': 'Vennligst legg inn familieinformasjon',
        'familyTree.enterFamilyInfoSuggestion': 'Legg inn detaljer om familiemedlemmene dine, deres relasjoner og viktige datoer.',
        'familyTree.analyzing': 'Analyserer familieinformasjon...',
        'familyTree.connecting': 'Kobler til AI...',
        'familyTree.connectingMerge': 'Kobler til AI (vil slå sammen med eksisterende tre)...',
        'familyTree.building': 'Bygger familietre...',
        'familyTree.merging': 'Slår sammen med eksisterende tre...',
        'familyTree.apiKeyDeleted': 'API-nøkkel slettet',
        
        // Search
        'search.title': 'Søk Forfedre',
        'search.placeholder': 'Søk etter navn, sted, år, beskrivelse...',
        'search.noResults': 'Ingen resultater funnet',
        'search.results': 'Resultater',
        
        // Profile
        'profile.title': 'Profil',
        'profile.username': 'Brukernavn',
        'profile.bio': 'Bio',
        'profile.saveProfile': 'Lagre Profil',
        'profile.statistics': 'Statistikk',
        'profile.totalPersons': 'Totalt Personer',
        
        // Person
        'person.addAncestor': 'Legg til Forfader',
        'person.name': 'Navn',
        'person.birthYear': 'Fødselsår',
        'person.deathYear': 'Dødsår',
        'person.birthPlace': 'Fødselssted',
        'person.country': 'Land',
        'person.city': 'By',
        'person.description': 'Beskrivelse',
        'person.tags': 'Tags',
        'person.mainImage': 'Hovedbilde',
        'person.images': 'Bilder',
        'person.rotate': '🔄 Roter',
        'person.delete': 'Slett',
        'person.save': 'Lagre',
        'person.comments': 'Kommentarer',
        'person.addComment': 'Legg til Kommentar',
        'person.noComments': 'Ingen kommentarer ennå',
        
        // About
        'about.title': 'Om PastLife',
        'about.description': 'PastLife er en komplett webapplikasjon for å oppdage, organisere og dele informasjon om dine forfedre.',
        
        // Login
        'login.title': 'Logg inn',
        'login.username': 'Brukernavn',
        'login.password': 'Passord',
        'login.login': 'Logg inn',
        'login.register': 'Registrer',
        
        // Errors
        'error.generic': 'En feil oppstod',
        'error.apiKeyInvalid': 'API-nøkkel er ugyldig. Sjekk din OpenRouter API-nøkkel. Bruker grunnleggende analyse.',
        'error.network': 'Nettverksfeil. Vennligst sjekk tilkoblingen din.',
        
        // Success messages
        'success.saved': 'Lagret vellykket',
        'success.deleted': 'Slettet vellykket',
        'success.updated': 'Oppdatert vellykket'
    }
};

// Current language
let currentLanguage = DEFAULT_LANGUAGE;

// Initialize language from localStorage
function initLanguage() {
    const savedLanguage = localStorage.getItem(I18N_STORAGE);
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    } else {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('no')) {
            currentLanguage = 'no';
        } else {
            currentLanguage = 'en';
        }
        saveLanguage(currentLanguage);
    }
    return currentLanguage;
}

// Save language preference
function saveLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem(I18N_STORAGE, lang);
    }
}

// Get translation
function t(key, params = {}) {
    const translation = translations[currentLanguage]?.[key] || translations[DEFAULT_LANGUAGE]?.[key] || key;
    
    // Replace parameters
    if (params && Object.keys(params).length > 0) {
        return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
            return params[paramKey] !== undefined ? params[paramKey] : match;
        });
    }
    
    return translation;
}

// Get current language
function getCurrentLanguage() {
    return currentLanguage;
}

// Set language and update UI
function setLanguage(lang) {
    if (translations[lang]) {
        saveLanguage(lang);
        updatePageLanguage();
        return true;
    }
    return false;
}

// Update all elements with data-i18n attribute
function updatePageLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const translation = t(key);
        
        // Handle different element types
        if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'password' || element.type === 'email')) {
            // Only update placeholder if no data-i18n-placeholder attribute
            if (!element.hasAttribute('data-i18n-placeholder')) {
                element.placeholder = translation;
            } else {
                element.value = translation;
            }
        } else if (element.tagName === 'INPUT' && element.type === 'submit' || element.tagName === 'BUTTON') {
            element.textContent = translation;
        } else if (element.tagName === 'TEXTAREA') {
            // Only update placeholder if no data-i18n-placeholder attribute
            if (!element.hasAttribute('data-i18n-placeholder')) {
                element.placeholder = translation;
            } else {
                element.value = translation;
            }
        } else {
            element.textContent = translation;
        }
    });
    
    // Update placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // Update title attributes
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
    
    // Trigger custom event for components that need to update
    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: currentLanguage } }));
}

// Initialize on load
if (typeof document !== 'undefined') {
    initLanguage();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updatePageLanguage);
    } else {
        updatePageLanguage();
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { t, setLanguage, getCurrentLanguage, initLanguage, updatePageLanguage };
} else {
    window.i18n = {
        t,
        setLanguage,
        getCurrentLanguage,
        initLanguage,
        updatePageLanguage
    };
}

