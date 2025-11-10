// Utility functions

// Error logging
const ERROR_LOG_KEY = 'pastlife_error_log';
const MAX_ERROR_LOG_SIZE = 50; // Keep last 50 errors

// Log error for debugging
export function logError(category, details = {}) {
    try {
        const errorLog = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]');
        const errorEntry = {
            timestamp: new Date().toISOString(),
            category: category,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        errorLog.push(errorEntry);
        
        // Keep only last MAX_ERROR_LOG_SIZE errors
        if (errorLog.length > MAX_ERROR_LOG_SIZE) {
            errorLog.shift();
        }
        
        localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(errorLog));
        
        // Also log to console in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.error(`[${category}]`, details);
        }
    } catch (e) {
        console.error('Failed to log error:', e);
    }
}

// Get error log (for debugging)
export function getErrorLog() {
    try {
        return JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]');
    } catch (e) {
        return [];
    }
}

// Clear error log
export function clearErrorLog() {
    localStorage.removeItem(ERROR_LOG_KEY);
}

// Global error handler
window.addEventListener('error', (event) => {
    logError('Global Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
    });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled Promise Rejection', {
        reason: event.reason?.message || event.reason,
        stack: event.reason?.stack
    });
});
export function showMessage(message, type = 'info', duration = 3000, details = null) {
    // Announce to screen readers for important messages
    if (type === 'error' || type === 'warning') {
        announceToScreenReader(message, 'assertive');
    } else {
        announceToScreenReader(message, 'polite');
    }
    
    // Remove existing message
    const existing = document.getElementById('globalMessage');
    if (existing) existing.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'globalMessage';
    messageDiv.className = `global-message ${type}`;
    
    // Create message content
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = message;
    messageDiv.appendChild(messageContent);
    
    // Add details if provided
    if (details) {
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'message-details';
        detailsDiv.textContent = details;
        messageDiv.appendChild(detailsDiv);
    }
    
    document.body.appendChild(messageDiv);
    
    // Animate in
    setTimeout(() => messageDiv.classList.add('show'), 10);
    
    // Remove after duration
    setTimeout(() => {
        messageDiv.classList.remove('show');
        setTimeout(() => messageDiv.remove(), 300);
    }, duration);
    
    return messageDiv;
}

// Enhanced error messages with suggestions
export function showErrorWithSuggestion(error, suggestion = null, examples = null) {
    let details = suggestion || '';
    
    // Add examples if provided
    if (examples && Array.isArray(examples)) {
        details += (details ? '\n\n' : '') + 'Examples: ' + examples.join(', ');
    }
    
    return showMessage(error, 'error', 6000, details || null);
}

// Show error with actionable help based on error type
export function showActionableError(error, context = {}) {
    // Announce to screen readers
    const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
    announceToScreenReader(errorMessage, 'assertive');
    let message = error;
    let suggestion = '';
    let examples = [];
    
    // Common error patterns and their solutions
    if (typeof error === 'string') {
        const errorLower = error.toLowerCase();
        
        // Image errors
        if (errorLower.includes('image') || errorLower.includes('bilde')) {
            if (errorLower.includes('format') || errorLower.includes('format')) {
                suggestion = 'Supported formats: JPEG, PNG, GIF, WebP. Try converting your image to one of these formats.';
                examples = ['photo.jpg', 'image.png', 'picture.gif'];
            } else if (errorLower.includes('size') || errorLower.includes('stor')) {
                suggestion = 'Image is too large. Try compressing the image or using a smaller file. Maximum size is 10MB.';
                examples = ['Use an image editor to reduce file size', 'Try a lower resolution version'];
            } else if (errorLower.includes('canvas') || errorLower.includes('not supported')) {
                suggestion = 'Your browser may not support image processing. Try using a modern browser like Chrome, Firefox, or Edge.';
            }
        }
        
        // Validation errors
        if (errorLower.includes('required') || errorLower.includes('påkrevd')) {
            suggestion = 'Please fill in all required fields marked with *.';
        }
        
        if (errorLower.includes('year') || errorLower.includes('år')) {
            if (errorLower.includes('invalid') || errorLower.includes('ugyldig')) {
                suggestion = 'Please enter a valid year between 1000 and the current year.';
                examples = ['1880', '1925', '1950'];
            } else if (errorLower.includes('before') || errorLower.includes('før')) {
                suggestion = 'Death year cannot be before birth year. Please check your dates.';
            }
        }
        
        // Network/API errors
        if (errorLower.includes('network') || errorLower.includes('fetch') || errorLower.includes('internett')) {
            suggestion = 'Check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.';
        }
        
        if (errorLower.includes('api') || errorLower.includes('401') || errorLower.includes('403')) {
            suggestion = 'API key may be invalid or expired. Please check your OpenRouter API key in the Family Tree settings.';
        }
        
        if (errorLower.includes('429') || errorLower.includes('rate limit') || errorLower.includes('for mange')) {
            suggestion = 'Too many requests. Please wait a few moments before trying again.';
        }
        
        // Login/authentication errors
        if (errorLower.includes('login') || errorLower.includes('password') || errorLower.includes('passord')) {
            if (errorLower.includes('invalid') || errorLower.includes('ugyldig')) {
                suggestion = 'Check your username/email and password. Passwords are case-sensitive.';
            } else if (errorLower.includes('not found') || errorLower.includes('ikke funnet')) {
                suggestion = 'User not found. Make sure you\'re using the correct username/email, or register a new account.';
            }
        }
        
        // Search errors
        if (errorLower.includes('no results') || errorLower.includes('ingen resultater')) {
            suggestion = 'Try adjusting your search criteria:\n• Use partial names\n• Check spelling\n• Remove some filters\n• Try searching by location or year instead';
        }
        
        // File errors
        if (errorLower.includes('file') || errorLower.includes('fil')) {
            if (errorLower.includes('read') || errorLower.includes('lese')) {
                suggestion = 'Could not read the file. Make sure the file is not corrupted and try again.';
            } else if (errorLower.includes('format') || errorLower.includes('format')) {
                suggestion = 'Unsupported file format. Please use the correct file type.';
            }
        }
    }
    
    return showErrorWithSuggestion(message, suggestion || null, examples.length > 0 ? examples : null);
}

