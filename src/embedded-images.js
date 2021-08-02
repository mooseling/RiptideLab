(function() {
  async function replaceWithViewer(element) {
    const cardName = element.dataset.cardName;
    const card = await RiptideLab.Card(cardName);
    const viewer = RiptideLab.CardViewer(card, {embedded: true});
    element.replaceWith(viewer);
  }

  document.addEventListener(
    'load',
    async function(event) {
      const img = event.target;
      const classList = img?.classList;
      if (classList && classList.contains('RiptideLab--unloaded-card-image'))
        replaceWithViewer(img);
    },
    true // Catch load events during the capture phase, since img loads do not bubble
  );

  document.addEventListener('DOMContentLoaded', function() {
    const elementsToLoad = document.getElementsByClassName('RiptideLab--unloaded-card-image');
    for (const element of elementsToLoad)
      replaceWithViewer(element);
  });
})();
