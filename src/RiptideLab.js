const RiptideLab = (function(){
  return {Card, addHandlerFromScriptTag};


  function Card(cardName) {
    return {getImageURI};


    async function getImageURI() {
      const cardDetails = await getDetails();
      return cardDetails.imageURI;
    }


    async function getDetails() {
      return await RiptideLab.cardService.getCard(cardName);
    }
  }


  async function handleHover(element) {
    const cardName = element.dataset.cardName;
    const card = Card(cardName);
    const imageURI = await card.getImageURI();
    const tooltip = RiptideLab.CardTooltip(imageURI, element);
    tooltip.show();
    const leaveListener = () => {
      tooltip.hide();
      element.removeEventListener('mouseleave', leaveListener);
      element.removeEventListener('blur', leaveListener);
    };
    element.addEventListener('mouseleave', leaveListener);
    element.addEventListener('blur', leaveListener);
  }

  function addHandlers(element) {
    element.addEventListener('mouseenter', () => handleHover(element));
    element.addEventListener('focus', () => handleHover(element));
  }


  function addHandlerFromScriptTag() {
    const scriptElement = document.currentScript;
    const bbcodeElement = scriptElement.parentElement;
    addHandlers(bbcodeElement);
  }
}());
