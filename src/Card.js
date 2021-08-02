RiptideLab.Card = (function() {
  class Card {
    constructor({name, imageURI, uri, isNoCard}) {
      this.name = name;
      this.imageURI = imageURI;
      this.uri = uri;
      this.isNoCard = Boolean(isNoCard);
    }
  }

  async function build(cardName) {
    const cardDetails = await RiptideLab.CardService.getCard(cardName);
    return new Card(cardDetails);
  }

  return build;
})();
