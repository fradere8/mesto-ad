/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import { addNewCard, getUserInfo, setUserAvatar, setUserInfo, getCardList, changeLikeCardStatus, deleteCard } from './components/api.js';
import { createCardElement, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";

import { enableValidation, clearValidation } from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const deleteCardModalWindow = document.querySelector(".popup_type_remove-card");
const deleteCardForm = deleteCardModalWindow.querySelector(".popup__form");

let currentCardElement = null; 
let currentCardId = null;

const infoElementTemplate = document.getElementById("popup-info-definition-template").content;

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = profileForm.querySelector(".popup__button");
  submitButton.textContent = "Сохранение...";

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name,
      profileDescription.textContent = userData.about,
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = "Сохранить"; 
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = avatarForm.querySelector(".popup__button");
  submitButton.textContent = "Сохранение...";

  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`,
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = "Сохранить";
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = cardForm.querySelector(".popup__button");
  submitButton.textContent = "Создание...";

  addNewCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((card) => {
      placesWrap.append(
        createCardElement(
          card,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: (likeButton, cardId, likeCounter) => 
              handleLikeCard(likeButton, cardId, likeCounter),
            onDeleteCard: (cardElement, cardId) => {
              openDeleteWindowPopup(cardElement, cardId)
            },
            onInfoButton: handleInfoClick, 
          },
          currentUserId
        )
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = "Создать";
    });
};

const openDeleteWindowPopup = (cardElement, cardId) => {
  currentCardElement = cardElement;
  currentCardId = cardId;

  openModalWindow(deleteCardModalWindow);
};

const handleDeleteCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = deleteCardForm.querySelector(".popup__button");
  submitButton.textContent = "Удаление...";

  deleteCard(currentCardId)
    .then(() => {
      currentCardElement.remove();
      closeModalWindow(deleteCardModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = "Да";
    });
};

const handleLikeCard = (likeButton, cardId, likeCounter) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  likeButton.disabled = true;

  changeLikeCardStatus(cardId, isLiked)
    .then((updCardData) => {
      likeCounter.textContent = updCardData.likes.length;
      likeButton.classList.toggle("card__like-button_is-active");
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      likeButton.disabled = false;
    });
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoElement = (term, description) => {
  const element = infoElementTemplate.cloneNode(true);
  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;
  return element;
};

const createLikedUserBadge = (user) => {
  const template = document.getElementById("popup-info-user-preview-template");
  if (!template) {
    console.error("Шаблон не найден");
    const fallback = document.createElement("li");
    fallback.textContent = user?.name || "—";
    fallback.classList.add("popup__list-item", "popup__list-item_type_name");
    return fallback;
  }

  if (!user || !user.name) {
    const placeholder = document.createElement("li");
    placeholder.textContent = "—";
    placeholder.classList.add("popup__list-item", "popup__list-item_type_name");
    return placeholder;
  }

  const badge = template.content.cloneNode(true).children[0];
  badge.textContent = user.name;
  return badge;
};

const handleInfoClick = (cardId) => {
  
  const infoModalWindow = document.querySelector(".popup_type_info");
  const infoList = infoModal.querySelector(".popup__info");
  const infoUserList = infoModal.querySelector(".popup__list");
  const infoTitle = infoModal.querySelector(".popup__title");

  infoTitle.textContent = '';
  infoList.innerHTML = '';
  infoUserList.innerHTML = '';

  getCardList()
    .then((cards) => {
      const cardData = cardList.find((card) => card._id === cardId);
      infoTitle.textContent = "Информация о карточке";

      infoList.append(
        createInfoElement(
          "Описание:",
          cardData.name
        )
      );

      infoList.append(
        createInfoElement(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        )
      );

      infoList.append(
        createInfoElement(
          "Владелец:",
          cardData.owner.name
        )
      );

      infoList.append(
        createInfoElement(
          "Количество лайков:",
          cardData.likes.length
        )
      );

      if (cardData.likes.length > 0) {
        const likedTitle = createInfoElement("Лайкнули:", "");
        infoList.append(likedTitle);
        
        cardData.likes.forEach((user) => {
          infoUserList.append(createLikedUserBadge(user));
        });
      }
      
      openModalWindow(infoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
};  

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});

deleteCardForm.addEventListener("submit", handleDeleteCardFormSubmit);
//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

let currentUserId;
let cardList = [];
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
      currentUserId = userData._id;
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about,
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`,
      cardList = cards;

      cards.forEach((card) => {
        placesWrap.append(
          createCardElement(
            card,
            {
              onPreviewPicture: handlePreviewPicture,
              onLikeIcon: (likeButton, cardId, likeCounter) => 
                handleLikeCard(likeButton, cardId, likeCounter),
              onDeleteCard: (cardElement, cardId) => {
                openDeleteWindowPopup(cardElement, cardId)
              },
              onInfoButton: handleInfoClick, 
            },
            currentUserId
          )
        );
      });
    })
  .catch((err) => {
    console.log(err); // В случае возникновения ошибки выводим её в консоль
  });

