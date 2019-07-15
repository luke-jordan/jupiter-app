import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage } from 'react-native';
// import { reloadIfUpdateAvailable } from '../util/ExpoPublishUtil';

export default class Splash extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
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
