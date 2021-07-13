RiptideLab.Card = function(cardName) {
  return {getViewer};

  async function getViewer() {
    const imageURI = await getImageURI();
    const viewer = createViewer();
    viewer.appendChild(createCardImg(imageURI));
    return viewer;
  }

  async function getImageURI() {
    const cardDetails = await getDetails();
    return cardDetails.imageURI;
  }

  async function getDetails() {
    return await RiptideLab.cardService.getCard(cardName);
  }

  function createViewer() {
    const viewer = document.createElement('div');
    viewer.style = 'display:inline-block;background-color:#f7f7f7;padding:8pt;border-color:#ccc';
    return viewer;
  }

  function createCardImg(imageURI) {
    const img = document.createElement('img');
    img.style.width = '200pt';
    img.src = imageURI;
    return img;
  }
};
