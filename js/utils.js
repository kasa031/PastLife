// Utility functions
export function showMessage(message, type = 'info', duration = 3000, details = null) {
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
export function showErrorWithSuggestion(error, suggestion = null) {
    return showMessage(error, 'error', 5000, suggestion);
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

export function showLoading(element) {
    if (element) {
        element.style.opacity = '0.6';
        element.style.pointerEvents = 'none';
        const loading = document.createElement('div');
        loading.className = 'loading-spinner';
        loading.innerHTML = '<div class="spinner"></div>';
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
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
