import logger from '../utils/Logger';

/**
 * Command Interface - Base command class
 * Implements Command Pattern
 */
export class Command {
  constructor(receiver) {
    this.receiver = receiver;
    this.executedAt = null;
    this.isExecuted = false;
  }

  /**
   * Execute the command
   * @returns {Promise<boolean>} Success status
   */
  async execute() {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Undo the command
   * @returns {Promise<boolean>} Success status
   */
  async undo() {
    throw new Error('undo() must be implemented by subclass');
  }

  /**
   * Get command description
   * @returns {string} Command description
   */
  getDescription() {
    return 'Base Command';
  }

  /**
   * Get command metadata
   * @returns {Object} Command metadata
   */
  getMetadata() {
    return {
      description: this.getDescription(),
      executedAt: this.executedAt,
      isExecuted: this.isExecuted,
    };
  }
}

/**
 * Set Color Command
 */
export class SetColorCommand extends Command {
  constructor(receiver, color, previousColor = null) {
    super(receiver);
    this.color = color;
    this.previousColor = previousColor;
  }

  async execute() {
    try {
      this.previousColor = this.receiver.getCurrentColor();
      await this.receiver.setColor(this.color);
      this.executedAt = Date.now();
      this.isExecuted = true;
      logger.info('SetColorCommand executed', {color: this.color});
      return true;
    } catch (error) {
      logger.error('SetColorCommand failed', error);
      return false;
    }
  }

  async undo() {
    if (!this.isExecuted || !this.previousColor) {
      return false;
    }
    try {
      await this.receiver.setColor(this.previousColor);
      this.isExecuted = false;
      logger.info('SetColorCommand undone', {previousColor: this.previousColor});
      return true;
    } catch (error) {
      logger.error('SetColorCommand undo failed', error);
      return false;
    }
  }

  getDescription() {
    return `Set color to ${this.color}`;
  }
}

/**
 * Set Brightness Command
 */
export class SetBrightnessCommand extends Command {
  constructor(receiver, brightness, previousBrightness = null) {
    super(receiver);
    this.brightness = brightness;
    this.previousBrightness = previousBrightness;
  }

  async execute() {
    try {
      this.previousBrightness = this.receiver.getCurrentBrightness();
      await this.receiver.setBrightness(this.brightness);
      this.executedAt = Date.now();
      this.isExecuted = true;
      logger.info('SetBrightnessCommand executed', {brightness: this.brightness});
      return true;
    } catch (error) {
      logger.error('SetBrightnessCommand failed', error);
      return false;
    }
  }

  async undo() {
    if (!this.isExecuted || this.previousBrightness === null) {
      return false;
    }
    try {
      await this.receiver.setBrightness(this.previousBrightness);
      this.isExecuted = false;
      logger.info('SetBrightnessCommand undone', {previousBrightness: this.previousBrightness});
      return true;
    } catch (error) {
      logger.error('SetBrightnessCommand undo failed', error);
      return false;
    }
  }

  getDescription() {
    return `Set brightness to ${this.brightness}%`;
  }
}

/**
 * Toggle Power Command
 */
export class TogglePowerCommand extends Command {
  constructor(receiver) {
    super(receiver);
    this.previousState = null;
  }

  async execute() {
    try {
      this.previousState = this.receiver.isPoweredOn();
      await this.receiver.togglePower();
      this.executedAt = Date.now();
      this.isExecuted = true;
      logger.info('TogglePowerCommand executed', {newState: !this.previousState});
      return true;
    } catch (error) {
      logger.error('TogglePowerCommand failed', error);
      return false;
    }
  }

  async undo() {
    if (!this.isExecuted || this.previousState === null) {
      return false;
    }
    try {
      await this.receiver.togglePower();
      this.isExecuted = false;
      logger.info('TogglePowerCommand undone', {restoredState: this.previousState});
      return true;
    } catch (error) {
      logger.error('TogglePowerCommand undo failed', error);
      return false;
    }
  }

  getDescription() {
    return 'Toggle power';
  }
}

/**
 * Set Effect Command
 */
export class SetEffectCommand extends Command {
  constructor(receiver, effect, previousEffect = null) {
    super(receiver);
    this.effect = effect;
    this.previousEffect = previousEffect;
  }

  async execute() {
    try {
      this.previousEffect = this.receiver.getCurrentEffect();
      await this.receiver.setEffect(this.effect);
      this.executedAt = Date.now();
      this.isExecuted = true;
      logger.info('SetEffectCommand executed', {effect: this.effect});
      return true;
    } catch (error) {
      logger.error('SetEffectCommand failed', error);
      return false;
    }
  }

  async undo() {
    if (!this.isExecuted || !this.previousEffect) {
      return false;
    }
    try {
      await this.receiver.setEffect(this.previousEffect);
      this.isExecuted = false;
      logger.info('SetEffectCommand undone', {previousEffect: this.previousEffect});
      return true;
    } catch (error) {
      logger.error('SetEffectCommand undo failed', error);
      return false;
    }
  }

