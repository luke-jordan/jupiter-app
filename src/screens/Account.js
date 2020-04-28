import React from 'react';
import { connect } from 'react-redux';

import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Icon, Button } from 'react-native-elements';
import VersionCheck from 'react-native-version-check-expo';

import { LoggingUtil } from '../util/LoggingUtil';
import { LogoutUtil } from '../util/LogoutUtil';
import NavigationBar from '../elements/NavigationBar';
import { Colors } from '../util/Values';

import { getProfileData } from '../modules/profile/profile.reducer';

const { height, width } = Dimensions.get('window');
const PROFILE_PIC_SIZE = 0.13 * width;

const mapPropsToState = state => ({
  profile: getProfileData(state),
})

const mapDispatchToProps = {
  clearState: () => ({ type: 'USER_LOGOUT' }), 
};

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profilePic: null,
      loading: false,
      initials: '',
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_ACCOUNT_SCREEN');
    let initials = '';
    if (this.props.profile && this.props.profile.personalName && this.props.profile.familyName) {
      initials = this.props.profile.personalName[0] + this.props.profile.familyName[0]
    }
    
    this.setState({ initials });
  }

  onPressLogout = () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    this.props.clearState();
    LogoutUtil.logout(this.props.navigation);
  };

  onPressDetails = () => {
    this.props.navigation.navigate('Profile');
  };

  onPressHistory = () => {
    this.props.navigation.navigate('History');
  };

  onPressMessages = () => {
    this.props.navigation.navigate('PastMessages');
  }

  onPressWithdraw = () => {
    this.props.navigation.navigate('WithdrawStep1');
  };

  onPressStokvel = () => {
    this.props.navigation.navigate('Stokvel');
  }

  onPressMoneyMarket = () => {
    this.props.navigation.navigate('MoneyMarket');
  }

  onPressTerms = () => {
    this.props.navigation.navigate('Terms');
  };

  onPressPrivacy = () => {
    this.props.navigation.navigate('PrivacyPolicy');
  };

  onPressSupport = () => {
    this.props.navigation.navigate('Support', { originScreen: 'Account' });
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
          <Text style={styles.headerTitle}>Account</Text>
        </View>
        <View style={styles.mainContentWrapper}>
          <ScrollView style={styles.mainContent}>
            {/* <View style={{ width: '100%', marginTop: 20, alignItems: 'center' }}>
              {this.renderProfilePicture()}
              <Text style={styles.nameText}>{this.state.fullName}</Text>
            </View> */}
            <View style={styles.mainContent}>
              <View style={styles.sectionContent}>
                {/* <Text style={styles.sectionHead}>MY ACCOUNT</Text> */}
                <TouchableOpacity
                  style={[styles.buttonLine, styles.accountButtonLine]}
                  onPress={this.onPressHistory}
                >
                  <View style={styles.accountLineContent}>
                    <Image style={styles.accountLineIcon} source={require('../../assets/history.png')} />
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountLineText}>History</Text>
                    </View>
                  </View>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buttonLine, styles.accountButtonLine]}
                  onPress={this.onPressDetails}
                >
                  <View style={styles.accountLineContent}>
                    <Image style={styles.accountLineIcon} source={require('../../assets/profile.png')} />
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountLineText}>Profile</Text>
                    </View>
                  </View>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buttonLine, styles.accountButtonLine]}
                  onPress={this.onPressWithdraw}
                >
                  <View style={styles.accountLineContent}>
                    <Image style={styles.accountLineIcon} source={require('../../assets/withdraw.png')} />
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountLineText}>Withdraw Cash</Text>
                    </View>
                  </View>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.buttonLine, styles.accountButtonLine]}
                  onPress={this.onPressMessages}
                >
                  <View style={styles.accountLineContent}>
                    <Image style={styles.accountLineIcon} source={require('../../assets/messages.png')} />
                    <View style={styles.accountInfo}>
                      <Text style={styles.accountLineText}>Messages</Text>
                    </View>
                  </View>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.sectionContent}>
                <Text style={styles.sectionHead}>ABOUT</Text>
                <TouchableOpacity
                  style={styles.buttonLine}
                  onPress={this.onPressStokvel}
                >
                  <Text style={styles.buttonLineText}>Jupiter Stokvel</Text>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonLine}
                  onPress={this.onPressMoneyMarket}
                >
                  <Text style={styles.buttonLineText}>Money Market Fund</Text>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonLine}
                  onPress={this.onPressTerms}
                >
                  <Text style={styles.buttonLineText}>Terms & Conditions</Text>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.buttonLine}
                  onPress={this.onPressPrivacy}
                >
                  <Text style={styles.buttonLineText}>Privacy Policy</Text>
                  <Icon
                    name="chevron-right"
                    type="evilicon"
                    size={50}
                    color={Colors.MEDIUM_GRAY}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.versionLine}>
              <Text style={styles.versionText}>
                Version {VersionCheck.getCurrentVersion()}
              </Text>
              <Text style={[styles.versionText, styles.supportLink]} onPress={this.onPressSupport}>
                Contact Support
              </Text>
            </View>
          </ScrollView>
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
            }}
          />
        </View>
        <NavigationBar navigation={this.props.navigation} currentTab={3} />
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
    backgroundColor: Colors.WHITE,
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
    width: '100%',
  },
  sectionContent: {
    marginTop: 20,
  },
  sectionHead: {
    fontSize: 12, 
    fontWeight: '500',
    fontFamily: 'poppins-regular', 
    marginLeft: 14,
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
    width: '87%',
  },
  versionLine: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 22,
    paddingHorizontal: 14,
  },
  versionText: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 13,
  },
  supportLink: {
    textDecorationLine: 'underline',
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
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 17,
  },
  accountButtonLine: {
    height: height * 0.09,
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
    color: Colors.WHITE,
  },
  accountInfo: {
    flex: 1,
  },
  // nameText: {
  //   fontFamily: 'poppins-semibold',
  //   fontSize: 18,
  //   color: Colors.DARK_GRAY,
  // },
  accountLineText: {
    fontFamily: 'poppins-regular',
    fontSize: 17,
    color: Colors.NEAR_BLACK,
  },
  accountLineIcon: {
    marginRight: 10,
    maxWidth: 30,
    maxHeight: 30,
  },
});

export default connect(mapPropsToState, mapDispatchToProps)(Account);
