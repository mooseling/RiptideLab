/* jshint esversion:8 */
/* jshint -W027 */

const scryfall = (function(){
  const cardCache = {};

  return {getCardByName};


  async function getCardByName(cardName) {
    const cachedCard = cardCache[cardName];
    if (cachedCard)
      return cachedCard;
    return getCardFromApiByName(cardName);
  }


  async function getCardFromApiByName(cardName) {
    const endpoint = 'cards/named?exact=' + cardName;

    const response = await scryfall.api.get(endpoint);
    const card = cardCache[cardName] = await response.json();
    return card;
  }
}());


// This is separate so we can mock it for testing one day
scryfall.api = (function(){
  const baseUrl = 'https://api.scryfall.com';

  return {get};


  async function get(endpoint) {
    return fetch(`${baseUrl}/${endpoint}`);
  }
}());
