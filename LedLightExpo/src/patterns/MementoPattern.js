import logger from '../utils/Logger';

/**
 * Memento - Stores state snapshot
 * Implements Memento Pattern for undo/redo functionality
 */
export class Memento {
  constructor(state, metadata = {}) {
    this.state = JSON.parse(JSON.stringify(state)); // Deep copy
    this.timestamp = Date.now();
    this.metadata = metadata;
  }

  /**
   * Get state
   * @returns {Object} Stored state
   */
  getState() {
    return JSON.parse(JSON.stringify(this.state)); // Return copy
  }

  /**
   * Get timestamp
   * @returns {number} Timestamp
   */
  getTimestamp() {
    return this.timestamp;
  }

  /**
   * Get metadata
   * @returns {Object} Metadata
   */
  getMetadata() {
    return {...this.metadata};
  }

  /**
   * Get memento info
   * @returns {Object} Memento information
   */
  getInfo() {
    return {
      timestamp: this.timestamp,
      metadata: this.metadata,
      stateKeys: Object.keys(this.state),
    };
  }
}

/**
 * Originator - Creates and restores mementos
 */
export class LEDStateOriginator {
  constructor() {
    this.state = {
      power: false,
      color: {r: 0, g: 1, b: 0.533}, // Default green
      brightness: 50,
      effect: null,
      effectSpeed: 1.0,
      effectIntensity: 100,
    };
  }

  /**
   * Set state
   * @param {Object} state - New state
   */
  setState(state) {
    this.state = {...this.state, ...state};
    logger.info('State updated', {state: this.state});
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return {...this.state};
  }

  /**
   * Create memento
   * @param {Object} metadata - Optional metadata
   * @returns {Memento} Memento instance
   */
  createMemento(metadata = {}) {
    logger.info('Creating memento', {metadata});
    return new Memento(this.state, metadata);
  }

  /**
   * Restore from memento
   * @param {Memento} memento - Memento to restore
   */
  restoreFromMemento(memento) {
    this.state = memento.getState();
    logger.info('State restored from memento', {
      timestamp: memento.getTimestamp(),
      metadata: memento.getMetadata(),
    });
  }

  /**
   * Update specific property
   * @param {string} key - Property key
   * @param {any} value - Property value
   */
  updateProperty(key, value) {
    this.state[key] = value;
    logger.info('Property updated', {key, value});
  }

  /**
   * Get property
   * @param {string} key - Property key
   * @returns {any} Property value
   */
  getProperty(key) {
    return this.state[key];
  }
}

/**
 * Caretaker - Manages memento history
 */
export class MementoCaretaker {
  constructor(maxHistory = 50) {
    this.mementos = [];
    this.currentIndex = -1;
    this.maxHistory = maxHistory;
  }

  /**
   * Save memento
   * @param {Memento} memento - Memento to save
   */
  save(memento) {
    // Remove any mementos after current index (for redo functionality)
    this.mementos = this.mementos.slice(0, this.currentIndex + 1);
    
    // Add new memento
    this.mementos.push(memento);
    this.currentIndex++;
    
    // Limit history size
    if (this.mementos.length > this.maxHistory) {
      this.mementos.shift();
      this.currentIndex--;
    }
    
    logger.info('Memento saved', {
      totalMementos: this.mementos.length,
      currentIndex: this.currentIndex,
    });
  }

  /**
   * Get previous memento (for undo)
   * @returns {Memento|null} Previous memento
   */
  undo() {
    if (!this.canUndo()) {
      logger.warn('Cannot undo: no previous mementos');
      return null;
    }

    this.currentIndex--;
    const memento = this.mementos[this.currentIndex];
    logger.info('Undo performed', {
      currentIndex: this.currentIndex,
      timestamp: memento.getTimestamp(),
    });
    
    return memento;
  }

  /**
   * Get next memento (for redo)
   * @returns {Memento|null} Next memento
   */
  redo() {
    if (!this.canRedo()) {
      logger.warn('Cannot redo: no next mementos');
      return null;
    }

    this.currentIndex++;
    const memento = this.mementos[this.currentIndex];
    logger.info('Redo performed', {
      currentIndex: this.currentIndex,
      timestamp: memento.getTimestamp(),
    });
    
    return memento;
  }

  /**
   * Check if undo is available
   * @returns {boolean} True if undo is available
   */
  canUndo() {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean} True if redo is available
   */
  canRedo() {
    return this.currentIndex < this.mementos.length - 1;
  }

  /**
   * Get current memento
   * @returns {Memento|null} Current memento
   */
  getCurrentMemento() {
    if (this.currentIndex >= 0 && this.currentIndex < this.mementos.length) {
      return this.mementos[this.currentIndex];
    }
    return null;
  }

  /**
   * Get memento at index
   * @param {number} index - Memento index
   * @returns {Memento|null} Memento at index
   */
  getMementoAt(index) {
    if (index >= 0 && index < this.mementos.length) {
      return this.mementos[index];
    }
    return null;
  }

  /**
   * Get all mementos
   * @returns {Array} Array of mementos
   */
  getAllMementos() {
    return [...this.mementos];
  }