// Validation helpers
export function validateYear(year, fieldName = 'Year') {
    if (!year) return { valid: true }; // Optional field
    
    const yearNum = parseInt(year);
    if (isNaN(yearNum)) {
        return {
            valid: false,
            message: `${fieldName} must be a valid number`,
            suggestion: 'Please enter a year (e.g., 1880)'
        };
    }
    
    if (yearNum < 1000 || yearNum > new Date().getFullYear() + 10) {
        return {
            valid: false,
            message: `${fieldName} seems invalid`,
            suggestion: `Please enter a year between 1000 and ${new Date().getFullYear() + 10}`
        };
    }
    
    return { valid: true };
}

export function validateDateRange(birthYear, deathYear) {
    if (!birthYear || !deathYear) return { valid: true };
    
    const birth = parseInt(birthYear);
    const death = parseInt(deathYear);
    
    if (isNaN(birth) || isNaN(death)) return { valid: true };
    
    if (death < birth) {
        return {
            valid: false,
            message: 'Death year cannot be before birth year',
            suggestion: 'Please check the dates and correct them'
        };
    }
    
    if (death - birth > 150) {
        return {
            valid: false,
            message: 'Age seems unusually high',
            suggestion: 'Please verify the birth and death years are correct'
        };
    }
    
    return { valid: true };
}

// Validate email format
export function validateEmail(email) {
    if (!email) {
        return {
            valid: false,
            message: 'Email is required',
            suggestion: 'Please enter your email address'
        };
    }
    
    // Basic email regex pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailPattern.test(email)) {
        return {
            valid: false,
            message: 'Invalid email format',
            suggestion: 'Please enter a valid email address (e.g., user@example.com)'
        };
    }
    
    // Check for common typos
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
        return {
            valid: false,
            message: 'Invalid email format',
            suggestion: 'Email cannot contain consecutive dots or start/end with a dot'
        };
    }
    
    return { valid: true };
}

// Debounce function to limit how often a function is called
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced confirmation dialog with better UX
export function confirmAction(message, details = '', confirmText = 'Confirm', cancelText = 'Cancel', danger = true) {
    return new Promise((resolve) => {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.2s;
        `;
        
        // Create modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: var(--white);
            border-radius: 12px;
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            animation: slideIn 0.3s;
        `;
        
        modal.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: ${danger ? 'var(--red-primary, #c62828)' : 'var(--turquoise-dark)'}; margin: 0 0 0.5rem 0; font-size: 1.3rem;">
                    ${danger ? '⚠️' : 'ℹ️'} ${escapeHtml(message)}
                </h3>
                ${details ? `<p style="color: var(--text-dark); margin: 0; line-height: 1.5;">${escapeHtml(details)}</p>` : ''}
            </div>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button id="confirmCancel" style="
                    padding: 0.75rem 1.5rem;
                    background: var(--gray-light);
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    color: var(--text-dark);
                    font-weight: bold;
                    font-size: 1rem;
                ">${cancelText}</button>
                <button id="confirmOk" style="
                    padding: 0.75rem 1.5rem;
                    background: ${danger ? 'var(--red-primary, #c62828)' : 'var(--turquoise-primary)'};
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    color: white;
                    font-weight: bold;
                    font-size: 1rem;
                ">${confirmText}</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Handle confirm
        document.getElementById('confirmOk').addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });
        
        // Handle cancel
        document.getElementById('confirmCancel').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
        
        // Handle ESC key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', handleEsc);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEsc);
        
        // Handle overlay click (close on outside click)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                document.removeEventListener('keydown', handleEsc);
                resolve(false);
            }
        });
    });
}

