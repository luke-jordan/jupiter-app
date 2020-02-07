import React from 'react';
import { Platform, StyleSheet, SafeAreaView, AppState } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { Provider } from 'react-redux';
import * as Sentry from 'sentry-expo';

import { LoggingUtil } from './src/util/LoggingUtil';
import { Endpoints } from './src/util/Values';
import Splash from './src/screens/Splash';
import Login from './src/screens/Login';
import OTPVerification from './src/screens/OTPVerification';
import Home from './src/screens/Home';
import AddCash from './src/screens/AddCash';
import Onboarding from './src/screens/Onboarding';
import LimitedUsers from './src/screens/LimitedUsers';
import ThankYou from './src/screens/ThankYou';
import Boosts from './src/modules/boost/views/Boosts';
import Friends from './src/screens/Friends';
import Account from './src/screens/Account';
import Terms from './src/screens/Terms';
import PrivacyPolicy from './src/screens/PrivacyPolicy';
import Profile from './src/screens/Profile';
import Register from './src/screens/Register';
import SetPassword from './src/screens/SetPassword';
import Payment from './src/screens/Payment';
import CheckingForPayment from './src/screens/CheckingForPayment';
import PaymentComplete from './src/screens/PaymentComplete';
import PendingRegistrationSteps from './src/screens/PendingRegistrationSteps';
import ResetPassword from './src/screens/ResetPassword';
import ResetQuestions from './src/screens/ResetQuestions';
import ResetComplete from './src/screens/ResetComplete';
import WithdrawStep1 from './src/screens/WithdrawStep1';
import WithdrawStep2 from './src/screens/WithdrawStep2';
import WithdrawalComplete from './src/screens/WithdrawalComplete';
import ChangePassword from './src/screens/ChangePassword';
import Support from './src/screens/Support';
import SupportRequestSent from './src/screens/SupportRequestSent';
import History from './src/screens/History';
import FailedVerification from './src/screens/FailedVerification';
import EFTPayment from './src/screens/EFTPayment';
import configureStore from './src/store/configureStore';

const AppContainer = createAppContainer(
  createStackNavigator(
    {
      Splash: { screen: Splash },
      Login: { screen: Login },
      OTPVerification: { screen: OTPVerification },
      Home: { screen: Home },
      AddCash: { screen: AddCash },
      Onboarding: { screen: Onboarding },
      LimitedUsers: { screen: LimitedUsers },
      ThankYou: { screen: ThankYou },
      Boosts: { screen: Boosts },
      Friends: { screen: Friends },
      Account: { screen: Account },
      Terms: { screen: Terms },
      PrivacyPolicy: { screen: PrivacyPolicy },
      Profile: { screen: Profile },
      Register: { screen: Register },
      SetPassword: { screen: SetPassword },
      Payment: { screen: Payment },
      CheckingForPayment: { screen: CheckingForPayment },
      PaymentComplete: { screen: PaymentComplete },
      PendingRegistrationSteps: { screen: PendingRegistrationSteps },
      ResetPassword: { screen: ResetPassword },
      ResetQuestions: { screen: ResetQuestions },
      ResetComplete: { screen: ResetComplete },
      WithdrawStep1: { screen: WithdrawStep1 },
      WithdrawStep2: { screen: WithdrawStep2 },
      WithdrawalComplete: { screen: WithdrawalComplete },
      ChangePassword: { screen: ChangePassword },
      Support: { screen: Support },
      SupportRequestSent: { screen: SupportRequestSent },
      History: { screen: History },
      FailedVerification: { screen: FailedVerification },
      EFTPayment: { screen: EFTPayment },
    },
    { initialRouteName: 'Splash', headerMode: 'none' }
  )
);

export default class App extends React.Component {
  componentDidMount() {
    Sentry.init({
      dsn: Endpoints.SENTRY,
      enableInExpoDevelopment: true,
      debug: true,
    });
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = nextAppState => {
    if (nextAppState === 'inactive') {
      LoggingUtil.logEvent('USER_EXITED_APP');
    } else if (nextAppState === 'active') {
      // we are currently logging the USER_OPENED_APP after initialization to avoid conflicts, but here would be another spot to do that
    }
  };

  render() {
    const store = configureStore();

    return (
      <SafeAreaView style={styles.safeArea} behavior="padding">
        <Provider store={store}>
          <AppContainer />
        </Provider>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: Platform.OS == 'android' ? 30 : 0,
  },
});
