import React from 'react';
import { StyleSheet, View } from 'react-native';
// import { LoggingUtil } from '../util/LoggingUtil';
// import { Image, Text, AsyncStorage, TouchableOpacity } from 'react-native;'
// import { NavigationUtil } from '../util/NavigationUtil';
// import { Endpoints, Colors } from '../util/Values';
// import { Button, Icon, Input } from 'react-native-elements';

/*
This component is not actually used in the app, but serves as a template for creating other screens. Uncomment needed imports on initiating.
*/

export default class Template extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    // LoggingUtil.logEvent('USER_ENTERED_....');
  }

  render() {
    return (
      <View style={styles.container}>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
