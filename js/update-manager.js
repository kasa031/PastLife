// Update Manager for PWA
// Handles app updates and notifies users when new versions are available

let registration = null;
let updateAvailable = false;

// Initialize update manager
export function initUpdateManager() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
            registration = reg;
            
            // Check for updates every hour
            setInterval(() => {
                checkForUpdates();
            }, 60 * 60 * 1000); // 1 hour
            
            // Check for updates on page load
            checkForUpdates();
            
            // Listen for controller change (new service worker activated)
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (updateAvailable) {
                    showUpdateNotification();
                }
            });
            
            // Listen for service worker updates
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New service worker is installed and waiting
                            updateAvailable = true;
                            showUpdateAvailableNotification();
                        }
                    });
                }
            });
        });
    }
}

// Check for updates
function checkForUpdates() {
    if (registration) {
        registration.update().catch((error) => {
            console.log('Error checking for updates:', error);
        });
    }
}

// Show notification when update is available
function showUpdateAvailableNotification() {
    // Import showMessage dynamically
    import('./utils.js').then(({ showMessage }) => {
        const updateNotification = document.createElement('div');
        updateNotification.id = 'updateNotification';
        updateNotification.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--turquoise-primary, #00897b);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
            display: flex;
            align-items: center;
            gap: 1rem;
            max-width: 500px;
            width: 90%;
            animation: slideInUp 0.3s ease-out;
        `;
        
        updateNotification.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: bold; margin-bottom: 0.25rem;">🔄 Ny versjon tilgjengelig</div>
                <div style="font-size: 0.85rem; opacity: 0.9;">En oppdatert versjon av PastLife er klar!</div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button id="updateNowBtn" style="
                    background: white;
                    color: var(--turquoise-primary);
                    border: none;
                    border-radius: 6px;
                    padding: 0.5rem 1rem;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">Oppdater nå</button>
                <button id="updateLaterBtn" style="
                    background: transparent;
                    color: white;
                    border: 1px solid white;
                    border-radius: 6px;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">Senere</button>
            </div>
        `;
        
        document.body.appendChild(updateNotification);
        
        // Add CSS animation if not exists
        if (!document.getElementById('updateNotificationStyles')) {
            const style = document.createElement('style');
            style.id = 'updateNotificationStyles';
            style.textContent = `
                @keyframes slideInUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }
                
                @keyframes slideOutDown {
                    from {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Handle update now
        document.getElementById('updateNowBtn').addEventListener('click', () => {
            updateApp();
        });
        
        // Handle update later
        document.getElementById('updateLaterBtn').addEventListener('click', () => {
            updateNotification.style.animation = 'slideOutDown 0.3s ease-out';
            setTimeout(() => {
                updateNotification.remove();
            }, 300);
        });
        
        // Auto-hide after 10 seconds if user doesn't interact
        setTimeout(() => {
            if (document.getElementById('updateNotification')) {
                updateNotification.style.animation = 'slideOutDown 0.3s ease-out';
                setTimeout(() => {
                    updateNotification.remove();
                }, 300);
            }
        }, 10000);
    }).catch(() => {
        // Fallback if utils.js not available
        console.log('Update available - refresh page to get latest version');
    });
}

// Update the app
function updateApp() {
    if (registration && registration.waiting) {
        // Tell the service worker to skip waiting and activate
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } else {
        // Fallback: just reload
        window.location.reload();
    }
}

// Show notification when update is installed
function showUpdateNotification() {
    import('./utils.js').then(({ showMessage }) => {
        showMessage('App oppdatert! Nye funksjoner er tilgjengelige.', 'success', 5000);
    }).catch(() => {
        // Fallback notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10001;
        `;
        notification.textContent = '✅ App oppdatert!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    });
}

// Check if app is running latest version
export function isUpdateAvailable() {
    return updateAvailable;
}

// Force check for updates
export function forceCheckForUpdates() {
    checkForUpdates();
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUpdateManager);
} else {
    initUpdateManager();
}

