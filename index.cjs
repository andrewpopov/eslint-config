'use strict';

const base = require('./presets/base.cjs');
const react = require('./presets/react.cjs');
const next = require('./presets/next.cjs');
const node = require('./presets/node.cjs');
const tests = require('./presets/tests.cjs');
const strict = require('./presets/strict.cjs');
const layerBoundary = require('./factories/layerBoundary.cjs');
const exemptFilesFromRule = require('./factories/exemptFilesFromRule.cjs');

module.exports = {
  base,
  react,
  next,
  node,
  tests,
  strict,
  layerBoundary,
  exemptFilesFromRule,
};
