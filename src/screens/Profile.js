import React from 'react';
import {
  ActivityIndicator,
  AsyncStorage,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import { Button, Input, Icon } from 'react-native-elements';
import Dialog, {
  DialogContent,
  SlideAnimation,
} from 'react-native-popup-dialog';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';

const { height, width } = Dimensions.get('window');
const PROFILE_PIC_SIZE = 0.16 * width;

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    const failedVerification = this.props.navigation.getParam(
      'failedVerification'
    );

    this.state = {
      profilePic: null,
      loading: false,
      firstName: '',
      lastName: '',
      idNumber: '',
      initials: '',
      dialogVisible: false,
      chooseFromLibraryLoading: false,
      takePhotoLoading: false,
      failedVerification,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_PROFILE_SCREEN');
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      if (this.state.failedVerification) {
        info = this.props.navigation.getParam('info');
        this.setState({
          firstName: info.firstName,
          lastName: info.lastName,
          idNumber: info.idNumber,
          initials: info.firstName[0] + info.lastName[0],
          systemWideUserId: info.systemWideUserId,
          token: info.token,
        });
      } else {
        NavigationUtil.logout(this.props.navigation);
      }
    } else {
      info = JSON.parse(info);
      this.setState({
        firstName: info.profile.personalName,
        lastName: info.profile.familyName,
        idNumber: info.profile.nationalId,
        tempEmail: info.profile.email,
        initials: info.profile.personalName[0] + info.profile.familyName[0],
        systemWideUserId: info.systemWideUserId,
        token: info.token,
        userLoggedIn: true,
      });
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onPressChangePassword = () => {
    this.props.navigation.navigate('ChangePassword', {
      systemWideUserId: this.state.systemWideUserId,
      token: this.state.token,
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
    this.props.navigation.navigate('Support');
  };

  fetchProfileForOnboardingUser = async () => {
    const result = await fetch(`${Endpoints.AUTH}profile/fetch`, {
      headers: {
        Authorization: `Bearer ${this.state.token}`,
      },
      method: 'GET',
    });
    if (result.ok) {
      const resultJson = await result.json();
      await AsyncStorage.setItem('userInfo', JSON.stringify(resultJson));
      return resultJson;
    } else {
      throw result;
    }
  };

  onPressSave = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    try {
      const payload = {
        personalName: this.state.firstName,
        familyName: this.state.lastName,
        nationalId: this.state.idNumber,
      };

      const result = await fetch(`${Endpoints.AUTH}profile/update`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (result.ok) {
        const resultJson = await result.json();
        if (resultJson.updatedKycStatus === 'VERIFIED_AS_PERSON') {
          if (this.state.userLoggedIn) {
            // update the stored profile and continue
            let info = await AsyncStorage.getItem('userInfo');
            info = JSON.parse(info);
            info.profile.kycStatus = resultJson.updatedKycStatus;
            await AsyncStorage.setItem('userInfo', JSON.stringify(info));
            this.setState({ loading: false });
            const { screen, params } = NavigationUtil.directBasedOnProfile(
              info
            );
            NavigationUtil.navigateWithoutBackstack(
              this.props.navigation,
              screen,
              params
            );
          } else {
            // we must be in the condition of user not having completed onboarding; instead of straight to cash,
            // take them to the onboarding steps remaining screen, straight to add cash being abrupt, but first get & store profile
            const profileInfo = await this.fetchProfileForOnboardingUser();
            const { screen, params } = NavigationUtil.directBasedOnProfile(
              profileInfo
            );
            NavigationUtil.navigateWithoutBackstack(
              this.props.navigation,
              screen,
              params
            );
          }
        } else {
          this.setState({ hasRepeatingError: true, loading: false });
        }
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ loading: false, hasRepeatingError: true });
      // console.log("error", JSON.stringify(error, null, "\t"));
      // TODO handle properly
    }
  };

  onPressLogout = () => {
    NavigationUtil.logout(this.props.navigation);
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
        <View style={styles.mainContent}>
          <View style={styles.picWrapper}>
            {this.renderProfilePicture()}
            {/*
              Uncomment this once we want to implement the edit picture feature
              <Text style={styles.editText} onPress={this.onPressEditPic}>edit</Text>
              */}
          </View>
          <View style={styles.profileInfoWrapper}>
            <View style={styles.profileInfo}>
              <View style={styles.profileField}>
                <Input
                  label={
                    `First Name${!this.state.failedVerification}` ? '*' : ''
                  }
                  editable={this.state.failedVerification}
                  value={this.state.firstName}
                  onChangeText={text => {
                    this.setState({ firstName: text });
                  }}
                  labelStyle={styles.profileFieldTitle}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={[
                    styles.profileFieldValue,
                    this.state.errors && this.state.errors.firstName
                      ? styles.redText
                      : null,
                  ]}
                  containerStyle={styles.containerStyle}
                />
              </View>
              <View style={styles.separator} />
              <View style={styles.profileField}>
                <Input
                  label={
                    `Last Name${!this.state.failedVerification}` ? '*' : ''
                  }
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
                  label={
                    `ID Number${!this.state.failedVerification}` ? '*' : ''
                  }
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
              {!this.state.failedVerification ? (
                <View style={styles.separator} />
              ) : null}
              {!this.state.failedVerification ? (
                <View style={styles.profileField}>
                  <Input
                    label="Email Address / Phone Number*"
                    editable={false}
                    value={this.state.tempEmail}
                    onChangeText={text => {
                      this.setState({ tempEmail: text });
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
              ) : null}
              {/*
                <View style={styles.profileField}>
                  <Input
                    label="Email Address"
                    value={this.state.tempEmail}
                    onChangeText={(text) => {this.setState({tempEmail: text})}}
                    labelStyle={styles.profileFieldTitle}
                    inputContainerStyle={styles.inputContainerStyle}
                    inputStyle={[styles.profileFieldValue, this.state.errors && this.state.errors.email ? styles.redText : null]}
                    containerStyle={styles.containerStyle}
                  />
                </View>
                <View style={styles.separator}/>
                <View style={styles.profileField}>
                  <Input
                    label="Phone Number"
                    value={this.state.tempPhoneNumber}
                    onChangeText={(text) => {this.setState({tempPhoneNumber: text})}}
                    labelStyle={styles.profileFieldTitle}
                    inputContainerStyle={styles.inputContainerStyle}
                    inputStyle={[styles.profileFieldValue, this.state.errors && this.state.errors.phoneNumber ? styles.redText : null]}
                    containerStyle={styles.containerStyle}
                  />
                </View>
                */}
            </View>
            <View>
              {this.state.hasRepeatingError ? (
                <Text
                  style={[styles.disclaimer, styles.redText]}
                  onPress={this.onPressSupport}
                >
                  Sorry, your details still failed the ID verification check. If
                  you believe they are correct,{' '}
                  <Text style={styles.disclaimerBold}>
                    please contact support
                  </Text>
                  .
                </Text>
              ) : (
                <View>
                  {this.state.failedVerification ? (
                    <Text style={styles.disclaimer}>
                      If your details are correct, please{' '}
                      <Text
                        style={styles.disclaimerBold}
                        onPress={this.onPressSupport}
                      >
                        contact support
                      </Text>
                      .
                    </Text>
                  ) : (
                    <Text style={styles.disclaimer}>
                      *In order to update any of the those fields please contact
                      us{' '}
                      <Text
                        style={styles.disclaimerBold}
                        onPress={this.onPressSupport}
                      >
                        using the support form.
                      </Text>
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
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
                onPress={this.onPressLogout}
              >
                <Text style={styles.buttonLineText}>Logout</Text>
                <Icon
                  name="chevron-right"
                  type="evilicon"
                  size={50}
                  color={Colors.MEDIUM_GRAY}
                />
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
        </View>

        <Dialog
          visible={this.state.dialogVisible}
          dialogStyle={styles.editPicDialog}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: 'bottom',
            })
          }
          onTouchOutside={this.onHideDialog}
          onHardwareBackPress={this.onHideDialog}
        >
          <DialogContent style={styles.dialogContent}>
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
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  buttonLine: {
    height: height * 0.075,
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
  picWrapper: {
    alignItems: 'center',
  },
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
    height: '50%',
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
    flex: 1,
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
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  containerStyle: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  redText: {
    color: Colors.RED,
  },
  spinner: {
    marginRight: 15,
  },
});
