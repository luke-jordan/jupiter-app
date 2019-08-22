import { StackActions, NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';

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

  // navigateWithHomeBackstack(navigation, screen, params) {
  //   const resetAction = StackActions.reset({
  //     index: 1,
  //     actions: [
  //       NavigationActions.navigate({ routeName: 'Home'}),
  //       params ? NavigationActions.navigate({ routeName: screen, params: params}) : NavigationActions.navigate({ routeName: screen})
  //     ]
  //   });
  //   navigation.dispatch(resetAction);
  // },

  logout(navigation) {
    AsyncStorage.removeItem("userInfo");
    AsyncStorage.removeItem("lastShownBalance");
    LoggingUtil.clearUserProperties();
    NavigationUtil.navigateWithoutBackstack(navigation, 'Login');
  }

};
