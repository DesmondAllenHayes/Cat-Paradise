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
        
        this.init();
    }

    init() {
        this.createInitialCat();
    }

    createInitialCat() {
        const cat = document.createElement('div');
        cat.classList.add('cat');
        
        // Add the cat image
        cat.innerHTML = `
            <img src="assets/cat.png" alt="Clickable Cat" 
                 width="200" height="200" 
                 draggable="false">
        `;
        
        // Make the cat look clickable
        cat.style.cursor = 'pointer';
        
        this.catContainer.appendChild(cat);
        this.setupCatClickHandler(cat);
        this.setupCatHoverHandler(cat);
    }

    setupCatClickHandler(cat) {
        cat.addEventListener('click', (event) => {
            // Prevent any default browser behavior
            event.preventDefault();
            
            // Update the score
            this.game.updateScore(1);
            
            // Increment click count
            this.clickCount++;
            
            // Animate the click
            this.animateClick(cat);
            
            // Check for click milestones
            this.checkClickMilestones();
        });
    }

    animateClick(cat) {
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
        
        // Create a canvas to detect visible pixels
        this.setupPixelDetection(catImg);
        
        // Use mousemove to check pixel alpha
        cat.addEventListener('mousemove', (event) => {
            this.handlePixelHover(event, catImg);
        });
        
        // Handle mouse leave
        cat.addEventListener('mouseleave', () => {
            this.startHoverAnimation(catImg, false);
        });
    }

    setupPixelDetection(catImg) {
        // Create canvas to analyze image pixels
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const setupCanvas = () => {
            canvas.width = catImg.naturalWidth;
            canvas.height = catImg.naturalHeight;
            ctx.drawImage(catImg, 0, 0);
            
            // Store canvas data for pixel checking
            this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            this.imageWidth = canvas.width;
            this.imageHeight = canvas.height;
        };
        
        // Check if image is already loaded
        if (catImg.complete && catImg.naturalWidth > 0) {
            setupCanvas();
        } else {
            // Wait for image to load
            catImg.onload = setupCanvas;
        }
    }

    handlePixelHover(event, catImg) {
        if (!this.imageData) return;
        
        const rect = catImg.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to image coordinates
        const imgX = Math.floor((x / rect.width) * this.imageWidth);
        const imgY = Math.floor((y / rect.height) * this.imageHeight);
        
        // Check bounds
        if (imgX < 0 || imgX >= this.imageWidth || imgY < 0 || imgY >= this.imageHeight) {
            if (this.isHovering) {
                this.isHovering = false;
                this.startHoverAnimation(catImg, false);
            }
            return;
        }
        
        // Get pixel alpha value
        const index = (imgY * this.imageWidth + imgX) * 4 + 3; // Alpha channel
        const alpha = this.imageData.data[index];
        
        // Debug: log alpha values (remove this later)
        console.log(`Pixel at (${imgX}, ${imgY}): alpha = ${alpha}`);
        
        // Only trigger hover if pixel is visible (alpha > 0)
        if (alpha > 0) {
            if (!this.isHovering) {
                this.isHovering = true;
                this.startHoverAnimation(catImg, true);
            }
        } else {
            if (this.isHovering) {
                this.isHovering = false;
                this.startHoverAnimation(catImg, false);
            }
        }
    }

    startHoverAnimation(catImg, isHovering) {
        if (isHovering) {
            // Change to perked up cat image
            catImg.src = 'assets/cat-perked.png';
            catImg.style.transition = 'all 0.3s ease';
        } else {
            // Return to normal cat image
            catImg.src = 'assets/cat.png';
            catImg.style.transition = 'all 0.3s ease';
        }
    }

    showPattedState(catImg) {
        // Show patted cat image
        catImg.src = 'assets/cat-patted.png';
        
        // Return to perked state after a short delay
        setTimeout(() => {
            if (this.isHovering) {
                catImg.src = 'assets/cat-perked.png';
            } else {
                catImg.src = 'assets/cat.png';
            }
        }, 200);
    }
}

// Initialize cat manager when game is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catManager = new CatManager(window.gameInstance);
});
