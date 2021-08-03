RiptideLab.CardService = (function(){
  const cardCache = CardCache();
  const externalService = ExternalService(cardCache);

  return {getCard};


  async function getCard(cardName) {
    cardName = cardName.toLowerCase();
    const cachedCard = cardCache.get(cardName);
    if (cachedCard)
      return translateToRiptideLab(cardName, cachedCard);

    const externalCard = await externalService.get(cardName);
    return translateToRiptideLab(cardName, externalCard);
  }


  function translateToRiptideLab(cardName, cardObject) {
    const riptideCard = {
      name: cardObject.name,
      uri: cardObject.scryfall_uri,
      imageURI: cardObject.image_uris?.normal
    };
    if (cardObject.card_faces) {
      const correctFace = getCorrectFace(cardName, cardObject.card_faces);
      riptideCard.name = correctFace.name;
      riptideCard.imageURI = correctFace.image_uris?.normal;
    }
    if (cardObject.isNoCard)
      riptideCard.isNoCard = true;

    return riptideCard;
  }

  function getCorrectFace(cardName, cardFaces) {
    for (const cardFace of cardFaces) {
      if (cardFace.name && cardFace.name.toLowerCase() === cardName)
        return cardFace;
    }
    return cardFaces[0];
  }



  // ====================================================
  //                     Card Cache
  // ====================================================

  function CardCache() {
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
        return string.startsWith('RiptideLab--') && string.endsWith('-timestamp');
      }

      function getFromFuzzyReference(fuzzyReference) {
        const cardName = fuzzyReference.slice(16);
        let cardJSON = localStorage.getItem(`RiptideLab--${cardName}`);
        if (cardJSON)
          return JSON.parse(cardJSON);
      }
    }
  }



  // ====================================================
  //                     ExternalService
  // ====================================================
  function ExternalService(cardCache) {
    const baseUrl = 'https://api.scryfall.com';
    return {get};


    async function get(cardName) {
      const endpoint = 'cards/named?fuzzy=' + encodeURIComponent(cardName);
      let card;

      // When a card is not found, Scryfall returns a json response and a 404 status
      try {
        const response = await fetch(`${baseUrl}/${endpoint}`);
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

    function isValid(card) {
      return Boolean(card?.name && card.scryfall_uri && (card.image_uris?.normal || card.card_faces));
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
  }
}());
