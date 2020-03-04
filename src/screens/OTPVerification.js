import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  AsyncStorage,
  TouchableOpacity,
} from 'react-native';
import { Input, Button, Overlay } from 'react-native-elements';

import { Colors, Endpoints, DeviceInfo } from '../util/Values';
import { NavigationUtil } from '../util/NavigationUtil';

export default class OTPVerification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pin: [null, null, null, null],
      loading: false,
      dialogVisible: false,
      otpError: false,
      header: 'Please enter the one time pin sent to you',
      deviceId: DeviceInfo.DEVICE_ID,
    };
  }

  async componentDidMount() {
    // TODO show phone / email in this.state.otpMethod properly according to the backend response
    const channel = this.props.navigation.getParam('channel');
    if (channel === 'EMAIL' || channel === 'PHONE') {
      this.setState({
        header: `Please enter the one time pin sent to your ${channel.toLowerCase()}`,
      });
    }
  }

  onPressContinue = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    const userId = this.props.navigation.getParam('userId');
    const redirection = this.props.navigation.getParam('redirection');
    if (redirection.includes('Login')) {
      this.handleLogin(userId);
    } else if (redirection.includes('Reset')) {
      const systemWideUserId = this.props.navigation.getParam('systemWideUserId');
      this.handlePassReset(userId, systemWideUserId);
    } else {
      this.setState({ loading: false });
    }
  };

  onPressResend = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    const userId = this.props.navigation.getParam('userId');
    const redirection = this.props.navigation.getParam('redirection');
    let type = 'LOGIN';
    if (redirection.includes('Reset')) {
      type = 'RESET';
      // } else if (redirection.includes('')) {
    }
    try {
      const result = await fetch(`${Endpoints.AUTH}otp/generate`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          phoneOrEmail: userId,
          type,
        }),
      });
      if (result.ok) {
        this.setState({ loading: false });
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ loading: false });
    }
  };

  onPressHelp = () => {
    this.setState({
      dialogVisible: true,
    });
  };

  onPressContactUs = () => {
    this.onHideDialog();
  };

  onHideDialog = () => {
    this.setState({
      dialogVisible: false,
    });
    return true;
  };

  onChangePinField = (text, index) => {
    const { pin } = this.state;
    const deletion = text.length === 0;
    if (deletion) {
      pin[index] = null;
    } else {
      const num = parseInt(text[text.length - 1]);
      if (num >= 0 && num <= 9) {
        pin[index] = text[text.length - 1];
      }
    }
    this.setState({
      otpError: false,
      pin,
    });
    switch (index) {
      case 0:
        if (!deletion) this.inputRefs1.focus();
        break;

      case 1:
        if (deletion) this.inputRefs0.focus();
        else this.inputRefs2.focus();
        break;

      case 2:
        if (deletion) this.inputRefs1.focus();
        else this.inputRefs3.focus();
        break;

      case 3:
        if (deletion) this.inputRefs2.focus();
        else this.inputRefs3.blur();
        break;

      default:
        break;
    }
  };

  async handlePassReset(userId, systemWideUserId) {
    try {
      const otpResult = await fetch(`${Endpoints.AUTH}otp/verify`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          systemWideUserId,
          otp: this.state.pin.join(''),
          deviceId: this.state.deviceId,
        }),
      });
      if (otpResult.ok) {
        const otpResultJson = await otpResult.json();
        if (!otpResultJson.verified) {
          throw otpResult;
        }
      } else {
        throw otpResult;
      }

      const result = await fetch(
        `${Endpoints.AUTH}password/reset/obtainqs?phoneOrEmail=${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          method: 'GET',
        }
      );
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({ loading: false });
        if (resultJson.flags && resultJson.flags.includes('CAN_SKIP_QUESTIONS')) {
          NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'SetPassword',
            { systemWideUserId: resultJson.systemWideUserId, isReset: true }
          );
        } else {
          NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'ResetQuestions', { questions: resultJson });
        }
      } else {
        const resultJson = await result.json();
        if (Array.isArray(resultJson)) {
          this.setState({
            loading: false,
            otpError: resultJson.indexOf('OTP_ERROR') > -1,
          });
        } else {
          this.setState({
            loading: false,
            otpError: true,
          });
        }
      }
    } catch (error) {
      this.setState({ loading: false, otpError: true });
    }
  }

  async handleLogin(userId) {
    try {
      const result = await fetch(`${Endpoints.AUTH}login`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          phoneOrEmail: userId,
          otp: this.state.pin.join(''),
          deviceId: this.state.deviceId,
        }),
      });

      if (result.ok) {
        const resultJson = await result.json();
        this.setState({ loading: false });
        await Promise.all([
          AsyncStorage.setItem('userInfo', JSON.stringify(resultJson)),
          AsyncStorage.setItem('hasOnboarded', 'true'),
        ]);
        const { screen, params } = NavigationUtil.directBasedOnProfile(resultJson, false);
        NavigationUtil.navigateWithoutBackstack(this.props.navigation, screen, params);
      } else {
        const resultJson = await result.json();
        if (Array.isArray(resultJson)) {
          this.setState({
            loading: false,
            otpError: resultJson.indexOf('OTP_ERROR') > -1,
          });
        } else {
          this.setState({ loading: false });
        }
      }
    } catch (error) {
      console.log('Error: ', error);
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerImageWrapper}>
          <Image
            style={styles.headerImage}
            source={require('../../assets/otp_phone_illi.png')}
          />
        </View>
        <View style={styles.mainContent}>
          <Text style={styles.labelStyle}>{this.state.header}</Text>
          <View style={styles.pinInputs}>
            <Input
              testID="otp-index-1"
              accessibilityLabel="otp-index-1"
              ref={ref => (this.inputRefs0 = ref)}
              keyboardType="numeric"
              secureTextEntry
              value={this.state.pin[0] ? this.state.pin[0].toString() : ''}
              onChangeText={text => this.onChangePinField(text, 0)}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
            <Input
              testID="otp-index-2"
              accessibilityLabel="otp-index-2"
              ref={ref => (this.inputRefs1 = ref)}
              keyboardType="numeric"
              secureTextEntry
              value={this.state.pin[1] ? this.state.pin[1].toString() : ''}
              onChangeText={text => this.onChangePinField(text, 1)}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
            <Input
              testID="otp-index-3"
              accessibilityLabel="otp-index-3"
              ref={ref => (this.inputRefs2 = ref)}
              keyboardType="numeric"
              secureTextEntry
              value={this.state.pin[2] ? this.state.pin[2].toString() : ''}
              onChangeText={text => this.onChangePinField(text, 2)}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
            <Input
              testID="otp-index-4"
              accessibilityLabel="otp-index-4"
              ref={ref => (this.inputRefs3 = ref)}
              keyboardType="numeric"
              secureTextEntry
              value={this.state.pin[3] ? this.state.pin[3].toString() : ''}
              onChangeText={text => this.onChangePinField(text, 3)}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
          </View>
          {this.state.otpError ? (
            <Text style={styles.redText}>
              Sorry, the OTP you entered is not valid.
            </Text>
          ) : null}
        </View>
        <Button
          testID="otp-continue-btn"
          accessibilityLabel="otp-continue-btn"
          title="CONTINUE"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressContinue}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
        <View style={styles.signUpLink}>
          <Text style={styles.noAccText}>
            Didn&apos;t receive the OTP pin?
            <Text style={styles.noAccButton} onPress={this.onPressResend}>
              {' '}
              Resend
            </Text>
          </Text>
          <Text style={styles.noAccText}>
            What is a one-time password?
            <Text style={styles.noAccButton} onPress={this.onPressHelp}>
              {' '}
              Help
            </Text>
          </Text>
        </View>

        <Overlay
          isVisible={this.state.dialogVisible}
          height="auto"
          width="auto"
          onBackdropPress={this.onHideDialog}
          onHardwareBackPress={this.onHideDialog}
        >
          <View style={styles.dialogWrapper}>
            <View style={styles.helpDialog}>
              <Text style={styles.helpTitle}>Help</Text>
              <Text style={styles.helpContent}>
                A one-time password (OTP) is a password that is valid for only
                one login session, or transaction on a digital device.
                {'\n\n'}
                Check that you haven’t entered an incorrect OTP or resend a new
                pin.
              </Text>
              <Text style={styles.helpLink} onPress={this.onPressContactUs}>
                Contact Us
              </Text>
              <TouchableOpacity
                style={styles.closeDialog}
                onPress={this.onHideDialog}
              >
                <Image source={require('../../assets/close.png')} />
              </TouchableOpacity>
            </View>
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
    justifyContent: 'space-between',
  },
  headerImageWrapper: {
    flex: 1,
  },
  headerImage: {
    marginVertical: 20,
  },
  mainContent: {
    flex: 2,
    width: '90%',
    minHeight: 100,
    justifyContent: 'center',
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    width: '20%',
    marginHorizontal: 10,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinInputs: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelStyle: {
    fontSize: 24,
    fontFamily: 'poppins-regular',
    marginBottom: 10,
    marginHorizontal: 20,
    textAlign: 'center',
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
    marginBottom: 20,
    justifyContent: 'center',
    width: '80%',
  },
  signUpLink: {
    alignItems: 'center',
    marginBottom: 10,
  },
  noAccText: {
    textAlign: 'center',
    fontFamily: 'poppins-regular',
    marginBottom: 5,
    fontSize: 14,
  },
  noAccButton: {
    color: Colors.PURPLE,
    fontWeight: 'bold',
  },
  dialogWrapper: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpDialog: {
    minHeight: 310,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  helpTitle: {
    textAlign: 'center',
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpContent: {
    fontFamily: 'poppins-regular',
    fontSize: 16,
    lineHeight: 20,
  },
  helpLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.PURPLE,
    fontWeight: 'bold',
  },
  closeDialog: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  redText: {
    fontFamily: 'poppins-semibold',
    color: Colors.RED,
    textAlign: 'center',
    marginTop: 25,
  },
});
