RiptideLab.CardService = (function(){
  const cardCache = CardCache();
  const externalService = ExternalService();
  const queue = RateLimitingQueue();

  return {getCard};


  async function getCard(cardName) {
    cardName = cardName.toLowerCase();
    const cachedCard = cardCache.get(cardName);
    if (cachedCard)
      return translateToRiptideLab(cardName, cachedCard);

    if (queue.isTooSoon()) {
      await queue.wait();
      return getCard(cardName);
    }

    queue.stampTime();
    const externalCard = await externalService.get(cardName);
    const returnedCardName = externalCard.name.toLowerCase();
    if (cardName !== returnedCardName) // Must be fuzzy matched (or double face, but that's fine)
      cardCache.addFuzzy(cardName, returnedCardName, externalCard);
    else
      cardCache.add(cardName, externalCard);
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
  function ExternalService() {
    return {get};


    async function get(cardName) {
      let card;

      // When a card is not found, Scryfall returns a json response and a 404 status
      try {
        const response = await fetch('https://api.scryfall.com/cards/named?fuzzy=' + encodeURIComponent(cardName));
        card = await response.json(); // Had issues with blank responses on Edge
      } catch (error) {} // If such a thing happens, we just move on

      if (!isValid(card))
        card = getNoCard(cardName);

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


  // ====================================================
  //                     RateLimitingQueue
  // ====================================================
  function RateLimitingQueue() {
    const interval = 100;
    let lastTimeStamp = null;
    let queueHandler = null;
    const queue = [];

    return {isTooSoon, stampTime, wait};


    function isTooSoon() {
      return getTimeLeft() > 0;
    }

    function stampTime() {
      lastTimeStamp = Date.now();
    }

    function wait() {
      const queueMember = {};
      const promise = new Promise(resolve => queueMember.resolve = resolve);
      queueMember.promise = promise;
      queue.push(queueMember);
      if (queueHandler === null)
        queueHandler = setTimeout(handleQueue, getTimeLeft());
      return promise;
    }

    function handleQueue() {
      const timeLeft = getTimeLeft();
      if (timeLeft > 0)
        return setTimeout(handleQueue, timeLeft);

      const firstQueueMember = queue[0];
      queue.shift();
      firstQueueMember.resolve();
      if (queue.length)
        queueHandler = setTimeout(handleQueue, getTimeLeft());
      else
        queueHandler = null;
    }

    function getTimeLeft() {
      if (lastTimeStamp === null)
        return 0;
      return lastTimeStamp + interval - Date.now();
    }
  }
}());
