import { Linking } from 'react-native';
import { extractAmount } from '../../../util/AmountUtil';

const handleMessageActionPress = (messageDetails, navigation) => {
  const actionContext = messageDetails ? messageDetails.actionContext : null;
  const actionToTake = messageDetails.actionToTake || (actionContext && actionContext.actionToTake);

  // console.log('Processing message action, message details: ', messageDetails);
  // console.log('Action context: ', actionContext);

  if (!actionContext && !actionToTake) {
    return false;
  }
  
  switch (actionToTake) {
    case 'ADD_CASH': {
        const addCashEmbeddedAmount = actionContext ? actionContext.addCashPreFilled : null;
        const params = { startNewTransaction: true };
        if (addCashEmbeddedAmount) {
          params.preFilledAmount = extractAmount(addCashEmbeddedAmount, 'WHOLE_CURRENCY');
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
