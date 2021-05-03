/* jshint esversion:8 */
/* jshint -W027 */

const RiptideLab = (function(){
  const cardCache = {};

  return {Card};


  function Card(cardName) {
    return {getDetails};

    async function getDetails() {
      if (cardCache[cardName])
        return cardCache[cardName];
      return RiptideLab.cardService.getCard(cardName);
    }
  }
}());


RiptideLab.cardService = (function(){
  const baseUrl = 'https://api.scryfall.com';
  const cardCache = {};

  return {getCard};


  async function getCard(cardName) {
    if (cardCache[cardName])
      return translateToRiptideLab(cardCache[cardName]);
    return translateToRiptideLab(getCardFromExternalService(cardName));
  }


  function translateToRiptideLab(cardObject) {
    const riptideCard = {
      // jshint ignore:start
      imageURI: cardObject?.image_uris?.normal
      // jshint ignore:end
    };

    return riptideCard;
  }


  async function getCardFromExternalService(cardName) {
    const endpoint = 'cards/named?exact=' + cardName;

    const response = await get(endpoint);
    const card = cardCache[cardName] = await response.json();
    return card;
  }


  async function get(endpoint) {
    return fetch(`${baseUrl}/${endpoint}`);
  }
}());
