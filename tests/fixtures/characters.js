'use strict';

const characters = [
  { type: 'character', properties: { id: 'char-pc', name: 'Beacon PC', controlledby: 'player-pc' } },
  { type: 'character', properties: { id: 'char-ally', name: 'Beacon Ally', controlledby: 'player-ally' } },
  { type: 'character', properties: { id: 'char-target', name: 'Test Target', controlledby: '' } }
];

const beaconValues = {
  'char-pc': { hp: 10, hp_temp: 5, speed: 30 },
  'char-ally': { hp: 12, hp_temp: 0 },
  'char-target': { hp: 20, hp_temp: 0 }
};

module.exports = { characters, beaconValues };
