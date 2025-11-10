// Offline indicator utility
// Shows a visual indicator when the user goes offline

let offlineIndicator = null;

export function initOfflineIndicator() {
    // Create offline indicator element
    offlineIndicator = document.createElement('div');
    offlineIndicator.id = 'offline-indicator';
    offlineIndicator.setAttribute('role', 'status');
    offlineIndicator.setAttribute('aria-live', 'polite');
    offlineIndicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #c62828;
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: none;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
        font-weight: 500;
        animation: slideUp 0.3s ease-out;
    `;
    
    // Add icon
    const icon = document.createElement('span');
    icon.textContent = '⚠️';
    icon.setAttribute('aria-hidden', 'true');
    
    const text = document.createElement('span');
    text.textContent = 'Du er offline. Noen funksjoner kan være utilgjengelige.';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Lukk offline-indikator');
    closeBtn.style.cssText = `
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 0;
        margin-left: auto;
        opacity: 0.8;
        transition: opacity 0.2s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.8';
    closeBtn.onclick = () => {
        offlineIndicator.classList.remove('show');
    };
    
    offlineIndicator.appendChild(icon);
    offlineIndicator.appendChild(text);
    offlineIndicator.appendChild(closeBtn);
    document.body.appendChild(offlineIndicator);
    
    // Add CSS animation
    if (!document.getElementById('offline-indicator-styles')) {
        const style = document.createElement('style');
        style.id = 'offline-indicator-styles';
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            #offline-indicator.show {
                display: flex !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check initial state
    if (!navigator.onLine) {
        handleOffline();
    }
}

function handleOffline() {
    if (offlineIndicator) {
        offlineIndicator.classList.add('show');
        offlineIndicator.setAttribute('aria-label', 'Du er offline');
        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'alert');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.className = 'sr-only';
        announcement.textContent = 'Du er nå offline. Noen funksjoner kan være utilgjengelige.';
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }
}

function handleOnline() {
    if (offlineIndicator) {
        offlineIndicator.classList.remove('show');
        // Announce to screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'alert');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.className = 'sr-only';
        announcement.textContent = 'Du er nå tilbake online.';
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(announcement);
        setTimeout(() => announcement.remove(), 1000);
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOfflineIndicator);
} else {
    initOfflineIndicator();
}

