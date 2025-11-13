// Lazy loading utility for images and components
// Uses IntersectionObserver for efficient lazy loading

// Lazy load images
export function setupLazyImageLoading() {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: load all images immediately
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
        });
        return;
    }

    // Create IntersectionObserver with adaptive rootMargin
    // Use larger margin for better performance on fast connections
    const isMobile = window.innerWidth < 768;
    const rootMargin = isMobile ? '100px' : '200px'; // Larger margin for smoother experience
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    // Add loading class for animation
                    img.classList.add('loading');
                    
                    // Create new image to preload
                    const imageLoader = new Image();
                    imageLoader.onload = () => {
                        // Fade in animation
                        img.src = img.dataset.src;
                        img.classList.remove('loading');
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                        
                        // Trigger fade-in animation
                        requestAnimationFrame(() => {
                            img.style.opacity = '0';
                            img.style.transition = 'opacity 0.3s ease-in';
                            requestAnimationFrame(() => {
                                img.style.opacity = '1';
                            });
                        });
                    };
                    imageLoader.onerror = () => {
                        img.classList.remove('loading');
                        img.classList.add('error');
                        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EIngen bilde%3C/text%3E%3C/svg%3E';
                    };
                    imageLoader.src = img.dataset.src;
                }
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: rootMargin
    });

    // Observe all lazy images (including gallery images)
    const lazyImages = document.querySelectorAll('img[data-src], img.lazy-gallery-image, img.lazy-load');
    lazyImages.forEach(img => {
        // If image already has src, skip
        if (img.src && !img.dataset.src) {
            return;
        }
        // If it's a lazy-gallery-image or lazy-load, set data-src if not already set
        if (img.classList.contains('lazy-gallery-image') || img.classList.contains('lazy-load')) {
            if (!img.dataset.src && img.src) {
                img.dataset.src = img.src;
                img.src = ''; // Clear src to trigger lazy load
            }
        }
        imageObserver.observe(img);
    });
}

// Lazy load components (e.g., heavy sections)
export function setupLazyComponentLoading() {
    if (!('IntersectionObserver' in window)) {
        return;
    }

    const componentObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const component = entry.target;
                const loadFunction = component.dataset.load;
                
                if (loadFunction && typeof window[loadFunction] === 'function') {
                    window[loadFunction]();
                }
                
                // Trigger custom event
                component.dispatchEvent(new CustomEvent('lazyLoad', {
                    detail: { component }
                }));
                
                observer.unobserve(component);
            }
        });
    }, {
        rootMargin: '100px'
    });

    // Observe all lazy components
    const lazyComponents = document.querySelectorAll('[data-lazy-load]');
    lazyComponents.forEach(component => componentObserver.observe(component));
}

// Initialize lazy loading on DOM ready
export function initLazyLoading() {
    setupLazyImageLoading();
    setupLazyComponentLoading();
}

// Re-initialize lazy loading after dynamic content is added
export function refreshLazyLoading() {
    setupLazyImageLoading();
    setupLazyComponentLoading();
}


