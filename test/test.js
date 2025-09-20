/* global describe, it, before */

const assert = require('chai').assert;
global.document = require('./document-mock.js');
const fetchMock = require('fetch-mock');
const RiptideLab = require('../build/RiptideLab.node.js');

describe('RiptideLab', function() {
  it('is a variable', () => assert(typeof RiptideLab !== 'undefined'));
  it('has tooltipContentStyle', () => assert(RiptideLab.tooltipContentStyle !== undefined));
  it('has ui', () => assert(RiptideLab.ui !== undefined));
  it('has Card', () => assert(RiptideLab.Card !== undefined));
  it('has CardViewer', () => assert(RiptideLab.CardViewer !== undefined));
  it('has CardService', () => assert(RiptideLab.CardService !== undefined));
  it('has Tooltip', () => assert(RiptideLab.Tooltip !== undefined));
});


// ===================================
//             CardService
// ===================================
describe('CardService', function() {
  const brushwaggJSON = require('./card-responses/brushwagg.json');
  const juggernautJSON = require('./card-responses/juggernaut.json');
  const forestJSON = require('./card-responses/forest.json');
  const plainsJSON = require('./card-responses/plains.json');
  const mountainJSON = require('./card-responses/mountain.json');
  fetchMock.mock('end:brushwagg%22(s:zen%20or%20not:reprint)', brushwaggJSON);
  fetchMock.mock('end:juggernaut%22(s:zen%20or%20not:reprint)', juggernautJSON);
  fetchMock.mock('end:forest%22(s:zen%20or%20not:reprint)', forestJSON);
  fetchMock.mock('end:plains%22(s:zen%20or%20not:reprint)', plainsJSON);
  fetchMock.mock('end:mountain%22(s:zen%20or%20not:reprint)', mountainJSON);
  const timestamper = require('./timestamper.js');
  let card1, fetchCount1, card2, fetchCount2, leastTimeBetweenFetches;

  before(async function() {
    // Plug in a time-stamp on every fetch call
    (function(){
      const nativeFetch = global.fetch;
      const newFetch = function(...args) {
        timestamper.stamp();
        return nativeFetch(...args);
      };
      global.fetch = newFetch;
    })();
    card1 = await RiptideLab.CardService.getCard('brushwagg');
    fetchCount1 = fetchMock.calls().length;
    card2 = await RiptideLab.CardService.getCard('brushwagg');
    fetchCount2 = fetchMock.calls().length;
    await RiptideLab.CardService.getCard('juggernaut');
    await RiptideLab.CardService.getCard('forest');
    await RiptideLab.CardService.getCard('plains');
    await RiptideLab.CardService.getCard('mountain');
    leastTimeBetweenFetches = timestamper.getSmallestGap();
  });

  it('returns Brushwagg', () => assert(card1.name === 'Brushwagg', 'Returned card name: ' + card1.name));
  it('calls fetch for first request', () => assert(fetchCount1 === 1, 'Fetch count 1: ' + fetchCount1));
  it('doesn\'t call fetch for second request', () => assert(fetchCount2 === 1, 'Fetch count 2: ' + fetchCount2));
  it('...but does return the same Brushwagg', () => assert(
    JSON.stringify(card1) === JSON.stringify(card2),
    `Card 1:\n${JSON.stringify(card1)}\n\nCard 2:\n${JSON.stringify(card2)}`
  ));
  it('waits 100ms+ between fetches', () => assert(
    leastTimeBetweenFetches >= 100,
    `Least wait time was ${leastTimeBetweenFetches}ms`
  ));
});
