import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, AsyncStorage } from 'react-native';
// import { reloadIfUpdateAvailable } from '../util/ExpoPublishUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';

const SPLASH_TIMEOUT = 1400;

export default class Splash extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    try {
      LoggingUtil.initialize();
      await Font.loadAsync({
        'poppins-bold': require('./../../assets/poppins/Poppins-Bold.ttf'),
        'poppins-light': require('./../../assets/poppins/Poppins-Light.ttf'),
        'poppins-medium': require('./../../assets/poppins/Poppins-Medium.ttf'),
        'poppins-regular': require('./../../assets/poppins/Poppins-Regular.ttf'),
        'poppins-semibold': require('./../../assets/poppins/Poppins-SemiBold.ttf'),
      });
    
      const [rawUserInfo, rawOnboarded] = await Promise.all([AsyncStorage.getItem('userInfo'), AsyncStorage.getItem('hasOnboarded')]);
      // const [rawUserInfo, rawOnboarded] = [undefined, null];

      const userInfo = rawUserInfo && typeof rawUserInfo === 'string' ? JSON.parse(rawUserInfo) : null;
      const hasOnboarded = rawOnboarded ? Boolean(rawOnboarded) : false; 
      
      setTimeout(() => {
        this.navigate(userInfo, hasOnboarded);
      }, SPLASH_TIMEOUT);
    } catch (err) {
      console.log('Error!: ', err);
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Onboarding');
    }
  }

  navigate(userInfo, hasOnboarded) {
    if (userInfo && userInfo.token && userInfo.token.length > 0) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home');
    } else if (hasOnboarded) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Login');
    } else {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Onboarding');
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.logo}
          source={require('../../assets/group_15.png')}
          resizeMode="contain"
        />
        <Image
          style={styles.text}
          source={require('../../assets/group_2.png')}
          resizeMode="contain"
        />
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
