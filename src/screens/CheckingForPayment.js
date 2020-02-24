import React from 'react';
import {
  AppState,
  Animated,
  ActivityIndicator,
  Clipboard,
  Easing,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  View,
  ScrollView,
} from 'react-native';
import { Button, Overlay } from 'react-native-elements';
import Toast from 'react-native-easy-toast';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';

const HOURGLASS_ROTATION_DURATION = 10000;

export default class CheckingForPayment extends React.Component {
  constructor(props) {
    super(props);
    this.toastRef = React.createRef();
    this.state = {
      paymentLink: '',
      accountTransactionId: -1,
      token: '',
      isOnboarding: false,
      loading: false,
      checkingForPayment: false,
      rotation: new Animated.Value(0),
    };
  }

  async componentDidMount() {
    this.rotateHourglass();
    LoggingUtil.logEvent('USER_ENTERED_CHECKING_FOR_PAYMENT');
    const { params } = this.props.navigation.state;
    if (params) {
      this.setState({
        paymentLink: params.paymentLink,
        accountTransactionId: params.accountTransactionId,
        token: params.token,
        isOnboarding: params.isOnboarding,
        amountAdded: params.amountAdded,
        bankDetails: params.bankDetails,
      });
    }
  }

  onPressCopy = () => {
    Clipboard.setString(this.state.paymentLink);
    this.toastRef.current.show('Copied to clipboard!');
  };

  checkIfPaymentCompleted = async () => {
    this.setState({
      checkingForPayment: true,
      loading: true,
    });
    try {
      const result = await fetch(
        `${Endpoints.CORE}addcash/check?transactionId=${this.state.accountTransactionId}&failureType=PENDING`,
        {
          headers: {
            Authorization: `Bearer ${this.state.token}`,
          },
          method: 'GET',
        }
      );
      if (result.ok) {
        const resultJson = await result.json();
        // console.log(resultJson);
        AppState.removeEventListener('change', this.handleAppStateChange);
        if (this.backHandler) {
          this.backHandler.remove();
        }
        this.setState({
          checkingForPayment: false,
          loading: false,
        });
        if (resultJson.result.includes('PAYMENT_SUCCEEDED')) {
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
            }
          );
        } else if (resultJson.result.includes('PAYMENT_PENDING')) {
          // do nothing, already on the page
        } else {
          LoggingUtil.logEvent('PAYMENT_FAILED_UNKNOWN', {
            serverResponse: JSON.stringify(result),
          });
          // failed
          // TODO redirect to failed screen
        }
      } else {
        throw result;
      }
    } catch (error) {
      LoggingUtil.logEvent('PAYMENT_FAILED_UNKNOWN', {
        serverResponse: JSON.stringify(error),
      });
      this.setState({ checkingForPayment: false, loading: false });
    }
  };

  onPressAlreadyPaid = () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    this.checkIfPaymentCompleted();
  };

  onPressPaymentLink = () => {
    Linking.openURL(this.state.paymentLink);
  };

  onPressEft = () => {
    const humanReference = this.props.navigation.getParam('humanReference');
    this.props.navigation.navigate('EFTPayment', {
      humanReference,
      bankDetails: this.state.bankDetails,
    });
  };

  onPressCancel = () => {
    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home');
  };

  onPressContact = () => {
    this.props.navigation.navigate('Support', { originScreen: 'CheckingForPayment', postSubmitNavigateHome: true });
  };

  async rotateHourglass() {
    const rotationDuration = HOURGLASS_ROTATION_DURATION;
    Animated.timing(this.state.rotation, {
      toValue: 1,
      duration: rotationDuration,
      easing: Easing.linear,
    }).start(() => {
      this.setState({
        rotation: new Animated.Value(0),
      });
      this.rotateHourglass();
    });
  }

  render() {
    const hourglassRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    const icon = (
      <Image source={require('../../assets/eft.png')} style={styles.eftIcon} />
    );

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContent}>
          <View style={styles.section}>
            <ImageBackground
              style={styles.hourglassBackground}
              source={require('../../assets/hourglass_path.png')}
            >
              <Animated.Image
                style={[
                  styles.hourglass,
                  { transform: [{ rotate: hourglassRotation }] },
                ]}
                source={require('../../assets/hourglass.png')}
              />
            </ImageBackground>
            <Text style={styles.title}>Checking for payment</Text>
            <Text style={styles.description}>
              Sorry, we seem to be having some trouble finding your payment.
              Would you prefer to pay via manual EFT instead?
            </Text>
            <Button
              title="PAY VIA EFT"
              icon={icon}
              loading={this.state.loading}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={this.onPressEft}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
          </View>
          <View style={styles.graySection}>
            <View style={styles.graySubsection}>
              <Text style={styles.buttonDescription}>
                Follow the link to retry with Ozow:
              </Text>
              <View style={{ flexDirection: 'row' }}>
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
              </View>
            </View>
            <View style={styles.separator} />
            <View style={styles.graySubsection}>
              <Text
                style={styles.buttonDescription}
                onPress={this.onPressAlreadyPaid}
              >
                Tap to check for payment
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.graySubsection}>
              <Text
                style={styles.buttonDescription}
                onPress={this.onPressCancel}
              >
                Cancel my payment
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.graySubsection}>
              <Text
                style={styles.buttonDescription}
                onPress={this.onPressContact}
              >
                Contact Us
              </Text>
            </View>
          </View>
        </View>

        <Overlay
          isVisible={this.state.checkingForPayment}
          dialogStyle={styles.dialogStyle}
          height="auto"
          width="auto"
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

        <Toast ref={this.toastRef} opacity={1} style={styles.toast} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  section: {
    width: '100%',
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hourglass: {
    marginTop: 10,
  },
  hourglassBackground: {
    width: 120,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  paymentLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    marginRight: 12,
    color: Colors.PURPLE,
  },
  copyIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.PURPLE,
    alignSelf: 'flex-end',
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    alignSelf: 'stretch',
    paddingHorizontal: 15,
  },
  toast: {
    backgroundColor: Colors.DARK_GRAY,
    width: '60%',
    alignItems: 'center',
  },
  dialogWrapper: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  dialogText: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    textAlign: 'center',
  },
  eftIcon: {
    marginRight: 10,
  },
  graySection: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    borderRadius: 15,
  },
  graySubsection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 2,
    backgroundColor: Colors.LIGHT_GRAY,
  },
  buttonDescription: {
    width: '100%',
    fontFamily: 'poppins-regular',
    fontSize: 15,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
    marginBottom: 3,
  },
});
