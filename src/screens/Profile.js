import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, Dimensions } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints } from '../util/Values';
import { Button, Icon } from 'react-native-elements';
import { Colors } from '../util/Values';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';

let {height, width} = Dimensions.get('window');
const PROFILE_PIC_SIZE = 0.16 * width;

export default class Profile extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      profilePic: null,
      loading: false,
      firstName: "",
      lastName: "",
      idNumber: "",
      email: "",
      initials: "",
      dialogVisible: false,
      chooseFromLibraryLoading: false,
      takePhotoLoading: false,
    };
  }

  async componentDidMount() {
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
      this.setState({
        firstName: info.profile.personalName,
        lastName: info.profile.familyName,
        idNumber: info.profile.nationalId,
        email: info.profile.email,
        initials: info.profile.personalName[0] + info.profile.familyName[0],
      });
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressChangePassword = () => {

  }

  onPressEditPic = () => {
    this.setState({
      dialogVisible: true,
    });
  }

  renderProfilePicture() {
    if (this.state.profilePic) {
      return (
        <Image style={styles.profilePic}/>
      );
    } else {
      return (
        <View style={styles.profilePic}>
          <Text style={styles.profilePicText}>{this.state.initials}</Text>
        </View>
      )
    }
  }

  onHideDialog = () => {
    this.setState({ dialogVisible: false });
    return true;
  }

  onPressTakePhoto = () => {
    if (this.state.takePhotoLoading) return;
  }

  onPressChooseFromLibrary = () => {
    if (this.state.chooseFromLibraryLoading) return;
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
            <Icon
              name='chevron-left'
              type='evilicon'
              size={45}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.mainContent}>
          <View style={styles.picWrapper}>
            {this.renderProfilePicture()}
            <Text style={styles.editText} onPress={this.onPressEditPic}>edit</Text>
          </View>
          <View style={styles.profileInfoWrapper}>
            <View style={styles.profileInfo}>
              <View style={styles.profileField}>
                <Text style={styles.profileFieldTitle}>First Name</Text>
                <Text style={styles.profileFieldValue}>{this.state.firstName}</Text>
              </View>
              <View style={styles.separator}/>
              <View style={styles.profileField}>
                <Text style={styles.profileFieldTitle}>Last Name</Text>
                <Text style={styles.profileFieldValue}>{this.state.lastName}</Text>
              </View>
              <View style={styles.separator}/>
              <View style={styles.profileField}>
                <Text style={styles.profileFieldTitle}>ID Number</Text>
                <Text style={styles.profileFieldValue}>{this.state.idNumber}</Text>
              </View>
              <View style={styles.separator}/>
              <View style={styles.profileField}>
                <Text style={styles.profileFieldTitle}>Email Address</Text>
                <Text style={styles.profileFieldValue}>{this.state.email}</Text>
              </View>
            </View>
            <Text style={styles.disclaimer}>In order to update any of the above information please email <Text style={styles.disclaimerBold}>xxxx@jupiter.com</Text></Text>
          </View>
          <TouchableOpacity style={styles.buttonLine} onPress={this.onPressChangePassword}>
            <Text style={styles.buttonLineText}>Change Password</Text>
            <Icon
              name='chevron-right'
              type='evilicon'
              size={50}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
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
              }} />
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
              }} />
            <Text style={styles.editPicDialogCancel} onPress={this.onHideDialog}>Cancel</Text>
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
    backgroundColor: 'white',
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
    backgroundColor: 'white',
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
    color: 'white',
  },
  editText: {
    marginTop: 5,
    fontSize: 15,
    fontFamily: 'poppins-semibold',
    color: Colors.MEDIUM_GRAY,
  },
  profileInfoWrapper: {
    height: '50%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    width: '88%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  disclaimer: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    fontSize: 12.5,
    width: '88%',
    marginTop: 5,
  },
  disclaimerBold: {
    fontFamily: 'poppins-semibold',
  },
  profileField: {
    flex: 1,
    justifyContent: 'center',
  },
  profileFieldTitle: {
    fontFamily: 'poppins-semibold',
    color: Colors.MEDIUM_GRAY,
    fontSize: 12,
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
    color: 'white',
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
});
