const RiptideLab = (function() {
  return {Card};


  function Card(cardName) {
    return {getImageURI};


    async function getImageURI() {
      const cardDetails = await getDetails();
      return cardDetails.imageURI;
    }


    async function getDetails() {
      return await RiptideLab.cardService.getCard(cardName);
    }
  }
}());
