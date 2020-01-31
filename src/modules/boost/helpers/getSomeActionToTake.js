import { actionType, buttonLabel } from '../models';

const getSomeActionToTake = action => {
  if (action === actionType.ADD_CASH) {
    return {
      onPressHandler: addCashHandler,
      buttonLabel: buttonLabel.ADD_CASH,
    };
  }
};

const addCashHandler = (navigation, hideModal) => {
  navigation.navigate('AddCash');
  hideModal();
};

export default getSomeActionToTake;
