/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
//import '../pages/index.css';
import { addNewCard, getUserInfo, setUserAvatar, setUserInfo, getCardList, changeLikeCardStatus } from './components/api.js';
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
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

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
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
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  setUserAvatar({
    avatar: avatarInput.value,
  })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`,
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
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
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
          }
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

const handleDeleteCard = (cardElement, cardId) => {
  deleteCard(cardId)
    .then(() => cardElement.remove())
    .catch((err => console.log(err))); 
};

const handleLikeCard = (likeButton, cardId) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");
  likeButton.disabled = true;

  changeLikeCardStatus(cardId, isLiked)
    .then((updCardData) => {
      likeCount.textContent = updCardData.likes.length;
      likeButton.classList.toggle("card__like-button_is-active");
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      likeButton.disabled = false;
    });
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

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about,
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`,

      cards.forEach((card) => {
        placesWrap.append(
          createCardElement(
            card,
            {
              onPreviewPicture: handlePreviewPicture,
              onLikeIcon: likeCard,
              onDeleteCard: deleteCard,
            },
            currentUserId
          )
        );
      });
    })
  .catch((err) => {
    console.log(err); // В случае возникновения ошибки выводим её в консоль
  });

