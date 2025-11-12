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
// Only shows on profile page, not as fixed button
function showInstallButton() {
    // Don't show if already installed
    if (isAppInstalled()) {
        // Hide any existing button
        const existingBtn = document.getElementById('installAppButton');
        if (existingBtn) {
            existingBtn.style.display = 'none';
        }
        return;
    }
    
    // Only show install button on profile page
    const isProfilePage = window.location.pathname.includes('profile.html');
    if (!isProfilePage) {
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
    
    // Check if button already exists in profile section
    if (document.getElementById('installAppButton')) {
        document.getElementById('installAppButton').style.display = 'block';
        return;
    }
    
    // Find profile settings section to add button there
    const profileSection = document.querySelector('.profile-settings-section');
    if (!profileSection) {
        // If profile section not found, don't show button
        return;
    }
    
    // Create install button container
    const installContainer = document.createElement('div');
    installContainer.id = 'installAppButtonContainer';
    installContainer.style.cssText = `
        margin-top: 1.5rem;
        padding: 1.5rem;
        background: linear-gradient(135deg, #F8F6F3 0%, #ffffff 100%);
        border: 2px solid var(--turquoise-primary, #00897b);
        border-radius: 12px;
    `;
    
    // Create install button
    installButton = document.createElement('button');
    installButton.id = 'installAppButton';
    installButton.className = 'install-prompt-btn';
    installButton.innerHTML = '📱 Install PastLife App';
    installButton.title = 'Install PastLife as a web app on your device';
    installButton.style.cssText = `
        width: 100%;
        background: var(--turquoise-primary, #00897b);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.3s;
    `;
    
    // Add hover effect
    installButton.addEventListener('mouseenter', () => {
        installButton.style.transform = 'translateY(-2px)';
        installButton.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
    });
    installButton.addEventListener('mouseleave', () => {
        installButton.style.transform = 'translateY(0)';
        installButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    });
    
    // Add click handler
    installButton.addEventListener('click', handleInstallClick);
    
    installContainer.appendChild(installButton);
    
    // Add description
    const description = document.createElement('p');
    description.style.cssText = `
        margin-top: 0.75rem;
        font-size: 0.9rem;
        color: var(--gray-dark, #666);
        text-align: center;
    `;
    description.textContent = 'Installer PastLife som en app på enheten din for raskere tilgang';
    installContainer.appendChild(description);
    
    // Insert after profile settings section
    profileSection.parentNode.insertBefore(installContainer, profileSection.nextSibling);
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
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 4rem; margin-bottom: 0.5rem;">📱</div>
                    <h3 style="color: var(--turquoise-dark, #8B6F47); margin-top: 0; font-size: 1.5rem;">Install PastLife på iPhone (Brave)</h3>
                </div>
                <div style="background: linear-gradient(135deg, #F8F6F3 0%, #ffffff 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #8B6F47;">
                    <ol style="line-height: 2.2; color: var(--text-dark, #333); margin: 0; padding-left: 1.5rem; list-style: none; counter-reset: step-counter;">
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">1</span>
                            <strong style="color: #8B6F47;">Trykk på meny-knappen</strong> 
                            <span style="font-size: 1.5rem; vertical-align: middle; margin-left: 0.5rem;">☰</span>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">Nederst i Brave-nettleseren</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">2</span>
                            <strong style="color: #8B6F47;">Velg "Share" eller "Del"</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">📤 Ikonet med pil oppover</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">3</span>
                            <strong style="color: #8B6F47;">Scroll ned og velg "Legg til på hjem-skjerm"</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">📲 Eller "Add to Home Screen"</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">4</span>
                            <strong style="color: #8B6F47;">Trykk "Legg til" eller "Add"</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">I øvre høyre hjørne</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 0; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #4caf50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">✓</span>
                            <strong style="color: #4caf50;">PastLife vises nå som en app! 🎉</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">På hjem-skjermen din</div>
                        </li>
                    </ol>
                </div>
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <div style="display: flex; align-items: start;">
                        <span style="font-size: 1.5rem; margin-right: 0.5rem;">💡</span>
                        <div>
                            <strong style="color: #856404;">Tips:</strong>
                            <div style="color: #856404; font-size: 0.9rem; margin-top: 0.3rem;">Hvis du ikke ser "Legg til på hjem-skjerm", prøv å swipe opp i share-menyen for å se flere alternativer.</div>
                        </div>
                    </div>
                </div>
                <button onclick="this.closest('.install-instructions-modal').remove(); this.closest('.install-instructions-overlay').remove();" style="
                    margin-top: 1.5rem;
                    padding: 0.875rem 1.5rem;
                    background: linear-gradient(135deg, #8B6F47 0%, #6B5F3F 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                    font-size: 1rem;
                    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(139, 111, 71, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(139, 111, 71, 0.3)';">Lukk</button>
            </div>
        `;
    } else if (isBrave && isAndroid) {
        instructionsHTML = `
            <div style="padding: 1.5rem;">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 4rem; margin-bottom: 0.5rem;">🤖</div>
                    <h3 style="color: var(--turquoise-dark, #8B6F47); margin-top: 0; font-size: 1.5rem;">Install PastLife på Android (Brave)</h3>
                </div>
                <div style="background: linear-gradient(135deg, #F8F6F3 0%, #ffffff 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #8B6F47;">
                    <ol style="line-height: 2.2; color: var(--text-dark, #333); margin: 0; padding-left: 1.5rem; list-style: none; counter-reset: step-counter;">
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">1</span>
                            <strong style="color: #8B6F47;">Trykk på meny-knappen</strong> 
                            <span style="font-size: 1.5rem; vertical-align: middle; margin-left: 0.5rem;">☰</span>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">Øverst i Brave-nettleseren</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">2</span>
                            <strong style="color: #8B6F47;">Velg "Install" eller "Add to Home Screen"</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">📲 I menyen</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">3</span>
                            <strong style="color: #8B6F47;">Bekreft installasjonen</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">Trykk "Install" i bekreftelsesdialogen</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 0; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #4caf50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">✓</span>
                            <strong style="color: #4caf50;">PastLife vises nå som en app! 🎉</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">På hjem-skjermen din</div>
                        </li>
                    </ol>
                </div>
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <div style="display: flex; align-items: start;">
                        <span style="font-size: 1.5rem; margin-right: 0.5rem;">💡</span>
                        <div>
                            <strong style="color: #856404;">Tips:</strong>
                            <div style="color: #856404; font-size: 0.9rem; margin-top: 0.3rem;">Hvis du ikke ser install-alternativet, sjekk at du er på HTTPS og at appen er PWA-kompatibel.</div>
                        </div>
                    </div>
                </div>
                <button onclick="this.closest('.install-instructions-modal').remove(); this.closest('.install-instructions-overlay').remove();" style="
                    margin-top: 1.5rem;
                    padding: 0.875rem 1.5rem;
                    background: linear-gradient(135deg, #8B6F47 0%, #6B5F3F 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                    font-size: 1rem;
                    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(139, 111, 71, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(139, 111, 71, 0.3)';">Lukk</button>
            </div>
        `;
    } else if (isIOS) {
        instructionsHTML = `
            <div style="padding: 1.5rem;">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 4rem; margin-bottom: 0.5rem;">📱</div>
                    <h3 style="color: var(--turquoise-dark, #8B6F47); margin-top: 0; font-size: 1.5rem;">Install PastLife på iOS</h3>
                </div>
                <div style="background: linear-gradient(135deg, #F8F6F3 0%, #ffffff 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem; border: 2px solid #8B6F47;">
                    <ol style="line-height: 2.2; color: var(--text-dark, #333); margin: 0; padding-left: 1.5rem; list-style: none; counter-reset: step-counter;">
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">1</span>
                            <strong style="color: #8B6F47;">Trykk på Share-knappen</strong> 
                            <span style="font-size: 1.5rem; vertical-align: middle; margin-left: 0.5rem;">📤</span>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">Nederst i Safari-nettleseren</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">2</span>
                            <strong style="color: #8B6F47;">Velg "Legg til på hjem-skjerm"</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">📲 Eller "Add to Home Screen"</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 1.2rem; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #8B6F47; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">3</span>
                            <strong style="color: #8B6F47;">Trykk "Legg til" eller "Add"</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">I øvre høyre hjørne</div>
                        </li>
                        <li style="counter-increment: step-counter; margin-bottom: 0; position: relative; padding-left: 2.5rem;">
                            <span style="position: absolute; left: 0; top: 0; width: 2rem; height: 2rem; background: #4caf50; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">✓</span>
                            <strong style="color: #4caf50;">PastLife vises nå som en app! 🎉</strong>
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.3rem;">På hjem-skjermen din</div>
                        </li>
                    </ol>
                </div>
                <button onclick="this.closest('.install-instructions-modal').remove(); this.closest('.install-instructions-overlay').remove();" style="
                    margin-top: 1.5rem;
                    padding: 0.875rem 1.5rem;
                    background: linear-gradient(135deg, #8B6F47 0%, #6B5F3F 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    width: 100%;
                    font-size: 1rem;
                    box-shadow: 0 4px 12px rgba(139, 111, 71, 0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(139, 111, 71, 0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(139, 111, 71, 0.3)';">Lukk</button>
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
    // Check if launched from home screen (Android)
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
        return true;
    }
    // Check localStorage for installation status
    const installStatus = localStorage.getItem('pastlife_app_installed');
    if (installStatus === 'true') {
        return true;
    }
    return false;
}

// Listen for app installed event
window.addEventListener('appinstalled', () => {
    console.log('PastLife app was installed');
    deferredPrompt = null;
    // Mark as installed in localStorage
    localStorage.setItem('pastlife_app_installed', 'true');
    // Hide install button
    if (installButton) {
        installButton.style.display = 'none';
        const container = document.getElementById('installAppButtonContainer');
        if (container) {
            container.style.display = 'none';
        }
    }
    showMessageSafe('PastLife app installed successfully! 🎉', 'success');
});

// Auto-show install button on page load for iOS/Brave (only on profile page)
window.addEventListener('load', () => {
    // Wait a bit for everything to load
    setTimeout(() => {
        // Only show on profile page
        const isProfilePage = window.location.pathname.includes('profile.html');
        if (!isProfilePage) {
            return;
        }
        
        // Don't show if already installed
        if (isAppInstalled()) {
            return;
        }
        
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const browser = detectBrowser();
        const isBrave = browser === 'brave';
        
        // Auto-show for iOS or Brave, or if deferredPrompt exists
        if (isIOS || isBrave || deferredPrompt) {
            showInstallButton();
        }
    }, 1000);
});

// Export functions for global use
window.showInstallButton = showInstallButton;
window.handleInstallClick = handleInstallClick;
