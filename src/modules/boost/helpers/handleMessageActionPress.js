import { Linking } from 'react-native';
import { extractAmount, calculateAmountToBalanceOrMajorDigit } from '../../../util/AmountUtil';

const setPrefilledAddCash = (actionContext, currentBalance) => {
  const params = { startNewTransaction: true };
  if (!actionContext) {
    return params;
  }
  
  if (actionContext.addCashPreFilled) {
    params.preFilledAmount = extractAmount(actionContext.addCashPreFilled, 'WHOLE_CURRENCY');
  } else if (actionContext.addCashTargetMinimum) {
    // console.log('Add cash target minimum: ', actionContext.addCashTargetMinimum, ' and balance : ', currentBalance);
    const targetMinimum = { amount: extractAmount(actionContext.addCashTargetMinimum, 'WHOLE_CURRENCY'), unit: 'WHOLE_CURRENCY' };
    const amountToReachNextDigitOrMinimum = calculateAmountToBalanceOrMajorDigit(currentBalance, targetMinimum, actionContext.addCashDigitThresholds);
    // console.log(`Target minimum is: ${targetMinimum.amount} and to get to next amount is: ${amountToReachNextDigitOrMinimum}`)
    params.preFilledAmount = amountToReachNextDigitOrMinimum;
  }

  return params;
}

const handleMessageActionPress = (messageDetails, navigation, currentBalance = null) => {
  const actionContext = messageDetails ? messageDetails.actionContext : null;
  const actionToTake = messageDetails.actionToTake || (actionContext && actionContext.actionToTake);

  // console.log('Processing message action, message details: ', messageDetails);
  // console.log('Action context: ', actionContext);

  if (!actionContext && !actionToTake) {
    return false;
  }
  
  switch (actionToTake) {
    case 'ADD_CASH': {
        const params = setPrefilledAddCash(actionContext, currentBalance);
        if (messageDetails.instructionId) {
          params.messageInstructionId = messageDetails.instructionId;
        }
        navigation.navigate('AddCash', params);
        break;
    }

    case 'VIEW_HISTORY':
      navigation.navigate('History');
      break;

    case 'VIEW_FRIENDS':
      navigation.navigate('Friends');
      break;

    case 'VIEW_BOOSTS':
      navigation.navigate('Boosts');
      break;

    case 'VISIT_MESSAGES':
      navigation.navigate('PastMessages');
      break;

    case 'VIEW_PROFILE':
      navigation.navigate('Profile');
      break;

    case 'VISIT_WEB':
      if (actionContext && actionContext.urlToVisit) {
        Linking.openURL(actionContext.urlToVisit);
      } else {
        Linking.openURL('https://jupitersave.com')
      }
      break;

    default:
      break;
  }
};

export default handleMessageActionPress;
