// Automatic backup functionality
// Creates periodic backups of user data

const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_BACKUPS = 7; // Keep last 7 backups
const BACKUP_KEY_PREFIX = 'pastlife_auto_backup_';

// Initialize automatic backup
export function initAutoBackup() {
    // Check if user is logged in
    import('./auth.js').then(({ getCurrentUser }) => {
        const user = getCurrentUser();
        if (!user) {
            return; // No user logged in, skip backup
        }
        
        // Check if backup is enabled (default: enabled)
        const backupEnabled = localStorage.getItem('pastlife_auto_backup_enabled');
        if (backupEnabled === 'false') {
            return; // Backup disabled by user
        }
        
        // Check last backup time
        const lastBackupTime = localStorage.getItem(`pastlife_last_backup_time_${user.username}`);
        const now = Date.now();
        
        if (!lastBackupTime || (now - parseInt(lastBackupTime)) >= BACKUP_INTERVAL) {
            // Time for a new backup
            createAutoBackup(user);
        }
        
        // Set up periodic check (every hour)
        setInterval(() => {
            const currentUser = getCurrentUser();
            if (currentUser) {
                const lastBackup = localStorage.getItem(`pastlife_last_backup_time_${currentUser.username}`);
                if (!lastBackup || (Date.now() - parseInt(lastBackup)) >= BACKUP_INTERVAL) {
                    createAutoBackup(currentUser);
                }
            }
        }, 60 * 60 * 1000); // Check every hour
    });
}

// Create automatic backup
function createAutoBackup(user) {
    try {
        import('./data.js').then(({ getAllPersons }) => {
            const backup = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                username: user.username,
                type: 'automatic',
                data: {
                    persons: getAllPersons().filter(p => p.createdBy === user.username),
                    favorites: JSON.parse(localStorage.getItem(`pastlife_favorites_${user.username}`) || '[]'),
                    tree: localStorage.getItem(`pastlife_tree_${user.username}`) ? JSON.parse(localStorage.getItem(`pastlife_tree_${user.username}`)) : null,
                    searchHistory: JSON.parse(localStorage.getItem(`pastlife_search_history_${user.username}`) || '[]'),
                    profile: localStorage.getItem(`pastlife_profile_${user.username}`) ? JSON.parse(localStorage.getItem(`pastlife_profile_${user.username}`)) : null
                }
            };
            
            // Store backup in localStorage
            const backupKey = `${BACKUP_KEY_PREFIX}${user.username}_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backup));
            
            // Update last backup time
            localStorage.setItem(`pastlife_last_backup_time_${user.username}`, Date.now().toString());
            
            // Clean up old backups (keep only last MAX_BACKUPS)
            cleanupOldBackups(user.username);
            
            console.log('Automatic backup created:', backupKey);
        });
    } catch (error) {
        console.error('Error creating automatic backup:', error);
    }
}

// Clean up old backups
function cleanupOldBackups(username) {
    const backupKeys = [];
    
    // Find all backup keys for this user
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${BACKUP_KEY_PREFIX}${username}_`)) {
            backupKeys.push(key);
        }
    }
    
    // Sort by timestamp (extracted from key)
    backupKeys.sort((a, b) => {
        const timestampA = parseInt(a.split('_').pop());
        const timestampB = parseInt(b.split('_').pop());
        return timestampB - timestampA; // Newest first
    });
    
    // Remove old backups (keep only MAX_BACKUPS)
    if (backupKeys.length > MAX_BACKUPS) {
        const toRemove = backupKeys.slice(MAX_BACKUPS);
        toRemove.forEach(key => {
            localStorage.removeItem(key);
        });
    }
}

// Get list of automatic backups
export function getAutoBackups(username) {
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${BACKUP_KEY_PREFIX}${username}_`)) {
            try {
                const backup = JSON.parse(localStorage.getItem(key));
                backups.push({
                    key: key,
                    timestamp: backup.timestamp,
                    size: JSON.stringify(backup).length
                });
            } catch (e) {
                console.error('Error parsing backup:', key, e);
            }
        }
    }
    
    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return backups;
}

// Restore from automatic backup
export function restoreAutoBackup(backupKey) {
    try {
        const backup = JSON.parse(localStorage.getItem(backupKey));
        if (!backup || !backup.data) {
            throw new Error('Invalid backup format');
        }
        
        return backup;
    } catch (error) {
        console.error('Error restoring backup:', error);
        throw error;
    }
}

// Enable/disable automatic backup
export function setAutoBackupEnabled(enabled) {
    localStorage.setItem('pastlife_auto_backup_enabled', enabled.toString());
}

// Check if automatic backup is enabled
export function isAutoBackupEnabled() {
    const setting = localStorage.getItem('pastlife_auto_backup_enabled');
    return setting !== 'false'; // Default to enabled
}

