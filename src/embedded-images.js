document.addEventListener(
  'load',
  async function(event) {
    const img = event.target;
    const classList = img?.classList;
    if (!classList || !classList.contains('RiptideLab--unloaded-card-image'))
      return;

    const cardName = img.dataset.cardName;
    const card = await RiptideLab.Card(cardName);
    const viewer = RiptideLab.CardViewer(card, {embedded: true});
    img.replaceWith(viewer);
  },
  true // Catch load events during the capture phase, since img loads do not bubble
);
