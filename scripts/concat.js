const concat = require('concat');

concat(
  [
    'src/_build-prefix',
    'src/RiptideLab.js',
    'src/ui.js',
    'src/Card.js',
    'src/CardViewer.js',
    'src/CardService.js',
    'src/Tooltip.js',
    'src/_build-suffix'
  ],
  'build/RiptideLab.js'
);
