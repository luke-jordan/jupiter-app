import React from 'react';

import { Platform, StyleSheet, SafeAreaView, AppState } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import * as Sentry from 'sentry-expo';
import configureStore from './src/store/configureStore';

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
import Boosts from './src/screens/Boosts';
import Friends from './src/screens/Friends';
import Account from './src/screens/Account';
import Terms from './src/screens/Terms';
import PrivacyPolicy from './src/screens/PrivacyPolicy';
import Profile from './src/screens/Profile';
import Register from './src/screens/Register';
import SetPassword from './src/screens/SetPassword';
import Payment from './src/screens/Payment';
import SelectTransferMethod from './src/screens/SelectTransferMethod';
import PendingInstantTransfer from './src/screens/PendingInstantTransfer';
import PaymentComplete from './src/screens/PaymentComplete';
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
import PastMessages from './src/screens/PastMessages';
import FailedVerification from './src/screens/FailedVerification';
import EFTPayment from './src/screens/EFTPayment';
import PendingManualTransfer from './src/screens/PendingManualTransfer';
import Stokvel from './src/screens/Stokvel';
import MoneyMarket from './src/screens/MoneyMarket';
import OnboardRegulation from './src/screens/OnboardRegulation';
import OnboardAddSaving from './src/screens/OnboardAddSaving';
import OnboardPending from './src/screens/OnboardPending';

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
      SelectTransferMethod: { screen: SelectTransferMethod },
      PendingInstantTransfer: { screen: PendingInstantTransfer },
      PaymentComplete: { screen: PaymentComplete },
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
      PastMessages: { screen: PastMessages },
      FailedVerification: { screen: FailedVerification },
      EFTPayment: { screen: EFTPayment },
      PendingManualTransfer: { screen: PendingManualTransfer },
      Stokvel: { screen: Stokvel },
      MoneyMarket: { screen: MoneyMarket },
      OnboardRegulation: { screen: OnboardRegulation },
      OnboardAddSaving: { screen: OnboardAddSaving },
      OnboardPending: { screen: OnboardPending },
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
    const { store, persistor } = configureStore();

    return (
      <SafeAreaView style={styles.safeArea} behavior="padding">
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppContainer />
          </PersistGate>
        </Provider>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: Platform.OS === 'android' ? 30 : 0,
  },
});
