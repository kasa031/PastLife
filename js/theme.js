// Shared theme/dark mode functionality
// Centralized theme management to avoid duplication across files

// Toggle dark mode
export function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pastlife_theme', newTheme);
    localStorage.setItem('pastlife_theme_manual', 'true'); // Mark as manually set
    
    // Update toggle buttons
    updateThemeToggles(newTheme);
}

// Load saved theme or detect system preference
export function loadTheme() {
    // Check for saved preference first
    let savedTheme = localStorage.getItem('pastlife_theme');
    
    // If no saved preference, detect system preference
    if (!savedTheme) {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            savedTheme = 'dark';
        } else {
            savedTheme = 'light';
        }
    }
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update toggle buttons
    updateThemeToggles(savedTheme);
    
    // Listen for system theme changes (only if user hasn't manually set preference)
    if (window.matchMedia && !localStorage.getItem('pastlife_theme_manual')) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('pastlife_theme_manual')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                updateThemeToggles(newTheme);
            }
        });
    }
}

// Update all theme toggle buttons
function updateThemeToggles(theme) {
    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(toggle => {
        toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
        toggle.title = theme === 'dark' ? 'Toggle light mode' : 'Toggle dark mode';
    });
}

// Make toggleDarkMode available globally for onclick handlers
window.toggleDarkMode = toggleDarkMode;

