RiptideLab.CardViewer = function(card, {isTouch, embedded} = {}) {
  const cardIMG = createCardIMG(card.imageURI);
  if (embedded) {
    cardIMG.style.width = '223px';
    cardIMG.style.height = '311.35px';
    return cardIMG;
  } else { // Tooltips
    const viewer = document.createElement('div');
    viewer.appendChild(cardIMG);
    viewer.style = RiptideLab.tooltipContentStyle;
    if (isTouch)
      viewer.appendChild(createDetailsButton());
    viewer.onLoad = function(callback) {
      cardIMG.onLoad = callback;
    };
    return viewer;
  }


  function createCardIMG(imageURI) {
    const img = document.createElement('img');
    // Fix the aspect ratio at 61:85, which magic cards should be
    // Fixed dimensions mean we can position the tooltip before the image has loaded
    img.style.width = '192.15pt';
    img.style.height = '267.75pt';
    img.style.maxWidth = 'unset'; // I think other RL css is clashing here
    img.src = imageURI;
    return img;
  }

  function createDetailsButton() {
    const anchor = document.createElement('a');
    anchor.href = card.uri;
    anchor.target = '_blank';
    anchor.text = 'More details';
    const button = document.createElement('div');
    button.style.marginTop = '5pt';
    button.appendChild(anchor);
    return button;
  }
};
