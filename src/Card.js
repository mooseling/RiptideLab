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
    // Fix the aspect ratio at 61:85, which magic cards should be
    // Fixed dimensions mean we can position the tooltip before the image has loaded
    img.style.width = '192.15pt';
    img.style.height = '267.75pt';
    img.style.maxWidth = 'unset'; // I think other RL css is clashing here
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
