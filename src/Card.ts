import {CardService} from "./CardService.js";


const Card = (function() {
  class Card {
    name: string;
    imageURI: string;
    uri: string;
    isNoCard: boolean;

    constructor({name, imageURI, uri, isNoCard}) {
      this.name = name;
      this.imageURI = imageURI;
      this.uri = uri;
      this.isNoCard = Boolean(isNoCard);
    }
  }

  async function build(cardName: string) {
    const cardDetails = await CardService.getCard(cardName);
    return new Card(cardDetails);
  }

  return build;
})();


export {Card};
