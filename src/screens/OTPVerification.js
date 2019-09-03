import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, ImageBackground, TouchableOpacity } from 'react-native';
import { Colors, Endpoints } from '../util/Values';
import { Input, Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationUtil } from '../util/NavigationUtil';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';

export default class OTPVerification extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      phoneNumber: "********87",
      pin: [null, null, null, null],
      loading: false,
      dialogVisible: false,
      otpMethod: "phone",
      otpError: false,
      passwordError: false,
    };
  }

  async componentDidMount() {
    //TODO show phone / email in this.state.otpMethod properly according to the backend response
  }

  async handleLogin(userId, password) {
    try {
      let result = await fetch(Endpoints.AUTH + 'login', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          "phoneOrEmail": userId,
          "password": password,
          "otp": this.state.pin.join(""),
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        this.setState({loading: false});
        // console.log("result:", resultJson);
        if (resultJson.onboardStepsComplete.includes("ALL")) {
          AsyncStorage.setItem('userInfo', JSON.stringify(resultJson));
          NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home', { userInfo: resultJson });
        } else {
          NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'PendingRegistrationSteps', { userInfo: resultJson });
        }
      } else {
        let resultJson = await result.json();
        if (Array.isArray(resultJson)) {
          this.setState({
            loading: false,
            otpError: resultJson.indexOf("OTP_ERROR") > -1,
            passwordError: resultJson.indexOf("PASSWORD_ERROR") > -1,
          });
        } else {
          this.setState({loading: false});
        }
      }
    } catch (error) {
      console.log("error!", await error.text());
      this.setState({loading: false});
    }

  }

  async handlePassReset(userId) {
    try {
      let result = await fetch(Endpoints.AUTH + 'password/reset/obtainqs?phoneOrEmail=' + userId + '&otp=' + this.state.pin.join(""), {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'GET',
      });
      if (result.ok) {
        let resultJson = await result.json();
        this.setState({loading: false});
        NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'ResetQuestions', { questions: resultJson });
      } else {
        let resultJson = await result.json();
        if (Array.isArray(resultJson)) {
          this.setState({
            loading: false,
            otpError: resultJson.indexOf("OTP_ERROR") > -1,
            passwordError: resultJson.indexOf("PASSWORD_ERROR") > -1,
          });
        } else {
          this.setState({
            loading: false,
            otpError: true
          });
        }
      }
    } catch (error) {
      console.log("error!", await error.text());
      this.setState({loading: false});
    }

  }

  onPressContinue = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    let userId = this.props.navigation.getParam("userId");
    let password = this.props.navigation.getParam("password");
    let redirection = this.props.navigation.getParam("redirection");
    if (redirection.includes('Login')) {
      this.handleLogin(userId, password);
    } else if (redirection.includes('Reset')) {
      this.handlePassReset(userId);
    } else {
      this.setState({loading: false});
    }
  }

  onPressResend = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    let userId = this.props.navigation.getParam("userId");
    let password = this.props.navigation.getParam("password");
    let redirection = this.props.navigation.getParam("redirection");
    let type = "LOGIN";
    if (redirection.includes('Reset')) {
      type = "RESET";
    // } else if (redirection.includes('')) {

    }
    try {
      let result = await fetch(Endpoints.AUTH + 'otp/generate', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          "phoneOrEmail": userId,
          "type": type,
        }),
      });
      if (result.ok) {
        this.setState({loading: false});
      } else {
        throw result;
      }
    } catch (error) {
      console.log("error!", error);
      this.setState({loading: false});
    }
  }

  onPressHelp = () => {
    this.setState({
      dialogVisible: true,
    });
  }

  onPressContactUs = () => {
    this.onHideDialog();
  }

  onHideDialog = () => {
    this.setState({
      dialogVisible: false,
    });
    return true;
  }

  onChangePinField = (text, index) => {
    let pin = this.state.pin;
    let num = parseInt(text[text.length - 1]);
    if (num >= 0 && num <= 9) {
      pin[index] = text[text.length - 1];
      this.setState({
        otpError: false,
        passwordError: false,
        pin,
      });
    }
    switch (index) {
      case 0:
      this.inputRefs1.focus();
      break;

      case 1:
      this.inputRefs2.focus();
      break;

      case 2:
      this.inputRefs3.focus();
      break;

      case 3:
      this.inputRefs3.blur();
      break;

      default:
      break;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerImageWrapper}>
          <Image style={styles.headerImage} source={require('../../assets/otp_phone_illi.png')}/>
        </View>
        <View style={styles.mainContent}>
          <Text style={styles.labelStyle}>Please enter the one time pin sent to your {this.state.otpMethod}</Text>
          <View style={styles.pinInputs}>
            <Input
              ref={ref => this.inputRefs0 = ref}
              keyboardType='numeric'
              secureTextEntry={true}
              value={this.state.pin[0] ? this.state.pin[0].toString() : ""}
              onChangeText={(text) => this.onChangePinField(text, 0)}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
            <Input
              ref={ref => this.inputRefs1 = ref}
              keyboardType='numeric'
              secureTextEntry={true}
              value={this.state.pin[1] ? this.state.pin[1].toString() : ""}
              onChangeText={(text) => this.onChangePinField(text, 1)}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
            <Input
              ref={ref => this.inputRefs2 = ref}
              keyboardType='numeric'
              secureTextEntry={true}
              value={this.state.pin[2] ? this.state.pin[2].toString() : ""}
              onChangeText={(text) => this.onChangePinField(text, 2)}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
            <Input
              ref={ref => this.inputRefs3 = ref}
              keyboardType='numeric'
              secureTextEntry={true}
              value={this.state.pin[3] ? this.state.pin[3].toString() : ""}
              onChangeText={(text) => this.onChangePinField(text, 3)}
              inputContainerStyle={styles.inputContainerStyle}
              inputStyle={styles.inputStyle}
              containerStyle={styles.containerStyle}
            />
          </View>
          {
            this.state.otpError ?
            <Text style={styles.redText}>The OTP you entered is not valid.</Text>
            : null
          }
          {
            this.state.passwordError ?
            <Text style={styles.redText}>The password you entered is not valid.</Text>
            : null
          }
        </View>
        <Button
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
          }} />
        <View style={styles.signUpLink}>
          <Text style={styles.noAccText}>Didn't receive the OTP pin?
            <Text style={styles.noAccButton} onPress={this.onPressResend}> Resend</Text>
          </Text>
          <Text style={styles.noAccText}>What is a one-time password?
            <Text style={styles.noAccButton} onPress={this.onPressHelp}> Help</Text>
          </Text>
        </View>

        <Dialog
          visible={this.state.dialogVisible}
          dialogStyle={styles.editPicDialog}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          onTouchOutside={this.onHideDialog}
          onHardwareBackPress={this.onHideDialog}
        >
          <DialogContent style={styles.dialogWrapper}>
            <View style={styles.helpDialog}>
              <Text style={styles.helpTitle}>Help</Text>
              <Text style={styles.helpContent}>
                A one-time password (OTP) is a password that is valid for only one login session, or transaction on a digital device.
                {"\n\n"}
                Check that you haven’t entered an incorrect OTP or resend a new pin.
              </Text>
              <Text style={styles.helpLink} onPress={this.onPressContactUs}>Contact Us</Text>
              <TouchableOpacity style={styles.closeDialog} onPress={this.onHideDialog} >
                <Image source={require('../../assets/close.png')}/>
              </TouchableOpacity>
            </View>
          </DialogContent>
        </Dialog>
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
  otpText: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    color: Colors.PURPLE,
    textAlign: 'center',
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: 'white',
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
  textAsButton: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
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
    color: 'white',
    marginTop: 15,
  },
  dialogWrapper: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpDialog: {
    minHeight: 310,
    backgroundColor: 'white',
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
