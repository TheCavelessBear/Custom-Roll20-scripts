'use strict';

const base = { subtype: 'token', _pageid: 'page-test', pageid: 'page-test', layer: 'objects', left: 350, top: 350, width: 70, height: 70, rotation: 0, statusmarkers: '', controlledby: '' };
const tokens = [
  { type: 'graphic', properties: { ...base, id: 'token-pc', name: 'Linked Beacon PC', represents: 'char-pc', sides: 'https%3A%2F%2Fs3.amazonaws.com%2Ffiles.d20.io%2Fimages%2F1%2Fthumb.png%3F1|https%3A%2F%2Fs3.amazonaws.com%2Ffiles.d20.io%2Fimages%2F2%2Fthumb.png%3F2', currentSide: 0, imgsrc: 'https://s3.amazonaws.com/files.d20.io/images/1/thumb.png?1', bar1_value: 10, bar1_max: 20, bar2_value: 5, bar2_max: 5, bar3_value: 30, bar3_max: 30, bar4_value: 15, bar4_max: 15 } },
  { type: 'graphic', properties: { ...base, id: 'token-ally', name: 'Linked Beacon Ally', represents: 'char-ally', left: 420, bar1_value: 12, bar1_max: 12, bar2_value: 0, bar3_value: 30, bar4_value: 14 } },
  { type: 'graphic', properties: { ...base, id: 'token-npc', name: 'Unlinked NPC', represents: '', left: 490, bar1_value: 10, bar1_max: 10, bar2_value: 5, bar2_max: 5, bar3_value: 30, bar4_value: 12 } },
  { type: 'graphic', properties: { ...base, id: 'token-enemy', name: 'Generic Enemy', represents: '', left: 560, bar1_value: 8, bar1_max: 8, bar2_value: 0, bar4_value: 12 } },
  { type: 'graphic', properties: { ...base, id: 'token-mount', name: 'Mount', represents: '', left: 630, bar1_value: 30, bar1_max: 30 } },
  { type: 'graphic', properties: { ...base, id: 'token-rider', name: 'Rider', represents: 'char-pc', left: 700, bar1_value: 10, bar1_max: 20, bar2_value: 5, bar3_value: 30, bar4_value: 15 } },
  { type: 'graphic', properties: { ...base, id: 'token-target', name: 'ADR / SE Target', represents: 'char-target', left: 770, bar1_value: 20, bar1_max: 20, bar2_value: 0, bar4_value: 13 } }
];

module.exports = { tokens };
