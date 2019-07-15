import React from 'react';
import { View, Platform } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import { StyleSheet, SafeAreaView, AsyncStorage } from 'react-native';

import Splash from './src/screens/Splash';
import Login from './src/screens/Login';
// import Home from './src/screens/Home';

const AppContainer = createAppContainer(
  createStackNavigator(
    {
      Splash: { screen: Splash },
      Login: { screen: Login },
      // Home: { screen: Home },
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
    marginTop: Platform.OS == 'android' ? 31 : 0,
  },
});
