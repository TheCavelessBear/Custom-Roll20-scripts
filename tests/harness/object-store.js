'use strict';

// Confirmed subset: Roll20 objects expose get/set/remove and are found through
// getObj/findObjs/createObj. Event ordering is controlled locally, not asserted
// as Roll20 platform behavior.
class ObjectStore {
  constructor(eventBus, { emitChanges = false } = {}) {
    this.eventBus = eventBus;
    this.emitChanges = emitChanges;
    this.objects = new Map();
    this.mutations = [];
    this.nextId = 1;
  }

  add(type, properties = {}) {
    const id = properties.id || properties._id || `${type}-${this.nextId++}`;
    const data = { ...properties, id, _id: id, _type: type };
    const object = this.wrap(type, data);
    this.objects.set(`${type}:${id}`, object);
    return object;
  }

  wrap(type, data) {
    const store = this;
    return {
      id: data.id,
      get(property, callback) {
        const value = property === '_id' ? data.id : property === '_type' || property === 'type' ? type : property === 'tags' && data[property] === undefined ? '' : data[property];
        if (typeof callback === 'function') callback(value);
        return value;
      },
      set(property, value) {
        const changes = typeof property === 'object' ? property : { [property]: value };
        const previous = { ...data };
        Object.assign(data, changes);
        store.mutations.push({ type, id: data.id, changes: { ...changes }, previous });
        if (store.emitChanges) {
          void store.eventBus.emit(`change:${type}`, this, previous);
          for (const key of Object.keys(changes)) {
            void store.eventBus.emit(`change:${type}:${key}`, this, previous);
          }
        }
        return this;
      },
      remove() {
        store.objects.delete(`${type}:${data.id}`);
        store.mutations.push({ type, id: data.id, removed: true });
        if (store.emitChanges) void store.eventBus.emit(`destroy:${type}`, this);
      },
      toJSON() { return { ...data }; }
    };
  }

  getObj(type, id) {
    return this.objects.get(`${type}:${id}`);
  }

  findObjs(query = {}) {
    const requestedType = query._type || query.type;
    return [...this.objects.values()].filter((object) => {
      if (requestedType && object.get('_type') !== requestedType) return false;
      return Object.entries(query).every(([key, value]) => {
        if (key === 'type') return true;
        return object.get(key) === value;
      });
    });
  }

  filterObjs(predicate) {
    return [...this.objects.values()].filter(predicate);
  }

  getAllObjs() {
    return [...this.objects.values()];
  }

  createObj(type, properties) {
    const object = this.add(type, properties);
    if (this.emitChanges) void this.eventBus.emit(`add:${type}`, object);
    return object;
  }

  setEventEmission(enabled) {
    this.emitChanges = Boolean(enabled);
  }
}

module.exports = { ObjectStore };
