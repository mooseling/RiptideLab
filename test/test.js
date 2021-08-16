/* jshint node:true */

const assert = require('chai').assert;
const RiptideLab = require('../build/RiptideLab.node.js');

describe('RiptideLab is built properly', function() {
  it('is a variable', function() {
    assert(typeof RiptideLab !== 'undefined');
  });

  it('has tooltipContentStyle', function() {
    assert(RiptideLab.tooltipContentStyle !== undefined);
  });

  it('has ui', function() {
    assert(RiptideLab.ui !== undefined);
  });

  it('has Card', function() {
    assert(RiptideLab.Card !== undefined);
  });

  it('has CardViewer', function() {
    assert(RiptideLab.CardViewer !== undefined);
  });

  it('has CardService', function() {
    assert(RiptideLab.CardService !== undefined);
  });

  it('has Tooltip', function() {
    assert(RiptideLab.Tooltip !== undefined);
  });
});
