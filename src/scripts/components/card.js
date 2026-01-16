export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoButton },
  currentUserId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCounter = cardElement.querySelector(".card__like-count");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;
  likeCounter.textContent = data.likes.length;
  cardElement.dataset.cardId = data._id;
  infoButton.dataset.id = data._id;

  if (data.likes.some(like => like._id === currentUserId)) {
    likeButton.classList.add("card__like-button_is-active");
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, cardElement.dataset.cardId, likeCounter));
  }

  if (data.owner && data.owner._id === currentUserId) {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(cardElement, data._id);
    });
  } else {
    deleteButton.remove(); 
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  if (onInfoButton) {
    infoButton.addEventListener("click", () => { onInfoButton(data._id)});
  }

  return cardElement;
};
