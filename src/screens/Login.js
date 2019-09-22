import React from 'react';
import { StyleSheet, View, Image, Text, ImageBackground } from 'react-native';
import { Colors, Endpoints } from '../util/Values';
import { Input, Button } from 'react-native-elements';
import { LoggingUtil } from '../util/LoggingUtil';
import { ValidationUtil } from '../util/ValidationUtil';

import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';

const stdHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      userId: "someone@jupitersave.com",
      validationError: false,
      password: "holy_CHRYSALIS_hatching9531",
      passwordError: false
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_LOGIN_SCREEN');
  }

  initiateLogin = async () => {
    const loginOptions = {
      headers: stdHeaders,
      method: 'POST',
      body: JSON.stringify({
        phoneOrEmail: this.state.userId,
        password: this.state.password
      })
    };

    const result = await fetch(Endpoints.AUTH + 'login', loginOptions);
    
    if (result.ok) {
      let resultJson = await result.json();
      await this.generateOtpAndMove(resultJson.systemWideUserId);
    } else if (result.status == 403) {
      this.setState({ 
        loading: false,
        passwordError: true
      });
    } else {
        this.setState({ loading: false });
        // todo: display proper error with contact us
    }
  }

  generateOtpAndMove = async () => {
    let result = await fetch(Endpoints.AUTH + 'otp/generate', {
      headers: stdHeaders,
      method: 'POST',
      body: JSON.stringify({
        phoneOrEmail: this.state.userId,
        'type': 'LOGIN',
      }),
    });

    if (result.ok) {
      const resultJson = await result.json();
      this.setState({ loading: true });
      this.props.navigation.navigate('OTPVerification', {
        userId: this.state.userId,
        password: this.state.password,
        channel: resultJson.channel,
        redirection: 'Login',
      });
      this.setState({ loading: false }); // in case we come back (leaving true above in case slowness in nav)
    } else {
      throw result;
    }
  };

  onPressLogin = async () => {
    if (this.state.loading) return;
    // Just to clear this so user can always see it is happening
    this.setState({ validationError: false });

    const isValid = ValidationUtil.checkValidEmailPhone(this.state.userId);
    if (!isValid) {
      console.log('ERROR! Halted submission');
      this.setState({ validationError: true });
      return;
    }

    this.setState({loading: true});
    try {
      await this.initiateLogin();
    } catch (error) {
      console.log("error!", error);
      this.setState({loading: false});
    }
  }

  onPressSignUp = () => {
    // NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home');
  }

  onPressWhatIs = () => {
    this.props.navigation.navigate('Onboarding');
  }

  onPressForgotPassword = () => {
    this.props.navigation.navigate('ResetPassword');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerImageWrapper}>
          <Image style={styles.headerImage} source={require('../../assets/group_16.png')}/>
        </View>
        <View style={styles.mainContent}>
          <Text style={styles.labelStyle}>Enter your phone number or email*</Text>
          <Input
            value={this.state.userId}
            onChangeText={(text) => this.setState({userId: text})}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            containerStyle={styles.containerStyle}
          />
          {
            this.state.validationError ?
            <Text style={styles.validationErrorText}>Please enter a valid email or phone number</Text> 
            : null
          }
          <Text style={styles.labelStyle}>Password*</Text>
          <Input
            secureTextEntry={true}
            value={this.state.password}
            onChangeText={(text) => this.setState({password: text})}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            containerStyle={styles.containerStyle}
          />
          <Text style={styles.textAsButton} onPress={this.onPressForgotPassword}>
            Forgot Password?
          </Text>
          {
            this.state.passwordError ? 
            <Text style={styles.accessErrorText}>Sorry, we couldn&apos;t match that phone/email and password. Please try again.</Text>
            : null
          }
        </View>
        <Button
          title="LOGIN"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressLogin}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }} />
        <View style={styles.signUpLink}>
          {/*
          <Text style={styles.noAccText}>Don't have an account yet?
            <Text style={styles.noAccButton} onPress={this.onPressSignUp}> Sign up</Text>
          </Text>
          */}
        </View>
        <ImageBackground source={require('../../assets/wave_pattern.png')} style={styles.bottomView}>
          <Text style={styles.bottomText} onPress={this.onPressWhatIs}>WHAT IS JUPITER?</Text>
        </ImageBackground>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    marginVertical: 20,
  },
  mainContent: {
    flex: 2,
    width: '90%',
    minHeight: 170,
    justifyContent: 'center',
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
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
  textAsButton: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  signUpLink: {
    alignItems: 'center',
    flex: 1,
  },
  noAccText: {
    textAlign: 'center',
    fontFamily: 'poppins-regular',
    fontSize: 14,
  },
  noAccButton: {
    color: Colors.PURPLE,
    fontWeight: 'bold',
  },
  bottomView: {
    width: '100%',
    height: 75,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.WHITE,
    marginTop: 15,
  },
  validationErrorText: {
    fontFamily: 'poppins-semibold',
    color: Colors.RED,
    textAlign: 'left'
  },
  accessErrorText: {
    fontFamily: 'poppins-semibold',
    color: Colors.RED,
    textAlign: 'center',
    marginTop: 25,
  }
});
