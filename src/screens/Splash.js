import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage } from 'react-native';
// import { reloadIfUpdateAvailable } from '../util/ExpoPublishUtil';

export default class Splash extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      'poppins-bold': require('./../../assets/poppins/Poppins-Bold.ttf'),
      'poppins-light': require('./../../assets/poppins/Poppins-Light.ttf'),
      'poppins-medium': require('./../../assets/poppins/Poppins-Medium.ttf'),
      'poppins-regular': require('./../../assets/poppins/Poppins-Regular.ttf'),
      'poppins-semibold': require('./../../assets/poppins/Poppins-SemiBold.ttf'),
    })
    // if (token && token.length > 0) {
    //   this.props.navigation.navigate('Home');
    // } else {
      this.props.navigation.navigate('Login');
    // }
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
