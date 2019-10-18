import React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Keyboard } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { ValidationUtil } from '../util/ValidationUtil';
import { Button, Icon, Input } from 'react-native-elements';
import { Colors, Endpoints } from '../util/Values';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';

export default class Register extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      firstName: "test",
      lastName: "test",
      idNumber: "0000000000001",
      userId: "testemail01@test.tst",
      referralCode: "",
      errors: {
        firstName: false,
        lastName: false,
        idNumber: false,
        userId: false,
        phoneEmailValidation: false,
        general: false,
      },
      generalErrorText: "Sorry, there's an error with one or more input above, please check and resubmit",
      defaultGeneralErrorText: "Sorry, there's an error with one or more input above, please check and resubmit",
      dialogVisible: false,
    };
  }

  async componentDidMount() {
    let referralCode = this.props.navigation.getParam("referralCode");
    if (referralCode && referralCode.length > 0) {
      this.setState({referralCode});
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  fieldIsMandatory(field) {
    switch (field) {
      case "firstName":
      case "lastName":
      case "idNumber":
      return true;

      default:
      return false;
    }
  }

  onEditField = (text, field) => {
    let errors = Object.assign({}, this.state.errors);
    errors[field] = false;
    if (field == "userId") {
      errors.phone = false;
      errors.email = false;
    }
    errors.general = false;
    this.setState({
      [field]: text,
      errors: errors,
    });
  }

  onEndEditing = async (field) => {
    let errors = Object.assign({}, this.state.errors);
    if (this.fieldIsMandatory(field) && this.state[field].length == 0) {
      errors[field] = true;
    } else {
      errors[field] = false;
    }
    errors.general = false;
    this.setState({
      errors: errors,
    });
  }

  onPressTerms = () => {
    this.props.navigation.navigate('Terms');
  }

  // note : for some strange deep RN weirdness, this has to be async
  validateInput = async () => {
    let hasErrors = false;
    let errors = Object.assign({}, this.state.errors);

    // check for non-null
    if (this.state.firstName.length < 1) {
      hasErrors = true;
      errors.firstName = true;
    }
    if (this.state.lastName.length < 1) {
      hasErrors = true;
      errors.lastName = true;
    }
    if (this.state.idNumber.length < 1) {
      hasErrors = true;
      errors.idNumber = true;
    }

    // check for phone email is non null & is valid
    if (this.state.userId.length < 1) {
      hasErrors = true;
      errors.phoneEmailValidation = true;
    } else {
      if (!ValidationUtil.isValidEmailPhone(this.state.userId)) {
        hasErrors = true;
        errors.phoneEmailValidation = true;
      }
    }

    // since SA ID numbers are easy to check for basic validity, do so
    if (!ValidationUtil.isValidId(this.state.idNumber)) {
      hasErrors = true;
      errors.idNumber = true;
    }

    if (hasErrors) {
      await this.setState({
        errors: errors,
      });
      return false;
    }

    return true;
  }

  onPressRegister = async () => {
    Keyboard.dismiss();
    if (this.state.loading) return;
    this.setState({loading: true});

    this.clearError(); // so prior ones are no longer around
    let validation = await this.validateInput();
    if (!validation) {
      this.showError();
      return;
    }

    try {
      let result = await fetch(Endpoints.AUTH + 'register/profile', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          "countryCode3Letter": 'ZAF',
          "nationalId": this.state.idNumber,
          "phoneOrEmail": this.state.userId,
          "personalName": this.state.firstName,
          "familyName": this.state.lastName,
          "referralCode": this.state.referralCode,
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        this.setState({loading: false});
        if (resultJson.result.includes("SUCCESS")) {
          LoggingUtil.logEvent("USER_PROFILE_REGISTER_SUCCEEDED");
          this.props.navigation.navigate("SetPassword", {
            systemWideUserId: resultJson.systemWideUserId,
            clientId: resultJson.clientId,
            defaultFloatId: resultJson.defaultFloatId,
            defaultCurrency: resultJson.defaultCurrency,
          });
        } else {
          LoggingUtil.logEvent("USER_PROFILE_REGISTER_FAILED", {"reason" : "Result didn't include SUCCESS"});
          this.showError();
        }
      } else {
        let resultJson = await result.json();
        LoggingUtil.logEvent("USER_PROFILE_REGISTER_FAILED", {"reason": resultJson.errorField});
        let errors = Object.assign({}, this.state.errors);
        if (!resultJson.conflicts) {
          throw null;
        }
        for (let conflict of resultJson.conflicts) {
          if (conflict.errorField.includes("NATIONAL_ID")) {
            this.setState({
              dialogVisible: true,
            });
            errors.idNumber = conflict.messageToUser;
          }
          if (conflict.errorField.includes("EMAIL_ADDRESS")) {
            errors.userId = true;
            errors.email = conflict.messageToUser;
          }
          if (conflict.errorField.includes("PHONE_NUMBER")) {
            errors.userId = true;
            errors.phone = conflict.messageToUser;
          }
        }
        this.setState({
          loading: false,
          errors: errors,
        });
      }
    } catch (error) {
      console.log("error!", error);
      this.showError(error);
    }
  }

  showError(errorText) {
    let errors = Object.assign({}, this.state.errors);
    errors.general = true;
    this.setState({
      loading: false,
      errors: errors,
      generalErrorText: errorText ? errorText : this.state.defaultGeneralErrorText,
    });
  }

  clearError() {
    let errors = Object.assign({}, this.state.errors);
    Object.keys(errors).forEach((key) => errors[key] = false);
    this.setState({ errors });
  }

  onHideDialog = () => {
    this.setState({
      dialogVisible: false,
    });
    return true;
  }

  onPressLogin = () => {
    this.onHideDialog();
    this.props.navigation.navigate('Login');
  }

  onPressResetPassword = () => {
    this.onHideDialog();
    this.props.navigation.navigate('ResetPassword');
  }

  onPressContactUs = () => {
    this.onHideDialog();
    this.props.navigation.navigate('Support');
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} contentContainerStyle={styles.container} behavior="padding">
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
            <Icon
              name='chevron-left'
              type='evilicon'
              size={45}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.contentWrapper}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.mainContent}>
            <Text style={styles.title}>Let’s create your Jupiter account</Text>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>First Name*</Text>
                <Input
                  testID='register-first-name'
                  accessibilityLabel='register-first-name'
                  value={this.state.firstName}
                  onChangeText={(text) => this.onEditField(text, "firstName")}
                  onEndEditing={() => this.onEndEditing("firstName")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.firstName ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.firstName ?
                  <Text style={styles.errorMessage}>Please enter a valid first name</Text>
                  : null
                }
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Last Name*</Text>
                <Input
                  testID='register-last-name'
                  accessibilityLabel='register-last-name'
                  value={this.state.lastName}
                  onChangeText={(text) => this.onEditField(text, "lastName")}
                  onEndEditing={() => this.onEndEditing("lastName")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.lastName ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.lastName ?
                  <Text style={styles.errorMessage}>Please enter a valid last name</Text>
                  : null
                }
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>ID Number*</Text>
                <Input
                  testID='register-id-number'
                  accessibilityLabel='register-id-number'
                  value={this.state.idNumber}
                  onChangeText={(text) => this.onEditField(text, "idNumber")}
                  onEndEditing={() => this.onEndEditing("idNumber")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.idNumber ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.idNumber ?
                  <Text style={styles.errorMessage}>{this.state.errors.idNumber === true ? "Please enter a valid ID number" : this.state.errors.idNumber}</Text>
                  : null
                }
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Email Address or Phone number</Text>
                <Input
                  testID='register-email-or-phone'
                  accessibilityLabel='register-email-or-phone'                  
                  value={this.state.userId}
                  onChangeText={(text) => this.onEditField(text, "userId")}
                  onEndEditing={() => this.onEndEditing("userId")}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[styles.inputStyle, this.state.errors && this.state.errors.userId ? styles.redText : null]}
                  containerStyle={styles.containerStyle}
                />
                {
                  this.state.errors && this.state.errors.phoneEmailValidation ?
                  <Text style={styles.errorMessage}>Please enter a valid email address or cellphone number</Text>
                  : null
                }
                {
                  this.state.errors && this.state.errors.email ?
                  <Text style={styles.errorMessage}>{this.state.errors.email === true ? "Please enter a valid email address" : this.state.errors.email}</Text>
                  : null
                }
                {
                  this.state.errors && this.state.errors.phone ?
                  <Text style={styles.errorMessage}>{this.state.errors.phone === true ? "Please enter a valid cellphone numebr" : this.state.errors.phone}</Text>
                  : null
                }
            </View>
            <Text style={styles.disclaimer}>Continuing means you’ve read and agreed to Jupiter’s{" "}
              <Text style={styles.disclaimerButton} onPress={this.onPressTerms}>T’C & C’s.</Text>
            </Text>
            <Text style={[styles.disclaimer, styles.disclaimerButton, {marginTop: 10}]} onPress={this.onPressContactUs}>Need help?</Text>
          </ScrollView>
          {
            this.state.errors && this.state.errors.general ?
            <Text style={styles.errorMessage}>{this.state.generalErrorText}</Text>
            : null
          }
          <Button
            testID='register-continue-btn'
            accessibilityLabel='register-continue-btn'
            title="CONTINUE"
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressRegister}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }} />
        </View>

        <Dialog
          visible={this.state.dialogVisible}
          dialogStyle={styles.dialogStyle}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          onTouchOutside={this.onHideDialog}
          onHardwareBackPress={this.onHideDialog}
        >
          <DialogContent style={styles.dialogWrapper}>
            <View style={styles.helpDialog}>
              <Text style={styles.helpTitle}>Account already exists</Text>
              <Text style={styles.helpContent}>An account with this <Text style={styles.bold}>ID number</Text> has already been created.</Text>
              <Text style={styles.explanation}>Log in to your account</Text>
              <Button
                testID='register-login'
                accessibilityLabel='register-login'
                title="LOG IN"
                loading={this.state.loginLoading}
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.onPressLogin}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }} />
              <Text style={styles.explanation}>Forgot your password?</Text>
              <Button
                testID='register-reset-password'
                accessibilityLabel='register-reset-password'
                title="RESET PASSWORD"
                loading={this.state.resetPasswordLoading}
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.onPressResetPassword}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }} />
              <TouchableOpacity style={styles.closeDialog} onPress={this.onHideDialog} >
                <Image source={require('../../assets/close.png')}/>
              </TouchableOpacity>
            </View>
            <View style={styles.dialogFooter}>
              <Text style={styles.dialogFooterText}>Something not right? <Text style={styles.dialogFooterLink} onPress={this.onPressContactUs}>Contact us</Text></Text>
            </View>
          </DialogContent>
        </Dialog>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    marginBottom: 15,
  },
  mainContent: {
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: Colors.WHITE,
  },
  scrollView: {
    flex: 1,
    width: '100%',
    marginVertical: 15,
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
    marginVertical: 10,
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 15,
  },
  profileField: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 5,
  },
  profileFieldTitle: {
    fontFamily: 'poppins-semibold',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
    marginBottom: 5,
  },
  profileFieldValue: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 18,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: Colors.WHITE,
    borderColor: Colors.GRAY,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 13,
    marginTop: -15, //this is valid because of the exact alignment of other elements - do not reuse in other components
    marginBottom: 20,
    width: '90%',
  },
  redText: {
    color: Colors.RED,
  },
  disclaimer: {
    width: '100%',
    paddingHorizontal: 15,
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
    fontSize: 11,
  },
  disclaimerButton: {
    textDecorationLine: 'underline',
  },
  dialogStyle: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  helpDialog: {
    minHeight: 330,
    borderRadius: 10,
    justifyContent: 'space-around',
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  helpTitle: {
    textAlign: 'center',
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: Colors.DARK_GRAY,
  },
  helpContent: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  closeDialog: {
    position: 'absolute',
    top: 10,
    right: 10,
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
  explanation: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  dialogFooter: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogFooterText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  dialogFooterLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.PURPLE,
  },
});
