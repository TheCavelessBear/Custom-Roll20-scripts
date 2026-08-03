'use strict';

const campaign = { playerpageid: 'page-test', turnorder: '[]', initiativepage: false, _token_markers: '[]', token_markers: '[{"name":"Test Marker","tag":"test-marker","url":"https://example.invalid/marker.png"}]', playerspecificpages: false };
const startupObjects = [
  { type: 'page', properties: { id: 'page-test', name: 'Roll20 API Test Ground', scale_number: 5, snapping_increment: 1, width: 25, height: 25, dynamic_lighting_enabled: false } },
  { type: 'player', properties: { id: 'GM', _displayname: 'Test GM', displayname: 'Test GM' } }
];

module.exports = { campaign, startupObjects };
