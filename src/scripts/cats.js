/**
 * Handles all cat-related functionality in the game
 */
class CatManager {
    constructor(game) {
        this.game = game;
        this.cats = [];
        this.catContainer = document.querySelector('.cat-container');
        this.clickCount = 0;
        this.isHovering = false;
        this.isBeingPatted = false;
        this.pattedTimer = null;
        // Removed sound effect code
        // this.clickSound = new Audio('assets/Click.mp3');
        // this.clickSound.volume = 0.7;
        
        // Canvas for analyzing image pixels
        this.canvas = null;
        this.ctx = null;
        this.imageDataCache = new Map();
        this.opaquePixelMap = null; // 2D array of booleans for non-transparent pixels
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.hitboxExpansion = 25; // Fixed expansion in px
        this.init();
        // Removed createHitboxSlider()
    }

    init() {
        this.createInitialCat();
    }

    createInitialCat() {
        // Create a container div for the cat with expanded hitbox
        const cat = document.createElement('div');
        cat.classList.add('cat');
        cat.style.position = 'relative';
        cat.style.width = '220px'; // 200px image + 20px border
        cat.style.height = '220px';
        cat.style.display = 'flex';
        cat.style.alignItems = 'center';
        cat.style.justifyContent = 'center';
        
        // Center the image inside the container
        cat.innerHTML = `
            <img class="cat-img" src="assets/cat.png" alt="Clickable Cat" 
                 width="200" height="200" 
                 draggable="false"
                 style="position: absolute; left: 10px; top: 10px;">
        `;
        
        this.catContainer.appendChild(cat);
        const catImg = cat.querySelector('img');
        // Precompute opaque pixel map when image loads
        catImg.addEventListener('load', () => {
            this.precomputeOpaquePixelMap(catImg);
        });
        
        this.setupCatClickHandler(cat);
        this.setupCatHoverHandler(cat);
    }

    // Removed createHitboxSlider()

    setupCatClickHandler(cat) {
        // Attach to the container, not the image
        const catImg = cat.querySelector('img');
        cat.addEventListener('click', (event) => {
            // Pixel detection enabled
            const enablePixelDetection = true;
            if (!enablePixelDetection || this.isClickOnValidPixel(event, cat, catImg)) {
                this.game.updateScore(1);
                this.clickCount++;
                this.animateClick(cat);
                this.checkClickMilestones();
            }
        });
    }

    animateClick(cat) {
        // Removed sound effect code
        // if (this.clickSound) {
        //     this.clickSound.currentTime = 0;
        //     this.clickSound.play();
        // }
        const catImg = cat.querySelector('img');
        
        // Remove the class first to reset the animation
        cat.classList.remove('cat-clicked');
        
        // Force a reflow to ensure the class removal is processed
        cat.offsetHeight;
        
        // Add the click animation class
        cat.classList.add('cat-clicked');
        
        // Show patted state
        this.showPattedState(catImg);
        
        // Create a score popup
        this.createScorePopup(cat);
        
        // Remove the animation class after animation completes
        setTimeout(() => {
            cat.classList.remove('cat-clicked');
        }, 300);
    }

