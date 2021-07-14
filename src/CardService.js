RiptideLab.CardService = (function(){
  const baseUrl = 'https://api.scryfall.com';
  const cardCache = initCardCache();

  return {getCard};


  async function getCard(cardName) {
    if (cardCache.get(cardName))
      return translateToRiptideLab(cardCache.get(cardName));

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
    cardCache.add(cardName, card);
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



  // ====================================================
  //                     Card Cache
  // ====================================================

  function initCardCache() {
    const cache = {};
    return {add, get};

    function add(cardName, card) {
      cache[cardName] = card;
    }

    function get(cardName) {
      return cache[cardName];
    }
  }
}());
