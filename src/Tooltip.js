RiptideLab.Tooltip = (function(){
  const tooltipElement = document.createElement('div');
  tooltipElement.style.position = 'fixed';
  tooltipElement.style.display = 'none';
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
    replaceContent(tooltipElement, createLoadingMessage());
    const viewer = await card.getViewer({isTouch:props.isTouch});
    if (RiptideLab.Card.areSame(card, currentCard)) {
      replaceContent(tooltipElement, viewer);
      updatePosition({event});
    }
  }

  function updatePosition({event}) {
    if (event) // a mouse-event to put the tooltip next to
      setPositionFromEvent(event);
  }

  function setPositionFromEvent(event) {
    const eventTop = getTop(event);
    const eventLeft = getLeft(event);
    const newCoords = fitToScreen(eventLeft, eventTop);
    tooltipElement.style.top = newCoords[1] + 'px';
    tooltipElement.style.left = newCoords[0] + 'px';
  }

  function getLeft(event) {
    if (event.pageX !== undefined)
      return event.pageX;

    if (event.touches?.[0].pageX !== undefined)
      return event.touches?.[0].pageX;

    const docElement = document.documentElement;
    const scrollLeft = document.body?.scrollLeft || 0;
    return (event.clientX +
      (docElement.scrollLeft || scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function getTop(event) {
    if (event.pageY !== undefined)
      return event.pageY;

    if (event.touches?.[0].pageY !== undefined)
      return event.touches?.[0].pageY;

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

  function replaceContent(element, newContent) {
    element.innerHTML = '';
    element.appendChild(newContent);
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

  document.addEventListener('touchstart', function(event) {
    if (needsTooltip(event)) {
      event.preventDefault();
      showTooltip(event, {isTouch:true});
    }
  }, {passive:false});

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
