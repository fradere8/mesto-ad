function showInputError(formElement, inputElement, settings) {
  let errorElement = formElement.querySelector('#' + inputElement.id + '-error');
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.textContent = inputElement.validationMessage;
  errorElement.classList.add(settings.errorClass);

  //if (inputElement.validity.patternMismatch && inputElement.hasAttribute('data-error-message')) {
    //errorElement.textContent = inputElement.dataset.errorMessage;
  //}
}

function hideInputError(formElement, inputElement, settings) {
  let errorElement = formElement.querySelector('#' + inputElement.id + '-error');
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.classList.remove(settings.errorClass);
  errorElement.textContent = '';
}

function checkInputValidity(formElement, inputElement, settings) {
  if (!inputElement.validity.valid) {
    showInputError(formElement, inputElement, settings);
  } else {
    hideInputError(formElement, inputElement, settings);
  }
}

function hasInvalidInput(inputList) {
  return inputList.some(function (input) {
    return !input.validity.valid;
  });
}

function disableSubmitButton(buttonElement, settings) {
  buttonElement.classList.add(settings.inactiveButtonClass);
  buttonElement.disabled = true;
}

function enableSubmitButton(buttonElement, settings) {
  buttonElement.classList.remove(settings.inactiveButtonClass);
  buttonElement.disabled = false;
}

function toggleButtonState(inputList, buttonElement, settings) {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
}

function setEventListeners(formElement, settings) {
  let inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  let buttonElement = formElement.querySelector(settings.submitButtonSelector);

  toggleButtonState(inputList, buttonElement, settings);

  inputList.forEach(function (inputElement) {
    inputElement.addEventListener('input', function () {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
}

function clearValidation(formElement, settings) {
  let inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
  let buttonElement = formElement.querySelector(settings.submitButtonSelector);

  inputList.forEach(function (inputElement) {
    hideInputError(formElement, inputElement, settings);
  });

  disableSubmitButton(buttonElement, settings);
}

function enableValidation(settings) {
  let formList = Array.from(document.querySelectorAll(settings.formSelector));
  formList.forEach(function (formElement) {
    setEventListeners(formElement, settings);
  });
}

export { enableValidation, clearValidation };
