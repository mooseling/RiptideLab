declare global {
  interface Window {
    opera: any;
  }
}

const ui = {
  getLeft(event) {
    if (event.pageX !== undefined)
      return event.pageX;

    if (event.touches?.[0]?.pageX !== undefined)
      return event.touches[0].pageX;

    if (event.changedTouches?.[0]?.pageX !== undefined)
      return event.changedTouches[0].pageX;

    const docElement = document.documentElement;
    const scrollLeft = document.body?.scrollLeft || 0;
    return (event.clientX +
      (docElement.scrollLeft || scrollLeft) -
      (docElement.clientLeft || 0));
  },
  getTop(event) {
    if (event.pageY !== undefined)
      return event.pageY;

    if (event.touches?.[0]?.pageY !== undefined)
      return event.touches[0].pageY;

    if (event.changedTouches?.[0]?.pageY !== undefined)
      return event.changedTouches[0].pageY;

    const docElement = document.documentElement;
    const scrollTop = document.body?.scrollTop || 0;
    return (event.clientY +
      (docElement.scrollTop || scrollTop) -
      (docElement.clientTop || 0));
  },
  scrollOffsets() {
    return [
      window.visualViewport
        ? window.visualViewport.pageLeft
        : window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.visualViewport
        ? window.visualViewport.pageTop
        : window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop
    ];
  },
  viewportSize() {
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
  },
  addTapListener(element, handler) {
    let startLeft, startTop;

    element.addEventListener('touchstart', function (event) {
      setCoordinates(event);
    });
    element.addEventListener('touchend', function (event) {
      if (wasNoMovement(event))
        handler.call(this, event);
    });

    function setCoordinates(event) {
      startLeft = ui.getLeft(event);
      startTop = ui.getTop(event);
    }

    function wasNoMovement(event) {
      const newLeft = ui.getLeft(event);
      const newTop = ui.getTop(event);
      return newLeft === startLeft && newTop === startTop;
    }
  }
};

export {ui};
