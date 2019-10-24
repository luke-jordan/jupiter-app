import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, Linking, Clipboard, ActivityIndicator, AppState, ImageBackground, Animated, Easing } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-easy-toast';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';

const HOURGLASS_ROTATION_DURATION = 10000;

export default class CheckingForPayment extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      paymentLink: "",
      accountTransactionId: -1,
      token: "",
      isOnboarding: false,
      loading: false,
      checkingForPayment: false,
      rotation: new Animated.Value(0),
    };
  }

  async componentDidMount() {
    this.rotateHourglass();
    LoggingUtil.logEvent('USER_ENTERED_CHECKING_FOR_PAYMENT');
    let params = this.props.navigation.state.params;
    if (params) {
      this.setState({
        paymentLink: params.paymentLink,
        accountTransactionId: params.accountTransactionId,
        token: params.token,
        isOnboarding: params.isOnboarding,
        amountAdded: params.amountAdded,
      });
    }
  }

  async rotateHourglass() {
    let rotationDuration = HOURGLASS_ROTATION_DURATION;
    Animated.timing(
      this.state.rotation,
      {
        toValue: 1,
        duration: rotationDuration,
        easing: Easing.linear,
      }
    ).start(() => {
      this.setState({
        rotation: new Animated.Value(0),
      });
      this.rotateHourglass();
    });
  }

  onPressCopy = () => {
    Clipboard.setString(this.state.paymentLink);
    this.refs.toast.show('Copied to clipboard!');
  }

  checkIfPaymentCompleted = async () => {
    this.setState({
      checkingForPayment: true,
      loading: true,
    });
    try {
      let result = await fetch(Endpoints.CORE + 'addcash/check?transactionId=' + this.state.accountTransactionId + '&failureType=PENDING', {
        headers: {
          'Authorization': 'Bearer ' + this.state.token,
        },
        method: 'GET',
      });
      if (result.ok) {
        let resultJson = await result.json();
        // console.log(resultJson);
        AppState.removeEventListener('change', this.handleAppStateChange);
        this.backHandler.remove();
        this.setState({
          checkingForPayment: false,
          loading: false,
        });
        if (resultJson.result.includes("PAYMENT_SUCCEEDED")) {
          NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'PaymentComplete', {
            paymentLink: this.state.paymentLink,
            accountTransactionId:this.state.accountTransactionId,
            token: this.state.token,
            isOnboarding: this.state.isOnboarding,
            newBalance: resultJson.newBalance,
            amountAdded: this.state.amountAdded,
          });
        } else if (resultJson.result.includes("PAYMENT_PENDING")) {
          //do nothing, already on the page
        } else {
          LoggingUtil.logEvent('PAYMENT_FAILED_UNKNOWN', { "serverResponse" : JSON.stringify(result) });
          //failed
          //TODO redirect to failed screen
        }
      } else {
        throw result;
      }
    } catch (error) {
      LoggingUtil.logEvent('PAYMENT_FAILED_UNKNOWN', { "serverResponse" : JSON.stringify(result) });
      console.log("error!", error.status);
      this.setState({checkingForPayment: false, loading: false});
    }
  }

  onPressAlreadyPaid = () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    this.checkIfPaymentCompleted();
  }

  onPressPaymentLink = () => {
    Linking.openURL(this.state.paymentLink);
  }

  render() {
    const hourglassRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    return (
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.section}>
            <ImageBackground style={styles.hourglassBackground} source={require('../../assets/hourglass_path.png')}>
              <Animated.Image style={[styles.hourglass, {transform: [{rotate: hourglassRotation}]}]} source={require('../../assets/hourglass.png')}/>
            </ImageBackground>
            <Text style={styles.title}>Checking for payment</Text>
            <Text style={styles.description}>Sorry we seem to be having some trouble finding your payment.</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.buttonDescription}>Please follow the link to pay via Ozow:</Text>
            <LinearGradient start={[0, 0.5]} end={[1, 0.5]} colors={[Colors.LIGHT_BLUE, Colors.PURPLE]} style={styles.gradientStyle}>
              <Text style={styles.paymentLink} onPress={this.onPressPaymentLink}>{this.state.paymentLink}</Text>
              <TouchableOpacity onPress={this.onPressCopy}>
                <Image style={styles.copyIcon} source={require('../../assets/copy.png')} resizeMode="contain"/>
              </TouchableOpacity>
            </LinearGradient>
          </View>
          <View style={styles.orView}>
            <Text style={styles.orText}>-OR-</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.explanation}>If you’ve already paid, tap the button below and we’ll check again.</Text>
            <Button
              testID='payment-check-paid'
              accessibilityLabel='payment-check-paid'
              title="I'VE ALREADY PAID"
              loading={this.state.loading}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={this.onPressAlreadyPaid}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }} />
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Payment still not going through? <Text style={styles.footerLink}>Contact us</Text></Text>
        </View>

        <Dialog
          visible={this.state.checkingForPayment}
          dialogStyle={styles.dialogStyle}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          onTouchOutside={() => {}}
          onHardwareBackPress={() => {this.setState({checkingForPayment: false}); return true;}}
        >
          <DialogContent style={styles.dialogWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
            <Text style={styles.dialogText}>Checking if your payment is complete...</Text>
          </DialogContent>
        </Dialog>

        <Toast ref="toast" opacity={1} style={styles.toast}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
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
  },
  buttonDescription: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
    marginBottom: 3,
  },
  gradientStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    borderRadius: 10,
    minHeight: 65,
    paddingHorizontal: 20,
  },
  paymentLink: {
    flex: 1,
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.WHITE,
  },
  copyIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.WHITE,
    alignSelf: 'flex-end',
  },
  orView: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    borderRadius: 65 / 2,
    width: 65,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orText: {
    fontFamily: 'poppins-regular',
    fontSize: 16,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
  },
  explanation: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
    marginBottom: 3,
    paddingHorizontal: 15,
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
  footer: {
    height: '6.5%',
    width: '100%',
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  footerText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
  },
  footerLink: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  toast: {
    backgroundColor: Colors.DARK_GRAY,
    width: '60%',
    alignItems: 'center',
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
});
