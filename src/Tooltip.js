RiptideLab.Tooltip = (function(){
  const tooltipElement = document.createElement('div');
  tooltipElement.style.position = 'absolute';
  tooltipElement.style.display = 'none';
  tooltipElement.style.zIndex = '500';
  const props = {
    isTouch:false
  };
  let currentCard = null;

  return {show, hide, props};

  function show(options) {
    if (options)
      update(options);
    tooltipElement.style.display = '';
    document.body.appendChild(tooltipElement);
    updatePosition(options);
  }

  function update(options) {
    updateProps(options);
    updateContent(options);
  }

  function updateProps({isTouch}) {
    props.isTouch = Boolean(isTouch); // We want to convert undefined to false
  }

  function updateContent({card, event}) {
    if (card)
      showCard(card, event);
  }

  async function showCard(card, event) {
    if (RiptideLab.Card.areSame(card, currentCard))
      return;
    currentCard = card;
    replaceTooltipContent(createLoadingMessage());
    const viewer = await card.getViewer({isTouch:props.isTouch});
    if (RiptideLab.Card.areSame(card, currentCard)) {
      replaceTooltipContent(viewer);
      updatePosition({event});
    }
  }

  function updatePosition({event}) {
    if (event) { // a mouse-event to put the tooltip next to
      const eventTop = RiptideLab.ui.getTop(event);
      const eventLeft = RiptideLab.ui.getLeft(event);
      const newCoords = fitToScreen(eventLeft, eventTop);
      tooltipElement.style.top = newCoords[1] + 'px';
      tooltipElement.style.left = newCoords[0] + 'px';
    }
  }

  function hide() {
    tooltipElement.style.display = 'none';
  }





  function fitToScreen(posX, posY) {
    const scroll = RiptideLab.ui.scrollOffsets();
    const viewport = RiptideLab.ui.viewportSize();
    const {offsetWidth, offsetHeight} = tooltipElement;

    posX += 8; // Offset from cursor a little

    /* decide if we need to switch sides for the tooltip */
    /* too big for X */
    if ((posX + offsetWidth - scroll[0]) >= (viewport[0] - 15))
      posX = posX - offsetWidth - 20;
    /* too far left */
    if (posX < scroll[0] + 15)
      posX = scroll[0] + 15;
    /* If it's too high, we move it down. */
    if (posY - scroll[1] < 0)
      posY += scroll[1] - posY + 5;
    /* If it's too low, we move it up. */
    if (posY + offsetHeight - scroll[1] > viewport[1])
      posY -= posY + offsetHeight + 5 - scroll[1] - viewport[1];

    return [posX, posY];
  }

  function replaceTooltipContent(newContent) {
    tooltipElement.innerHTML = '';
    tooltipElement.appendChild(newContent);
  }

  function createLoadingMessage() {
    const message = document.createElement('div');
    message.innerHTML = 'Loading...';
    message.style = RiptideLab.tooltipContentStyle;
    return message;
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
      showTooltip(event, {isTouch:true});
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
    const element = event.target;
    const card = RiptideLab.Card(element.dataset.cardName);
    currentTooltippedElement = element;
    RiptideLab.Tooltip.show({card, event, isTouch});
  }

  function hideTooltip() {
    RiptideLab.Tooltip.hide();
    currentTooltippedElement = null;
  }
})();
