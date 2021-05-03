/* jshint esversion:8 */
/* jshint -W027 */

const scryfall = (function(){
  return {getCardByName};


  async function getCardByName(cardName) {
    const endpoint = 'cards/named?exact=' + cardName;

    const response = await scryfall.api.get(endpoint);
    return response.json();
  }
}());


scryfall.api = (function(){
  const baseUrl = 'https://api.scryfall.com';

  return {get};


  async function get(endpoint) {
    const url = `${baseUrl}/${endpoint}`;

    return fetch(url);
  }
}());
