import { StackActions, NavigationActions } from 'react-navigation';
import { AsyncStorage } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';

import { NotificationsUtil } from './NotificationsUtil';

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

  directBasedOnProfile(profileData, fromHome = true) {
    if (!profileData) {
      return { screen: 'Splash', params: {}};
    }

    let screen = '';
    let params = {};

    const hasProfileButNeedsKyc = profileData.profile &&
      (['FAILED_VERIFICATION', 'REVIEW_FAILED'].includes(profileData.profile.kycStatus));
    
    const { onboardStepsRemaining } = profileData;

    const mustStillGiveRegulatoryApproval = onboardStepsRemaining && onboardStepsRemaining.includes('AGREE_REGULATORY');
    const mustStillAddCash = onboardStepsRemaining && onboardStepsRemaining.includes('ADD_CASH');
    const mustCompletePayment = onboardStepsRemaining && onboardStepsRemaining.includes('FINISH_SAVE');

    if (hasProfileButNeedsKyc) {
      screen = 'FailedVerification';
      params = { fromHome };
    } else if (mustStillGiveRegulatoryApproval) {
      screen = 'OnboardRegulation';
      params = { isOnboarding: mustStillAddCash, userInfo: profileData };
    } else if (mustStillAddCash || mustCompletePayment) {
      screen = 'PendingRegistrationSteps';
      params = { userInfo: profileData };
    } else {
      screen = 'Home';
      params = { userInfo: profileData };
    }

    return { screen, params };
  },

  // this is a bit complicated and a little fragile, and in theory might be replaced by a call to profile/fetch,
  // _but_ that profile fetch call is pretty heavy if there has not been a prior balance fetch to warm it up,
  // and each second counts during onboard (plus each moment of possible fragility), and the risks are not very high
  // since any missed step will be caught pretty quickly in the balance update / home screen flow
  async removeOnboardStepRemaining(stepToRemove) {
    const info = await AsyncStorage.getItem('userInfo');
    if (info) {
      const userInfo = JSON.parse(info);
      const revisedStepsRemaining = userInfo.onboardStepsRemaining.filter((step) => step !== stepToRemove);
      userInfo.onboardStepsRemaining = revisedStepsRemaining;
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  },

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

  async logout(navigation) {
    await this.cleanUpPushToken();
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
