import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';


export default class Support extends React.Component {

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
        <Text>Work in progress :)</Text>
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
