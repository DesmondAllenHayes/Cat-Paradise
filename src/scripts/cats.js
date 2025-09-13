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
        
        this.init();
    }

    init() {
        this.createInitialCat();
    }

    createInitialCat() {
        const cat = document.createElement('div');
        cat.classList.add('cat');
        
        // Add the shine stars BEFORE the cat image so they are behind it
        cat.innerHTML = `
            <div class="cat-glow"></div>
            <img class="cat-img" src="assets/cat.png" alt="Clickable Cat" 
                 width="200" height="200" 
                 draggable="false">
        `;
        
        this.catContainer.appendChild(cat);
        
        this.setupCatClickHandler(cat);
        this.setupCatHoverHandler(cat);
    }

    setupCatClickHandler(cat) {
        const catImg = cat.querySelector('img');
        
        // Click detection with pixel-perfect alpha checking
        catImg.addEventListener('click', (event) => {
            
            // Pixel detection enabled
            const enablePixelDetection = true;
            
            if (!enablePixelDetection || this.isClickOnValidPixel(event, catImg)) {
            // Update the score
            this.game.updateScore(1);
            
            // Increment click count
            this.clickCount++;
            
            // Animate the click
            this.animateClick(cat);
            
            // Check for click milestones
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
        catImg.addEventListener('mousemove', (event) => {
            // Pixel detection enabled for hover
            const enablePixelDetection = true;
            const isValidPixel = !enablePixelDetection || this.isClickOnValidPixel(event, catImg);
            
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
        
        catImg.addEventListener('mouseleave', () => {
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

    /**
     * Check if a click is on a valid (non-transparent) pixel using alpha detection
     * @param {MouseEvent} event - The click event
     * @param {HTMLImageElement} img - The image element
     * @returns {boolean} - True if click is on a valid pixel
     */
    isClickOnValidPixel(event, img) {
        try {
            if (!img.complete || img.naturalWidth === 0) {
                return true;
            }

            // Create canvas if it doesn't exist
            if (!this.canvas) {
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
            }

            // Set canvas size to match image
            this.canvas.width = img.naturalWidth;
            this.canvas.height = img.naturalHeight;

            // Clear canvas first
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw the image to canvas
            this.ctx.drawImage(img, 0, 0);

            // Get click position relative to the image
            const rect = img.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // Scale to image coordinates
            const scaleX = img.naturalWidth / rect.width;
            const scaleY = img.naturalHeight / rect.height;
            
            const pixelX = Math.floor(x * scaleX);
            const pixelY = Math.floor(y * scaleY);

            // Check bounds
            if (pixelX < 0 || pixelX >= img.naturalWidth || pixelY < 0 || pixelY >= img.naturalHeight) {
                return false;
            }

            // Get pixel data
            const imageData = this.ctx.getImageData(pixelX, pixelY, 1, 1);
            const alpha = imageData.data[3]; // Alpha channel

            // Return true if pixel is not transparent (alpha > 0)
            return alpha > 0;
        } catch (error) {
            // If there's an error, allow the click to prevent blocking
            return true;
        }
    }


}

// Initialize cat manager when game is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catManager = new CatManager(window.gameInstance);
});
