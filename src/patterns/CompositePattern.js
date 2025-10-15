import logger from '../utils/Logger';

/**
 * Component Interface - Base class for LED components
 * Implements Composite Pattern
 */
export class LEDComponent {
  constructor(name) {
    this.name = name;
    this.parent = null;
  }

  /**
   * Add child component
   */
  add(component) {
    throw new Error('add() not supported');
  }

  /**
   * Remove child component
   */
  remove(component) {
    throw new Error('remove() not supported');
  }

  /**
   * Get child at index
   */
  getChild(index) {
    throw new Error('getChild() not supported');
  }

  /**
   * Get all children
   */
  getChildren() {
    throw new Error('getChildren() not supported');
  }

  /**
   * Set color
   */
  async setColor(color) {
    throw new Error('setColor() must be implemented');
  }

  /**
   * Set brightness
   */
  async setBrightness(brightness) {
    throw new Error('setBrightness() must be implemented');
  }

  /**
   * Toggle power
   */
  async togglePower() {
    throw new Error('togglePower() must be implemented');
  }

  /**
   * Set effect
   */
  async setEffect(effect) {
    throw new Error('setEffect() must be implemented');
  }

  /**
   * Get name
   */
  getName() {
    return this.name;
  }

  /**
   * Set parent
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   * Get parent
   */
  getParent() {
    return this.parent;
  }

  /**
   * Is composite
   */
  isComposite() {
    return false;
  }
}

/**
 * Leaf - Individual LED
 */
export class IndividualLED extends LEDComponent {
  constructor(name, controller) {
    super(name);
    this.controller = controller;
    this.state = {
      power: false,
      color: '#ffffff',
      brightness: 100,
      effect: null,
    };
  }

  async setColor(color) {
    logger.info('Setting color for individual LED', {name: this.name, color});
    this.state.color = color;
    await this.controller.setColor(color);
    return true;
  }

  async setBrightness(brightness) {
    logger.info('Setting brightness for individual LED', {name: this.name, brightness});
    this.state.brightness = brightness;
    await this.controller.setBrightness(brightness);
    return true;
  }

  async togglePower() {
    logger.info('Toggling power for individual LED', {name: this.name});
    this.state.power = !this.state.power;
    await this.controller.togglePower();
    return true;
  }

  async setEffect(effect) {
    logger.info('Setting effect for individual LED', {name: this.name, effect});
    this.state.effect = effect;
    await this.controller.setEffect(effect);
    return true;
  }

  getState() {
    return {...this.state};
  }
}

/**
 * Composite - LED Group
 */
export class LEDGroup extends LEDComponent {
  constructor(name) {
    super(name);
    this.children = [];
  }

  add(component) {
    component.setParent(this);
    this.children.push(component);
    logger.info('Component added to group', {
      group: this.name,
      component: component.getName(),
    });
  }

