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
      uri: cardObject?.scryfall_uri,
      imageURI: cardObject?.image_uris?.normal
    };

    return riptideCard;
  }


  async function getCardFromExternalService(cardName) {
    const endpoint = 'cards/named?exact=' + cardName;
    const response = await get(endpoint);
    let card = await response.json();
    if (!isValid(card))
      card = getNoCard(cardName);
    cardCache[cardName] = card;
    return card;
  }


  function get(endpoint) {
    return fetch(`${baseUrl}/${endpoint}`);
  }

  function isValid(card) {
    return Boolean(card?.scryfall_uri && card.image_uris?.normal);
  }

  function getNoCard(cardName) {
    return {
      scryfall_uri:'https://scryfall.com/search?q=' + encodeURIComponent(cardName),
      image_uris:{
        normal:'/card-back.jpg'
      }
    };
  }
}());
