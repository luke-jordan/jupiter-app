import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AppState,
  BackHandler,
} from 'react-native';
import { Icon, Overlay } from 'react-native-elements';
import Toast from 'react-native-easy-toast';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';

const { width, height } = Dimensions.get('window');

const FONT_UNIT = 0.01 * width;

export default class Payment extends React.Component {
  constructor(props) {
    super(props);
    this.toastRef = React.createRef();
    this.state = {
      paymentLink: '',
      accountTransactionId: -1,
      checkingForPayment: false,
      token: '',
      isOnboarding: false,
      appState: AppState.currentState,
    };
  }

  async componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleHardwareBackPress
    );
    const { params } = this.props.navigation.state;
    if (params) {
      this.setState({
        humanReference: params.humanReference,
        paymentLink: params.urlToCompletePayment,
        accountTransactionId: params.accountTransactionId,
        token: params.token,
        isOnboarding: params.isOnboarding,
        amountAdded: params.amountAdded,
        amountForBoost: params.amountForBoost,
      });
    }
  }

  // removing until more confidence in iOS bug handling
  handleAppStateChange = async (nextAppState) => {
    try {
      if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
        LoggingUtil.logEvent("USER_RETURNED_TO_PAYMENT_LINK");
        if (this.state.checkingForPayment) {
          this.setState({ appState: nextAppState });
          return;
        }
        this.checkIfPaymentCompleted();
      } else {
        LoggingUtil.logEvent("USER_LEFT_APP_AT_PAYMENT_LINK");
        this.setState({ appState: nextAppState });
      }
    } catch (err) {
      LoggingUtil.logError(err);
    }
  }

  checkIfPaymentCompleted = async () => {
    this.setState({
      checkingForPayment: true,
    });
    try {
      // let result = await fetch(Endpoints.CORE + 'addcash/check?transactionId=' + this.state.accountTransactionId + '&failureType=PENDING', {
      const result = await fetch(
        `${Endpoints.CORE}addcash/check?transactionId=${this.state.accountTransactionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.state.token}`,
          },
          method: 'GET',
        }
      );
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({
          checkingForPayment: false,
        });
        if (!resultJson || !resultJson.result) {
          LoggingUtil.logError(
            new Error('Payment status check returned malform result: check')
          );
          this.navigateToPaymentPending();
        }
        if (resultJson.result.includes('PAYMENT_SUCCEEDED')) {
          AppState.removeEventListener('change', this.handleAppStateChange);
          NavigationUtil.navigateWithoutBackstack(
            this.props.navigation,
            'PaymentComplete',
            {
              paymentLink: this.state.paymentLink,
              accountTransactionId: this.state.accountTransactionId,
              token: this.state.token,
              isOnboarding: this.state.isOnboarding,
              newBalance: resultJson.newBalance,
              amountAdded: this.state.amountAdded,
              amountForBoost: this.state.amountForBoost,
            }
          );
        } else if (resultJson.result.includes('PAYMENT_PENDING')) {
          this.navigateToPaymentPending();
        } else {
          this.logPaymentError('Payment failed on server response', result);
        }
      } else {
        this.logPaymentError('Payment received bad status code from server', result);
      }
    } catch (error) {
      this.setState({ checkingForPayment: false });
      LoggingUtil.logError(error);
      this.navigateToPaymentPending();
    }
  };

  handleHardwareBackPress = () => {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.backHandler.remove();
    return true;
  };

  onPressBack = () => {
    // TODO : consider altering to prevent back
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.backHandler.remove();
    LoggingUtil.logEvent('USER_WENT_BACK_AT_PAYMENT_LINK');
    this.props.navigation.goBack();
  };

  onPressAlreadyPaid = () => {
    this.checkIfPaymentCompleted();
  };

  onPressCopy = () => {
    Clipboard.setString(this.state.paymentLink);
    this.toastRef.current.show('Copied to clipboard!');
  };

  onPressPaymentLink = () => {
    Linking.openURL(this.state.paymentLink);
  };

  logPaymentError(message, response) {
    const paymentError = new Error(message);
    const serverResponse = response ? JSON.stringify(response) : 'Could not retrieve failing server response';
    if (serverResponse) {
      paymentError.serverResponse = serverResponse;
    }
    LoggingUtil.logError(paymentError);
    LoggingUtil.logEvent('PAYMENT_FAILED_SERVER_ERROR');
    this.navigateToPaymentPending();
  }

  navigateToPaymentPending(bankDetails) {
    AppState.removeEventListener('change', this.handleAppStateChange);
    NavigationUtil.navigateWithHomeBackstack(
      this.props.navigation,
      'CheckingForPayment',
      {
        paymentLink: this.state.paymentLink,
        accountTransactionId: this.state.accountTransactionId,
        token: this.state.token,
        isOnboarding: this.state.isOnboarding,
        amountForBoost: this.state.amountForBoost,
        amountAdded: this.state.amountAdded,
        humanReference: this.state.humanReference,
        bankDetails,
      }
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.onPressBack}
          >
            <Icon
              name="chevron-left"
              type="evilicon"
              size={45}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Payment</Text>
          <View style={styles.mainContent}>
            <Image
              style={styles.ozowLogo}
              source={require('../../assets/ozow_black.png')}
            />
            <Text style={styles.description}>
              We use <Text style={styles.bold}>Ozow</Text>, SA&apos;s premium
              payment solution, to process instant EFTs and transfer cash
              directly to your Jupiter account.{' '}
            </Text>
            <Text style={styles.buttonDescription}>
              Tap the link to pay with Ozow:
            </Text>
            <LinearGradient
              start={[0, 0.5]}
              end={[1, 0.5]}
              colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
              style={styles.buttonStyle}
            >
              <Text
                style={styles.paymentLink}
                onPress={this.onPressPaymentLink}
              >
                {this.state.paymentLink}
              </Text>
              <TouchableOpacity onPress={this.onPressCopy}>
                <Image
                  style={styles.copyIcon}
                  source={require('../../assets/copy.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </LinearGradient>
            <TouchableOpacity
              testID="payment-already-paid"
              accessibilityLabel="payment-already-paid"
              style={styles.alreadyPaidButton}
              onPress={this.onPressAlreadyPaid}
            >
              <Text style={styles.alreadyPaidButtonText}>
                {this.state.checkingForPayment
                  ? 'CHECKING PAYMENT STATUS...'
                  : 'I MADE THE PAYMENT!'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.description}>
              When you come back from Ozow tap the button to complete adding
              your cash
            </Text>
          </View>
        </View>
        {height > 600 ? (
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>THE EASIEST WAY TO PAY:</Text>
            <Image
              style={styles.shield}
              source={require('../../assets/shield.png')}
            />
            <View style={styles.footerItem}>
              <Icon
                name="check"
                type="feather"
                size={19}
                color={Colors.PURPLE}
              />
              <Text style={styles.footerItemText}>
                No registration or app download required
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Icon
                name="check"
                type="feather"
                size={19}
                color={Colors.PURPLE}
              />
              <Text style={styles.footerItemText}>
                Payments completed in seconds
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Icon
                name="check"
                type="feather"
                size={19}
                color={Colors.PURPLE}
              />
              <Text style={styles.footerItemText}>
                <Text style={styles.bold}>No</Text> banking login details stored
              </Text>
            </View>
            <View style={styles.footerItem}>
              <Icon
                name="check"
                type="feather"
                size={19}
                color={Colors.PURPLE}
              />
              <Text style={styles.footerItemText}>Safe and secure</Text>
            </View>
          </View>
        ) : null}
        <Toast ref={this.toastRef} opacity={1} style={styles.toast} />

        <Overlay
          isVisible={this.state.checkingForPayment}
          height="auto"
          width="auto"
          containerStyle={styles.dialogStyle}
          onBackdropPress={() => {}}
          onHardwareBackPress={() => {
            this.setState({ checkingForPayment: false });
            return true;
          }}
        >
          <View style={styles.dialogWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
            <Text style={styles.dialogText}>
              Checking if your payment is complete...
            </Text>
          </View>
        </Overlay>
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
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    width: '100%',
    paddingLeft: 15,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignItems: 'center',
  },
  buttonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '90%',
    borderRadius: 10,
    minHeight: 65,
    minWidth: 220,
  },
  ozowLogo: {},
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
    paddingHorizontal: 7,
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  buttonDescription: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
  },
  paymentLink: {
    fontFamily: 'poppins-semibold',
    fontSize: FONT_UNIT * 3,
    color: Colors.WHITE,
    textAlign: 'center',
  },
  alreadyPaidButton: {
    borderWidth: 2,
    borderColor: Colors.PURPLE,
    borderRadius: 4,
    marginBottom: 10,
  },
  alreadyPaidButtonText: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.PURPLE,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    padding: 15,
  },
  footerTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.PURPLE,
    marginBottom: 2,
  },
  shield: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  footerItem: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'center',
  },
  footerItemText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    marginBottom: 2,
    marginLeft: 5,
  },
  copyIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.WHITE,
  },
  dialogWrapper: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    paddingBottom: 0,
  },
  dialogText: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    marginHorizontal: 30,
    textAlign: 'center',
  },
  toast: {
    backgroundColor: Colors.DARK_GRAY,
    width: '60%',
    alignItems: 'center',
  },
});
