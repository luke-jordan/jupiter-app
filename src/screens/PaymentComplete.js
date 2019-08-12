import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, Dimensions, BackHandler } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';

let {height, width} = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class PaymentComplete extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBackPress);
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleHardwareBackPress = () => {
    this.backHandler.remove();
    this.onPressDone();
    return false;
  }

  onPressDone = () => {
    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home');
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={this.onPressDone}>
          <Icon
            name='close'
            type='evilicon'
            size={30}
            color={Colors.MEDIUM_GRAY}
          />
        </TouchableOpacity>
        <View style={styles.mainContent}>
          <View style={styles.top}>
            <Image style={styles.image} source={require('../../assets/thank_you.png')} resizeMode="contain"/>
            <Text style={styles.title}>Payment complete</Text>
            <Text style={styles.description}>Congratulations on creating your account. We’re looking forward to watching your savings grow!</Text>
          </View>
          <View style={styles.amountsView}>
            <Text style={styles.description}>Your new account has been topped up with:</Text>
            <Text style={styles.amount}>{this.props.amount}R100.00</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.amountsView}>
            <Text style={styles.description}>Your balance is now:</Text>
            <Text style={styles.amount}>{this.props.balance}R100.00</Text>
          </View>
          <View style={styles.separator} />
        </View>
        <Button
          title="DONE"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressDone}
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
    justifyContent: 'space-around',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  top: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 50,
    marginBottom: 70,
  },
  amountsView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontFamily: 'poppins-semibold',
    fontSize: 5.2 * FONT_UNIT,
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  image: {
    marginBottom: 15,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 6.8 * FONT_UNIT,
    lineHeight: 9.3 * FONT_UNIT,
    marginVertical: 5,
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 3.7 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
  },
  textAsButton: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    textDecorationLine: 'underline',
    fontSize: 3.7 * FONT_UNIT,
    marginBottom: 10,
  },
  separator: {
    height: 1,
    width: width * 0.8,
    backgroundColor: Colors.GRAY,
    marginVertical: 20,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: 'white',
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    marginVertical: 10,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
});