    createScorePopup(cat) {
        // Create a floating score element
        const popup = document.createElement('div');
        popup.classList.add('score-popup');
        popup.textContent = '+1';
        
        // Position it at click location
        const rect = cat.getBoundingClientRect();
        popup.style.left = rect.left + rect.width / 2 + 'px';
        popup.style.top = rect.top + rect.height / 2 + 'px';
        
        // Add it to the document
        document.body.appendChild(popup);
        
        // Remove it after animation
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 1000);
    }

    checkClickMilestones() {
        // Check for click count milestones
        const milestones = [10, 50, 100, 500, 1000];
        if (milestones.includes(this.clickCount)) {
            this.game.triggerMystery('clickMilestone', this.clickCount);
        }
    }

    setupCatHoverHandler(cat) {
        const catImg = cat.querySelector('img');
        
        // Hover detection with pixel-perfect alpha checking
        cat.addEventListener('mousemove', (event) => {
            // Pixel detection enabled for hover
            const enablePixelDetection = true;
            const isValidPixel = !enablePixelDetection || this.isClickOnValidPixel(event, cat, catImg);
            
            // Set cursor based on pixel validity
            catImg.style.cursor = isValidPixel ? 'pointer' : 'default';
            
            if (isValidPixel && !this.isHovering) {
            this.isHovering = true;
            if (!this.isBeingPatted) {
                this.startHoverAnimation(catImg, true);
                }
                // (visual feedback removed)
            } else if (!isValidPixel && this.isHovering) {
                this.isHovering = false;
                if (!this.isBeingPatted) {
                    this.startHoverAnimation(catImg, false);
                }
                // (visual feedback removed)
            } else if (!isValidPixel) {
                // (visual feedback removed)
            }
        });
        
        cat.addEventListener('mouseleave', () => {
            this.isHovering = false;
            if (!this.isBeingPatted) {
                this.startHoverAnimation(catImg, false);
            }
            // Reset cursor when leaving image
            catImg.style.cursor = 'default';
        });
    }

    startHoverAnimation(catImg, isHovering) {
        const cat = catImg.parentElement;
        if (isHovering) {
            // Change to perked up cat image
            catImg.src = 'assets/cat-perked.png';
            cat.setAttribute('data-state', 'perked');
            catImg.classList.add('hovering');
            catImg.style.transition = 'all 0.3s ease';
        } else {
            // Return to normal cat image
            catImg.src = 'assets/cat.png';
            cat.setAttribute('data-state', 'normal');
            catImg.classList.remove('hovering');
            catImg.style.transition = 'all 0.3s ease';
        }
    }

    showPattedState(catImg) {
        const cat = catImg.parentElement;
        
        // Clear any existing patted timer to prevent state flashing
        if (this.pattedTimer) {
            clearTimeout(this.pattedTimer);
        }
        
        // Set patted flag to prevent hover state changes
        this.isBeingPatted = true;
        
        // Show patted cat image
        catImg.src = 'assets/cat-patted.png';
        cat.setAttribute('data-state', 'patted');
        
        // Stay in patted state for 1 second, then return to appropriate state
        this.pattedTimer = setTimeout(() => {
            this.isBeingPatted = false; // Clear patted flag
            this.pattedTimer = null; // Clear timer reference
            
            if (this.isHovering) {
                catImg.src = 'assets/cat-perked.png';
                cat.setAttribute('data-state', 'perked');
            } else {
                catImg.src = 'assets/cat.png';
                cat.setAttribute('data-state', 'normal');
            }
        }, 1000);
    }

    precomputeOpaquePixelMap(img) {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        }
        this.canvas.width = img.naturalWidth;
        this.canvas.height = img.naturalHeight;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(img, 0, 0);
        const imageData = this.ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
        this.imageWidth = img.naturalWidth;
        this.imageHeight = img.naturalHeight;
        // Build a 2D boolean array: true if pixel is opaque
        this.opaquePixelMap = [];
        for (let y = 0; y < img.naturalHeight; y++) {
            const row = [];
            for (let x = 0; x < img.naturalWidth; x++) {
                const idx = (y * img.naturalWidth + x) * 4;
                row.push(imageData.data[idx + 3] > 0);
            }
            this.opaquePixelMap.push(row);
        }
    }

    /**
     * Check if a click is on a valid (non-transparent) pixel using alpha detection
     * @param {MouseEvent} event - The click event
     * @param {HTMLImageElement} img - The image element
     * @returns {boolean} - True if click is on a valid pixel
     */
    // Adjusted for container and expanded hitbox
    isClickOnValidPixel(event, cat, img) {
        try {
            if (!img.complete || img.naturalWidth === 0) {
                return true;
            }
            // Get click position relative to the container
            const rect = cat.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            // Now, the image is at (10, 10) in the container
            const imgX = Math.floor(x - 10);
            const imgY = Math.floor(y - 10);
            // If inside image bounds, check pixel
            if (
                imgX >= 0 && imgX < img.naturalWidth &&
                imgY >= 0 && imgY < img.naturalHeight
            ) {
                if (this.opaquePixelMap && this.opaquePixelMap[imgY] && this.opaquePixelMap[imgY][imgX]) {
                    return true;
                }
            }
            // If not inside, or pixel is transparent, check for nearby opaque pixel
            const border = this.hitboxExpansion;
            if (this.opaquePixelMap) {
                for (let dy = -border; dy <= border; dy++) {
                    for (let dx = -border; dx <= border; dx++) {
                        const nx = imgX + dx;
                        const ny = imgY + dy;
                        if (
                            nx >= 0 && nx < this.imageWidth &&
                            ny >= 0 && ny < this.imageHeight &&
                            this.opaquePixelMap[ny][nx]
                        ) {
                            // Check Euclidean distance
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist <= border) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        } catch (error) {
            return true;
        }
    }


}

// Initialize cat manager when game is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catManager = new CatManager(window.gameInstance);
});
