import {ui} from './ui.js';
import {Card} from './Card.js';
import {CardViewer} from './CardViewer.js';
import {applyTooltipContentStyle} from './constants.js';

const Tooltip = (function(){
  const tooltipElement = document.createElement('div');
  tooltipElement.style.position = 'absolute';
  tooltipElement.style.display = 'none';
  tooltipElement.style.zIndex = '500';
  let lastRequestedCardName = null;
  let shownCard = null;

  return {
    show(options) {
      showCard(options);
      tooltipElement.style.display = '';
      document.body.appendChild(tooltipElement);
      updatePosition(options);
    },
    hide() {
      tooltipElement.style.display = 'none';
      shownCard = null;
    }
  };

  async function showCard(options) {
    updatePosition(options);
    const cardName = options.event.target?.dataset?.cardName;
    if (lastRequestedCardName !== cardName) {
      lastRequestedCardName = cardName;
      showLoadingMessage();
      const card = await Card(cardName);
      if (!card || lastRequestedCardName !== cardName || shownCard === cardName)
        return;
      const viewer = CardViewer(card, options);
      replaceTooltipContent(viewer);
      updatePosition(options);
      shownCard = cardName;
    }
  }

  function updatePosition({event}) {
    if (event) // a mouse-event to put the tooltip next to
      fitToScreen(event);
  }

  function fitToScreen(event) {
    let posX = ui.getLeft(event);
    let posY = ui.getTop(event);
    const [scrollX, scrollY] = ui.scrollOffsets();
    const viewport = ui.viewportSize();
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
    applyTooltipContentStyle(message);
    replaceTooltipContent(message);
  }
})();



// ====================================================
//                 Add event handlers
// ====================================================

function addTooltipHandlers() {
  let currentTooltippedElement = null;

  ui.addTapListener(document, function(event) {
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


  function showTooltip(event, isTouch?) {
    currentTooltippedElement = event.target;
    Tooltip.show({event, isTouch});
  }

  function hideTooltip() {
    Tooltip.hide();
    currentTooltippedElement = null;
  }
}

export {addTooltipHandlers};
