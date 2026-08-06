'use strict';

// Intentional simplification: deterministic, synchronous dispatch. Roll20's
// scheduler and callback ordering remain live-Roll20 verification work.
class EventBus {
  constructor() {
    this.handlers = new Map();
    this.registrations = [];
    this.dispatches = [];
    this.exceptions = [];
    this.registrationSource = '(harness)';
    this.activeSource = null;
  }

  setRegistrationSource(source) {
    this.registrationSource = source || '(harness)';
  }

  on(event, handler) {
    if (typeof event !== 'string' || typeof handler !== 'function') {
      throw new TypeError('on(event, handler) requires a string and function');
    }
    const source = this.activeSource || this.registrationSource;
    const handlers = this.handlers.get(event) || [];
    handlers.push({ handler, source });
    this.handlers.set(event, handlers);
    this.registrations.push({ event, handlerName: handler.name || '(anonymous)', source });
  }

  count(event) {
    return (this.handlers.get(event) || []).length;
  }

  events() {
    return Array.from(this.handlers.keys()).sort();
  }

  async emit(event, ...args) {
    const handlers = [...(this.handlers.get(event) || [])];
    this.dispatches.push({ event, handlerCount: handlers.length, args });
    for (const registration of handlers) {
      const { handler, source } = registration;
      const previousSource = this.activeSource;
      this.activeSource = source;
      try {
        await handler(...args);
      } catch (error) {
        this.exceptions.push({ event, handlerName: handler.name || '(anonymous)', source, error });
        throw error;
      } finally {
        this.activeSource = previousSource;
      }
    }
  }
}

module.exports = { EventBus };
