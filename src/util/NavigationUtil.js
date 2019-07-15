import { StackActions, NavigationActions } from 'react-navigation';

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

};
