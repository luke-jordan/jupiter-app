import React from 'react';
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Input } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { Colors, Endpoints, Defaults } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class LimitedUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInput: Defaults.REFERRAL,
      notifyMode: false,
      hasError: false,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_REFERRAL_SCREEN');
  }

  onPressNotifyMe = () => {
    this.setState({
      userInput: '',
      notifyMode: !this.state.notifyMode,
      hasError: false,
    });
  };

  onPressLogin = () => {
    this.props.navigation.navigate('Login');
  };

  onPressContinue = async () => {
    if (this.state.loading) return;
    Keyboard.dismiss();
    if (this.state.notifyMode) {
      LoggingUtil.logEvent('USER_HAS_NO_REFERRAL_CODE');
      this.addUserToWaitingList();
    } else {
      this.verifyReferral();
    }
  };

  addUserToWaitingList = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    try {
      const payload = {
        phoneOrEmail: this.state.userInput,
        countryCode3Letter: 'ZAF',
        source: Platform.OS,
      };
      const result = await fetch(`${Endpoints.AUTH}register/list`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (result.ok) {
        this.setState({ loading: false });
        this.props.navigation.navigate('ThankYou');
      } else {
        throw result;
      }
    } catch (error) {
      this.showError();
    }
  };

  verifyReferral = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    try {
      const result = await fetch(`${Endpoints.CORE}referral/verify`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          referralCode: this.state.userInput,
          countryCode: 'ZAF',
        }),
      });
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({ loading: false });
        if (resultJson.result.includes('CODE_IS_ACTIVE')) {
          LoggingUtil.logEvent('USER_ENTERED_VALID_REFERRAL_CODE');
          this.props.navigation.navigate('Register', {
            referralCode: this.state.userInput,
          });
        } else {
          LoggingUtil.logEvent('USER_ENTERED_INVALID_REFERRAL_CODE');
          this.showError();
        }
      } else {
        throw result;
      }
    } catch (error) {
      this.showError();
    }
  };

  showError() {
    this.setState({
      loading: false,
      hasError: true,
    });
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        contentContainerStyle={styles.container}
        behavior="position"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={styles.wrapper}>
          <Image
            style={styles.image}
            source={require('../../assets/group_10.png')}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            Jupiter is giving early access to limited users.
          </Text>
          <Text style={styles.description}>
            <Text style={styles.bold}>
              {this.state.notifyMode
                ? 'Found a referral code? '
                : 'Don’t have a referral code? '}
            </Text>
            {this.state.notifyMode
              ? ''
              : '\nBe one of the first to know when access is open! '}
            <Text style={styles.textAsButton} onPress={this.onPressNotifyMe}>
              {this.state.notifyMode ? 'Press here to enter it' : 'Notify me'}
            </Text>
          </Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.labelStyle}>
            {this.state.notifyMode
              ? 'Enter your cell number or email address to be notified*'
              : 'Enter your referral code (caps or lower case)*'}
          </Text>
          <Input
            value={this.state.userInput}
            onChangeText={text =>
              this.setState({ userInput: text, hasError: false })
            }
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={[
              styles.inputStyle,
              this.state.hasError ? styles.redText : null,
            ]}
            containerStyle={styles.containerStyle}
          />
          {this.state.hasError ? (
            <Text style={styles.errorMessage}>
              {this.state.notifyMode
                ? 'Please enter a valid number or email address'
                : 'Please enter a valid referral code'}
            </Text>
          ) : null}
        </View>
        <View style={styles.nextButtonWrapper}>
          <Button
            testID="limited-users-button"
            accessibilityLabel="limited-users-button"
            title={this.state.notifyMode ? 'NOTIFY ME' : 'CONTINUE'}
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
        </View>
        <Text style={styles.haveAnAccountText}>
          Already have an account?
          <Text
            testID="limited-users-login"
            accessibilityLabel="limited-users-login"
            style={styles.textAsButton}
            onPress={this.onPressLogin}
          >
            {' '}
            Log in
          </Text>
        </Text>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 5,
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 15,
  },
  image: {
    height: '30%',
    marginBottom: 30,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 7.2 * FONT_UNIT,
    lineHeight: 10 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
  },
  description: {
    marginTop: 10,
    marginHorizontal: 12 * FONT_UNIT,
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
    textAlign: 'center',
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  textAsButton: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
  },
  redText: {
    color: Colors.RED,
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 12,
    marginTop: -15, // this is valid because of the exact alignment of other elements - do not reuse in other components
    marginBottom: 20,
  },
  labelStyle: {
    fontSize: 12,
    fontFamily: 'poppins-semibold',
    marginVertical: 5,
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    flex: 1,
    marginVertical: 10,
    justifyContent: 'center',
    width: '80%',
  },
  nextButtonWrapper: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  haveAnAccountText: {
    marginTop: 10,
    marginHorizontal: 12 * FONT_UNIT,
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
    textAlign: 'center',
    marginBottom: 15,
  },
});
