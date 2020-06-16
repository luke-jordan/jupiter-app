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
  Linking,
  ScrollView
} from 'react-native';
import { Button, Input } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { Colors, Endpoints, Defaults, FallbackSupportNumber } from '../util/Values';

const { width, height } = Dimensions.get('window');
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
    // console.log('ENTERED REFERRAL, HEIGHT: ', height);
    this.fetchReferralDefaults();
  }

  onPressNotifyMe = () => {
    this.setState({
      userInput: '',
      notifyMode: !this.state.notifyMode,
      hasError: false,
    });
  };

  onPressWhatsApp = () => {
    const defaultText = 'Hi! I\'d like a referral code for Jupiter please. You should give me one because - ';
    const whatsAppLink = `https://wa.me/${FallbackSupportNumber.link}?text=${encodeURIComponent(defaultText)}`;
    Linking.openURL(whatsAppLink).catch((err) => {
      LoggingUtil.logError(err);
      this.defaultToSupportScreen()
    });
  };

  defaultToSupportScreen = () => {
    this.props.navigation.navigate('Support', {
      originScreen: 'LimitedUsers',
      preFilledSupportMessage: 'Hi, please give me a referral code',
    });
  }

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

  fetchReferralDefaults = async () => {
    try {
      // console.log('Fetching referral defaults');
      const options = { method: 'GET', headers: { Accept: 'application/json' } };
      const result = await fetch(`${Endpoints.CORE}referral/status?countryCode=ZAF`, options);
      if (!result.ok) {
        throw result;
      }
      const { defaultCode } = await result.json();
      // console.log('Code required :: ', codeRequired);
      if (defaultCode) {
        this.setState({ userInput: defaultCode });
      }
    } catch (err) {
      console.log('Failure fetching referral status: ', JSON.stringify(err));
    }
  }

  verifyReferral = async () => {
    if (this.state.loading) return;

    if (typeof this.state.userInput !== 'string' || this.state.userInput.trim().length === 0) {
      this.showError('Please enter a referral code to continue');
      return;
    }

    this.setState({ loading: true });
    
    try {
      const providedCode = this.state.userInput.trim();
      const endPoint = `${Endpoints.CORE}referral/verify`;

      const result = await fetch(endPoint, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          referralCode: providedCode,
          countryCode: 'ZAF',
        }),
      });

      if (result.ok) {
        const resultJson = await result.json();
        this.setState({ loading: false });
        if (resultJson.result.includes('CODE_IS_ACTIVE')) {
          LoggingUtil.logEvent('USER_ENTERED_VALID_REFERRAL_CODE');
          this.props.navigation.navigate('Register', { referralCode: providedCode });
        } else {
          this.handleCodeNotFound();
        }
      } else if (result.status === 404) {
        this.handleCodeNotFound();
      } else {
        LoggingUtil.logApiError(endPoint, result);
        throw result;
      }
    } catch (error) {
      this.showError('Sorry, there is an error submitting to the server. Please try again later');
    }

  };

  handleCodeNotFound() {
    LoggingUtil.logEvent('USER_ENTERED_INVALID_REFERRAL_CODE');
    this.showError('Sorry, we could not find that code. Please check it and try again');
  }

  showError(errorMessage) {
    this.setState({
      loading: false,
      hasError: true,
      errorText: errorMessage || 'Sorry, there was an error submitting',
    });
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.avoidingContainer}
        contentContainerStyle={styles.container}
        behavior="height"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          style={styles.scrollView}
        >
          <View style={styles.imageBlock}>
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
              {!this.state.notifyMode && (
                <Text>{'\n'}
                No problem! <Text style={styles.textAsButton} onPress={this.onPressWhatsApp}>WhatsApp</Text> our support team, 
                tell us how much you want in &amp; we may just send you a code right now!
                </Text>              
              )}
              {/* ? '' : '\nBe one of the first to know when access is open! '} */}
              {/* <Text style={styles.textAsButton} onPress={this.onPressNotifyMe}>
                {this.state.notifyMode ? 'Press here to enter it' : 'Notify me'}
              </Text> */}
            </Text>
          </View>
          <View style={styles.inputBlock}>
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
              containerStyle={styles.inputWrapperStyle}
            />
            {this.state.hasError ? (
              <Text style={styles.errorMessage}>
                {this.state.errorText}
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
              Login
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  avoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  imageBlock: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 30,
  },
  image: {
    maxHeight: 150,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 7.2 * FONT_UNIT,
    lineHeight: 10 * FONT_UNIT,
    marginTop: 15,
    textAlign: 'center',
  },
  description: {
    marginTop: 5,
    marginHorizontal: 5 * FONT_UNIT,
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
    lineHeight: 6 * FONT_UNIT,
    textAlign: 'center',
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  textAsButton: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  inputBlock: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
  },
  redText: {
    color: Colors.RED,
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 12,
    marginTop: 5,
    marginBottom: 20,
  },
  labelStyle: {
    fontSize: 12,
    fontFamily: 'poppins-semibold',
    marginVertical: 5,
  },
  inputWrapperStyle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonWrapper: {
    justifyContent: 'flex-end',
    width: '100%',
    marginTop: height > 640 ? 20 : 10,
    paddingHorizontal: 15,
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
    justifyContent: 'center',
    width: '100%',
  },
  haveAnAccountText: {
    marginTop: height > 640 ? 20 : 10,
    marginHorizontal: 12 * FONT_UNIT,
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
    textAlign: 'center',
    paddingBottom: 20,
  },
});
