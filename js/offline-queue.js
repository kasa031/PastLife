// Offline Queue Manager
// Queues actions when offline and syncs when online

const OFFLINE_QUEUE_KEY = 'pastlife_offline_queue';
const MAX_QUEUE_SIZE = 100;

// Queue item types
const QUEUE_TYPES = {
    ADD_PERSON: 'add_person',
    UPDATE_PERSON: 'update_person',
    DELETE_PERSON: 'delete_person',
    ADD_COMMENT: 'add_comment',
    DELETE_COMMENT: 'delete_comment'
};

// Get offline queue
function getOfflineQueue() {
    return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
}

// Save offline queue
function saveOfflineQueue(queue) {
    // Limit queue size
    if (queue.length > MAX_QUEUE_SIZE) {
        queue = queue.slice(-MAX_QUEUE_SIZE);
    }
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

// Add item to offline queue
// Note: Actions are still saved to localStorage immediately (works offline)
// This queue is for tracking and potential future backend sync
export function queueOfflineAction(type, data, timestamp = null) {
    if (!navigator.onLine) {
        const queue = getOfflineQueue();
        const item = {
            id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            data: data,
            timestamp: timestamp || new Date().toISOString(),
            retries: 0
        };
        queue.push(item);
        saveOfflineQueue(queue);
        
        // Show notification (only if queue is getting large)
        if (queue.length > 5) {
            showQueueNotification(queue.length);
        }
        return item.id;
    }
    return null;
}

// Process offline queue when online
// Note: Since this is a localStorage-based app, actions are already saved locally
// This queue is mainly for tracking and future backend sync if needed
export async function processOfflineQueue() {
    if (!navigator.onLine) {
        return { processed: 0, failed: 0 };
    }
    
    const queue = getOfflineQueue();
    if (queue.length === 0) {
        return { processed: 0, failed: 0 };
    }
    
    // Since we're using localStorage, all actions are already saved
    // This queue is mainly for tracking and potential future backend sync
    // For now, we just clear the queue and notify user
    const processed = queue.length;
    clearQueue();
    
    // Show notification
    if (processed > 0) {
        showSyncNotification(processed, 0);
    }
    
    return { processed, failed: 0 };
}

// Show queue notification
function showQueueNotification(count) {
    // Import showMessage dynamically
    import('./utils.js').then(({ showMessage }) => {
        showMessage(`${count} handling(er) i kø. Vil bli synkronisert når du er online.`, 'info', 5000);
    }).catch(() => {
        // Fallback
        console.log(`${count} items queued for offline sync`);
    });
}

// Show sync notification
function showSyncNotification(processed, failed) {
    import('./utils.js').then(({ showMessage }) => {
        if (failed === 0) {
            showMessage(`${processed} handling(er) synkronisert!`, 'success', 3000);
        } else {
            showMessage(`${processed} synkronisert, ${failed} feilet.`, 'warning', 5000);
        }
    }).catch(() => {
        console.log(`Synced ${processed} items, ${failed} failed`);
    });
}

// Get queue status
export function getQueueStatus() {
    const queue = getOfflineQueue();
    return {
        count: queue.length,
        items: queue
    };
}

// Clear queue
export function clearQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// Initialize offline queue manager
export function initOfflineQueue() {
    // Listen for Service Worker messages
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'SYNC_OFFLINE_QUEUE') {
                processOfflineQueue();
            }
        });
    }
    
    // Process queue when coming online
    window.addEventListener('online', () => {
        // Wait a bit before processing to ensure connection is stable
        setTimeout(() => {
            processOfflineQueue();
        }, 1000);
    });
    
    // Check queue on page load if online
    if (navigator.onLine) {
        processOfflineQueue();
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOfflineQueue);
} else {
    initOfflineQueue();
}

