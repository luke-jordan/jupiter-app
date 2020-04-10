/**
 * Note : Keep an eye on how the assets are passed around from this (though some research suggests this is efficient)
 * @param {string} iconType From the standard library 
 */
const getMessageCardIcon = (iconType) => {
  switch (iconType) {
    case 'BOOST_ROCKET':
      return require('../../../../assets/rocket.png');

    case 'UNLOCKED':
      return require('../../../../assets/unlocked.png');

    default:
      return require('../../../../assets/notification.png');
  }
}

export default getMessageCardIcon;
