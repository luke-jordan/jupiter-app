import { StackActions, NavigationActions } from 'react-navigation';

export const NavigationUtil = {
  navigateWithoutBackstack(navigation, screen, params) {
    const resetAction = StackActions.reset({
      index: 0,
      actions: [
        params
          ? NavigationActions.navigate({ routeName: screen, params })
          : NavigationActions.navigate({ routeName: screen }),
      ],
    });
    navigation.dispatch(resetAction);
  },

  navigateWithHomeBackstack(navigation, screen, params) {
    const resetAction = StackActions.reset({
      index: 1,
      actions: [
        NavigationActions.navigate({ routeName: 'Home' }),
        params
          ? NavigationActions.navigate({ routeName: screen, params })
          : NavigationActions.navigate({ routeName: screen }),
      ],
    });
    navigation.dispatch(resetAction);
  },

  directBasedOnProfile(profileData) {
    if (!profileData) {
      return { screen: 'Splash', params: {}};
    }

    const { onboardStepsRemaining } = profileData;

    if (Array.isArray(onboardStepsRemaining) && onboardStepsRemaining.length > 0) {
      return { screen: 'OnboardPending' };
    } else {
      return { screen: 'Home', params: { userInfo: profileData } };
    }
  },

};
