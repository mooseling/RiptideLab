RiptideLab.CardViewer = function(card, {isTouch, embedded, small, inCubedeck} = {}) {
    const cardIMG = createCardIMG();
    if (embedded) {
      if (inCubedeck) {
        const anchor = createCardLink();
        anchor.appendChild(cardIMG);
        return anchor;
      }

      return cardIMG;
    }

    // ...must be a tooltip tooltip
    const viewer = document.createElement('div');
    viewer.appendChild(cardIMG);
    viewer.style = RiptideLab.tooltipContentStyle;
    if (isTouch)
      viewer.appendChild(createDetailsButton());
    return viewer;


  function createCardIMG() {
    const img = document.createElement('img');
    // Fix the aspect ratio at 61:85, which magic cards should be
    // Fixed dimensions mean we can position the tooltip before the image has loaded
    if (embedded) {
      if (small) {
        img.style.width = '167px';
        img.style.height = '233.163px';
      } else if (inCubedeck) {
        img.style.width = '160px';
        img.style.height = '222.951px';
      } else {
        img.style.width = '223px';
        img.style.height = '311.35px';
      }
    } else { // Tooltip
      img.style.width = '192.15pt';
      img.style.height = '267.75pt';
    }
    img.style.maxWidth = 'unset'; // I think other RL css is clashing here
    img.src = card.imageURI;
    return img;
  }

  function createDetailsButton() {
    const anchor = createCardLink();
    anchor.text = 'More details';
    const button = document.createElement('div');
    button.style.marginTop = '5pt';
    button.appendChild(anchor);
    return button;
  }

  function createCardLink() {
    const anchor = document.createElement('a');
    anchor.href = card.uri;
    anchor.target = '_blank';
    return anchor;
  }
};
