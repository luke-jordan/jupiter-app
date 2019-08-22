import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage } from 'react-native';
// import { reloadIfUpdateAvailable } from '../util/ExpoPublishUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints } from '../util/Values';

const SPLASH_TIMEOUT = 1400;

export default class Splash extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    LoggingUtil.initialize();
    await Font.loadAsync({
      'poppins-bold': require('./../../assets/poppins/Poppins-Bold.ttf'),
      'poppins-light': require('./../../assets/poppins/Poppins-Light.ttf'),
      'poppins-medium': require('./../../assets/poppins/Poppins-Medium.ttf'),
      'poppins-regular': require('./../../assets/poppins/Poppins-Regular.ttf'),
      'poppins-semibold': require('./../../assets/poppins/Poppins-SemiBold.ttf'),
    });
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
    }

    //dummy call to the backend to make sure it's up and running for next calls
    fetch(Endpoints.CORE + 'warmup');
    fetch(Endpoints.AUTH + 'warmup');

    setTimeout(() => {
      this.navigate(userInfo);
    }, SPLASH_TIMEOUT);
  }

  navigate(userInfo) {
    if (userInfo && userInfo.token && userInfo.token.length > 0) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home');
    } else {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Onboarding');
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.logo} source={require('../../assets/group_15.png')} resizeMode='contain'/>
        <Image style={styles.text} source={require('../../assets/group_2.png')} resizeMode='contain'/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
  },
  logo: {
    width: 70,
    height: 67,
    marginBottom: 20,
  },
  text: {
    width: '100%',
  },
});
