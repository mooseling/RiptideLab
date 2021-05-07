RiptideLab.CardTooltip = (function(){
  let tooltipWrapper;
  return construct;

  function construct(imageURI, targetElement) {
    const wrapper = getWrapper();
    wrapper.innerHTML = '';
    const tooltipElement = createTooltipElement(imageURI);
    wrapper.appendChild(tooltipElement);
    return Tooltip(targetElement, tooltipElement);
  }


  function getWrapper() {
    if (!tooltipWrapper)
      createWrapper();
    return tooltipWrapper;
  }


  function createWrapper() {
    const wrapper = document.createElement('div');
    wrapper.id = 'card-tooltip-wrapper';
    document.body.appendChild(wrapper);
    tooltipWrapper = wrapper;
  }


  function createTooltipElement(imageURI) {
    const img = document.createElement('img');
    img.src = imageURI;
    img.id = 'card-tooltip';
    return img;
  }


  function Tooltip(targetElement, tooltipElement) {
    const popper = Popper.createPopper(targetElement, tooltipElement);
    return {show, hide};

    function show() {
      tooltipElement.setAttribute('data-show', '');

      popper.setOptions({
        modifiers: [{ name: 'eventListeners', enabled: true }],
      });

      popper.update();
    }

    function hide() {
      tooltipElement.removeAttribute('data-show');

      popper.setOptions({
        modifiers: [{ name: 'eventListeners', enabled: false }],
      });
    }
  }
})();
