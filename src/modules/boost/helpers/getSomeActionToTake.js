import { actionType, buttonLabel } from '../models';

/**
 * Depending on the action, we assign the handler we need and the name of the buttons
 * We will expand this scheme in the future
 */
const getSomeActionToTake = action => {
  if (action === actionType.ADD_CASH) {
    return {
      onPressHandler: addCashHandler,
      buttonLabel: buttonLabel.ADD_CASH,
    };
  }
};

/**
 * If the user decided to add cash, you need to hide the modal, and go to the add cash screen
 */
const addCashHandler = (navigation, hideModal, preFilledAmount) => {
  if (preFilledAmount) {
    navigation.navigate('AddCash', { preFilledAmount, startNewTransaction: true });
  } else {
    navigation.navigate('AddCash');
  }
  hideModal();
};

export default getSomeActionToTake;