  /**
   * Get memento history
   * @returns {Array} Array of memento info
   */
  getHistory() {
    return this.mementos.map((memento, index) => ({
      index,
      info: memento.getInfo(),
      isCurrent: index === this.currentIndex,
    }));
  }

  /**
   * Jump to specific memento
   * @param {number} index - Target index
   * @returns {Memento|null} Memento at index
   */
  jumpTo(index) {
    if (index >= 0 && index < this.mementos.length) {
      this.currentIndex = index;
      logger.info('Jumped to memento', {index});
      return this.mementos[index];
    }
    logger.warn('Invalid memento index', {index});
    return null;
  }

  /**
   * Clear history
   */
  clear() {
    this.mementos = [];
    this.currentIndex = -1;
    logger.info('Memento history cleared');
  }

  /**
   * Get statistics
   * @returns {Object} History statistics
   */
  getStatistics() {
    return {
      totalMementos: this.mementos.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.currentIndex,
      redoCount: this.mementos.length - this.currentIndex - 1,
      maxHistory: this.maxHistory,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Estimate memory usage
   * @returns {number} Estimated memory in bytes
   */
  estimateMemoryUsage() {
    const json = JSON.stringify(this.mementos);
    return json.length * 2; // Rough estimate (UTF-16)
  }
}

/**
 * Memento Manager - High-level API for state management
 */
export class MementoManager {
  constructor(maxHistory = 50) {
    this.originator = new LEDStateOriginator();
    this.caretaker = new MementoCaretaker(maxHistory);
    this.autoSave = true;
    this.autoSaveDelay = 500; // ms
    this.autoSaveTimeout = null;
  }

  /**
   * Get current state
   * @returns {Object} Current state
   */
  getState() {
    return this.originator.getState();
  }

  /**
   * Set state and optionally save
   * @param {Object} state - New state
   * @param {Object} metadata - Optional metadata
   * @param {boolean} save - Whether to save memento
   */
  setState(state, metadata = {}, save = true) {
    this.originator.setState(state);
    
    if (save && this.autoSave) {
      this.scheduleSave(metadata);
    } else if (save) {
      this.save(metadata);
    }
  }

  /**
   * Update property
   * @param {string} key - Property key
   * @param {any} value - Property value
   * @param {Object} metadata - Optional metadata
   */
  updateProperty(key, value, metadata = {}) {
    this.originator.updateProperty(key, value);
    
    if (this.autoSave) {
      this.scheduleSave({...metadata, property: key});
    }
  }

  /**
   * Schedule auto-save
   * @param {Object} metadata - Metadata
   */
  scheduleSave(metadata) {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      this.save(metadata);
      this.autoSaveTimeout = null;
    }, this.autoSaveDelay);
  }

  /**
   * Save current state
   * @param {Object} metadata - Optional metadata
   */
  save(metadata = {}) {
    const memento = this.originator.createMemento(metadata);
    this.caretaker.save(memento);
  }

  /**
   * Undo last change
   * @returns {boolean} Success status
   */
  undo() {
    const memento = this.caretaker.undo();
    if (memento) {
      this.originator.restoreFromMemento(memento);
      return true;
    }
    return false;
  }

  /**
   * Redo last undone change
   * @returns {boolean} Success status
   */
  redo() {
    const memento = this.caretaker.redo();
    if (memento) {
      this.originator.restoreFromMemento(memento);
      return true;
    }
    return false;
  }

  /**
   * Jump to specific point in history
   * @param {number} index - History index
   * @returns {boolean} Success status
   */
  jumpToHistory(index) {
    const memento = this.caretaker.jumpTo(index);
    if (memento) {
      this.originator.restoreFromMemento(memento);
      return true;
    }
    return false;
  }

  /**
   * Check if undo is available
   * @returns {boolean} True if undo is available
   */
  canUndo() {
    return this.caretaker.canUndo();
  }

  /**
   * Check if redo is available
   * @returns {boolean} True if redo is available
   */
  canRedo() {
    return this.caretaker.canRedo();
  }

  /**
   * Get history
   * @returns {Array} History array
   */
  getHistory() {
    return this.caretaker.getHistory();
  }

  /**
   * Get statistics
   * @returns {Object} Statistics
   */
  getStatistics() {
    return this.caretaker.getStatistics();
  }

  /**
   * Enable auto-save
   * @param {number} delay - Auto-save delay in ms
   */
  enableAutoSave(delay = 500) {
    this.autoSave = true;
    this.autoSaveDelay = delay;
    logger.info('Auto-save enabled', {delay});
  }

  /**
   * Disable auto-save
   */
  disableAutoSave() {
    this.autoSave = false;
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
    logger.info('Auto-save disabled');
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.caretaker.clear();
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.originator.setState({
      power: false,
      color: {r: 0, g: 1, b: 0.533},
      brightness: 50,
      effect: null,
      effectSpeed: 1.0,
      effectIntensity: 100,
    });
    this.clearHistory();
    logger.info('Memento manager reset');
  }
}
