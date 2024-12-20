import * as actionTypes from '../types/ui'

export function showModal(modal) {
  return {
    type: actionTypes.SHOW_MODAL,
    modal: modal
  }
}

export function hideModal() {
  return {
    type: actionTypes.HIDE_MODAL
  }
}

export function hideModals() {
  return {
    type: actionTypes.HIDE_MODALS
  }
}

export function hideModalsExceptDapp() {
  return {
    type: actionTypes.HIDE_MODALS_EXCEPT_DAPP
  }
}

export function showLoader(message) {
  return {
    type: actionTypes.SHOW_LOADER,
    message: message
  }
}

export function hideLoader() {
  return {
    type: actionTypes.HIDE_LOADER
  }
}
