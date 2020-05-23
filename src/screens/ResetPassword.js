import React from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Input, Icon } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      hasError: false,
      userInput: '',
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_INITIATED_PWORD_RESET_ON_OTP');
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onPressReset = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    if (!this.state.userInput) {
      return;
    }

    try {
      const phoneOrEmail = this.state.userInput.trim();
      const result = await fetch(`${Endpoints.AUTH}otp/generate`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          phoneOrEmail,
          type: 'RESET',
        }),
      });
      if (result.ok) {
        this.setState({ loading: false });
        const resultJson = await result.json();
        this.props.navigation.navigate('OTPVerification', {
          userId: phoneOrEmail,
          systemWideUserId: resultJson.systemWideUserId,
          redirection: 'Reset',
        });
      } else if (result.status === 400) {
        this.showError();
      } else if (result.status === 403) {
        // note : this is a potential flaw, as it will allow some probing, to be remedied when there are sufficient users to justify it
        this.showError('Sorry, we could not find your profile. Did you use another contact method to register?');
      } else {
        throw result;
      }
    } catch (error) {
      this.showError();
    }
  };

  showError(errorText = 'Sorry, that does not appear to be a valid phone number or email address') {
    this.setState({
      loading: false,
      hasError: true,
      errorText,
    });
  }

  render() {
    return (
      <View
        style={styles.container}
        contentContainerStyle={styles.container}
        behavior="position"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
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
        <Image
          style={styles.image}
          source={require('../../assets/lock.png')}
          resizeMode="contain"
        />
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>
          We’ll send you a code to reset your password.
        </Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.labelStyle}>
            Enter your phone number or email address*
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
              {this.state.errorText}
            </Text>
          ) : null}
        </View>
        <Button
          title="RESET PASSWORD"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressReset}
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
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  image: {
    height: '15%',
    marginVertical: 30,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 7.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.DARK_GRAY,
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 3.8 * FONT_UNIT,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  labelStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
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
    marginVertical: 10,
    justifyContent: 'center',
    width: '100%',
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
  header: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -20,
  },
});
