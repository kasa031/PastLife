// Navigation utilities for accessibility and consistency
// Add skip-to-content link and ARIA labels to all pages

export function addSkipToContentLink() {
    // Check if already exists
    if (document.querySelector('.skip-to-content')) return;
    
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.style.cssText = `
        position: absolute;
        left: -9999px;
        z-index: 9999;
        padding: 1rem;
        background: var(--turquoise-primary, #8B6F47);
        color: white;
        text-decoration: none;
        font-weight: bold;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.left = '0';
        skipLink.style.top = '0';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.left = '-9999px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

export function enhanceNavigationAccessibility() {
    // Add ARIA labels to navigation
    const nav = document.querySelector('.navbar');
    if (nav && !nav.getAttribute('role')) {
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Main navigation');
    }
    
    // Enhance menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        if (!menuToggle.getAttribute('aria-expanded')) {
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        if (!menuToggle.getAttribute('aria-controls')) {
            menuToggle.setAttribute('aria-controls', 'navMenu');
        }
    }
    
    // Enhance nav menu
    const navMenu = document.getElementById('navMenu');
    if (navMenu && !navMenu.getAttribute('role')) {
        navMenu.setAttribute('role', 'menubar');
        
        // Add ARIA labels to menu items
        navMenu.querySelectorAll('li').forEach((li, index) => {
            if (!li.getAttribute('role')) {
                li.setAttribute('role', 'none');
            }
            
            const link = li.querySelector('a');
            const button = li.querySelector('button');
            const element = link || button;
            
            if (element && !element.getAttribute('role')) {
                element.setAttribute('role', 'menuitem');
            }
            
            if (link && !link.getAttribute('aria-label')) {
                const text = link.textContent.trim();
                const ariaLabel = text === 'Home' ? 'Home page' :
                                text === 'Search' ? 'Search ancestors' :
                                text === 'Profile' ? 'Your profile' :
                                text === 'Family Tree' ? 'Family tree builder' :
                                text === 'Om Meg' ? 'About page' :
                                text === 'Login' ? 'Login to your account' :
                                text === 'Logout' ? 'Logout from your account' :
                                text;
                link.setAttribute('aria-label', ariaLabel);
            }
            
            if (button && button.classList.contains('theme-toggle') && !button.getAttribute('aria-label')) {
                button.setAttribute('aria-label', 'Toggle dark mode');
            }
        });
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        addSkipToContentLink();
        enhanceNavigationAccessibility();
    });
} else {
    addSkipToContentLink();
    enhanceNavigationAccessibility();
}

