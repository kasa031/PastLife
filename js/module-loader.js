// Module loader for code splitting and lazy loading
// This module handles dynamic imports to reduce initial bundle size

// Cache for loaded modules
const moduleCache = new Map();

// Load module with caching
export async function loadModule(modulePath) {
    if (moduleCache.has(modulePath)) {
        return moduleCache.get(modulePath);
    }
    
    try {
        const module = await import(modulePath);
        moduleCache.set(modulePath, module);
        return module;
    } catch (error) {
        console.error(`Error loading module ${modulePath}:`, error);
        throw error;
    }
}

// Preload modules in the background (non-blocking)
export function preloadModules(modulePaths) {
    modulePaths.forEach(path => {
        // Use requestIdleCallback if available, otherwise setTimeout
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                loadModule(path).catch(() => {
                    // Silently fail preload
                });
            });
        } else {
            setTimeout(() => {
                loadModule(path).catch(() => {
                    // Silently fail preload
                });
            }, 2000); // Wait 2 seconds before preloading
        }
    });
}

// Load module when needed (on user interaction)
export async function loadModuleOnInteraction(modulePath, eventType = 'click', selector = null) {
    const element = selector ? document.querySelector(selector) : document;
    
    const loadOnce = async () => {
        await loadModule(modulePath);
        // Remove listener after first load
        element.removeEventListener(eventType, loadOnce);
    };
    
    element.addEventListener(eventType, loadOnce, { once: true });
}

// Initialize install prompt lazily
export async function initInstallPrompt() {
    const { initInstallPrompt: init } = await loadModule('./install-prompt.js');
    return init();
}

// Initialize offline indicator lazily
export async function initOfflineIndicator() {
    const { initOfflineIndicator: init } = await loadModule('./offline-indicator.js');
    return init();
}

// Initialize update manager lazily
export async function initUpdateManager() {
    const { initUpdateManager: init } = await loadModule('./update-manager.js');
    return init();
}

// Initialize onboarding lazily
export async function initOnboarding() {
    const { showOnboarding } = await loadModule('./onboarding.js');
    return showOnboarding;
}

