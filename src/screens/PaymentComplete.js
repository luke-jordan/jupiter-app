import React from 'react';
import { connect } from 'react-redux';

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
import { getFormattedValue } from '../util/AmountUtil';
import { Endpoints, Colors } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getCurrentTransactionDetails } from '../modules/transaction/transaction.reducer';

import { updateAllFields } from '../modules/profile/profile.actions';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const mapStateToProps = state => ({ 
  authToken: getAuthToken(state),
  transactionDetails: getCurrentTransactionDetails(state),
});
const mapDispatchToProps = { updateAllFields };

class PaymentComplete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fetchingProfile: true,
      userInfo: null,
      isOnboarding: false,
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
        this.setState({ isOnboarding: true });
      }
      LoggingUtil.logEvent('PAYMENT_SUCCEEDED', {
        amountAdded: params.amountAdded,
      });
    }

    this.fetchProfile();
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  onPressDone = attempts => {
    // need this here because otherwise event is passed in to argument from on press, which causes proceed to happen too quickly
    if (!attempts || !Number.isInteger(attempts)) attempts = 0;
    this.setState({ loading: true });
    if ((this.state.fetchingProfile || !this.state.userInfo) && attempts < 10) {
      setTimeout(() => {
        this.onPressDone(attempts + 1);
      }, 300);
    } else {
      this.setState({ loading: false });
      this.onMoveToNextScreen();
    }
  };

  onMoveToNextScreen = () => {
    const { savingPoolId } = this.props.transactionDetails;
    if (savingPoolId) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'ViewSavingPool', { savingPoolId });
    } else {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home', {
        userInfo: this.state.userInfo,
        showModal: this.state.showModal,
      });
    }
  }

  handleHardwareBackPress = () => {
    this.backHandler.remove();
    this.onPressDone();
    return false;
  };

  async fetchProfile() {
    this.setState({
      fetchingProfile: true,
    });
    try {
      const result = await fetch(`${Endpoints.AUTH}profile/fetch`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'GET',
      });
      if (result.ok) {
        const resultJson = await result.json();
        // console.log('Result of profile fetch on payment complete: ', resultJson);
        await AsyncStorage.setItem('userInfo', JSON.stringify(resultJson));
        this.props.updateAllFields(resultJson);
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
    
    const firstRow = this.state.isOnboarding ? 
      'Congratulations on creating your account. We’re looking forward to watching your savings grow!' :
      'Congratulations on adding to your savings! We’re looking forward to watching your savings grow!';

    const topUpLabel = this.state.isOnboarding ? 
      'Your new account has been topped up with:' : 'Your account has been topped up with:';

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
              {firstRow}
            </Text>
          </View>
          <View style={styles.amountsView}>
            <Text style={styles.description}>
              {topUpLabel}
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
              {getFormattedValue(newBalance.amount, newBalance.unit)}
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

export default connect(mapStateToProps, mapDispatchToProps)(PaymentComplete);