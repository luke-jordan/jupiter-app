import { actionType, buttonLabel } from '../models';

/**
 * Depending on the action, we assign the handler we need and the name of the buttons
 * We will expand this scheme in the future
 */
const getSomeActionToTake = (action) => {
  if (action === actionType.ADD_CASH) {
    return {
      onPressHandler: addCashHandler,
      buttonLabel: buttonLabel.ADD_CASH,
    };
  }

  if (action === actionType.CANCEL_WITHDRAWAL) {
    return { onPressHandler: viewHistoryHandler, buttonLabel: buttonLabel.CANCEL_WITHDRAWAL }
  }
};

/**
 * If the user decided to add cash, you need to hide the modal, and go to the add cash screen
 */
const addCashHandler = (navigation, hideModal, preFilledAmount, boostId) => {
  const cashParams = { startNewTransaction: true };
  if (boostId) {
    cashParams.boostId = boostId;
  }
  if (preFilledAmount) {
    cashParams.preFilledAmount = preFilledAmount;
  }
  navigation.navigate('AddCash', cashParams);
  hideModal();
};

/**
 * This React pattern of like 50 files with 10 lines each is seriously misguided, but anyway
 */
const viewHistoryHandler = (navigation, hideModal) => {
  navigation.navigate('History'); // because the transaction will appear there
  hideModal();
}

export default getSomeActionToTake;
