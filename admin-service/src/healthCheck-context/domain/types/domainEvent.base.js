/**
 * Base Domain Event
 *
 * Serves as the base class for all domain events in the system.
 * Provides common structure and behavior for domain events.
 */

class DomainEvent {
  #type;
  #data;
  #timestamp;
  #metadata;

  /**
   * Creates a new domain event
   * Flow:
   * 1. Set event metadata (type, timestamp)
   * 2. Store event data
   *
   * @param {string} type - The event type identifier
   * @param {Object} data - The event payload data
   */
  constructor(type, data) {
    if (!type) {
      throw new Error("Event type is required");
    }

    this.#type = type;
    this.#data = Object.freeze({ ...data }); // Immutable event data
    this.#timestamp = new Date();
    this.#metadata = {};

    // Freeze the event to enforce immutability
    Object.freeze(this);
  }

  /**
   * Gets the event type
   * @returns {string} The event type
   */
  get type() {
    return this.#type;
  }

  /**
   * Gets the event data
   * @returns {Object} The event payload data
   */
  get data() {
    return this.#data;
  }

  /**
   * Gets the event timestamp
   * @returns {Date} The event timestamp
   */
  get timestamp() {
    return this.#timestamp;
  }

  /**
   * Gets the event metadata
   * @returns {Object} The event metadata
   */
  get metadata() {
    return { ...this.#metadata };
  }

  /**
   * Creates a serialized representation of the event for storage or messaging
   * @returns {Object} Serialized event
   */
  serialize() {
    return {
      type: this.#type,
      data: this.#data,
      timestamp: this.#timestamp.toISOString(),
      metadata: this.#metadata,
    };
  }

  /**
   * Creates a new domain event from serialized data
   * @param {Object} serialized - The serialized event data
   * @returns {DomainEvent} A new domain event instance
   */
  static deserialize(serialized) {
    const event = new DomainEvent(serialized.type, serialized.data);
    event.#timestamp = new Date(serialized.timestamp);
    event.#metadata = { ...serialized.metadata };
    return event;
  }
}

module.exports = DomainEvent;
