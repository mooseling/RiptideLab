RiptideLab.CardService = (function(){
  const baseUrl = 'https://api.scryfall.com';
  const cardCache = initCardCache();

  return {getCard};


  async function getCard(cardName) {
    cardName = cardName.toLowerCase();
    const cachedCard = cardCache.get(cardName);
    if (cachedCard)
      return translateToRiptideLab(cachedCard);

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

  // When a card is not found, Scryfall returns a json response and a 404 status
  async function getCardFromExternalService(cardName) {
    const endpoint = 'cards/named?fuzzy=' + encodeURIComponent(cardName);
    let card;

    try {
      const response = await get(endpoint);
      card = await response.json(); // Had issues with blank responses on Edge
    } catch (error) {}

    if (!isValid(card))
      card = getNoCard(cardName);

    // If it is fuzzy matched, then we want to cache the actual card
    const returnedCardName = card.name.toLowerCase();
    if (cardName !== returnedCardName)
      cardCache.addFuzzy(cardName, returnedCardName, card);
    else
      cardCache.add(cardName, card);

    return card;
  }


  function get(endpoint) {
    return fetch(`${baseUrl}/${endpoint}`);
  }

  function isValid(card) {
    return Boolean(card?.name && card.scryfall_uri && card.image_uris?.normal);
  }

  // A no-card must pass isValid()
  function getNoCard(cardName) {
    return {
      name:cardName,
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
      cleanCache();

      return {
        add(cardName, card) {
          if (card.isNoCard) {
            memoryCache[cardName] = card;
          } else {
            localStorage.setItem(`RiptideLab--${cardName}`, JSON.stringify(card));
            localStorage.setItem(`RiptideLab--${cardName}-timestamp`, Date.now());
          }
        },
        addFuzzy(cardName, exactName, card) {
          // Card should always be a valid card because of how this is called, but
          // for safetly and extensibility...
          if (card.isNoCard) {
            memoryCache[cardName] = card;
          } else {
            const timeNow = Date.now();
            localStorage.setItem(`RiptideLab--${exactName}`, JSON.stringify(card));
            localStorage.setItem(`RiptideLab--${exactName}-timestamp`, timeNow);
            // Fuzzy name can reference the exactName
            localStorage.setItem(`RiptideLab--${cardName}`, `fuzzyReference--${exactName}`);
            localStorage.setItem(`RiptideLab--${cardName}-timestamp`, timeNow);
          }
        },
        get(cardName) {
          if (memoryCache[cardName])
            return memoryCache[cardName];
          let cardJSON = localStorage.getItem(`RiptideLab--${cardName}`);
          if (cardJSON) {
            if (cardJSON.startsWith('fuzzyReference--')) // If this is a fuzzy reference, follow it
              return getFromFuzzyReference(cardJSON);
            return JSON.parse(cardJSON);
          }
        }
      };

      function cleanCache() {
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key) && isCacheTimeStamp(key)) {
            const timestamp = localStorage.getItem(key);
            if (Date.now() - timestamp > 2419200000) { // 4 weeks
              localStorage.removeItem(key);
              localStorage.removeItem(key.slice(0, -10));
            }
          }
        }
      }

      function isCacheTimeStamp(string) {
        return string.substr(0,12) === 'RiptideLab--' && string.substr(-10) === '-timestamp';
      }

      function getFromFuzzyReference(fuzzyReference) {
        const cardName = fuzzyReference.slice(16);
        let cardJSON = localStorage.getItem(`RiptideLab--${cardName}`);
        if (cardJSON)
          return JSON.parse(cardJSON);
      }
    }
  }
}());
