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
    if (cardObject.isNoCard)
      riptideCard.isNoCard = true;

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
      isNoCard:true,
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
      return createLocalStorageCache();
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

    function createLocalStorageCache() {
      const memoryCache = {};
      function isTimedOut(cardName) {
        const timestamp = localStorage.getItem(`RiptideLab--${cardName}-timestamp`);
        return Date.now() - timestamp > 2419200000; // 4 weeks
      }
      function remove(cardName) {
        localStorage.removeItem(`RiptideLab--${cardName}`);
        localStorage.removeItem(`RiptideLab--${cardName}-timestamp`);
      }

      return {
        add(cardName, card) {
          if (card.isNoCard) {
            memoryCache[cardName] = card;
          } else {
            localStorage.setItem(`RiptideLab--${cardName}`, JSON.stringify(card));
            localStorage.setItem(`RiptideLab--${cardName}-timestamp`, Date.now());
          }
        },
        get(cardName) {
          if (memoryCache[cardName])
            return memoryCache[cardName];

          if (isTimedOut(cardName)) {
            remove(cardName);
            return;
          }

          const cardJSON = localStorage.getItem(`RiptideLab--${cardName}`);
          if (cardJSON)
            return JSON.parse(cardJSON);
        }
      };
    }
  }
}());
