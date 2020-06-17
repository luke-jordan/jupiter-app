import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { Button, Icon, Input, Overlay } from 'react-native-elements';
import Toast from 'react-native-easy-toast';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Colors, Endpoints } from '../util/Values';

export default class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.toastRef = React.createRef();
    this.state = {
      token: this.props.navigation.state.params.token,
      loading: false,
      generatePasswordLoading: false,
      oldPassword: '',
      password: '',
      passwordConfirm: '',
      errors: {
        password: false,
        passwordConfirm: false,
        general: false,
      },
      dialogVisible: false,
      generatedPassword: '',
      oldPasswordErrorMessage: 'Sorry, that password is not valid',
      defaultOldPasswordErrorMessage: 'Sorry, that password is not valid',
      passwordErrorMessage: 'Please enter a valid password',
      defaultPasswordErrorMessage: 'Please enter a valid password',
      generalErrorText: 'There is a problem with your request',
      checkingForCompletion: false,

      hideOldPassword: true,
      hideNewPassword1: true,
      hideNewPassword2: true,
    };
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onEditField = (text, field) => {
    const errors = { ...this.state.errors };
    errors[field] = false;
    errors.general = false;
    this.setState({
      [field]: text,
      errors,
    });
  };

  onEndEditing = field => {
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

  validateInput = async () => {
    let hasErrors = false;
    const errors = { ...this.state.errors };

    if (this.state.oldPassword.length === 0) {
      hasErrors = true;
      errors.oldPassword = true;
    }
    if (this.state.password.length === 0) {
      hasErrors = true;
      errors.password = true;
    }
    if (this.state.password !== this.state.passwordConfirm) {
      hasErrors = true;
      errors.password = false;
      errors.passwordConfirm = true;
    }
    if (hasErrors) {
      await this.setState({
        errors,
      });
      return false;
    }
    return true;
  };

  onPressContinue = async () => {
    if (this.state.loading) return;
    this.setState({
      checkingForCompletion: true,
      loading: true,
    });
    const validation = await this.validateInput();
    if (!validation) {
      this.showError();
      return;
    }
    this.handleChangePassword();
  };

  handleChangePassword = async () => {
    try {
      const result = await fetch(`${Endpoints.AUTH}password/change`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
        body: JSON.stringify({
          oldPassword: this.state.oldPassword,
          newPassword: this.state.password,
        }),
      });
      if (result.ok) {
        this.setState({
          loading: false,
          checkingForCompletion: false,
        });
        this.toastRef.current.show('Your password has been changed!');
        NavigationUtil.navigateWithoutBackstack(
          this.props.navigation,
          'ResetComplete'
        );
      } else {
        if (result.status === 403) {
          this.showError(this.state.defaultOldPasswordErrorMessage, 'OLD_PASSWORD');
          return;
        }
        
        const resultBody = await result.json();
        // console.log('Result body in error: ', resultBody);
        if (resultBody && resultBody.errors) {
          const responseErrors = resultBody.errors;
          const errorsString = `Your password must: ${responseErrors.map((error) => error.toLowerCase()).join(', ')}.`;
          this.showError(errorsString, 'NEW_PASSWORD');
          return;
        } 

        throw result;
      }
    } catch (error) {
      console.log('RESULT: ', JSON.stringify(error));
      this.showError();
    }
  };

  onPressGeneratePassword = async () => {
    if (this.state.generatePasswordLoading) return;
    LoggingUtil.logEvent('USER_REQUESTED_PASSWORD');
    this.setState({
      dialogVisible: true,
      generatePassword: '',
      generatePasswordLoading: true,
    });
    try {
      const result = await fetch(`${Endpoints.AUTH}password/generate`, {
        method: 'GET',
      });
      if (result.ok) {
        const resultJson = await result.json();
        const generated = resultJson.message.newPassword;
        this.setState({
          generatedPassword: generated,
          generatePasswordLoading: false,
        });
      } else {
        throw result;
      }
    } catch (error) {
      console.log('Error in change password!', error.status);
      this.setState({ generatePasswordLoading: false });
    }
  };

  onPressUseThisPassword = () => {
    if (this.state.generatePasswordLoading) return;
    LoggingUtil.logEvent('USER_ACCEPTED_PASSWORD');
    this.setState({
      password: this.state.generatedPassword,
      passwordConfirm: this.state.generatedPassword,
      dialogVisible: false,
    });
  };

  onHideDialog = () => {
    this.setState({
      dialogVisible: false,
    });
    return true;
  };

  fieldIsMandatory(field) {
    switch (field) {
      case 'password':
      case 'passwordConfirm':
        return true;

      default:
        return false;
    }
  }

  showError(errorText, errorType = null) {
    console.log('Showing error text: ', errorText);
    const errors = { ...this.state.errors };
    errors.general = !errorType;
    errors.oldPassword = errorType === 'OLD_PASSWORD';
    errors.newPassword = errorType === 'NEW_PASSWORD'; // new is not evaluated if old is wrong, hence cannot overlap
    this.setState({
      checkingForCompletion: false,
      loading: false,
      errors,
      passwordErrorMessage: errorText
        ? errorText
        : this.state.defaultPasswordErrorMessage,
    });
  }

  render() {
    return (
      <View style={styles.container}>
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
          <Text style={styles.resetTitle}>Change password</Text>
        </View>
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.mainContent}
          >
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Old Password*</Text>
              <Input
                value={this.state.oldPassword}
                secureTextEntry={this.state.hideOldPassword}
                onChangeText={text => this.onEditField(text, 'oldPassword')}
                onEndEditing={() => this.onEndEditing('oldPassword')}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={[
                  styles.inputStyle,
                  this.state.errors && this.state.errors.oldPassword
                    ? styles.redText
                    : null,
                ]}
                containerStyle={styles.containerStyle}
                rightIcon={(
                  <Icon
                    name={this.state.hideOldPassword ? "eye" : "eye-off"}
                    size={20}
                    color={Colors.PURPLE}
                    type="material-community"
                    onPress={() => this.setState({ hideOldPassword: !this.state.hideOldPassword })}
                  />
                )}
              />
              {this.state.errors && this.state.errors.oldPassword ? (
                <Text style={styles.errorMessage}>
                  {this.state.oldPasswordErrorMessage}
                </Text>
              ) : null}
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>New Password*</Text>
              <Input
                value={this.state.password}
                secureTextEntry={this.state.hideNewPassword1}
                onChangeText={text => this.onEditField(text, 'password')}
                onEndEditing={() => this.onEndEditing('password')}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={[
                  styles.inputStyle,
                  this.state.errors && this.state.errors.newPassword
                    ? styles.redText
                    : null,
                ]}
                containerStyle={styles.containerStyle}
                rightIcon={(
                  <Icon
                    name={this.state.hideNewPassword1 ? "eye" : "eye-off"}
                    size={20}
                    color={Colors.PURPLE}
                    type="material-community"
                    onPress={() => this.setState({ hideNewPassword1: !this.state.hideNewPassword1 })}
                  />
                )}    
              />
              {this.state.errors && this.state.errors.newPassword ? (
                <Text style={styles.errorMessage}>
                  {this.state.passwordErrorMessage}
                </Text>
              ) : null}
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>Retype New Password*</Text>
              <Input
                value={this.state.passwordConfirm}
                secureTextEntry={this.state.hideNewPassword2}
                onChangeText={text => this.onEditField(text, 'passwordConfirm')}
                onEndEditing={() => this.onEndEditing('passwordConfirm')}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={[
                  styles.inputStyle,
                  this.state.errors && this.state.errors.passwordConfirm
                    ? styles.redText
                    : null,
                ]}
                containerStyle={styles.containerStyle}
                rightIcon={(
                  <Icon
                    name={this.state.hideNewPassword2 ? "eye" : "eye-off"}
                    size={20}
                    color={Colors.PURPLE}
                    type="material-community"
                    onPress={() => this.setState({ hideNewPassword2: !this.state.hideNewPassword2 })}
                  />
                )}    
              />
              {this.state.errors && this.state.errors.passwordConfirm ? (
                <Text style={styles.errorMessage}>
                  Passwords don&apos;t match
                </Text>
              ) : null}
            </View>
          </ScrollView>
          {this.state.errors && this.state.errors.general ? (
            <Text style={styles.errorMessage}>
              {this.state.generalErrorText}
            </Text>
          ) : null}
          <Text
            style={styles.generatePassword}
            onPress={this.onPressGeneratePassword}
          >
            Help me generate a password
          </Text>
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
            }}
          />
        </View>

        <Overlay
          isVisible={this.state.dialogVisible}
          height="auto"
          width="auto"
          onBackdropPress={this.onHideDialog}
          onHardwareBackPress={this.onHideDialog}
        >
          <View style={styles.dialogWrapper}>
            <View style={styles.dialogContent}>
              <Text style={styles.dialogTitle}>Suggested password</Text>
              <View style={styles.profileField}>
                <Text style={styles.profileFieldTitle}>Password</Text>
                <Text
                  style={[styles.containerStyle, styles.generatedPasswordStyle]}
                >
                  {this.state.generatedPassword}
                </Text>
                <Button
                  title="USE THIS PASSWORD"
                  loading={this.state.generatePasswordLoading}
                  titleStyle={styles.buttonTitleStyle}
                  buttonStyle={styles.buttonStyle}
                  containerStyle={styles.buttonContainerStyle}
                  onPress={this.onPressUseThisPassword}
                  linearGradientProps={{
                    colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                    start: { x: 0, y: 0.5 },
                    end: { x: 1, y: 0.5 },
                  }}
                />
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeDialog}
              onPress={this.onHideDialog}
            >
              <Image source={require('../../assets/close.png')} />
            </TouchableOpacity>
          </View>
        </Overlay>

        <Overlay
          isVisible={this.state.checkingForCompletion}
          height="auto"
          width="auto"
          onBackdropPress={() => {}}
          onHardwareBackPress={() => {
            this.setState({ checkingForCompletion: false });
            return true;
          }}
        >
          <View style={styles.checkingDialogWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
            <Text style={styles.checkingDialogText}>
              Changing your password...
            </Text>
          </View>
        </Overlay>

        <Toast ref={this.toastRef} opacity={1} style={styles.toast} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
    width: '100%',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    minHeight: 50,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  resetTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    width: '100%',
    paddingLeft: 15,
    marginTop: 20,
    marginBottom: 10,
  },
  mainContent: {
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: Colors.BACKGROUND_GRAY,
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
    marginBottom: 20,
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
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 13,
    marginTop: -15, // this is valid because of the exact alignment of other elements - do not reuse in other components
    marginBottom: 20,
  },
  redText: {
    color: Colors.RED,
  },
  generatePassword: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    fontSize: 13,
    marginBottom: 10,
  },
  dialogWrapper: {
    minHeight: 280,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingTop: 30,
    width: '100%',
  },
  dialogTitle: {
    textAlign: 'center',
    fontFamily: 'poppins-semibold',
    fontSize: 19,
  },
  closeDialog: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  dialogContent: {
    flex: 1,
    width: '100%',
  },
  generatedPasswordStyle: {
    fontFamily: 'poppins-regular',
    paddingLeft: 10,
    textAlignVertical: 'center',
  },
  checkingDialogWrapper: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    paddingBottom: 0,
  },
  checkingDialogText: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    marginHorizontal: 30,
    textAlign: 'center',
  },
  toast: {
    backgroundColor: Colors.DARK_GRAY,
    width: '60%',
    alignItems: 'center',
  },
});
