import { AsyncStorage } from 'react-native';

import { LoggingUtil } from '../util/LoggingUtil';
import { NotificationsUtil } from './NotificationsUtil';
import { NavigationUtil } from './NavigationUtil';

export const LogoutUtil = {

  logoutAction: { type: 'USER_LOGOUT '},

  async cleanUpPushToken() {
    try {
      const storedInfo = await AsyncStorage.getItem('userInfo');
      if (storedInfo) {
        const info = JSON.parse(storedInfo);
        const { token } = info;
        await NotificationsUtil.deleteNotificationToken(token);
      }
    } catch (err) {
      LoggingUtil.logError(err);
    }
  },

  async logout(navigation, logoutEvent = 'USER_LOGGED_OUT') {
    await this.cleanUpPushToken();
    LoggingUtil.logEvent(logoutEvent);
    await Promise.all([
      AsyncStorage.removeItem('userInfo'),
      AsyncStorage.removeItem('lastShownBalance'),
      AsyncStorage.removeItem('gameId'),
      AsyncStorage.removeItem('currentGames'),
      AsyncStorage.removeItem('userHistory'),
      AsyncStorage.removeItem('userBoosts'),
    ]);
    LoggingUtil.clearUserProperties();
    NavigationUtil.navigateWithoutBackstack(navigation, 'Login');
  },

};
