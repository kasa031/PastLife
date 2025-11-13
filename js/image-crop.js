// Image cropping functionality
// Provides a modal interface for cropping images

import { escapeHtml } from './utils.js';

// Crop image using canvas
export function cropImage(imageSrc, x, y, width, height) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas size to crop dimensions
            canvas.width = width;
            canvas.height = height;
            
            // Draw cropped portion
            ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
            
            // Convert to base64 (prefer WebP)
            let result;
            try {
                result = canvas.toDataURL('image/webp', 0.9);
                if (!result || result.length === 0 || result === 'data:,') {
                    result = canvas.toDataURL('image/jpeg', 0.9);
                }
            } catch (e) {
                result = canvas.toDataURL('image/jpeg', 0.9);
            }
            
            resolve(result);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = imageSrc;
    });
}

// Show crop modal and return cropped image
export function showCropModal(imageSrc) {
    return new Promise((resolve, reject) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: var(--white);
            border-radius: 15px;
            padding: 2rem;
            max-width: 90vw;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        `;
        
        // Title
        const title = document.createElement('h2');
        title.textContent = 'Crop Image';
        title.style.cssText = `
            margin: 0;
            color: var(--turquoise-dark);
            font-size: 1.5rem;
        `;
        
        // Image container with crop area
        const imageContainer = document.createElement('div');
        imageContainer.style.cssText = `
            position: relative;
            display: inline-block;
            max-width: 100%;
            max-height: 60vh;
            overflow: hidden;
            border: 2px solid var(--turquoise-primary);
            border-radius: 8px;
            background: #000;
        `;
        
        const img = document.createElement('img');
        img.src = imageSrc;
        img.style.cssText = `
            display: block;
            max-width: 100%;
            max-height: 60vh;
            user-select: none;
            -webkit-user-drag: none;
        `;
        
        // Crop overlay (selection rectangle)
        const cropOverlay = document.createElement('div');
        cropOverlay.style.cssText = `
            position: absolute;
            border: 2px dashed var(--orange-primary);
            background: rgba(201, 169, 97, 0.2);
            pointer-events: none;
            box-sizing: border-box;
        `;
        
        // Instructions
        const instructions = document.createElement('p');
        instructions.textContent = 'Click and drag to select the area to crop';
        instructions.style.cssText = `
            margin: 0;
            color: var(--gray-dark);
            font-size: 0.9rem;
        `;
        
        // Buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 1rem;
            justify-content: flex-end;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.className = 'btn-edit';
        cancelBtn.style.cssText = `
            background: var(--gray-medium);
            color: var(--white);
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
        `;
        
        const cropBtn = document.createElement('button');
        cropBtn.textContent = 'Crop';
        cropBtn.className = 'btn-primary';
        cropBtn.style.cssText = `
            background: var(--turquoise-primary);
            color: var(--white);
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
        `;
        
        // Crop state
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let cropX = 0;
        let cropY = 0;
        let cropWidth = 0;
        let cropHeight = 0;
        
        // Initialize crop area to center 80% of image
        const initCropArea = () => {
            const rect = img.getBoundingClientRect();
            const containerRect = imageContainer.getBoundingClientRect();
            const scaleX = img.naturalWidth / rect.width;
            const scaleY = img.naturalHeight / rect.height;
            
            cropWidth = rect.width * 0.8;
            cropHeight = rect.height * 0.8;
            cropX = (rect.width - cropWidth) / 2;
            cropY = (rect.height - cropHeight) / 2;
            
            updateCropOverlay();
        };
        
        const updateCropOverlay = () => {
            const rect = img.getBoundingClientRect();
            cropOverlay.style.left = `${cropX}px`;
            cropOverlay.style.top = `${cropY}px`;
            cropOverlay.style.width = `${cropWidth}px`;
            cropOverlay.style.height = `${cropHeight}px`;
        };
        
        // Mouse/touch event handlers
        const handleStart = (clientX, clientY) => {
            const rect = img.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            
            // Check if click is inside crop area
            if (x >= cropX && x <= cropX + cropWidth &&
                y >= cropY && y <= cropY + cropHeight) {
                isDragging = true;
                startX = x - cropX;
                startY = y - cropY;
            } else {
                // Start new crop area
                isDragging = true;
                cropX = x;
                cropY = y;
                cropWidth = 0;
                cropHeight = 0;
                startX = 0;
                startY = 0;
            }
        };
        
        const handleMove = (clientX, clientY) => {
            if (!isDragging) return;
            
            const rect = img.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            
            if (startX === 0 && startY === 0) {
                // Creating new crop area
                cropWidth = Math.max(0, x - cropX);
                cropHeight = Math.max(0, y - cropY);
            } else {
                // Moving existing crop area
                cropX = Math.max(0, Math.min(x - startX, rect.width - cropWidth));
                cropY = Math.max(0, Math.min(y - startY, rect.height - cropHeight));
            }
            
            // Constrain to image bounds
            cropX = Math.max(0, Math.min(cropX, rect.width - cropWidth));
            cropY = Math.max(0, Math.min(cropY, rect.height - cropHeight));
            cropWidth = Math.min(cropWidth, rect.width - cropX);
            cropHeight = Math.min(cropHeight, rect.height - cropY);
            
            updateCropOverlay();
        };
        
        const handleEnd = () => {
            isDragging = false;
        };
        
        // Mouse events
        imageContainer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleStart(e.clientX, e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            handleMove(e.clientX, e.clientY);
        });
        
        document.addEventListener('mouseup', () => {
            handleEnd();
        });
        
        // Touch events
        imageContainer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleStart(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        });
        
        document.addEventListener('touchend', () => {
            handleEnd();
        });
        
        // Crop button handler
        cropBtn.addEventListener('click', async () => {
            if (cropWidth <= 0 || cropHeight <= 0) {
                alert('Please select an area to crop');
                return;
            }
            
            try {
                // Calculate crop coordinates in image coordinates
                const rect = img.getBoundingClientRect();
                const scaleX = img.naturalWidth / rect.width;
                const scaleY = img.naturalHeight / rect.height;
                
                const cropXScaled = cropX * scaleX;
                const cropYScaled = cropY * scaleY;
                const cropWidthScaled = cropWidth * scaleX;
                const cropHeightScaled = cropHeight * scaleY;
                
                const croppedImage = await cropImage(
                    imageSrc,
                    cropXScaled,
                    cropYScaled,
                    cropWidthScaled,
                    cropHeightScaled
                );
                
                overlay.remove();
                resolve(croppedImage);
            } catch (error) {
                console.error('Error cropping image:', error);
                alert('Failed to crop image: ' + error.message);
                reject(error);
            }
        });
        
        // Cancel button handler
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            resolve(null);
        });
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(null);
            }
        });
        
        // Assemble modal
        imageContainer.appendChild(img);
        imageContainer.appendChild(cropOverlay);
        modal.appendChild(title);
        modal.appendChild(imageContainer);
        modal.appendChild(instructions);
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(cropBtn);
        modal.appendChild(buttonContainer);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Initialize crop area when image loads
        img.onload = () => {
            initCropArea();
        };
    });
}

