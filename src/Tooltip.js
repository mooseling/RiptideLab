RiptideLab.Tooltip = (function(){
  const tooltipElement = document.createElement('div');
  tooltipElement.style = 'position:absolute;display:none;z-index:500';
  let isTouch = false;
  let lastRequestedCardName = null;
  let shownCard = null;

  return {
    show(options) {
      if (options)
        update(options);
      tooltipElement.style.display = '';
      document.body.appendChild(tooltipElement);
      updatePosition(options);
    },
    hide() {
      tooltipElement.style.display = 'none';
      shownCard = null;
    }
  };



  function update({isTouch, event}) {
    isTouch = Boolean(isTouch); // We want to convert undefined to false
    showCard(event);
  }

  async function showCard(event) {
    updatePosition({event});
    const cardName = event.target?.dataset?.cardName;
    if (lastRequestedCardName !== cardName) {
      lastRequestedCardName = cardName;
      showLoadingMessage();
      const card = await RiptideLab.Card(cardName);
      if (!card || lastRequestedCardName !== cardName || shownCard === cardName)
        return;
      const viewer = RiptideLab.CardViewer(card, {isTouch});
      replaceTooltipContent(viewer);
      updatePosition({event});
      shownCard = cardName;
    }
  }

  function updatePosition({event}) {
    if (event) // a mouse-event to put the tooltip next to
      fitToScreen(event);
  }

  function fitToScreen(event) {
    let posX = RiptideLab.ui.getLeft(event);
    let posY = RiptideLab.ui.getTop(event);
    const [scrollX, scrollY] = RiptideLab.ui.scrollOffsets();
    const viewport = RiptideLab.ui.viewportSize();
    const {offsetWidth, offsetHeight} = tooltipElement;

    posX += 8; // Offset from cursor a little

    // decide if we need to switch sides for the tooltip
    if ((posX + offsetWidth - scrollX) >= (viewport[0] - 15))
      posX = posX - offsetWidth - 20;
    if (posX < scrollX + 15) // too far left
      posX = scrollX + 15;

    // If it's too high, we move it down.
    if (posY - scrollY < 0)
      posY += scrollY - posY + 5;
    // If it's too low, we move it up.
    if (posY + offsetHeight - scrollY > viewport[1])
      posY -= posY + offsetHeight + 5 - scrollY - viewport[1];

    tooltipElement.style.left = posX + 'px';
    tooltipElement.style.top = posY + 'px';
  }

  function replaceTooltipContent(newContent) {
    tooltipElement.innerHTML = '';
    tooltipElement.appendChild(newContent);
  }

  function showLoadingMessage() {
    const message = document.createElement('div');
    message.innerHTML = 'Loading...';
    message.style = RiptideLab.tooltipContentStyle;
    replaceTooltipContent(message);
  }
})();



// ====================================================
//                 Add event handlers
// ====================================================

(function() {
  let currentTooltippedElement = null;

  RiptideLab.ui.addTapListener(document, function(event) {
    if (needsTooltip(event)) {
      event.preventDefault();
      showTooltip(event, true); // second param is isTouch
    }
  });

  document.addEventListener('click', function() {
    hideTooltip();
  });

  document.addEventListener('mouseover', function(event) {
    if (needsTooltip(event))
      showTooltip(event);
  });

  document.addEventListener('mouseout', function(event) {
    if (event.target === currentTooltippedElement)
      hideTooltip();
  });

  document.addEventListener('mousemove', function(event) {
    if (isCardTag(event.target))
      showTooltip(event);
  });


  function needsTooltip(event) {
    const element = event.target;
    return isCardTag(element) && currentTooltippedElement !== element;
  }

  function isCardTag(element) {
    if (element?.classList.contains('RiptideLab--card-hover'))
      return true;
    return false;
  }


  function showTooltip(event, isTouch) {
    currentTooltippedElement = event.target;
    RiptideLab.Tooltip.show({event, isTouch});
  }

  function hideTooltip() {
    RiptideLab.Tooltip.hide();
    currentTooltippedElement = null;
  }
})();
