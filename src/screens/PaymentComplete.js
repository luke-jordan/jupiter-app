import React from 'react';
import {
  AsyncStorage,
  BackHandler,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { MessagingUtil } from '../util/MessagingUtil';
import { Endpoints, Colors } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class PaymentComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fetchingProfile: true,
      userInfo: null,
    };
  }

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleHardwareBackPress
    );

    const { params } = this.props.navigation.state;
    if (params) {
      if (params.isOnboarding) {
        LoggingUtil.logEvent('USER_COMPLETED_ONBOARD', {
          amountAdded: params.amountAdded,
        });
      }
      LoggingUtil.logEvent('PAYMENT_SUCCEEDED', {
        amountAdded: params.amountAdded,
      });
    }

    this.fetchProfile(params.token);

    this.checkForActiveGame(params.token);
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  onPressDone = attempts => {
    // need this here because otherwise event is passed in to argument from on press, which causes proceed to happen too quickly
    if (!attempts || !Number.isInteger(attempts)) attempts = 0;
    this.setState({ loading: true });
    // console.log('Pressed done, is profile fetched ? :', this.state.fetchingProfile, ' and attempts: ', attempts);
    if ((this.state.fetchingProfile || !this.state.userInfo) && attempts < 10) {
      // console.log('State not finished fetching profile, wait for next attempt');
      setTimeout(() => {
        this.onPressDone(attempts + 1);
      }, 300);
    } else {
      // console.log('State is set to profile has been fetched, wait before continuing');
      this.setState({ loading: false });
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home', {
        userInfo: this.state.userInfo,
        showModal: true,
      });
    }
  };

  getFormattedBalance(balance, unit) {
    return (balance / this.getDivisor(unit)).toFixed(2);
  }

  getDivisor(unit) {
    switch (unit) {
      case 'MILLIONTH_CENT':
        return 100000000;

      case 'TEN_THOUSANDTH_CENT':
        return 1000000;

      case 'THOUSANDTH_CENT':
        return 100000;

      case 'HUNDREDTH_CENT':
        return 10000;

      case 'WHOLE_CENT':
        return 100;

      case 'WHOLE_CURRENCY':
        return 1;

      default:
        return 1;
    }
  }

  handleHardwareBackPress = () => {
    this.backHandler.remove();
    this.onPressDone();
    return false;
  };

  checkForActiveGame = async token => {
    // TODO this should check for amounts
    const game = await MessagingUtil.fetchMessagesAndGetTop(token);
    if (game && game.actionToTake && game.actionToTake.includes('ADD_CASH')) {
      MessagingUtil.setGameId(game.actionContext.msgOnSuccess);
    }
  };

  async fetchProfile(token) {
    this.setState({
      fetchingProfile: true,
    });
    try {
      if (!token) {
        NavigationUtil.logout(this.props.navigation);
      }
      const result = await fetch(`${Endpoints.AUTH}profile/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
      });
      if (result.ok) {
        const resultJson = await result.json();
        // console.log('Result of profile fetch on payment complete: ', resultJson);
        await AsyncStorage.setItem('userInfo', JSON.stringify(resultJson));
        this.setState({
          userInfo: resultJson,
          fetchingProfile: false,
        });
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ fetchingProfile: false });
    }
  }

  render() {
    const { newBalance } = this.props.navigation.state.params;
    const { amountAdded } = this.props.navigation.state.params;
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={this.onPressDone}>
          <Icon
            name="close"
            type="evilicon"
            size={30}
            color={Colors.MEDIUM_GRAY}
          />
        </TouchableOpacity>
        <View style={styles.mainContent}>
          <View style={styles.top}>
            <Image
              style={styles.image}
              source={require('../../assets/thank_you.png')}
              resizeMode="contain"
            />
            <Text style={styles.title}>Payment complete</Text>
            <Text style={styles.description}>
              Congratulations on creating your account. We’re looking forward to
              watching your savings grow!
            </Text>
          </View>
          <View style={styles.amountsView}>
            <Text style={styles.description}>
              Your new account has been topped up with:
            </Text>
            <Text style={styles.amount}>
              {this.props.amount}R{amountAdded}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.amountsView}>
            <Text style={styles.description}>Your balance is now:</Text>
            <Text style={styles.amount}>
              {this.props.balance}R
              {this.getFormattedBalance(newBalance.amount, newBalance.unit)}
            </Text>
          </View>
          <View style={styles.separator} />
        </View>
        <Button
          testID="paymnent-complete-done-btn"
          accessibilityLabel="paymnent-complete-done-btn"
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
          }}
        />
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
  separator: {
    height: 1,
    width: width * 0.8,
    backgroundColor: Colors.GRAY,
    marginVertical: 20,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: Colors.WHITE,
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
