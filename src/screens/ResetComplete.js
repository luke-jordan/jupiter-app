import React from 'react';
import { StyleSheet, View, Image, Text, Dimensions } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Colors } from '../util/Values';
import { Button } from 'react-native-elements';

let { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class ResetComplete extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_FINISHED_PWORD_RESET');
  }

  onPressLogin = () => {
    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Login');
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={require('../../assets/check.png')} resizeMode="contain"/>
        <Text style={styles.title}>Your password has been reset</Text>
        <Text style={styles.description}>You can now log in with your new password and get saving!</Text>
        <Button
          title="LOG IN"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressLogin}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '65%',
    paddingBottom: 100,
  },
  image: {
    marginBottom: 30,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 6.8 * FONT_UNIT,
    lineHeight: 9.3 * FONT_UNIT,
    marginBottom: 15,
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 3.9 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    paddingHorizontal: 30,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
  },
  buttonContainerStyle: {
    marginVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
