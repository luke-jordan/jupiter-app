import React from 'react';
import { connect } from 'react-redux';

import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { Button, Input, Icon, Overlay } from 'react-native-elements';

import { NavigationUtil } from '../util/NavigationUtil';
import { LogoutUtil } from '../util/LogoutUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors, FallbackSupportNumber } from '../util/Values';

import { getAuthToken } from '../modules/auth/auth.reducer';

import { getProfileData, getUserId } from '../modules/profile/profile.reducer';
import { updateProfileFields, updateAllFields } from '../modules/profile/profile.actions';

const { height, width } = Dimensions.get('window');
const PROFILE_PIC_SIZE = 0.16 * width;

const mapStateToProps = state => ({
  profile: getProfileData(state),
  authToken: getAuthToken(state),
  userId: getUserId(state),
});

const mapDispatchToProps = {
  updateProfileFields,
  updateAllFields,
};

// note : backend should convert the other way, so just need this way
const convertMsisdnToPhone = (msisdn) => {
  if (!msisdn) {
    return '';
  }

  return `0${msisdn.substring('27'.length)}`;
}

class Profile extends React.Component {
  constructor(props) {
    super(props);

    const failedVerification = this.props.navigation.getParam('failedVerification');

    this.state = {
      profilePic: null,
      loading: false,
      firstName: '',
      lastName: '',
      calledName: '',
      idNumber: '',
      initials: '',
      
      dialogVisible: false,
      chooseFromLibraryLoading: false,
      takePhotoLoading: false,

      showOtpModal: false,
      showSuccessModal: false,
      showErrorDialog: false,

      failedVerification,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_PROFILE_SCREEN');
    const rawInfo = await AsyncStorage.getItem('userInfo');

    if (this.state.failedVerification) {
      this.setStateForOnboarding(rawInfo);
    } else {
      this.setStateForLoggedIn(rawInfo);
    }
  }

  setStateForOnboarding = async () => {
    const { personalName, familyName, nationalId } = this.props.profile;
    const initials = personalName && familyName ? personalName[0] + familyName[0] : 'A';
    this.setState({
      firstName: personalName,
      lastName: familyName,
      idNumber: nationalId,
      initials,
    });
  }

  setStateForLoggedIn = () => {
    const { profile } = this.props;
    this.setState({
      firstName: profile.personalName,
      lastName: profile.familyName,
      calledName: profile.calledName,
      idNumber: profile.nationalId,
      emailAddress: profile.emailAddress,
      phoneNumber: profile.phoneNumber ? convertMsisdnToPhone(profile.phoneNumber) : profile.phoneNumber, // so we don't get false positive on change test
      initials: profile.personalName[0] + profile.familyName[0],
      userLoggedIn: true,
    });
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onPressChangePassword = () => {
    this.props.navigation.navigate('ChangePassword', {
      systemWideUserId: this.state.systemWideUserId,
      token: this.props.authToken,
    });
  };

  onPressEditPic = () => {
    this.setState({
      dialogVisible: true,
    });
  };

  onHideDialog = () => {
    this.setState({ dialogVisible: false });
    return true;
  };

  onPressTakePhoto = () => {
    // eslint-disable-next-line no-useless-return
    if (this.state.takePhotoLoading) return;
  };

  onPressChooseFromLibrary = () => {
    // eslint-disable-next-line no-useless-return
    if (this.state.chooseFromLibraryLoading) return;
  };

  onPressSupport = () => {
    this.props.navigation.navigate('Support', { originScreen: 'Profile' });
  };

  onPressWhatsApp = () => {
    const defaultText = 'Hello, I am stuck at the ID verification screen in the app. Please help.';
    const whatsAppLink = `https://wa.me/${FallbackSupportNumber.link}?text=${encodeURIComponent(defaultText)}`;
    Linking.openURL(whatsAppLink).catch((err) => {
      LoggingUtil.logError(err);
      this.defaultToSupportScreen()
    });
  };


  // yeah, really need that api service soon
  requestHeader = () => ({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${this.props.authToken}`,
  });

  postOptions = (payload) => ({
    headers: this.requestHeader(),
    method: 'POST',
    body: JSON.stringify(payload),
  });

  fetchProfileForOnboardingUser = async () => {
    const result = await fetch(`${Endpoints.AUTH}profile/fetch`, {
      headers: this.requestHeader(),
      method: 'GET',
    });
    if (result.ok) {
      const resultJson = await result.json();
      
      await AsyncStorage.setItem('userInfo', JSON.stringify(resultJson));
      this.props.updateAllFields(resultJson);

      return resultJson;
    } else {
      throw result;
    }
  };

  onPressCheckAgain = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    try {
      const currentProfile = await this.fetchProfileForOnboardingUser();
      // console.log('Fetched profile: ', currentProfile);

      if (['FAILED_VERIFICATION', 'REVIEW_FAILED'].includes(currentProfile.profile.kycStatus)) {
        this.setState({ loading: false, hasRepeatingError: true });
        return;
      }

      
      const { screen, params } = NavigationUtil.directBasedOnProfile(currentProfile);
      this.setState({ loading: false });
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, screen, params);

    } catch (error) {
      console.log('Error checking again: ', JSON.stringify(error));
      this.setState({ loading: false, hasRepeatingError: true });
    }
  };

  submitPayload = async (payload) => {
    try {
      const result = await fetch(`${Endpoints.AUTH}profile/update`, {
        headers: this.requestHeader(),
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result.ok) {
        return result.json();
      } else {
        throw result;
      }
    } catch (err) {
      console.log('Error updating profile: ', JSON.stringify(err));
      return null;
    }
  }

  submitForFailedVerification = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    const payload = {
      personalName: this.state.firstName,
      familyName: this.state.lastName,
      nationalId: this.state.idNumber,
    };

    const resultJson = await this.submitPayload(payload);
    if (!resultJson) {
      this.setState({ hasRepeatingError: true, loading: false });
      return;
    }

    this.setState({ loading: false });
    if (resultJson.updatedKycStatus === 'VERIFIED_AS_PERSON') {
      // we must be in the condition of user not having completed onboarding; 
      // we used to take them to the onboard remaining steps screen to have a gentler transition to add cash
      // but now we are going to take them to the regulatory screen, as the most natural transition
      const profileInfo = await this.fetchProfileForOnboardingUser();
      const { screen, params } = NavigationUtil.directBasedOnProfile(profileInfo);

      NavigationUtil.navigateWithoutBackstack(this.props.navigation, screen, params);
    } else {
      this.setState({ hasRepeatingError: true });
    }
  }

  triggerOtpRequest = async (otpType) => {
    try {
      const payload = { type: otpType };
      const result = await fetch(`${Endpoints.AUTH}otp/trigger`, this.postOptions(payload)); 
      if (!result.ok) {
        throw result;
      }
    } catch (error) {
      console.log('ERROR requesting OTP: ', JSON.stringify(error));
      this.setState({ 
        showOtpModal: false,
        showErrorDialog: true, 
        errorText: 'Sorry, there was an error triggering the OTP. Please contact support to update your profile' });
    }
  }

  verifyOtp = async () => {
    if (this.state.verifyingOtp) return;
    this.setState({ verifyingOtp: true, otpError: false });

    try {
      const payload = { type: this.state.otpType, OTP: this.state.otpEntered, systemWideUserId: this.props.userId }; 
      const otpResult = await fetch(`${Endpoints.AUTH}otp/verify`, this.postOptions(payload));
      this.setState({ verifyingOtp: false });
      if (!otpResult.ok) {
        throw otpResult;
      }

      this.submitForLoggedIn();

    } catch (error) {
      console.log('ERROR submitting OTP: ', JSON.stringify(error));
      if (error.status === 403) {
        this.setState({ otpError: true });
      } else {
        this.setState({ showOtpModal: false, showErrorDialog: true, errorText: 'Sorry, an unknown error has occurred. Please contact support to update your profile' });
      }
    }
  }

  submitForLoggedIn = async () => {

    if (this.state.loading) return;
    this.setState({ loading: true });
        
    const fieldChanged = (fieldName) => this.state[fieldName] !== this.props.profile[fieldName];
    if (fieldChanged('phoneNumber') && fieldChanged('emailAddress')) {
      this.setState({ showErrorDialog: true, errorText: 'Sorry, for security reasons you can only change one contact field at a time' });
      this.setState({ phoneNumber: this.props.profile.phoneNumber, emailAddress: this.props.profile.emailAddress });
    }

    const changedFields = ['phoneNumber', 'emailAddress', 'calledName'].filter(fieldChanged);
    const payload = changedFields.reduce((obj, fieldName) => ({ ...obj, [fieldName]: this.state[fieldName] }), {});

    const resultJson = await this.submitPayload(payload);
    this.setState({ loading: false });

    if (!resultJson) {
      return;
    }

    const { result } = resultJson;
    if (result === 'REQUIRES_OTP') {
      const { otpType } = resultJson;
      this.triggerOtpRequest(otpType);
      // eslint-disable-next-line no-nested-ternary
      const otpMethodDisplay = otpType ? (otpType === 'VERIFY_BY_EMAIL' ? 'email' : 'phone') : 'contact';
      this.setState({ loading: false, showOtpModal: true, otpType, otpMethodDisplay })
    } else {
      // update the stored profile and continue
      this.props.updateProfileFields({ calledName: this.state.calledName });
      this.setState({ loading: false, showOtpModal: false, showSuccessModal: true });
    }

  }

  onPressSave = async () => {
    if (this.state.failedVerification) {
      this.submitForFailedVerification();
    } else {
      this.submitForLoggedIn();
    }
  };

  onPressLogout = () => {
    this.props.dispatch(LogoutUtil.logoutAction);
    LogoutUtil.logout(this.props.navigation);
  };

  renderProfilePicture() {
    if (this.state.profilePic) {
      return <Image style={styles.profilePic} />;
    } else {
      return (
        <View style={styles.profilePic}>
          <Text style={styles.profilePicText}>{this.state.initials}</Text>
        </View>
      );
    }
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
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView style={{ width: '100%' }} containerStyle={styles.mainContent}>
            {/* <View style={styles.picWrapper}>
              {!this.state.keyboardShowing && this.renderProfilePicture()}
                {/* Uncomment this once we want to implement the edit picture feature
                <Text style={styles.editText} onPress={this.onPressEditPic}>edit</Text>
                </View> */}
            {/* <View style={styles.profileInfoWrapper}> */}
            <KeyboardAvoidingView style={styles.profileInfoWrapper} contentContainerStyle={styles.profileInfoWrapper} behavior="position">
              <View style={styles.profileInfo}>
                <View style={styles.profileField}>
                  <Input
                    label={`First Name${!this.state.failedVerification ? '*' : ''}`}
                    editable={this.state.failedVerification}
                    value={this.state.firstName}
                    onChangeText={text => { this.setState({ firstName: text }); }}
                    labelStyle={styles.profileFieldTitle}
                    inputContainerStyle={styles.inputContainerStyle}
                    inputStyle={[styles.profileFieldValue, this.state.errors && this.state.errors.firstName ? styles.redText : null]}
                    containerStyle={styles.containerStyle}
                  />
                </View>
                <View style={styles.separator} />
                {!this.state.failedVerification && (
                  <>
                    <View style={styles.profileField}>
                      <Input 
                        label='Nickname (optional)'
                        editable={!this.state.failedVerification}
                        value={this.state.calledName}
                        onChangeText={text => { this.setState({ calledName: text })}}
                        labelStyle={styles.profileFieldTitle}
                        inputContainerStyle={styles.inputContainerStyle}
                        inputStyle={styles.profileFieldValue}
                        containerStyle={styles.containerStyle}
                      />
                    </View>
                    <View style={styles.separator} />
                  </>
                )}
                <View style={styles.profileField}>
                  <Input
                    label={`Last Name${
                      !this.state.failedVerification ? '*' : ''
                    }`}
                    editable={this.state.failedVerification}
                    value={this.state.lastName}
                    onChangeText={text => {
                      this.setState({ lastName: text });
                    }}
                    labelStyle={styles.profileFieldTitle}
                    inputContainerStyle={styles.inputContainerStyle}
                    inputStyle={[
                      styles.profileFieldValue,
                      this.state.errors && this.state.errors.lastName
                        ? styles.redText
                        : null,
                    ]}
                    containerStyle={styles.containerStyle}
                  />
                </View>
                <View style={styles.separator} />
                <View style={styles.profileField}>
                  <Input
                    label={`ID number${
                      !this.state.failedVerification ? '*' : ''
                    }`}
                    editable={this.state.failedVerification}
                    value={this.state.idNumber}
                    onChangeText={text => {
                      this.setState({ idNumber: text });
                    }}
                    labelStyle={styles.profileFieldTitle}
                    inputContainerStyle={styles.inputContainerStyle}
                    inputStyle={[
                      styles.profileFieldValue,
                      this.state.errors && this.state.errors.idNumber
                        ? styles.redText
                        : null,
                    ]}
                    containerStyle={styles.containerStyle}
                  />
                </View>
                {!this.state.failedVerification && (
                <>
                  <View style={styles.separator} />
                  <View style={styles.profileField}>
                    <Input
                      label="Email Address"
                      editable
                      value={this.state.emailAddress}
                      onChangeText={text => { this.setState({ emailAddress: text }); }}
                      labelStyle={styles.profileFieldTitle}
                      inputContainerStyle={styles.inputContainerStyle}
                      inputStyle={[
                        styles.profileFieldValue,
                        this.state.errors && this.state.errors.idNumber
                          ? styles.redText
                          : null,
                      ]}
                      containerStyle={styles.containerStyle}
                    />
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.profileField}>
                    <Input
                      label="Phone Number"
                      editable
                      value={this.state.phoneNumber}
                      onChangeText={text => { this.setState({ phoneNumber: text }); }}
                      labelStyle={styles.profileFieldTitle}
                      inputContainerStyle={styles.inputContainerStyle}
                      inputStyle={[styles.profileFieldValue, this.state.errors && this.state.errors.idNumber ? styles.redText : null]}
                      containerStyle={styles.containerStyle}
                    />
                  </View>
                </>
                )}
              </View>
              <View>
                {this.state.hasRepeatingError ? (
                  <Text style={[styles.disclaimer, styles.redText]}>
                    Sorry, the ID check still failed. Usually this is the result of outdated Home Affairs databases, and 
                    can be fixed easily using our {' '}
                    <Text style={styles.disclaimerBold} onPress={this.onPressSupport}>support form</Text>{' '} or {' '} 
                    <Text style={styles.disclaimerBold} onPress={this.onPressWhatsApp}>on WhatsApp</Text>.
                  </Text>
                ) : (
                  <View>
                    {this.state.failedVerification ? (
                      <Text style={styles.disclaimer}>
                        If your details are correct, please{' '}
                        <Text style={styles.disclaimerBold} onPress={this.onPressSupport}>contact support</Text>.
                      </Text>
                    ) : (
                      <Text style={styles.disclaimer}>
                        *In order to update any of the those fields please contactus{' '}
                        <Text style={styles.disclaimerBold} onPress={this.onPressSupport}>using the support form.</Text>
                      </Text>
                    )}
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.buttonLine}
                onPress={this.onPressSave}
              >
                <Text style={styles.buttonLineText}>Save Changes</Text>
                {this.state.loading ? (
                  <ActivityIndicator
                    style={styles.spinner}
                    color={Colors.MEDIUM_GRAY}
                  />
                ) : (
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                )}
              </TouchableOpacity>
              {this.state.failedVerification ? (
                <TouchableOpacity
                  style={styles.buttonLine}
                  onPress={this.onPressCheckAgain}
                >
                  <Text style={styles.buttonLineText}>Check Again</Text>
                  {this.state.loading ? (
                    <ActivityIndicator
                      style={styles.spinner}
                      color={Colors.MEDIUM_GRAY}
                    />
                  ) : (
                    <Icon
                      name="chevron-right"
                      type="evilicon"
                      size={50}
                      color={Colors.MEDIUM_GRAY}
                    />
                  )}
                </TouchableOpacity>
              ) : null}
              {this.state.failedVerification ? (
                <TouchableOpacity
                  style={styles.buttonLine}
                  onPress={this.onPressLogout}
                >
                  <Text style={styles.buttonLineText}>Logout</Text>
                  {this.state.loading ? (
                    <ActivityIndicator
                      style={styles.spinner}
                      color={Colors.MEDIUM_GRAY}
                    />
                  ) : (
                    <Icon
                      name="chevron-right"
                      type="evilicon"
                      size={50}
                      color={Colors.MEDIUM_GRAY}
                    />
                  )}
                </TouchableOpacity>
              ) : null}
              {!this.state.failedVerification ? (
                <TouchableOpacity
                  style={styles.buttonLine}
                  onPress={this.onPressChangePassword}
                >
                  <Text style={styles.buttonLineText}>Change Password</Text>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>

        <Overlay
          isVisible={this.state.dialogVisible}
          containerStyle={styles.editPicDialog}
          onBackdropPress={this.onHideDialog}
          onHardwareBackPress={this.onHideDialog}
        >
          <View style={styles.dialogContent}>
            <Text style={styles.editPicDialogTitle}>Select a photo</Text>
            <Button
              title="TAKE PHOTO"
              loading={this.state.takePhotoLoading}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={this.onPressTakePhoto}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
            <Button
              title="CHOOSE FROM LIBRARY"
              loading={this.state.chooseFromLibraryLoading}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={this.onPressChooseFromLibrary}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
            <Text
              style={styles.editPicDialogCancel}
              onPress={this.onHideDialog}
            >
              Cancel
            </Text>
          </View>
        </Overlay>

        <Overlay
          isVisible={this.state.showOtpModal}
          containerStyle={styles.infoDialogContainer}
          height="auto"
        >
          <View style={styles.dialogContent}>
            <Text style={styles.editPicDialogTitle}>Enter OTP</Text>
            <Text style={styles.infoDialogBody}>
              For security reasons, changing contact details requires
              verification by OTP. We have sent a pin to your{' '} 
              {this.state.otpMethodDisplay}
            </Text>
            <Input 
              editable
              keyboardType="numeric"
              onChangeText={text => { this.setState({ otpEntered: text }); }}
              containerStyle={styles.otpInputContainerStyle}
              inputContainerStyle={styles.otpInputStyle}
              inputStyle={styles.otpInputField}
            />
            {this.state.otpError && 
              <Text style={styles.otpError}>Sorry, that OTP is incorrect</Text>}
            <Button 
              title="SUBMIT"
              onPress={this.verifyOtp}
              loading={this.state.verifyingOtp}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle} 
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
          </View>
        </Overlay>

        <Overlay
          isVisible={this.state.showSuccessModal}
          containerStyle={styles.infoDialogContainer}
          height="auto"
          onBackdropPress={() => this.setState({ showSuccessModal: false })}
          onHardwareBackPress={() => this.setState({ showSuccessModal: false })}
        >
          <View style={styles.dialogContent}>
            <Text style={styles.editPicDialogTitle}>
              Done!
            </Text>
            <Text style={styles.infoDialogBody}>
              Your profile has been updated. 
              Note: Some changes may not reflect until you reopen the app
            </Text>
            <Button 
              title="CLOSE"
              onPress={() => this.setState({ showSuccessModal: false })}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle} 
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
          </View>
        </Overlay>

        <Overlay
          isVisible={this.state.showErrorDialog}
          containerStyle={styles.infoDialogContainer}
          height="auto"
          onBackdropPress={() => this.setState({ showErrorDialog: false })}
          onHardwareBackPress={() => this.setState({ showErrorDialog: false })}
        >
          <View style={styles.dialogContent}>
            <Text style={styles.editPicDialogTitle}>Error</Text>
            <Text style={styles.infoDialogBody}>
              {this.state.errorText}
            </Text>
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
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 22,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  buttonLine: {
    height: height * 0.1,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 15,
    alignSelf: 'stretch',
    width: '100%',
    marginTop: 10,
  },
  buttonLineText: {
    flex: 1,
    color: Colors.DARK_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 17,
  },
  // picWrapper: {
  //   alignItems: 'center',
  // },
  profilePic: {
    width: PROFILE_PIC_SIZE,
    height: PROFILE_PIC_SIZE,
    borderRadius: PROFILE_PIC_SIZE / 2,
    backgroundColor: Colors.LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicText: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    color: Colors.WHITE,
  },
  // editText: {
  //   marginTop: 5,
  //   fontSize: 15,
  //   fontFamily: 'poppins-semibold',
  //   color: Colors.MEDIUM_GRAY,
  // },
  profileInfoWrapper: {
    minHeight: '50%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    width: '88%',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 10,
  },
  disclaimer: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 12.5,
    marginTop: 5,
    paddingHorizontal: 18,
  },
  disclaimerBold: {
    fontFamily: 'poppins-semibold',
    textDecorationLine: 'underline',
  },
  profileField: {
    flex: 1,
    justifyContent: 'center',
  },
  profileFieldTitle: {
    fontFamily: 'poppins-semibold',
    color: Colors.MEDIUM_GRAY,
    fontSize: 12,
    marginTop: 5,
  },
  profileFieldValue: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 18,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.GRAY,
    width: '100%',
  },
  editPicDialog: {
    width: '88%',
    position: 'absolute',
    bottom: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoDialogContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  dialogContent: {
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
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
    width: '95%',
  },
  editPicDialogTitle: {
    color: Colors.DARK_GRAY,
    fontSize: 20,
    fontFamily: 'poppins-semibold',
    marginTop: 10,
  },
  editPicDialogCancel: {
    color: Colors.PURPLE,
    fontSize: 15,
    fontFamily: 'poppins-semibold',
  },
  infoDialogBody: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    paddingHorizontal: 5,
    marginVertical: 10,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  containerStyle: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  otpInputContainerStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  otpInputStyle: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.PURPLE,
  },
  otpInputField: {
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  otpError: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    marginVertical: 10,
  },
  redText: {
    color: Colors.RED,
  },
  spinner: {
    marginRight: 15,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
