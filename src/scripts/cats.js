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
        
        // Simple hover in/out system
        cat.addEventListener('mouseenter', () => {
            this.isHovering = true;
            // Only change state if not being patted
            if (!this.isBeingPatted) {
                this.startHoverAnimation(catImg, true);
            }
        });
        
        cat.addEventListener('mouseleave', () => {
            this.isHovering = false;
            // Only change state if not being patted
            if (!this.isBeingPatted) {
                this.startHoverAnimation(catImg, false);
            }
        });
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
        // Clear any existing patted timer to prevent state flashing
        if (this.pattedTimer) {
            clearTimeout(this.pattedTimer);
        }
        
        // Set patted flag to prevent hover state changes
        this.isBeingPatted = true;
        
        // Show patted cat image
        catImg.src = 'assets/cat-patted.png';
        
        // Stay in patted state for 1 second, then return to appropriate state
        this.pattedTimer = setTimeout(() => {
            this.isBeingPatted = false; // Clear patted flag
            this.pattedTimer = null; // Clear timer reference
            
            if (this.isHovering) {
                catImg.src = 'assets/cat-perked.png';
            } else {
                catImg.src = 'assets/cat.png';
            }
        }, 1000);
    }
}

// Initialize cat manager when game is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.catManager = new CatManager(window.gameInstance);
});
