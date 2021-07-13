RiptideLab.Tooltip = (function(){
  const tooltipElement = document.createElement('div');
  tooltipElement.style.position = 'fixed';
  tooltipElement.style.display = 'none';

  return {show, hide, update};

  function show(options) {
    if (options)
      update(options);
    tooltipElement.style.display = '';
    document.body.appendChild(tooltipElement);
  }

  function update(options) {
    updateContent(options);
    updatePosition(options);
  }

  function updateContent({html, card}) {
    if (html !== undefined)
      tooltipElement.innerHTML = html;
    else if (card)
      showCard(card);
  }

  async function showCard(card) {
    tooltipElement.innerHTML = '';
    const viewer = await card.getViewer();
    tooltipElement.appendChild(viewer);
  }

  function updatePosition({top, left, event}) {
    if (event) { // a mouse-event to put the tooltip next to
      setPositionFromEvent(event);
    } else {
      if (top !== undefined)
        tooltipElement.style.top = top;
      if (left !== undefined)
        tooltipElement.style.left = left;
    }
  }

  function setPositionFromEvent(event) {
    const eventTop = getTop(event);
    const eventLeft = getLeft(event);
    const newCoords = fitToScreen(eventLeft, eventTop);
    tooltipElement.style.top = newCoords[1]; // + 8;
    tooltipElement.style.left = newCoords[0]; // + 8;
  }

  function getLeft(event) {
    if (event.pageX !== undefined)
      return event.pageX;

    const docElement = document.documentElement;
    const scrollLeft = document.body?.scrollLeft || 0;
    return (event.clientX +
      (docElement.scrollLeft || scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function getTop(event) {
    if (event.pageY !== undefined)
      return event.pageY;

    const docElement = document.documentElement;
    const scrollTop = document.body?.scrollTop || 0;
    return (event.clientY +
      (docElement.scrollTop || scrollTop) -
      (docElement.clientTop || 0));
  }

  function hide() {
    tooltipElement.style.display = 'none';
  }





  function fitToScreen(posX, posY) {
    const scroll = scrollOffsets();
    const viewport = viewportSize();
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

  function scrollOffsets() {
    return [
      window.visualViewport
        ? window.visualViewport.pageLeft
        : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.visualViewport
        ? window.visualViewport.pageTop
        : window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    ];
  }

  function viewportSize () {
    if (window.visualViewport)
      return [window.visualViewport.width, window.visualViewport.height];

    let ua = navigator.userAgent, rootElement;
    if (ua.indexOf('AppleWebKit/') > -1 && !document.evaluate) {
      rootElement = document;
    } else if (Object.prototype.toString.call(window.opera) === '[object Opera]' && window.parseFloat(window.opera.version()) < 9.5) {
      rootElement = document.body;
    } else {
      rootElement = document.documentElement;
    }

    // IE8 in quirks mode returns 0 for these sizes
    const size = [rootElement.clientWidth, rootElement.clientHeight];
    if (size[1] === 0) {
      return [document.body.clientWidth, document.body.clientHeight];
    } else {
      return size;
    }
  }
})();



// ====================================================
//                 Add event handlers
// ====================================================

(function() {
  let lastTouchedCardTag = null;
  let currentTooltippedElement = null;

  document.addEventListener('touchstart', function(event) {
    const element = event.target;
    if (element.classList.contains('card-hover'))
      lastTouchedCardTag = element;
  });

  document.addEventListener('click', function(event) {
    const element = event.target;
    if (lastTouchedCardTag) {
      if (element === lastTouchedCardTag) {
        if (needsTooltip(element))
          showTooltip(event);
      } else {
        hideTooltip();
      }
    }
  });

  document.addEventListener('mouseover', function(event) {
    const element = event.target;
    if (!needsTooltip(element))
      return;
    showTooltip(event);
  });

  document.addEventListener('mouseout', function(event) {
    const element = event.target;
    if (element === currentTooltippedElement)
      hideTooltip();
  });

  document.addEventListener('mousemove', function(event) {
    const element = event.target;
    if (!isCardTag(element))
      return;
    RiptideLab.Tooltip.update({event});
  });


  function needsTooltip(element) {
    return isCardTag(element) && currentTooltippedElement !== element;
  }

  function isCardTag(element) {
    if (element?.classList.contains('card-hover'))
      return true;
    return false;
  }


  function showTooltip(event) {
    const element = event.target;
    const card = RiptideLab.Card(element.dataset.cardName);
    RiptideLab.Tooltip.show({card, event});
    currentTooltippedElement = element;
  }

  function hideTooltip() {
    RiptideLab.Tooltip.hide();
    currentTooltippedElement = null;
  }
})();
