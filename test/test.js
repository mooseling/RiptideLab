/* global describe, it, before */

import * as fs from 'fs';
import {assert}  from 'chai';
import * as fetchMock from 'fetch-mock';
import * as document from './document-mock.js';
global.document = document;

// RiptideLab Modules
import {CardService} from '../build/CardService.js';

// JSON responses to test against
const brushwaggJSON = fs.readFileSync('./card-responses/brushwagg.json');
const juggernaughtJSON = fs.readFileSync('./card-responses/juggernaught.json');
const forestJSON = fs.readFileSync('./card-responses/forest.json');
const plainsJSON = fs.readFileSync('./card-responses/plains.json');
const mountainJSON = fs.readFileSync('./card-responses/mountain.json');

// Miscellaneous
import * as timestamper from './timestamper.js';


// ===================================
//             CardService
// ===================================

describe('CardService', function() {
  fetchMock.mock('https://api.scryfall.com/cards/named?fuzzy=brushwagg', brushwaggJSON);
  fetchMock.mock('https://api.scryfall.com/cards/named?fuzzy=juggernaught', juggernaughtJSON);
  fetchMock.mock('https://api.scryfall.com/cards/named?fuzzy=forest', forestJSON);
  fetchMock.mock('https://api.scryfall.com/cards/named?fuzzy=plains', plainsJSON);
  fetchMock.mock('https://api.scryfall.com/cards/named?fuzzy=mountain', mountainJSON);
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
    card1 = await CardService.getCard('brushwagg');
    fetchCount1 = fetchMock.calls().length;
    card2 = await CardService.getCard('brushwagg');
    fetchCount2 = fetchMock.calls().length;
    await CardService.getCard('juggernaught');
    await CardService.getCard('forest');
    await CardService.getCard('plains');
    await CardService.getCard('mountain');
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
