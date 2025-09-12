// GameState module: manages game data and persistence.
// Responsibilities: state encapsulation, localStorage sync.
// Usage: import { GameState } from './game-state.js';
// LEARN: Centralized state manager for maintainability and extensibility.

/**
 * GameState class
 * Encapsulates game state (clicks, currency, upgrades) and syncs with localStorage.
 * Methods: getState, setState, updateState, save, load, reset
 * No direct DOM access. Pure logic only.
 */
export class GameState {
    /**
     * @param {string} [storageKey='catParadiseGameState'] - localStorage key
     */
    constructor(storageKey = 'catParadiseGameState') {
        this._storageKey = storageKey;
        this._defaultState = {
            clicks: 0,
            currency: 0,
            upgrades: {}
        };
        this._state = this.load() || { ...this._defaultState };
    }

    /**
     * Get a copy of the current state
     * @returns {object}
     */
    getState() {
        return { ...this._state };
    }

    /**
     * Set the entire state (overwrites)
     * @param {object} newState
     */
    setState(newState) {
        this._state = { ...this._defaultState, ...newState };
        this.save();
    }

    /**
     * Update part of the state
     * @param {object} updates
     */
    updateState(updates) {
        this._state = { ...this._state, ...updates };
        this.save();
    }

    /**
     * Save state to localStorage
     */
    save() {
        try {
            localStorage.setItem(this._storageKey, JSON.stringify(this._state));
        } catch (e) {
            // LEARN: Always catch localStorage errors for quota/security
            console.warn('GameState save failed:', e);
        }
    }

    /**
     * Load state from localStorage
     * @returns {object|null}
     */
    load() {
        try {
            const raw = localStorage.getItem(this._storageKey);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            console.warn('GameState load failed:', e);
            return null;
        }
    }

    /**
     * Reset state to defaults and save
     */
    reset() {
        this._state = { ...this._defaultState };
        this.save();
    }
}
