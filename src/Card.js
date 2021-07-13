RiptideLab.Card = function(cardName) {
  return {getImageURI};

  async function getImageURI() {
    const cardDetails = await getDetails();
    return cardDetails.imageURI;
  }

  async function getDetails() {
    return await RiptideLab.cardService.getCard(cardName);
  }
};
