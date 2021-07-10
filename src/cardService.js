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
      imageURI: cardObject?.image_uris?.normal
    };

    return riptideCard;
  }


  async function getCardFromExternalService(cardName) {
    const endpoint = 'cards/named?exact=' + cardName;

    const response = await get(endpoint);
    const card = cardCache[cardName] = await response.json();
    return card;
  }


  function get(endpoint) {
    return fetch(`${baseUrl}/${endpoint}`);
  }
}());
