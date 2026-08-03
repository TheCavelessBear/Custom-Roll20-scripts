'use strict';

// Intentional simplification: storage only. Real Beacon sheet-worker syncing,
// validation, derived values, and token-bar ordering must be tested live.
class BeaconSheetMock {
  constructor(seed = {}) {
    this.values = new Map();
    this.reads = [];
    this.writes = [];
    for (const [characterId, attributes] of Object.entries(seed)) {
      for (const [name, value] of Object.entries(attributes)) {
        this.values.set(this.key(characterId, name, 'current'), value);
      }
    }
  }

  key(characterId, name, valueType) {
    return `${characterId}::${name}::${valueType || 'current'}`;
  }

  async getSheetItem(characterId, name, valueType = 'current') {
    this.reads.push({ characterId, name, valueType });
    return this.values.get(this.key(characterId, name, valueType));
  }

  async setSheetItem(characterId, name, value, valueType = 'current') {
    this.writes.push({ characterId, name, value, valueType });
    this.values.set(this.key(characterId, name, valueType), value);
    return value;
  }
}

module.exports = { BeaconSheetMock };
