import React from 'react';
import { connect } from 'react-redux';

import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View,
  AsyncStorage,
} from 'react-native';
import { Button, Input, Overlay } from 'react-native-elements';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Colors, Endpoints, DeviceInfo } from '../util/Values';
import iconClose from '../../assets/close.png';

import { updateAuthToken } from '../modules/auth/auth.actions';
import { updateComparatorRates } from '../modules/balance/balance.actions';

import { getUserId, getProfileData } from '../modules/profile/profile.reducer';
import { updateAccountId, updateProfileFields, updateOnboardSteps } from '../modules/profile/profile.actions';

import OnboardBreadCrumb from '../elements/OnboardBreadCrumb';

const mapStateToProps = (state) => ({
  systemWideUserId: getUserId(state),
  profileData: getProfileData(state),
});

const mapDispatchToProps = {
  updateAuthToken,
  updateAccountId,
  updateProfileFields,
  updateOnboardSteps,
  updateComparatorRates,
};

class SetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      generatePasswordLoading: false,
      password: '#NewPass1234',
      passwordConfirm: '#NewPass1234',
      errors: {
        password: false,
        passwordConfirm: false,
        general: false,
      },
      dialogVisible: false,
      generatedPassword: '',
      passwordErrorMessage: 'Please enter a valid password',
      defaultPasswordErrorMessage: 'Please enter a valid password',
      generalErrorText: 'There is a problem with your request',
      checkingForCompletion: false,
    };
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state;
    if (params) {
      this.setState({
        isReset: params.isReset,
      });
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onEditField = (text, field) => {
    const { errors } = this.state;
    errors[field] = false;
    errors.general = false;
    this.setState({
      [field]: text,
      errors,
    });
  };

  onEndEditing = field => {
    const { errors } = this.state;
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
    const { errors } = this.state;
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

    if (this.state.isReset) {
      this.handleResetPassword();
    } else {
      this.handleRegisterPassword();
    }
  };

  handleResetPassword = async () => {
    try {
      const result = await fetch(`${Endpoints.AUTH}password/reset/complete`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          systemWideUserId: this.props.systemWideUserId,
          newPassword: this.state.password,
          deviceId: DeviceInfo.DEVICE_ID,
        }),
      });
      if (result.ok) {
        this.setState({
          loading: false,
          checkingForCompletion: false,
        });
        NavigationUtil.navigateWithoutBackstack(
          this.props.navigation,
          'ResetComplete'
        );
      } else {
        throw result;
      }
    } catch (error) {
      this.showError();
    }
  };

  addPropertiesToState = async (resultJson) => {
    // store this so user comes back here if they exit / crash instead of needing to login again
    const { personalName, familyName } = this.props.profileData;
    const userInfo = {
      token: resultJson.token,
      systemWideUserId: resultJson.systemWideUserId,
      balance: {
        accountId: resultJson.accountId,
      },
      profile: {
        personalName,
        familyName,            
        kycStatus: resultJson.kycStatus,
      },
      onboardStepsRemaining: resultJson.onboardStepsRemaining,
    }

    await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));

    // however, remaining state uses the below (and in time, everything will)
    this.props.updateAuthToken(resultJson.token);
    this.props.updateAccountId(resultJson.accountId[0]);
    this.props.updateOnboardSteps(resultJson.onboardStepsRemaining);
    this.props.updateProfileFields({ kycStatus: resultJson.kycStatus });

    if (resultJson.comparatorRates) {
      this.props.updateComparatorRates(resultJson.comparatorRates);
    }
  }

  handleRegisterPassword = async () => {
    try {
      const { clientId, defaultFloatId: floatId, defaultCurrency: currency } = this.props.profileData;

      const result = await fetch(`${Endpoints.AUTH}register/password`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          systemWideUserId: this.props.systemWideUserId,
          password: this.state.password,
          clientId,
          floatId,
          currency,
        }),
      });

      if (result.ok) {
        const resultJson = await result.json();

        this.setState({
          loading: false,
          checkingForCompletion: false,
        });

        await AsyncStorage.setItem('hasOnboarded', 'true');

        await this.addPropertiesToState(resultJson);

        if (['FAILED_VERIFICATION', 'REVIEW_FAILED'].includes(resultJson.kycStatus)) {
          LoggingUtil.logEvent('USER_FAILED_KYC_CHECK_ONBOARD');
          this.props.navigation.navigate('FailedVerification', { fromHome: false });
          return;
        }

        if (resultJson.result === 'SUCCESS') {
          this.props.navigation.navigate('OnboardRegulation', {
            isOnboarding: true,
          });
        } else {
          LoggingUtil.logEvent('USER_PROFILE_PASSWORD_FAILED', {
            reason: resultJson.message,
          });
          this.showError(resultJson.message);
        }
      } else {
        const resultJson = await result.json();
        LoggingUtil.logEvent('USER_PROFILE_PASSWORD_FAILED', {
          reason: resultJson.errors.toString(),
        });
        const responseErrors = resultJson.errors;
        // eslint-disable-next-line fp/no-mutating-methods
        responseErrors.unshift('Your password must:');
        const errorsString = responseErrors.join('\n- ');
        this.showError(errorsString);
      }
    } catch (error) {
      console.log('Error in password set: ', error);
      this.showError(error);
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

  showError(errorText) {
    const { errors } = this.state;
    errors.general = true;
    if (errorText) {
      errors.password = true;
    }
    this.setState({
      checkingForCompletion: false,
      loading: false,
      errors,
      passwordErrorMessage: typeof errorText === 'string' && errorText.length > 0
        ? errorText : this.state.defaultPasswordErrorMessage,
    });
  }

  fieldIsMandatory(field) {
    switch (field) {
      case 'password':
      case 'passwordConfirm':
        return true;

      default:
        return false;
    }
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        contentContainerStyle={styles.container}
        behavior="padding"
      >
        <View style={styles.header}>
          {this.state.isReset ? (
            <Text style={styles.resetTitle}>Reset password</Text>
          ) : (
            <>
              {/* <TouchableOpacity
                style={styles.headerButton}
                onPress={this.onPressBack}
              >
                <Icon
                  name="chevron-left"
                  type="evilicon"
                  size={45}
                  color={Colors.MEDIUM_GRAY}
                />
              </TouchableOpacity> */}
              <Text style={styles.stepText}>Step 2 of 4</Text>
            </>
          )}
        </View>
        <View style={styles.contentWrapper}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.mainContent}
          >
            {this.state.isReset ? null : (
              <OnboardBreadCrumb currentStep="PASSWORD" />
            )}
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>
                {this.state.isReset ? 'New Password*' : 'Your Password*'}
              </Text>
              <Input
                testID="set-password-input-1"
                accessibilityLabel="set-password-input-1"
                value={this.state.password}
                secureTextEntry
                onChangeText={text => this.onEditField(text, 'password')}
                onEndEditing={() => this.onEndEditing('password')}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={[
                  styles.inputStyle,
                  this.state.errors && this.state.errors.password
                    ? styles.redText
                    : null,
                ]}
                containerStyle={styles.containerStyle}
              />
              {this.state.errors && this.state.errors.password ? (
                <Text style={styles.errorMessage}>
                  {this.state.passwordErrorMessage}
                </Text>
              ) : null}
            </View>
            <View style={styles.profileField}>
              <Text style={styles.profileFieldTitle}>
                {this.state.isReset
                  ? 'Retype New Password*'
                  : 'Retype Password*'}
              </Text>
              <Input
                testID="set-password-input-2"
                accessibilityLabel="set-password-input-2"
                value={this.state.passwordConfirm}
                secureTextEntry
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
              />
              {this.state.errors && this.state.errors.passwordConfirm ? (
                <Text style={styles.errorMessage}>
                  Sorry, those passwords do not match. Please adjust and
                  resubmit.
                </Text>
              ) : null}
              <Text style={styles.requirementsMessage}>
                <Text style={styles.requirementsNote}>Note:</Text> Passwords must be at least 8 characters long, with at least: one
                number, one uppercase letter, one lowercase letter, and one
                special character (e.g., @, #, !, etc). Set your password tight
                to keep your money safe!
              </Text>
            </View>
          </ScrollView>
          <Text
            testID="set-password-generate"
            accessibilityLabel="set-password-generate"
            style={styles.generatePassword}
            onPress={this.onPressGeneratePassword}
          >
            Help me generate a password
          </Text>
          <Button
            testID="set-password-continue-btn"
            accessibilityLabel="set-password-continue-btn"
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
                  testID="set-password-gen-btn"
                  accessibilityLabel="set-password-gen-btn"
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
              <Image source={iconClose} />
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
              {this.state.isReset
                ? 'Resetting your password...'
                : 'We are creating your account...'}
            </Text>
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
  stepText: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.DARK_GRAY,
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
    marginBottom: 10,
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
  requirementsNote: {
    fontFamily: 'poppins-semibold',
    color: Colors.DARK_GRAY,
  },
  requirementsMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(SetPassword);
