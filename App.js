import React from 'react';
import { View, Platform } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { StyleSheet, SafeAreaView, AsyncStorage } from 'react-native';

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
import CheckingForPayment from './src/screens/CheckingForPayment';

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
    },
    { initialRouteName: "Splash", headerMode: 'none' }
  )
);

export default class App extends React.Component {

  render() {
    return (
      <SafeAreaView style={styles.safeArea} behavior="padding">
        <AppContainer/>
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
