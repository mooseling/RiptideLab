RiptideLab.CardViewer = function(card, {isTouch} = {}) {
  const viewer = document.createElement('div');
  viewer.style = RiptideLab.tooltipContentStyle;
  viewer.appendChild(createCardImg(card.imageURI));
  if (isTouch)
    viewer.appendChild(createDetailsButton());
  return viewer;


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
