RiptideLab.Card = function(cardName) {
  return {getViewer};

  async function getViewer() {
    const imageURI = await getImageURI();
    const img = document.createElement('img');
    img.style.width = '200pt';
    img.src = imageURI;
    return img;
  }

  async function getImageURI() {
    const cardDetails = await getDetails();
    return cardDetails.imageURI;
  }

  async function getDetails() {
    return await RiptideLab.cardService.getCard(cardName);
  }
};
