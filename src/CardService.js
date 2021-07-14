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
    if (typeof localStorage !== 'undefined') {
      const cache = {
        isTimedOut(cardName) {
          const timestamp = localStorage.getItem(`${cardName}-timestamp`);
          return Date.now() - timestamp > 3600000;
        },
        remove(cardName) {
          localStorage.removeItem(cardName);
          localStorage.removeItem(`${cardName}-timestamp`);
        }
      };

      return {
        add(cardName, card) {
          localStorage.setItem(cardName, JSON.stringify(card));
          localStorage.setItem(`${cardName}-timestamp`, Date.now());
        },
        get(cardName) {
          if (cache.isTimedOut(cardName)) {
            cache.remove(cardName);
            return;
          }

          const cardJSON = localStorage.getItem(cardName);
          if (cardJSON)
            return JSON.parse(cardJSON);
        }
      };
    } else {
      const cache = {};
      return {
        add(cardName, card) {
          cache[cardName] = card;
        },
        get(cardName) {
          return cache[cardName];
        }
      };
    }
  }
}());
