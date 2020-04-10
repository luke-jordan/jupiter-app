/**
 * In time we will want to use constants, add i18n, etc., but leaving for now
 * @param {string} action The action embedded in the message entity 
 */
const getMessageCardButtonText = (action) => {
  switch (action) {
    case 'ADD_CASH':
      return 'ADD SAVINGS';

    case 'VIEW_HISTORY':
      return 'VIEW HISTORY';

    case 'VIEW_BOOSTS':
      return 'VIEW BOOSTS'

    case 'VISIT_WEB':
      return 'VISIT SITE';

    default:
      return '';
  }
}

export default getMessageCardButtonText;