(function() {
  // When a user posts, catch load events from images in the new content
  document.addEventListener(
    'load',
    async function(event) {
      const img = event.target;
      if (img?.classList?.contains('RiptideLab--unloaded-card-image'))
        replaceWithViewer(img);
    },
    true // Catch load events during the capture phase, since img loads do not bubble
  );

  // In theory, the listener above will fire on page load
  // But for an unknown reason, it doesn't on the forum
  // So we fire this when the page is ready
  document.addEventListener('DOMContentLoaded', function() {
    const elementsToReplace = document.getElementsByClassName('RiptideLab--unloaded-card-image');
    for (const element of elementsToReplace)
      replaceWithViewer(element);
  });


  async function replaceWithViewer(element) {
    // Prevent double handling elements, which may happen because of our two listeners
    element.classList.remove('RiptideLab--unloaded-card-image');

    element.replaceWith(RiptideLab.CardViewer(
      await RiptideLab.Card(element.dataset.cardName),
      {
        embedded: true,
        small: element.classList.contains('small'),
        inCubedeck: element.classList.contains('in-cubedeck')
      }
    ));
  }
})();
