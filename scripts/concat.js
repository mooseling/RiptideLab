const concat = require('concat');
const {unlink} = require('fs');

concat(
  [
    'src/RiptideLab.js',
    'src/ui.js',
    'src/Card.js',
    'src/CardViewer.js',
    'src/CardService.js',
    'src/Tooltip.js',
    'src/embedded-images.js'
  ],
  'build/RiptideLab.concat.js'
).then(() => {
  Promise.all([
    concat(
      [
        'src/_build-prefix-browser',
        'build/RiptideLab.concat.js',
        'src/_build-suffix-browser'
      ],
      'build/RiptideLab.js'
    ),
    concat(
      [
        'build/RiptideLab.concat.js',
        'src/_build-suffix-node'
      ],
      'build/RiptideLab.node.js'
    )
  ]).then(() => unlink('build/RiptideLab.concat.js', err => err && console.log(err)));
});