  remove(component) {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
      component.setParent(null);
      logger.info('Component removed from group', {
        group: this.name,
        component: component.getName(),
      });
    }
  }

  getChild(index) {
    return this.children[index];
  }

  getChildren() {
    return [...this.children];
  }

  async setColor(color) {
    logger.info('Setting color for LED group', {name: this.name, color, childCount: this.children.length});
    const results = await Promise.all(
      this.children.map(child => child.setColor(color))
    );
    return results.every(r => r);
  }

  async setBrightness(brightness) {
    logger.info('Setting brightness for LED group', {name: this.name, brightness, childCount: this.children.length});
    const results = await Promise.all(
      this.children.map(child => child.setBrightness(brightness))
    );
    return results.every(r => r);
  }

  async togglePower() {
    logger.info('Toggling power for LED group', {name: this.name, childCount: this.children.length});
    const results = await Promise.all(
      this.children.map(child => child.togglePower())
    );
    return results.every(r => r);
  }

  async setEffect(effect) {
    logger.info('Setting effect for LED group', {name: this.name, effect, childCount: this.children.length});
    const results = await Promise.all(
      this.children.map(child => child.setEffect(effect))
    );
    return results.every(r => r);
  }

  isComposite() {
    return true;
  }

  /**
   * Get total LED count
   */
  getCount() {
    return this.children.reduce((count, child) => {
      return count + (child.isComposite() ? child.getCount() : 1);
    }, 0);
  }

  /**
   * Find component by name
   */
  find(name) {
    if (this.name === name) {
      return this;
    }

    for (const child of this.children) {
      if (child.getName() === name) {
        return child;
      }
      if (child.isComposite()) {
        const found = child.find(name);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Get all leaf components
   */
  getLeaves() {
    const leaves = [];
    for (const child of this.children) {
      if (child.isComposite()) {
        leaves.push(...child.getLeaves());
      } else {
        leaves.push(child);
      }
    }
    return leaves;
  }
}

/**
 * Room - Special composite for room management
 */
export class Room extends LEDGroup {
  constructor(name, roomType = 'generic') {
    super(name);
    this.roomType = roomType;
    this.scenes = new Map();
  }

  /**
   * Add scene
   */
  addScene(sceneName, sceneConfig) {
    this.scenes.set(sceneName, sceneConfig);
    logger.info('Scene added to room', {room: this.name, scene: sceneName});
  }

  /**
   * Apply scene
   */
  async applyScene(sceneName) {
    const scene = this.scenes.get(sceneName);
    if (!scene) {
      throw new Error(`Scene not found: ${sceneName}`);
    }

    logger.info('Applying scene to room', {room: this.name, scene: sceneName});

    if (scene.color) await this.setColor(scene.color);
    if (scene.brightness) await this.setBrightness(scene.brightness);
    if (scene.effect) await this.setEffect(scene.effect);

    return true;
  }

  /**
   * Get scenes
   */
  getScenes() {
    return Array.from(this.scenes.keys());
  }

  /**
   * Remove scene
   */
  removeScene(sceneName) {
    return this.scenes.delete(sceneName);
  }
}

/**
 * Zone - Special composite for zone management
 */
export class Zone extends LEDGroup {
  constructor(name, priority = 0) {
    super(name);
    this.priority = priority;
    this.schedule = null;
  }

  /**
   * Set schedule
   */
  setSchedule(schedule) {
    this.schedule = schedule;
    logger.info('Schedule set for zone', {zone: this.name, schedule});
  }

  /**
   * Get schedule
   */
  getSchedule() {
    return this.schedule;
  }

  /**
   * Get priority
   */
  getPriority() {
    return this.priority;
  }

  /**
   * Set priority
   */
  setPriority(priority) {
    this.priority = priority;
    logger.info('Priority set for zone', {zone: this.name, priority});
  }
}

/**
 * LED Hierarchy Builder - Fluent interface for building LED trees
 */
export class LEDHierarchyBuilder {
  constructor() {
    this.root = null;
    this.currentGroup = null;
  }

  /**
   * Create root group
   */
  createRoot(name) {
    this.root = new LEDGroup(name);
    this.currentGroup = this.root;
    return this;
  }

  /**
   * Add group to current group
   */
  addGroup(name) {
    const group = new LEDGroup(name);
    this.currentGroup.add(group);
    return this;
  }

  /**
   * Add room to current group
   */
  addRoom(name, roomType) {
    const room = new Room(name, roomType);
    this.currentGroup.add(room);
    return this;
  }

  /**
   * Add zone to current group
   */
  addZone(name, priority) {
    const zone = new Zone(name, priority);
    this.currentGroup.add(zone);
    return this;
  }

  /**
   * Add LED to current group
   */
  addLED(name, controller) {
    const led = new IndividualLED(name, controller);
    this.currentGroup.add(led);
    return this;
  }

  /**
   * Enter group
   */
  enterGroup(name) {
    const found = this.currentGroup.find(name);
    if (found && found.isComposite()) {
      this.currentGroup = found;
    } else {
      throw new Error(`Group not found: ${name}`);
    }
    return this;
  }

  /**
   * Exit current group
   */
  exitGroup() {
    if (this.currentGroup.getParent()) {
      this.currentGroup = this.currentGroup.getParent();
    }
    return this;
  }

  /**
   * Build and return root
   */
  build() {
    return this.root;
  }
}

/**
 * LED Composite Manager - Manages LED hierarchies
 */
export class LEDCompositeManager {
  constructor() {
    this.hierarchies = new Map();
    this.currentHierarchy = null;
  }

  /**
   * Create hierarchy
   */
  createHierarchy(name) {
    const builder = new LEDHierarchyBuilder();
    builder.createRoot(name);
    const hierarchy = builder.build();
    this.hierarchies.set(name, hierarchy);
    this.currentHierarchy = hierarchy;
    logger.info('Hierarchy created', {name});
    return hierarchy;
  }

  /**
   * Get hierarchy
   */
  getHierarchy(name) {
    return this.hierarchies.get(name);
  }

  /**
   * Set current hierarchy
   */
  setCurrentHierarchy(name) {
    const hierarchy = this.hierarchies.get(name);
    if (hierarchy) {
      this.currentHierarchy = hierarchy;
      logger.info('Current hierarchy set', {name});
    }
  }

  /**
   * Get current hierarchy
   */
  getCurrentHierarchy() {
    return this.currentHierarchy;
  }

  /**
   * Delete hierarchy
   */
  deleteHierarchy(name) {
    return this.hierarchies.delete(name);
  }

  /**
   * Get all hierarchy names
   */
  getHierarchyNames() {
    return Array.from(this.hierarchies.keys());
  }

  /**
   * Find component across all hierarchies
   */
  findComponent(name) {
    for (const hierarchy of this.hierarchies.values()) {
      const found = hierarchy.find(name);
      if (found) return found;
    }
    return null;
  }
}

export default LEDCompositeManager;
