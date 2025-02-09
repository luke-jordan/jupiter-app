import React from 'react';
import { connect } from 'react-redux';

import {
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  View,
} from 'react-native';
import { Button, Icon, Input, Overlay } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { ValidationUtil } from '../util/ValidationUtil';
import { Colors, Endpoints } from '../util/Values';

import { getProfileData } from '../modules/profile/profile.reducer';
import { updateUserId, updateProfileFields } from '../modules/profile/profile.actions';
import OnboardBreadCrumb from '../elements/OnboardBreadCrumb';

const mapStateToProps = state => ({
  stashedProfile: getProfileData(state),
});

const mapDispatchToProps = {
  updateUserId, 
  updateProfileFields,
  clearState: () => ({ type: 'USER_LOGOUT' }), 
}

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      firstName: '',
      lastName: '',
      idNumber: '',
      userId: '',
      referralCode: '',
      errors: {
        firstName: false,
        lastName: false,
        idNumber: false,
        userId: false,
        phoneEmailValidation: false,
        general: false,
      },
      generalErrorText:
        "Sorry, there's an error with one or more input above, please check and resubmit",
      defaultGeneralErrorText:
        "Sorry, there's an error with one or more input above, please check and resubmit",
      dialogVisible: false,
      hasErrors: false,
      haveLoggedInput: false,
    };
  }

  async componentDidMount() {
    const referralCode = this.props.navigation.getParam('referralCode') || this.props.stashedProfile.referralCode;
    // just in case have some legacy stuff lying around from a prior user who did not log out but closed/opened, etc
    this.props.clearState();
    if (referralCode && referralCode.length > 0) {
      this.setState({ referralCode });
      this.props.updateProfileFields({ referralCode });
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onEditField = (text, field) => {
    const errors = { ...this.state.errors };
    errors[field] = false;
    if (field === 'userId') {
      errors.phone = false;
      errors.email = false;
    }
    errors.general = false;

    const stateUpdate = { [field]: text, errors};
    if (field === 'idNumber' && !this.state.haveLoggedInput) {
      // console.log('User entered ID number, and now logging');
      LoggingUtil.logEvent('USER_PROFILE_INPUT_STARTED', { field });
      stateUpdate.haveLoggedInput = true;  
    }

    this.setState(stateUpdate);
  };

  onEndEditing = async field => {
    const errors = { ...this.state.errors };
    if (this.fieldIsMandatory(field) && this.state[field].length === 0) {
      errors[field] = true;
    } else {
      errors[field] = false;
    }
    errors.general = false;
    this.setState({
      errors,
    });
  };

  onPressTerms = () => {
    this.props.navigation.navigate('Terms');
  };

  // note : for some strange deep RN weirdness, this has to be async
  validateInput = async () => {
    let hasErrors = false;
    const errors = { ...this.state.errors };

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

    // trim the input
    await this.setState({
      firstName: this.state.firstName.trim(),
      lastName: this.state.lastName.trim(),
      idNumber: this.state.idNumber.trim(),
    });

    // check for phone email is non null & is valid
    const enteredPhoneEmail = this.state.userId.trim();
    if (enteredPhoneEmail.length < 1) {
      hasErrors = true;
      errors.phoneEmailValidation = true;
    } else if (!ValidationUtil.isValidEmailPhone(enteredPhoneEmail)) {
      hasErrors = true;
      errors.phoneEmailValidation = true;
    }

    this.setState({
      userId: this.state.userId.trim(),
    });

    // since SA ID numbers are easy to check for basic validity, do so
    if (!ValidationUtil.isValidId(this.state.idNumber)) {
      hasErrors = true;
      errors.idNumber = true;
    }

    if (hasErrors) {
      await this.setState({
        errors,
        hasErrors: true,
      });
      return false;
    }

    this.setState({
      hasErrors: false,
    });

    return true;
  };

  onPressRegister = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    this.clearError(); // so prior ones are no longer around

    LoggingUtil.logEvent('USER_PROFILE_REGISTER_SUBMITTED'); // so we see if validation is hurting

    const validation = await this.validateInput();
    if (!validation) {
      this.showError();
      return;
    }

    try {
      const result = await fetch(`${Endpoints.AUTH}register/profile`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          countryCode3Letter: 'ZAF',
          nationalId: this.state.idNumber,
          phoneOrEmail: this.state.userId,
          personalName: this.state.firstName,
          familyName: this.state.lastName,
          referralCode: this.state.referralCode,
        }),
      });

      if (result.ok) {
        const resultJson = await result.json();
        this.setState({ loading: false });
        if (resultJson.result && resultJson.result.includes('SUCCESS')) {
          LoggingUtil.logEvent('USER_PROFILE_REGISTER_SUCCEEDED');
          
          this.props.updateUserId(resultJson.systemWideUserId);
          
          this.props.updateProfileFields({
            clientId: resultJson.clientId,
            defaultFloatId: resultJson.defaultFloatId,
            defaultCurrency: resultJson.defaultCurrency,
            personalName: this.state.firstName,
            familyName: this.state.lastName,
            nationalId: this.state.idNumber,
          });

          LoggingUtil.logEvent('USER_PROFILE_REGISTER_SET_PROPS');
          this.props.navigation.navigate('SetPassword');
        } else {
          LoggingUtil.logEvent('USER_PROFILE_REGISTER_FAILED', {
            reason: "Result didn't include SUCCESS",
          });
          this.showError();
        }
      } else {
        // await is important so if it is not interpretable it rejects and triggers catch
        await this.handleErrorWithResult(result);
      }
    } catch (error) {
      // this may double log, but given importance of this screen, that is fine
      LoggingUtil.logError(error);
      if (!error) {
        this.showError();
      } else if (Reflect.has(error, 'messageToUser')) {
        this.showError(error.messageToUser);
      } else {
        this.showError(error);
      }
    }
  };

  onHideDialog = () => {
    this.setState({
      dialogVisible: false,
    });
    return true;
  };

  onPressLogin = () => {
    this.onHideDialog();
    this.props.navigation.navigate('Login');
  };

  onPressResetPassword = () => {
    this.onHideDialog();
    this.props.navigation.navigate('ResetPassword');
  };

  onPressContactUs = () => {
    this.onHideDialog();
    this.props.navigation.navigate('Support', { originScreen: 'Register' });
  };

  fieldIsMandatory(field) {
    switch (field) {
      case 'firstName':
      case 'lastName':
      case 'idNumber':
        return true;

      default:
        return false;
    }
  }

  async handleErrorWithResult(result) {
    const resultJson = await result.json();
    // console.log('Result JSON: ', resultJson);
    LoggingUtil.logEvent('USER_PROFILE_REGISTER_FAILED', {
      reason: resultJson.errorField,
    });
    const errors = { ...this.state.errors };

    if (!resultJson.conflicts) {
      LoggingUtil.logApiError(`${Endpoints.AUTH}register/profile`, result);
      throw resultJson;
    }
    
    for (const conflict of resultJson.conflicts) {
      if (conflict.errorField.includes('NATIONAL_ID')) {
        this.setState({
          dialogVisible: true,
        });
        errors.idNumber = conflict.messageToUser;
      }
      if (conflict.errorField.includes('EMAIL_ADDRESS')) {
        errors.userId = true;
        errors.email = conflict.messageToUser;
      }
      if (conflict.errorField.includes('PHONE_NUMBER')) {
        errors.userId = true;
        errors.phone = conflict.messageToUser;
      }
    }

    this.setState({
      loading: false,
      errors,
      hasErrors: true,
    });
  }

  showError(errorText) {
    const errors = { ...this.state.errors };
    errors.general = true;
    this.setState({
      loading: false,
      errors,
      hasErrors: true,
      generalErrorText: typeof errorText === 'string' && errorText.length > 0
        ? errorText
        : this.state.defaultGeneralErrorText,
    });
  }

  clearError() {
    const errors = { ...this.state.errors };
    Object.keys(errors).forEach(key => (errors[key] = false));
    this.setState({ errors, hasErrors: false });
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        contentContainerStyle={styles.container}
        behavior="height"
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
          <Text style={styles.stepText}>Step 1 of 4</Text>
        </View>
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.mainContent}
          >
            <OnboardBreadCrumb currentStep="PROFILE" />
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>First Name*</Text>
              <Input
                testID="register-first-name"
                accessibilityLabel="register-first-name"
                value={this.state.firstName}
                onChangeText={text => this.onEditField(text, 'firstName')}
                onEndEditing={() => this.onEndEditing('firstName')}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={[
                  styles.inputStyle,
                  this.state.errors && this.state.errors.firstName
                    ? styles.redText
                    : null,
                ]}
                containerStyle={styles.containerStyle}
              />
              {this.state.hasErrors ? null : (
                <Text style={styles.noteMessage}>
                  Please enter your legal name (i.e. same as on your ID)
                </Text>
              )}
              {this.state.errors && this.state.errors.firstName ? (
                <Text style={styles.inputErrorMessage}>
                  Please enter a valid first name
                </Text>
              ) : null}
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Last Name*</Text>
              <Input
                testID="register-last-name"
                accessibilityLabel="register-last-name"
                value={this.state.lastName}
                onChangeText={text => this.onEditField(text, 'lastName')}
                onEndEditing={() => this.onEndEditing('lastName')}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={[
                  styles.inputStyle,
                  this.state.errors && this.state.errors.lastName
                    ? styles.redText
                    : null,
                ]}
                containerStyle={styles.containerStyle}
              />
              {this.state.errors && this.state.errors.lastName ? (
                <Text style={styles.inputErrorMessage}>
                  Please enter a valid last name
                </Text>
              ) : null}
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>ID Number*</Text>
              <Input
                testID="register-id-number"
                accessibilityLabel="register-id-number"
                keyboardType="numeric"
                value={this.state.idNumber}
                onChangeText={text => this.onEditField(text, 'idNumber')}
                onEndEditing={() => this.onEndEditing('idNumber')}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={[
                  styles.inputStyle,
                  this.state.errors && this.state.errors.idNumber
                    ? styles.redText
                    : null,
                ]}
                containerStyle={styles.containerStyle}
              />
              {this.state.errors && this.state.errors.idNumber ? (
                <Text style={styles.inputErrorMessage}>
                  {this.state.errors.idNumber === true
                    ? 'Please enter a valid ID number'
                    : this.state.errors.idNumber}
                </Text>
              ) : (
                <Text style={styles.noteMessage}>
                  ID numbers are safely stored and only used to FICA you without requiring proof of address
                </Text>
              )}
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>
                Email adress or Phone number
              </Text>
              <Input
                testID="register-email-or-phone"
                accessibilityLabel="register-email-or-phone"
                value={this.state.userId}
                onChangeText={text => this.onEditField(text, 'userId')}
                onEndEditing={() => this.onEndEditing('userId')}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={[
                  styles.inputStyle,
                  this.state.errors && this.state.errors.userId
                    ? styles.redText
                    : null,
                ]}
                containerStyle={styles.containerStyle}
              />
              {this.state.errors && this.state.errors.phoneEmailValidation ? (
                <Text style={styles.inputErrorMessage}>
                  Please enter a valid email address or cellphone number
                </Text>
              ) : null}
              {this.state.errors && this.state.errors.email ? (
                <Text style={styles.inputErrorMessage}>
                  {this.state.errors.email === true
                    ? 'Please enter a valid email address'
                    : this.state.errors.email}
                </Text>
              ) : null}
              {this.state.errors && this.state.errors.phone ? (
                <Text style={styles.inputErrorMessage}>
                  {this.state.errors.phone === true
                    ? 'Please enter a valid cellphone numebr'
                    : this.state.errors.phone}
                </Text>
              ) : null}
            </View>
            <Text style={styles.disclaimer}>
              Continuing means you’ve read and agreed to Jupiter’s{' '}
              <Text style={styles.disclaimerButton} onPress={this.onPressTerms}>
                Ts &amp; Cs.
              </Text>
            </Text>
            <Text
              style={[
                styles.disclaimer,
                styles.disclaimerButton,
                { marginTop: 10 },
              ]}
              onPress={this.onPressContactUs}
            >
              Need help?
            </Text>
          </ScrollView>
          {this.state.errors && this.state.errors.general ? (
            <Text style={styles.generalErrorMessage}>
              {this.state.generalErrorText}
            </Text>
          ) : null}
          <Button
            testID="register-continue-btn"
            accessibilityLabel="register-continue-btn"
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
            }}
          />
        </View>

        <Overlay
          isVisible={this.state.dialogVisible}
          dialogStyle={styles.dialogStyle}
          onBackdropPress={this.onHideDialog}
          onHardwareBackPress={this.onHideDialog}
        >
          <View style={styles.dialogWrapper}>
            <View style={styles.helpDialog}>
              <Text style={styles.helpTitle}>Account already exists</Text>
              <Text style={styles.helpContent}>
                An account with this <Text style={styles.bold}>ID number</Text>{' '}
                has already been created.
              </Text>
              <Text style={styles.explanation}>Log in to your account</Text>
              <Button
                testID="register-login"
                accessibilityLabel="register-login"
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
                }}
              />
              <Text style={styles.explanation}>Forgot your password?</Text>
              <Button
                testID="register-reset-password"
                accessibilityLabel="register-reset-password"
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
                }}
              />
              <TouchableOpacity
                style={styles.closeDialog}
                onPress={this.onHideDialog}
              >
                <Image source={require('../../assets/close.png')} />
              </TouchableOpacity>
            </View>
            <View style={styles.dialogFooter}>
              <Text style={styles.dialogFooterText}>
                Something not right?{' '}
                <Text
                  style={styles.dialogFooterLink}
                  onPress={this.onPressContactUs}
                >
                  Contact us
                </Text>
              </Text>
            </View>
          </View>
        </Overlay>
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
  stepText: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.DARK_GRAY,
  },
  mainContent: {
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: Colors.WHITE,
  },
  scrollView: {
    flex: 1,
    width: '100%',
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
    alignSelf: 'stretch',
  },
  profileField: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 5,
  },
  profileFieldTitle: {
    fontFamily: 'poppins-semibold',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
    marginBottom: 5,
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
  noteMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 13,
    marginTop: -15, // as below on error message
    marginBottom: 20,
    width: '90%',
  },
  inputErrorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 13,
    marginTop: -15, // only for here
    marginBottom: 10,
    width: '90%',
  },
  generalErrorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 13,
    marginTop: 10, // only for here
    marginBottom: 20,
    width: '90%',
  },
  redText: {
    color: Colors.RED,
  },
  disclaimer: {
    width: '100%',
    paddingHorizontal: 5,
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
    paddingTop: 50,
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
    top: 8,
    right: 8,
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

export default connect(mapStateToProps, mapDispatchToProps)(Register);
