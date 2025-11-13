// Rate Limiter - Client-side rate limiting to prevent abuse
// Tracks actions per user and enforces limits

const RATE_LIMIT_STORAGE_KEY = 'pastlife_rate_limits';
const DEFAULT_LIMITS = {
    // API calls
    apiCalls: {
        max: 50, // Max API calls
        window: 60 * 60 * 1000, // 1 hour window
        action: 'api_call'
    },
    // Person creation
    personCreation: {
        max: 20, // Max persons created
        window: 60 * 60 * 1000, // 1 hour window
        action: 'create_person'
    },
    // Comment posting
    commentPosting: {
        max: 30, // Max comments posted
        window: 60 * 60 * 1000, // 1 hour window
        action: 'post_comment'
    },
    // Search operations
    searchOperations: {
        max: 100, // Max searches
        window: 60 * 60 * 1000, // 1 hour window
        action: 'search'
    },
    // Image uploads
    imageUploads: {
        max: 50, // Max images uploaded
        window: 60 * 60 * 1000, // 1 hour window
        action: 'upload_image'
    }
};

// Get rate limit data
function getRateLimitData() {
    const data = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!data) {
        return {};
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('Error parsing rate limit data:', e);
        return {};
    }
}

// Save rate limit data
function saveRateLimitData(data) {
    try {
        localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Error saving rate limit data:', e);
    }
}

// Clean old entries (older than 24 hours)
function cleanOldEntries() {
    const data = getRateLimitData();
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    let cleaned = false;
    for (const action in data) {
        if (data[action] && Array.isArray(data[action])) {
            const filtered = data[action].filter(timestamp => (now - timestamp) < maxAge);
            if (filtered.length !== data[action].length) {
                data[action] = filtered;
                cleaned = true;
            }
        }
    }
    
    if (cleaned) {
        saveRateLimitData(data);
    }
}

// Check if action is allowed
export function checkRateLimit(actionType) {
    const limit = DEFAULT_LIMITS[actionType];
    if (!limit) {
        // Unknown action type, allow by default
        return { allowed: true };
    }
    
    // Clean old entries periodically
    if (Math.random() < 0.1) { // 10% chance to clean
        cleanOldEntries();
    }
    
    const data = getRateLimitData();
    const now = Date.now();
    const windowStart = now - limit.window;
    
    // Get timestamps for this action type
    let timestamps = data[actionType] || [];
    
    // Filter to only include timestamps within the window
    timestamps = timestamps.filter(ts => ts > windowStart);
    
    // Check if limit exceeded
    if (timestamps.length >= limit.max) {
        const oldestTimestamp = Math.min(...timestamps);
        const resetTime = oldestTimestamp + limit.window;
        const timeUntilReset = Math.max(0, resetTime - now);
        const minutesUntilReset = Math.ceil(timeUntilReset / (60 * 1000));
        
        return {
            allowed: false,
            limit: limit.max,
            window: limit.window,
            current: timestamps.length,
            resetTime: resetTime,
            minutesUntilReset: minutesUntilReset,
            message: `Rate limit exceeded. Maximum ${limit.max} ${limit.action} per hour. Please try again in ${minutesUntilReset} minute(s).`
        };
    }
    
    return { allowed: true };
}

// Record an action
export function recordAction(actionType) {
    const limit = DEFAULT_LIMITS[actionType];
    if (!limit) {
        return;
    }
    
    const data = getRateLimitData();
    const now = Date.now();
    
    // Initialize array if needed
    if (!data[actionType]) {
        data[actionType] = [];
    }
    
    // Add current timestamp
    data[actionType].push(now);
    
    // Clean old entries for this action type
    const windowStart = now - limit.window;
    data[actionType] = data[actionType].filter(ts => ts > windowStart);
    
    // Save updated data
    saveRateLimitData(data);
}

// Get rate limit status for an action
export function getRateLimitStatus(actionType) {
    const limit = DEFAULT_LIMITS[actionType];
    if (!limit) {
        return null;
    }
    
    const data = getRateLimitData();
    const now = Date.now();
    const windowStart = now - limit.window;
    
    let timestamps = data[actionType] || [];
    timestamps = timestamps.filter(ts => ts > windowStart);
    
    return {
        action: limit.action,
        current: timestamps.length,
        max: limit.max,
        remaining: Math.max(0, limit.max - timestamps.length),
        percentage: (timestamps.length / limit.max) * 100
    };
}

// Reset rate limit for an action (admin function)
export function resetRateLimit(actionType) {
    const data = getRateLimitData();
    if (actionType) {
        delete data[actionType];
    } else {
        // Reset all
        Object.keys(data).forEach(key => delete data[key]);
    }
    saveRateLimitData(data);
}

// Get all rate limit statuses
export function getAllRateLimitStatuses() {
    const statuses = {};
    for (const actionType in DEFAULT_LIMITS) {
        statuses[actionType] = getRateLimitStatus(actionType);
    }
    return statuses;
}

// Initialize - clean old entries on load
cleanOldEntries();

