import React from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import NavigationBar from '../elements/NavigationBar';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class Boosts extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_BOOST_LIST');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <Image style={styles.image} source={require('../../assets/group_7.png')} resizeMode="contain"/>
          <Text style={styles.title}>Watch this space…</Text>
          <Text style={styles.description}>We’re adding boosts to encourage and celebrate you being a{"\n"}happy saver!</Text>
        </View>
        <NavigationBar navigation={this.props.navigation} currentTab={2} hasNotification />
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
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 50,
  },
  image: {
    marginBottom: 35,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 6.4 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 4.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
  },
});
