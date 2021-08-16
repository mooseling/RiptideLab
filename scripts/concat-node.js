const concat = require('concat');
const riptideLabSources = require('./riptideLabSources.js');

concat(
  [
    'src/_build-prefix-node',
    ...riptideLabSources,
    'src/_build-suffix-node'
  ],
  'build/RiptideLab.node.js'
);
