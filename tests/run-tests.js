'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const scenarioDirectory = path.join(__dirname, 'scenarios');
const scenarios = fs.readdirSync(scenarioDirectory).filter((file) => file.endsWith('.test.js')).sort().map((file) => path.join(scenarioDirectory, file));
const result = spawnSync(process.execPath, ['--test', ...scenarios], { cwd: __dirname, stdio: 'inherit' });
process.exit(result.status === null ? 1 : result.status);
