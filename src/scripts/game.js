/**
 * Main game logic class that handles scoring and game state
 */
class Game {
    constructor() {
        this.score = 0;
        this.multiplier = 1;
        this.initialized = false;
        this.mysteryCounts = 0;
        this.mysteryThresholds = [100, 500, 1000, 5000];
        
        // Initialize game elements
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        this.scoreElement = document.getElementById('score');
        this.setupEventListeners();
        this.loadGame();
        this.initialized = true;
    }

    setupEventListeners() {
        // Save game when window is closed
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });
    }

    updateScore(points) {
        const oldScore = this.score;
        this.score += points * this.multiplier;
        this.scoreElement.textContent = this.score;
        
        // Check if we crossed any mystery thresholds
        this.checkMysteryTriggers(oldScore);
        
        // Save game state
        this.saveGame();
    }

    checkMysteryTriggers(oldScore) {
        // Check if we crossed any mystery thresholds
        for (let threshold of this.mysteryThresholds) {
            if (oldScore < threshold && this.score >= threshold) {
                this.triggerMystery('scoreThreshold', threshold);
            }
        }
    }

    triggerMystery(type, value) {
        // If we have a mysterious manager, trigger the event
        if (window.mysteriousManager) {
            window.mysteriousManager.triggerMysteriousEvent(type, value);
        }
    }

    saveGame() {
        const gameState = {
            score: this.score,
            multiplier: this.multiplier,
            mysteryCounts: this.mysteryCounts
        };
        
        localStorage.setItem('catParadiseGame', JSON.stringify(gameState));
    }

    loadGame() {
        const savedState = localStorage.getItem('catParadiseGame');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.score = gameState.score;
            this.multiplier = gameState.multiplier;
            this.mysteryCounts = gameState.mysteryCounts;
            this.scoreElement.textContent = this.score;
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new Game();
});
