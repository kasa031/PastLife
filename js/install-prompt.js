// Install Prompt functionality for PWA
// Handles the "Add to Home Screen" / "Install App" prompt

let deferredPrompt = null;
let installButton = null;
let showMessage = null;

// Import showMessage from utils.js
import('./utils.js').then(module => {
    showMessage = module.showMessage;
}).catch(() => {
    // Fallback if import fails
    showMessage = function(message, type) {
        console.log(`[${type}] ${message}`);
        // Create simple notification as fallback
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    };
});

// Helper function to show message safely
function showMessageSafe(message, type = 'info') {
    if (showMessage) {
        showMessage(message, type);
    } else {
        // Fallback notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button
    showInstallButton();
});

// Show install button when app can be installed
function showInstallButton() {
    // Don't show if already installed
    if (isAppInstalled()) {
        return;
    }
    
    // Always show install button for iOS/Brave (they don't support beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const browser = detectBrowser();
    const isBrave = browser === 'brave';
    
    // For iOS or Brave, always show button (they need manual instructions)
    if (isIOS || (isBrave && !deferredPrompt)) {
        // Continue to create button
    } else if (!deferredPrompt) {
        // For other browsers, only show if deferredPrompt exists
        return;
    }
    
    // Check if button already exists
    if (document.getElementById('installAppButton')) {
        document.getElementById('installAppButton').style.display = 'block';
        return;
    }
    
    // Create install button
    installButton = document.createElement('button');
    installButton.id = 'installAppButton';
    installButton.className = 'install-prompt-btn';
    installButton.innerHTML = '📱 Install PastLife App';
    installButton.title = 'Install PastLife as a web app on your device';
    installButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--turquoise-primary, #00897b);
        color: white;
        border: none;
        border-radius: 25px;
        padding: 12px 24px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s;
        animation: slideInUp 0.3s ease-out;
    `;
    
    // Add hover effect
    installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'translateY(-2px)';
        installButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    });
    installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'translateY(0)';
        installButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });
    
    // Add click handler
    installButton.addEventListener('click', handleInstallClick);
    
    document.body.appendChild(installButton);
    
    // Add CSS animation if not already added
    if (!document.getElementById('installPromptStyles')) {
        const style = document.createElement('style');
        style.id = 'installPromptStyles';
        style.textContent = `
            @keyframes slideInUp {
                from {
                    transform: translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @media (max-width: 768px) {
                #installAppButton {
                    bottom: 10px;
                    right: 10px;
                    left: 10px;
                    width: calc(100% - 20px);
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Handle install button click
async function handleInstallClick() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const browser = detectBrowser();
    const isBrave = browser === 'brave';
    
    // For iOS or Brave without deferredPrompt, show instructions
    if ((isIOS || isBrave) && !deferredPrompt) {
        showIOSInstructions();
        return;
    }
    
    if (!deferredPrompt) {
        // App may already be installed
        showMessageSafe('App is already installed or cannot be installed on this device', 'info');
        return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
        showMessageSafe('PastLife app is being installed!', 'success');
        // Hide install button
        if (installButton) {
            installButton.style.display = 'none';
        }
    } else {
        showMessageSafe('Installation cancelled. You can install it later from the browser menu.', 'info');
    }
    
    // Clear the deferredPrompt
    deferredPrompt = null;
}

// Detect browser type
function detectBrowser() {
    const ua = navigator.userAgent;
    // Check for Brave first (Brave identifies as Chrome but has Brave-specific properties)
    if (navigator.brave && navigator.brave.isBrave) {
        return 'brave';
    }
    // Check user agent for Brave
    if (/Brave/i.test(ua)) {
        return 'brave';
    }
    // Check for Brave in navigator
    if (navigator.userAgentData && navigator.userAgentData.brands) {
        const isBrave = navigator.userAgentData.brands.some(brand => 
            brand.brand && brand.brand.toLowerCase().includes('brave')
        );
        if (isBrave) {
            return 'brave';
        }
    }
    // Safari detection
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua) && !/CriOS/i.test(ua) && !/Brave/i.test(ua)) {
        return 'safari';
    }
    // Chrome detection
    if (/Chrome/i.test(ua) && !/Brave/i.test(ua)) {
        return 'chrome';
    }
    return 'unknown';
}

// Show iOS installation instructions
function showIOSInstructions() {
    const browser = detectBrowser();
    const isBrave = browser === 'brave';
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    let instructionsHTML = '';
    
    if (isBrave && isIOS) {
        instructionsHTML = `
            <div style="padding: 1.5rem;">
                <h3 style="color: var(--turquoise-dark); margin-top: 0;">📱 Install PastLife på iPhone (Brave)</h3>
                <ol style="line-height: 2; color: var(--text-dark);">
                    <li>Trykk på <strong>meny-knappen</strong> (☰) nederst i Brave</li>
                    <li>Velg <strong>"Share"</strong> eller <strong>"Del"</strong></li>
                    <li>Scroll ned og velg <strong>"Legg til på hjem-skjerm"</strong> eller <strong>"Add to Home Screen"</strong></li>
                    <li>Trykk <strong>"Legg til"</strong> eller <strong>"Add"</strong> i øvre høyre hjørne</li>
                    <li>PastLife vil nå vises som en app på hjem-skjermen din! 🎉</li>
                </ol>
                <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 Tips:</strong> Hvis du ikke ser "Legg til på hjem-skjerm", prøv å swipe opp i share-menyen for å se flere alternativer.
                </div>
                <button onclick="this.closest('.install-instructions-modal').remove(); this.closest('.install-instructions-overlay').remove();" style="
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: var(--turquoise-primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                ">Lukk</button>
            </div>
        `;
    } else if (isBrave && isAndroid) {
        instructionsHTML = `
            <div style="padding: 1.5rem;">
                <h3 style="color: var(--turquoise-dark); margin-top: 0;">📱 Install PastLife på Android (Brave)</h3>
                <ol style="line-height: 2; color: var(--text-dark);">
                    <li>Trykk på <strong>meny-knappen</strong> (☰) øverst i Brave</li>
                    <li>Velg <strong>"Install"</strong> eller <strong>"Add to Home Screen"</strong></li>
                    <li>Bekreft installasjonen</li>
                    <li>PastLife vil nå vises som en app på hjem-skjermen din! 🎉</li>
                </ol>
                <div style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <strong>💡 Tips:</strong> Hvis du ikke ser install-alternativet, sjekk at du er på HTTPS og at appen er PWA-kompatibel.
                </div>
                <button onclick="this.closest('.install-instructions-modal').remove(); this.closest('.install-instructions-overlay').remove();" style="
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: var(--turquoise-primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                ">Lukk</button>
            </div>
        `;
    } else if (isIOS) {
        instructionsHTML = `
            <div style="padding: 1.5rem;">
                <h3 style="color: var(--turquoise-dark); margin-top: 0;">📱 Install PastLife på iOS</h3>
                <ol style="line-height: 2; color: var(--text-dark);">
                    <li>Trykk på <strong>Share</strong>-knappen (📤) nederst i Safari</li>
                    <li>Velg <strong>"Legg til på hjem-skjerm"</strong> eller <strong>"Add to Home Screen"</strong></li>
                    <li>Trykk <strong>"Legg til"</strong> eller <strong>"Add"</strong> i øvre høyre hjørne</li>
                    <li>PastLife vil nå vises som en app på hjem-skjermen din!</li>
                </ol>
                <button onclick="this.closest('.install-instructions-modal').remove(); this.closest('.install-instructions-overlay').remove();" style="
                    margin-top: 1rem;
                    padding: 0.75rem 1.5rem;
                    background: var(--turquoise-primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                ">Lukk</button>
            </div>
        `;
    }
    
    const instructions = instructionsHTML;
    
    // Create a custom modal for instructions
    const modal = document.createElement('div');
    modal.className = 'install-instructions-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10001;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    `;
    modal.innerHTML = instructions;
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'install-instructions-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
    `;
    overlay.addEventListener('click', () => {
        modal.remove();
        overlay.remove();
    });
    
    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

// Check if app is already installed (standalone mode)
function isAppInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    // Check for iOS standalone mode
    if (window.navigator.standalone === true) {
        return true;
    }
    return false;
}

// Listen for app installed event
window.addEventListener('appinstalled', () => {
    console.log('PastLife app was installed');
    deferredPrompt = null;
    if (installButton) {
        installButton.style.display = 'none';
    }
    showMessageSafe('PastLife app installed successfully! 🎉', 'success');
});

// Auto-show install button on page load for iOS/Brave
window.addEventListener('load', () => {
    // Wait a bit for everything to load
    setTimeout(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const browser = detectBrowser();
        const isBrave = browser === 'brave';
        
        // Auto-show for iOS or Brave
        if (isIOS || isBrave) {
            showInstallButton();
        }
    }, 1000);
});

// Export functions for global use
window.showInstallButton = showInstallButton;
window.handleInstallClick = handleInstallClick;