  getDescription() {
    return `Set effect to ${this.effect}`;
  }
}

/**
 * Macro Command - Composite command that executes multiple commands
 */
export class MacroCommand extends Command {
  constructor(commands = []) {
    super(null);
    this.commands = commands;
  }

  addCommand(command) {
    this.commands.push(command);
  }

  async execute() {
    try {
      for (const command of this.commands) {
        const success = await command.execute();
        if (!success) {
          logger.warn('MacroCommand: Command failed', {command: command.getDescription()});
        }
      }
      this.executedAt = Date.now();
      this.isExecuted = true;
      logger.info('MacroCommand executed', {commandCount: this.commands.length});
      return true;
    } catch (error) {
      logger.error('MacroCommand failed', error);
      return false;
    }
  }

  async undo() {
    if (!this.isExecuted) {
      return false;
    }
    try {
      // Undo in reverse order
      for (let i = this.commands.length - 1; i >= 0; i--) {
        const success = await this.commands[i].undo();
        if (!success) {
          logger.warn('MacroCommand: Undo failed', {command: this.commands[i].getDescription()});
        }
      }
      this.isExecuted = false;
      logger.info('MacroCommand undone', {commandCount: this.commands.length});
      return true;
    } catch (error) {
      logger.error('MacroCommand undo failed', error);
      return false;
    }
  }

  getDescription() {
    return `Macro command with ${this.commands.length} commands`;
  }
}

/**
 * Command Invoker - Manages command execution and history
 */
export class CommandInvoker {
  constructor() {
    this.commandHistory = [];
    this.currentIndex = -1;
    this.maxHistorySize = 50;
  }

  /**
   * Execute a command
   * @param {Command} command - Command to execute
   * @returns {Promise<boolean>} Success status
   */
  async executeCommand(command) {
    try {
      const success = await command.execute();
      
      if (success) {
        // Remove any commands after current index (for redo functionality)
        this.commandHistory = this.commandHistory.slice(0, this.currentIndex + 1);
        
        // Add new command
        this.commandHistory.push(command);
        this.currentIndex++;
        
        // Limit history size
        if (this.commandHistory.length > this.maxHistorySize) {
          this.commandHistory.shift();
          this.currentIndex--;
        }
        
        logger.info('Command executed and added to history', {
          description: command.getDescription(),
          historySize: this.commandHistory.length,
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to execute command', error);
      return false;
    }
  }

  /**
   * Undo last command
   * @returns {Promise<boolean>} Success status
   */
  async undo() {
    if (!this.canUndo()) {
      logger.warn('Cannot undo: no commands in history');
      return false;
    }

    try {
      const command = this.commandHistory[this.currentIndex];
      const success = await command.undo();
      
      if (success) {
        this.currentIndex--;
        logger.info('Command undone', {description: command.getDescription()});
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to undo command', error);
      return false;
    }
  }

  /**
   * Redo last undone command
   * @returns {Promise<boolean>} Success status
   */
  async redo() {
    if (!this.canRedo()) {
      logger.warn('Cannot redo: no commands to redo');
      return false;
    }

    try {
      const command = this.commandHistory[this.currentIndex + 1];
      const success = await command.execute();
      
      if (success) {
        this.currentIndex++;
        logger.info('Command redone', {description: command.getDescription()});
      }
      
      return success;
    } catch (error) {
      logger.error('Failed to redo command', error);
      return false;
    }
  }

  /**
   * Check if undo is available
   * @returns {boolean} True if undo is available
   */
  canUndo() {
    return this.currentIndex >= 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean} True if redo is available
   */
  canRedo() {
    return this.currentIndex < this.commandHistory.length - 1;
  }

  /**
   * Get command history
   * @returns {Array} Command history
   */
  getHistory() {
    return this.commandHistory.map((cmd, index) => ({
      description: cmd.getDescription(),
      metadata: cmd.getMetadata(),
      isCurrent: index === this.currentIndex,
    }));
  }

  /**
   * Clear command history
   */
  clearHistory() {
    this.commandHistory = [];
    this.currentIndex = -1;
    logger.info('Command history cleared');
  }

  /**
   * Get history statistics
   * @returns {Object} History statistics
   */
  getStatistics() {
    return {
      totalCommands: this.commandHistory.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.currentIndex + 1,
      redoCount: this.commandHistory.length - this.currentIndex - 1,
    };
  }
}

/**
 * Command Factory - Creates command instances
 */
export class CommandFactory {
  static createSetColorCommand(receiver, color, previousColor = null) {
    return new SetColorCommand(receiver, color, previousColor);
  }

  static createSetBrightnessCommand(receiver, brightness, previousBrightness = null) {
    return new SetBrightnessCommand(receiver, brightness, previousBrightness);
  }

  static createTogglePowerCommand(receiver) {
    return new TogglePowerCommand(receiver);
  }

  static createSetEffectCommand(receiver, effect, previousEffect = null) {
    return new SetEffectCommand(receiver, effect, previousEffect);
  }

  static createMacroCommand(commands = []) {
    return new MacroCommand(commands);
  }
}
