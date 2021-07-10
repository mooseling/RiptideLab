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

  function update({card, html, top, left, event}) {
    if (html !== undefined)
      tooltipElement.innerHTML = html;
    else if (card)
      showCard(card);

    if (event) { // a mouse-event to put the tooltip next to
      setPositionFromEvent(event);
    } else {
      if (top !== undefined)
        tooltipElement.style.top = top;
      if (left !== undefined)
        tooltipElement.style.left = left;
    }
  }

  function hide() {
    tooltipElement.style.display = 'none';
  }

  async function showCard(card) {
    tooltipElement.innerHTML = '';
    const imageURI = await card.getImageURI();
    const img = document.createElement('img');
    img.style.width = '200pt';
    img.src = imageURI;
    tooltipElement.appendChild(img);
  }

  function setPositionFromEvent(event) {
    tooltipElement.style.top = getTop(event) + 8;
    tooltipElement.style.left = getLeft(event) + 8;
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
