RiptideLab.Card = function(cardName) {
  return {getViewer, getCardName};

  async function getViewer({isTouch} = {}) {
    const imageURI = await getImageURI();
    const viewer = createViewer();
    viewer.appendChild(createCardImg(imageURI));
    if (isTouch)
      viewer.appendChild(await createDetailsButton());
    return viewer;
  }

  async function getImageURI() {
    const cardDetails = await getDetails();
    return cardDetails.imageURI;
  }

  async function getDetails() {
    return await RiptideLab.CardService.getCard(cardName);
  }

  function createViewer() {
    const viewer = document.createElement('div');
    viewer.style = RiptideLab.tooltipContentStyle;
    return viewer;
  }

  function createCardImg(imageURI) {
    const img = document.createElement('img');
    img.style.width = '200pt';
    img.style.minHeight = '278.68pt';
    img.src = imageURI;
    return img;
  }

  async function createDetailsButton() {
    const details = await getDetails();
    const anchor = document.createElement('a');
    anchor.href = details.uri;
    anchor.target = '_blank';
    anchor.text = 'More details';
    const button = document.createElement('div');
    button.style.marginTop = '5pt';
    button.appendChild(anchor);
    return button;
  }

  function getCardName() {
    return cardName;
  }
};

RiptideLab.Card.areSame = function(card1, card2) {
  return card1 && card2 && card1.getCardName() === card2.getCardName();
};