export function showLoading(element, text = 'Loading...') {
    if (element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
        const loading = document.createElement('div');
        loading.className = 'loading-spinner';
        loading.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1000;
            text-align: center;
        `;
        loading.innerHTML = `
            <div class="spinner"></div>
            ${text ? `<div style="margin-top: 0.5rem; color: var(--text-dark, #333); font-size: 0.9rem;">${escapeHtml(text)}</div>` : ''}
        `;
        element.style.position = 'relative';
        element.appendChild(loading);
        return loading;
    }
}

export function hideLoading(element, loadingElement) {
    if (element) {
        element.style.opacity = '1';
        element.style.pointerEvents = 'auto';
    }
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Show loading overlay for page-level operations
export function showLoadingOverlay(text = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        background: var(--white, #fff);
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    spinner.innerHTML = `
        <div class="spinner" style="margin: 0 auto 1rem;"></div>
        <div style="color: var(--text-dark, #333);">${escapeHtml(text)}</div>
    `;
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    return overlay;
}

export function hideLoadingOverlay() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Auto-save functionality for forms
export function initAutoSave(formId, storageKey, options = {}) {
    const {
        debounceDelay = 2000, // Save 2 seconds after last change
        excludeFields = [], // Fields to exclude from auto-save
        onSave = null, // Callback when saving
        onLoad = null, // Callback when loading
        showIndicator = true // Show "Draft saved" indicator
    } = options;
    
    const form = document.getElementById(formId);
    if (!form) return;
    
    // Load saved draft on page load
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
        try {
            const draft = JSON.parse(savedDraft);
            if (onLoad) {
                onLoad(draft);
            } else {
                // Auto-fill form fields
                Object.keys(draft).forEach(key => {
                    const field = form.querySelector(`#${key}`) || form.querySelector(`[name="${key}"]`);
                    if (field && !excludeFields.includes(key)) {
                        if (field.type === 'checkbox') {
                            field.checked = draft[key];
                        } else if (field.type === 'radio') {
                            const radio = form.querySelector(`[name="${key}"][value="${draft[key]}"]`);
                            if (radio) radio.checked = true;
                        } else {
                            field.value = draft[key];
                        }
                    }
                });
            }
        } catch (e) {
            console.error('Error loading draft:', e);
        }
    }
    
    // Create save indicator
    let saveIndicator = null;
    if (showIndicator) {
        saveIndicator = document.createElement('div');
        saveIndicator.id = `${formId}_saveIndicator`;
        saveIndicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--turquoise-dark, #00695c);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            font-size: 0.9rem;
        `;
        saveIndicator.textContent = '💾 Draft saved';
        document.body.appendChild(saveIndicator);
    }
    
    // Save function
    const saveDraft = debounce(() => {
        const draft = {};
        
        // Collect all form values
        Array.from(form.elements).forEach(element => {
            if (element.id && !excludeFields.includes(element.id)) {
                if (element.type === 'checkbox') {
                    draft[element.id] = element.checked;
                } else if (element.type === 'radio') {
                    if (element.checked) {
                        draft[element.id] = element.value;
                    }
                } else if (element.value !== undefined && element.value !== null) {
                    draft[element.id] = element.value;
                }
            }
        });
        
        // Also handle textarea elements that might not be in form.elements
        const textareas = form.querySelectorAll('textarea');
        textareas.forEach(textarea => {
            if (textarea.id && !excludeFields.includes(textarea.id)) {
                draft[textarea.id] = textarea.value;
            }
        });
        
        // Custom save handler
        if (onSave) {
            const customDraft = onSave(draft);
            if (customDraft) {
                localStorage.setItem(storageKey, JSON.stringify(customDraft));
            }
        } else {
            localStorage.setItem(storageKey, JSON.stringify(draft));
        }
        
        // Show save indicator
        if (saveIndicator) {
            saveIndicator.style.opacity = '1';
            setTimeout(() => {
                saveIndicator.style.opacity = '0';
            }, 2000);
        }
    }, debounceDelay);
    
    // Listen to form changes
    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);
    
    // Clear draft on successful submit
    form.addEventListener('submit', () => {
        localStorage.removeItem(storageKey);
        if (saveIndicator) {
            saveIndicator.remove();
        }
    });
    
    return {
        clear: () => {
            localStorage.removeItem(storageKey);
            if (saveIndicator) {
                saveIndicator.remove();
            }
        },
        save: saveDraft
    };
}

// Breadcrumb navigation
export function initBreadcrumbs(breadcrumbs) {
    // Remove existing breadcrumb if any
    const existing = document.getElementById('breadcrumb-nav');
    if (existing) existing.remove();
    
    if (!breadcrumbs || breadcrumbs.length === 0) return;
    
    const breadcrumbNav = document.createElement('nav');
    breadcrumbNav.id = 'breadcrumb-nav';
    breadcrumbNav.setAttribute('aria-label', 'Breadcrumb');
    breadcrumbNav.style.cssText = `
        padding: 1rem 0;
        margin-bottom: 1rem;
        border-bottom: 1px solid var(--gray-light, #e0e0e0);
    `;
    
    const container = document.createElement('div');
    container.className = 'container';
    container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    `;
    
    breadcrumbs.forEach((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        const link = document.createElement(isLast ? 'span' : 'a');
        if (!isLast) {
            link.href = crumb.url || '#';
            link.style.cssText = `
                color: var(--turquoise-dark, #00695c);
                text-decoration: none;
                transition: color 0.2s;
            `;
            link.addEventListener('mouseenter', () => {
                link.style.color = 'var(--turquoise-primary, #00897b)';
            });
            link.addEventListener('mouseleave', () => {
                link.style.color = 'var(--turquoise-dark, #00695c)';
            });
        } else {
            link.style.cssText = `
                color: var(--text-dark, #333);
                font-weight: 500;
            `;
            link.setAttribute('aria-current', 'page');
        }
        
        link.textContent = crumb.label;
        container.appendChild(link);
        
        if (!isLast) {
            const separator = document.createElement('span');
            separator.textContent = '›';
            separator.style.cssText = `
                color: var(--gray-dark, #666);
                margin: 0 0.25rem;
            `;
            separator.setAttribute('aria-hidden', 'true');
            container.appendChild(separator);
        }
    });
    
    breadcrumbNav.appendChild(container);
    
    // Insert after navigation or at the beginning of main content
    const main = document.querySelector('main') || document.querySelector('.container') || document.body;
    if (main) {
        main.insertBefore(breadcrumbNav, main.firstChild);
    } else {
        document.body.insertBefore(breadcrumbNav, document.body.firstChild);
    }
}

// Input sanitization for XSS prevention
export function sanitizeInput(input) {
    if (typeof input !== 'string') {
        if (input === null || input === undefined) return '';
        return String(input);
    }
    
    // Create a temporary div to escape HTML
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Sanitize object recursively
export function sanitizeObject(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
        return sanitizeInput(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
        }
        return sanitized;
    }
    
    return obj;
}

// Validate and sanitize form input
export function validateAndSanitizeInput(value, type = 'text', options = {}) {
    const {
        required = false,
        minLength = 0,
        maxLength = Infinity,
        pattern = null,
        allowHtml = false
    } = options;
    
    // Check required
    if (required && (!value || value.trim().length === 0)) {
        return {
            valid: false,
            error: 'This field is required',
            value: ''
        };
    }
    
    // Convert to string if not already
    let stringValue = value === null || value === undefined ? '' : String(value);
    
    // Trim whitespace
    stringValue = stringValue.trim();
    
    // Check length
    if (stringValue.length < minLength) {
        return {
            valid: false,
            error: `Minimum length is ${minLength} characters`,
            value: stringValue
        };
    }
    
    if (stringValue.length > maxLength) {
        return {
            valid: false,
            error: `Maximum length is ${maxLength} characters`,
            value: stringValue.substring(0, maxLength)
        };
    }
    
    // Check pattern
    if (pattern && !pattern.test(stringValue)) {
        return {
            valid: false,
            error: 'Invalid format',
            value: stringValue
        };
    }
    
    // Sanitize HTML unless explicitly allowed
    const sanitizedValue = allowHtml ? stringValue : sanitizeInput(stringValue);
    
    return {
        valid: true,
        value: sanitizedValue,
        original: stringValue
    };
}

export function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showMessage('Link copied to clipboard!', 'success');
        }).catch(() => {
            showMessage('Failed to copy link', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showMessage('Link copied to clipboard!', 'success');
        } catch (err) {
            showMessage('Failed to copy link', 'error');
        }
        document.body.removeChild(textArea);
    }
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add tooltip to element
export function addTooltip(element, text, position = 'top') {
    if (!element || !text) return;
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = text;
    tooltip.setAttribute('role', 'tooltip');
    tooltip.style.cssText = `
        position: absolute;
        background: var(--gray-dark, #333);
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.875rem;
        white-space: nowrap;
        z-index: 10001;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
        ${position === 'top' ? 'bottom: 100%; margin-bottom: 5px;' : ''}
        ${position === 'bottom' ? 'top: 100%; margin-top: 5px;' : ''}
        ${position === 'left' ? 'right: 100%; margin-right: 5px;' : ''}
        ${position === 'right' ? 'left: 100%; margin-left: 5px;' : ''}
    `;
    
    // Make parent relative if not already
    const parentStyle = window.getComputedStyle(element);
    if (parentStyle.position === 'static') {
        element.style.position = 'relative';
    }
    
    element.appendChild(tooltip);
    
    // Show on hover/focus
    const showTooltip = () => {
        tooltip.style.opacity = '1';
    };
    
    const hideTooltip = () => {
        tooltip.style.opacity = '0';
    };
    
    element.addEventListener('mouseenter', showTooltip);
    element.addEventListener('mouseleave', hideTooltip);
    element.addEventListener('focus', showTooltip);
    element.addEventListener('blur', hideTooltip);
    
    return tooltip;
}

// Show keyboard shortcuts help modal
export function showKeyboardShortcuts() {
    const shortcuts = [
        { key: 'Esc', description: 'Close dialogs/messages' },
        { key: 'Ctrl/Cmd + /', description: 'Focus search field' },
        { key: 'Ctrl/Cmd + K', description: 'Quick search (on home page)' },
        { key: '↑/↓', description: 'Navigate search results' },
        { key: 'Enter', description: 'Select/search' },
    ];
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: var(--white);
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        animation: slideIn 0.3s;
    `;
    
    modal.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h2 style="color: var(--turquoise-dark); margin: 0; font-size: 1.5rem;">⌨️ Keyboard Shortcuts</h2>
            <button id="closeShortcuts" style="
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--gray-dark);
                padding: 0;
                width: 30px;
                height: 30px;
            ">×</button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${shortcuts.map(s => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--gray-light, #f5f5f5); border-radius: 6px;">
                    <span style="color: var(--text-dark);">${escapeHtml(s.description)}</span>
                    <kbd style="
                        background: var(--white);
                        border: 1px solid var(--gray-dark, #ccc);
                        border-radius: 4px;
                        padding: 0.25rem 0.5rem;
                        font-family: monospace;
                        font-size: 0.875rem;
                        color: var(--text-dark);
                    ">${escapeHtml(s.key)}</kbd>
                </div>
            `).join('')}
        </div>
        <div style="margin-top: 1.5rem; text-align: center; color: var(--gray-dark); font-size: 0.875rem;">
            Press <kbd style="background: var(--gray-light); padding: 0.2rem 0.4rem; border-radius: 3px;">?</kbd> to show this help
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Close handlers
    const close = () => {
        overlay.remove();
    };
    
    document.getElementById('closeShortcuts').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });
    
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            close();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// Initialize keyboard shortcuts help (press ? to show)
// Screen reader announcements for dynamic content
export function announceToScreenReader(message, priority = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', priority === 'assertive' ? 'alert' : 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.className = 'sr-only';
    announcement.textContent = message;
    announcement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
    `;
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);
}

// Enhanced keyboard navigation support
export function enhanceKeyboardNavigation() {
    // Add keyboard navigation to all interactive elements
    document.addEventListener('keydown', (e) => {
        // Tab navigation enhancement
        if (e.key === 'Tab') {
            // Ensure focus is visible
            document.body.classList.add('keyboard-navigation');
        }
        
        // Enter/Space on buttons and links
        if ((e.key === 'Enter' || e.key === ' ') && e.target.tagName === 'BUTTON' && !e.target.disabled) {
            e.preventDefault();
            e.target.click();
        }
    });
    
    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
}

// Initialize keyboard shortcuts
export function initKeyboardShortcuts() {
    let shortcutHelpShown = false;
    
    document.addEventListener('keydown', (e) => {
        // Only show if not typing in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        // Press ? to show shortcuts
        if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            showKeyboardShortcuts();
        }
    });
}
