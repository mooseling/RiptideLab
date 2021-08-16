const concat = require('concat');
const riptideLabSources = require('./riptideLabSources.js');

concat(
  [
    'src/_build-prefix',
    ...riptideLabSources,
    'src/_build-suffix'
  ],
  'build/RiptideLab.js'
);
