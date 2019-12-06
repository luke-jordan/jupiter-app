import { StackActions, NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';

import { NotificationsUtil } from './NotificationsUtil';

export const NavigationUtil = {

  navigateWithoutBackstack(navigation, screen, params) {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        params ? NavigationActions.navigate({ routeName: screen, params: params}) : NavigationActions.navigate({ routeName: screen})
      ]
    });
    navigation.dispatch(resetAction);
  },

  navigateWithHomeBackstack(navigation, screen, params) {
    const resetAction = StackActions.reset({
      index: 1,
      actions: [
        NavigationActions.navigate({ routeName: 'Home'}),
        params ? NavigationActions.navigate({ routeName: screen, params: params}) : NavigationActions.navigate({ routeName: screen})
      ]
    });
    navigation.dispatch(resetAction);
  },

  async cleanUpPushToken () {
    try {
      const storedInfo = await AsyncStorage.getItem('userInfo');
      if (storedInfo) {
        const info = JSON.parse(storedInfo);
        const token = info.token;
        await NotificationsUtil.deleteNotificationToken(token);
      }
    } catch (err) {
      LoggingUtil.logError(err);
    }
  },

  async logout(navigation) {
    await this.cleanUpPushToken();
    AsyncStorage.removeItem("userInfo");
    AsyncStorage.removeItem("lastShownBalance");
    AsyncStorage.removeItem("gameId");
    AsyncStorage.removeItem("currentGames");
    AsyncStorage.removeItem("userHistory");
    AsyncStorage.removeItem("userBoosts");
    LoggingUtil.clearUserProperties();
    NavigationUtil.navigateWithoutBackstack(navigation, 'Login');
  }

};
