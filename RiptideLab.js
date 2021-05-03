/* jshint esversion:8 */
/* jshint -W027 */

const RiptideLab = (function(){
  return {Card};


  function Card(cardName) {
    return {getImageURI};


    async function getImageURI() {
      const cardDetails = await getDetails();
      return cardDetails.imageURI;
    }


    async function getDetails() {
      return await RiptideLab.cardService.getCard(cardName);
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

    const externalCard = await getCardFromExternalService(cardName);
    return translateToRiptideLab(externalCard);
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
