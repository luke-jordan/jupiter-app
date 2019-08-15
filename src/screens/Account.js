import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, Dimensions } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints } from '../util/Values';
import NavigationBar from '../elements/NavigationBar';
import { Icon, Input, Button } from 'react-native-elements';
import { Colors } from '../util/Values';
import VersionCheck from 'react-native-version-check-expo';

let {height, width} = Dimensions.get('window');
// const FONT_UNIT = 0.01 * width;
const PROFILE_PIC_SIZE = 0.13 * width;

export default class Account extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      profilePic: null,
      loading: false,
      fullName: "",
      initials: "",
    };
  }

  async componentDidMount() {
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
      this.setState({
        fullName: info.profile.personalName + " " + info.profile.familyName,
        initials: info.profile.personalName[0] + info.profile.familyName[0],
      });
    }
  }

  onPressLogout = () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    NavigationUtil.logout(this.props.navigation);
  }

  onPressDetails = () => {
    this.props.navigation.navigate('Profile');
  }

  onPressWithdraw = () => {

  }

  onPressTerms = () => {
    this.props.navigation.navigate('Terms');
  }

  onPressPrivacy = () => {
    this.props.navigation.navigate('PrivacyPolicy');
  }

  onPressSupport = () => {

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

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>
        <View style={styles.mainContentWrapper}>
          <View style={styles.mainContent}>
            <TouchableOpacity style={[styles.buttonLine, styles.accountButtonLine]} onPress={this.onPressDetails}>
              <View style={styles.accountLineContent}>
                {this.renderProfilePicture()}
                <View style={styles.accountInfo}>
                  <Text style={styles.nameText}>{this.state.fullName}</Text>
                  <Text style={styles.detailsText}>View Details</Text>
                </View>
              </View>
              <Icon
                name='chevron-right'
                type='evilicon'
                size={50}
                color={Colors.MEDIUM_GRAY}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonLine} onPress={this.onPressWithdraw}>
              <Text style={styles.buttonLineText}>Withdraw Cash</Text>
              <Icon
                name='chevron-right'
                type='evilicon'
                size={50}
                color={Colors.MEDIUM_GRAY}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonLine} onPress={this.onPressTerms}>
              <Text style={styles.buttonLineText}>Terms & Conditions</Text>
              <Icon
                name='chevron-right'
                type='evilicon'
                size={50}
                color={Colors.MEDIUM_GRAY}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonLine} onPress={this.onPressPrivacy}>
              <Text style={styles.buttonLineText}>Privacy Policy</Text>
              <Icon
                name='chevron-right'
                type='evilicon'
                size={50}
                color={Colors.MEDIUM_GRAY}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.versionLine}>
            <Text style={styles.versionText}>Version {VersionCheck.getCurrentVersion()} {VersionCheck.getCurrentBuildNumber() ? `(${VersionCheck.getCurrentBuildNumber()})` : ""}</Text>
            <Text style={styles.versionText} onPress={this.onPressSupport}>Contact Support</Text>
          </View>
          <Button
            title="LOG OUT"
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressLogout}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }} />
        </View>
        <NavigationBar navigation={this.props.navigation} currentTab={3} hasNotification />
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
    height: height / 11,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 22,
  },
  mainContentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
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
    marginVertical: 10,
    justifyContent: 'center',
    width: '87%',
  },
  versionLine: {
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  versionText: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 13,
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
  accountButtonLine: {
    height: height * 0.11,
  },
  accountLineContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: PROFILE_PIC_SIZE,
    height: PROFILE_PIC_SIZE,
    borderRadius: PROFILE_PIC_SIZE / 2,
    backgroundColor: Colors.LIGHT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  profilePicText: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: 'white',
  },
  accountInfo: {
    flex: 1,
  },
  nameText: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
  },
  detailsText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
  },
});
