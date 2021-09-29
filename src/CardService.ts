interface ScryfallCard {
  name: string,
  scryfall_uri: string,
  image_uris?: {
    normal: string
  },
  card_faces?: [ScryfallCard],
  isNoCard?: boolean
}

interface CardPrecursor {
  name: string,
  uri: string,
  imageURI: string,
  isNoCard?: boolean
}



const CardService = (function(){
  const cardCache = CardCache();
  const externalService = ExternalService();
  const rateLimiter = RateLimiter();
  const currentFetches = {};

  return {getCard};


  async function getCard(cardName: string) {
    cardName = cardName.toLowerCase();
    const externalCard = await getExternalCard(cardName);
    return translateToRiptideLab(cardName, externalCard);
  }

  async function getExternalCard(cardName: string) {
    const cachedCard = cardCache.get(cardName);
    if (cachedCard)
      return cachedCard;

    if (rateLimiter.isTooSoon()) {
      await rateLimiter.waitMyTurn();
      return getExternalCard(cardName); // Start from the top so we check the cache again
    } if (currentFetches[cardName]) {
      await currentFetches[cardName];
      return getExternalCard(cardName); // Original fetch has cached the card
    }

    rateLimiter.stampTime();
    const cardFetch = currentFetches[cardName] = externalService.get(cardName);
    const externalCard = await cardFetch;
    cardCache.add(cardName, externalCard);
    delete currentFetches[cardName];
    return externalCard;
  }


  function translateToRiptideLab(cardName: string, cardObject: ScryfallCard): CardPrecursor {
    const riptideCard: any = {
      name: cardObject.name,
      uri: cardObject.scryfall_uri
    };
    // We need to deal with split cards and double-faced cards
    // Double-faced:
    // --> DO NOT have image_uris
    // --> DO have card_faces, and image_uris are contained within
    // Split cards: (includes adventures)
    // --> DO have image_uris
    // --> DO have card_faces, but with no image_uris
    if (cardObject.image_uris) { // Must be a normal or split
      riptideCard.imageURI = cardObject.image_uris.normal;
    } else if (cardObject.card_faces) { // Must be double-faced
      const correctFace = getCorrectFace(cardName, cardObject.card_faces);
      riptideCard.name = correctFace.name;
      riptideCard.imageURI = correctFace.image_uris?.normal;
    }
    if (cardObject.isNoCard)
      riptideCard.isNoCard = true;
    return riptideCard;
  }

  function getCorrectFace(cardName: string, cardFaces: [ScryfallCard]) {
    for (const cardFace of cardFaces) {
      if (cardFace.name && cardFace.name.toLowerCase() === cardName)
        return cardFace;
    }
    return cardFaces[0];
  }
})();



  // ====================================================
  //                     Card Cache
  // ====================================================

  function CardCache() {
    if (typeof localStorage !== 'undefined') {
      return createLocalStorageCache();
    } else {
      const cache = {};
      return {
        add(cardName: string, card: ScryfallCard) {
          cache[cardName] = card;
        },
        get(cardName: string) {
          return cache[cardName];
        }
      };
    }

    function createLocalStorageCache() {
      const memoryCache = {};
      cleanCache();

      return {
        add(cardName: string, card: ScryfallCard) {
          const exactName = card.name.toLowerCase();
          if (cardName !== exactName) // Fuzzy matched or double faced
            addFuzzy(cardName, exactName, card);
          else
            addExact(cardName, card);
        },
        get(cardName: string) {
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

      function addExact(cardName:string, card: ScryfallCard) {
        if (card.isNoCard) {
          memoryCache[cardName] = card;
        } else {
          localStorage.setItem(`RiptideLab--${cardName}`, JSON.stringify(card));
          localStorage.setItem(`RiptideLab--${cardName}-timestamp`, Date.now().toString()); // Explicitly call toString so TypeScript is happy
        }
      }

      function addFuzzy(cardName: string, exactName: string, card: ScryfallCard) {
        // Card should always be a valid card because of how this is called, but
        // for safetly and extensibility...
        if (card.isNoCard) {
          memoryCache[cardName] = card;
        } else {
          const timeNow = Date.now().toString(); // Explicitly call toString so TypeScript is happy
          localStorage.setItem(`RiptideLab--${exactName}`, JSON.stringify(card));
          localStorage.setItem(`RiptideLab--${exactName}-timestamp`, timeNow);
          // Fuzzy name can reference the exactName
          localStorage.setItem(`RiptideLab--${cardName}`, `fuzzyReference--${exactName}`);
          localStorage.setItem(`RiptideLab--${cardName}-timestamp`, timeNow);
        }
      }

      function cleanCache() {
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key) && isCacheTimeStamp(key)) {
            const timestamp = parseInt(localStorage.getItem(key));
            if (Date.now() - timestamp > 2419200000) { // 4 weeks
              localStorage.removeItem(key);
              localStorage.removeItem(key.slice(0, -10));
            }
          }
        }
      }

      function isCacheTimeStamp(string: string) {
        return string.startsWith('RiptideLab--') && string.endsWith('-timestamp');
      }

      function getFromFuzzyReference(fuzzyReference: string) {
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


  async function get(cardName: string) {
    let card: ScryfallCard;

    // When a card is not found, Scryfall returns a json response and a 404 status
    try {
      const response = await fetch('https://api.scryfall.com/cards/named?fuzzy=' + encodeURIComponent(cardName));
      card = await response.json(); // Had issues with blank responses on Edge
    } catch (error) {} // If such a thing happens, we just move on

    if (isValid(card))
      card = getLessDetailed(card); // Remove unused properties, since we're going to cache this
    else
      card = getNoCard(cardName);

    return card;
  }

  function isValid(card: ScryfallCard) {
    return Boolean(card?.name && card.scryfall_uri && (card.image_uris?.normal || card.card_faces));
  }

  function getLessDetailed(card: ScryfallCard) {
    const {name, scryfall_uri, image_uris, card_faces} = card;
    const trimmedCard: ScryfallCard = {name, scryfall_uri, image_uris};
    if (card_faces)
      trimmedCard.card_faces = card_faces;
    return trimmedCard;
  }

  // A no-card must pass isValid()
  function getNoCard(cardName: string) {
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
//                     RateLimiter
// ====================================================

interface QueueMember {
  resolve: (value?: unknown) => void,
  promise: Promise<unknown>
}

function RateLimiter() {
  const interval = 100;
  let lastTimeStamp = null;
  let queueHandler = null;
  const queue:QueueMember[] = [];

  return {isTooSoon, stampTime, waitMyTurn};


  function isTooSoon() {
    return getTimeLeft() > 0;
  }

  function stampTime() {
    lastTimeStamp = Date.now();
  }

  function waitMyTurn() {
    let resolve: (value: unknown) => void;
    const promise = new Promise(r => resolve = r);
    queue.push({resolve, promise});
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

export {CardService};
