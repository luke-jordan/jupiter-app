import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage } from 'react-native';
// import { reloadIfUpdateAvailable } from '../util/ExpoPublishUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';

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
    })
    let userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      userInfo = JSON.parse(userInfo);
    }
    if (userInfo && userInfo.token && userInfo.token.length > 0) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home');
    } else {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Login');
    }
  }

  render() {
    return (
      <View style={styles.container}>

      </View>
    );
  }
}

// </Mutation>

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
