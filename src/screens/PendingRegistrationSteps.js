import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '../util/Values';
import { NavigationUtil } from '../util/NavigationUtil';

const { width } = Dimensions.get('window');

export default class PendingRegistrationSteps extends React.Component {
  constructor(props) {
    super(props);
    const userInfo = this.props.navigation.getParam('userInfo');

    this.state = {
      firstName: userInfo.profile.personalName,
      stepsLeft: 2, // reasonable default
      stepsLeftHeader: '2 STEPS LEFT',
      mustAddCash: true,
      mustAgreeRegulatory: true,
      mustFinishTransfer: true,
    };
  }

  componentDidMount() {
    // should not happen but just in case
    const userInfo = this.props.navigation.getParam('userInfo');
    if (!Array.isArray(userInfo.onboardStepsRemaining) || userInfo.onboardStepsRemaining.length === 0) {
      NavigationUtil.navigateWithoutBackstack('Home', { userInfo });
    }

    const { onboardStepsRemaining } = userInfo;
    const stepsLeft = onboardStepsRemaining.length;

    this.setState({
      stepsLeft,
      stepsLeftHeader: `${stepsLeft} STEP${stepsLeft === 1 ? '' : 'S'} LEFT`,
      mustAgreeRegulatory: userInfo.onboardStepsRemaining.includes('AGREE_REGULATORY'),
      mustAddCash: onboardStepsRemaining.includes('ADD_CASH'),
      mustFinishTransfer: onboardStepsRemaining.includes('FINISH_SAVE'),
    });
  }

  onPressRegulatoryAgreement = () => {
    const userInfo = this.props.navigation.getParam('userInfo');
    this.props.navigation.navigate('OnboardRegulation', {
      isOnboarding: true,
      accountId: userInfo.balance.accountId[0],
    })
  }

  onPressAddCash = () => {
    const userInfo = this.props.navigation.getParam('userInfo');
    this.props.navigation.navigate('AddCash', {
      isOnboarding: true,
      systemWideUserId: userInfo.systemWideUserId,
      token: userInfo.token,
      accountId: userInfo.balance.accountId[0],
    });
  };

  onPressFinishSave = () => {
    const userInfo = this.props.navigation.getParam('userInfo');
    this.props.navigation.navigate('PendingManualTransfer', {
      isOnboarding: true,
      token: userInfo.token,
    });
  };

  onPressLogout = () => {
    NavigationUtil.logout();
  };

  onPressContactSupport = () => {
    this.props.navigation.navigate('Support', { originScreen: 'PendingRegistrationSteps' });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.headerImageWrapper}>
          <Image
            style={styles.headerImage}
            source={require('../../assets/group_16.png')}
            resizeMode="contain"
          />
        </View>
        <ScrollView style={styles.mainContent}>
          <View style={styles.topSection}>
            <Text style={styles.title}>Hello, {this.state.firstName}</Text>
            <Text style={styles.description}>
              You’re on your way to becoming a smart saver. We just need the
              following before activating your account:
            </Text>
          </View>
          <View style={styles.midSection}>
            <Text style={styles.stepsLeftText}>{this.state.stepsLeftHeader}</Text>
            <View style={styles.stepsLeftContainer}>
              <LinearGradient
                start={[0, 0.5]}
                end={[1, 0.5]}
                colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
                style={styles.stepsGradient}
              />
              <LinearGradient
                start={[0, 0.5]}
                end={[1, 0.5]}
                colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
                style={styles.stepsGradient}
              />
              <LinearGradient
                start={[0, 0.5]}
                end={[1, 0.5]}
                colors={this.state.stepsLeft > 2 ? [Colors.LIGHT_GRAY, Colors.LIGHT_GRAY] : [Colors.LIGHT_BLUE, Colors.PURPLE]}
                style={styles.stepsGradient}
              />
              <LinearGradient
                start={[0, 0.5]}
                end={[1, 0.5]}
                colors={this.state.stepsLeft > 1 ? [Colors.LIGHT_GRAY, Colors.LIGHT_GRAY] : [Colors.LIGHT_BLUE, Colors.PURPLE]}
                style={styles.stepsGradient}
              />
              <LinearGradient
                start={[0, 0.5]}
                end={[1, 0.5]}
                colors={[Colors.LIGHT_GRAY, Colors.LIGHT_GRAY]}
                style={styles.stepsGradient}
              />
            </View>
          </View>
          <View style={styles.botSection}>
            <View style={styles.stepButton}>
              <Image
                style={styles.stepButtonIcon}
                source={require('../../assets/smile.png')}
                resizeMode="contain"
              />
              <Text style={styles.stepButtonText}>Personal details</Text>
              <Icon
                name="check"
                type="feather"
                size={25}
                color={Colors.PURPLE}
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.stepButton}>
              <Image
                style={styles.stepButtonIcon}
                source={require('../../assets/key.png')}
                resizeMode="contain"
              />
              <Text style={styles.stepButtonText}>Set a password</Text>
              <Icon
                name="check"
                type="feather"
                size={25}
                color={Colors.PURPLE}
              />
            </View>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.stepButton}
              disabled={!this.state.mustAgreeRegulatory}
              onPress={this.onPressRegulatoryAgreement}
            >
              <Image
                style={styles.stepButtonIcon}
                source={require('../../assets/arrow_up_circle.png')}
                resizeMode="contain"
              />
              <Text
                style={this.state.mustAgreeRegulatory ? [styles.stepButtonText, styles.stepButtonTextIncomplete] : styles.stepButtonText}
              >
                Regulatory agreement
              </Text>
              {this.state.mustAgreeRegulatory ? (
                <Icon
                  name="chevron-right"
                  type="evilicon"
                  size={40}
                  color={Colors.DARK_GRAY}
                />
              ) : (
                <Icon
                  name="check"
                  type="feather"
                  size={25}
                  color={Colors.PURPLE}
                />
              )}
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.stepButton}
              disabled={this.state.mustAgreeRegulatory || !this.state.mustAddCash}
              onPress={this.onPressAddCash}
            >
              <Image
                style={styles.stepButtonIcon}
                source={require('../../assets/arrow_up_circle.png')}
                resizeMode="contain"
              />
              <Text
                style={this.state.mustAddCash ? [styles.stepButtonText, styles.stepButtonTextIncomplete] : styles.stepButtonText}
              >
                Add cash
              </Text>
              {this.state.mustAddCash ? (
                <Icon
                  name="chevron-right"
                  type="evilicon"
                  size={40}
                  color={Colors.DARK_GRAY}
                />
              ) : (
                <Icon
                  name="check"
                  type="feather"
                  size={25}
                  color={Colors.PURPLE}
                />
              )}
            </TouchableOpacity>
            <View style={styles.separator} />
            <TouchableOpacity
              style={styles.stepButton}
              disabled={this.state.mustAgreeRegulatory || this.state.mustAddCash}
              onPress={this.onPressFinishSave}
            >
              <Image
                style={styles.stepButtonIcon}
                source={require('../../assets/arrow_up_circle.png')}
                resizeMode="contain"
              />
              <Text
                style={this.state.mustFinishTransfer ? [styles.stepButtonText, styles.stepButtonTextIncomplete] : styles.stepButtonText}
              >
                Finish transfer
              </Text>
              {this.state.mustFinishTransfer ? (
                <Icon
                  name="chevron-right"
                  type="evilicon"
                  size={40}
                  color={Colors.DARK_GRAY}
                />
              ) : (
                <Icon
                  name="check"
                  type="feather"
                  size={25}
                  color={Colors.PURPLE}
                />
              )}
            </TouchableOpacity>
            <View style={styles.separator} />
          </View>
          <View style={styles.footerBox}>
            <Text style={styles.footerDesc}>
              Were you expecting to see something different?
            </Text>
            <View style={styles.footerRow}>
              <Text style={styles.footerLink}>Logout</Text>
              <Text style={styles.footerDesc}>|</Text>
              <Text style={styles.footerLink}>Contact support</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImageWrapper: {
    marginTop: 20,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {},
  mainContent: {
    flex: 2,
    width: '90%',
  },
  topSection: {
    flex: 2,
  },
  midSection: {
    flex: 1,
    marginTop: 10,
  },
  botSection: {
    flex: 3,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 23,
    color: Colors.DARK_GRAY,
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 17,
    color: Colors.MEDIUM_GRAY,
  },
  stepsLeftText: {
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.DARK_GRAY,
    marginBottom: 5,
  },
  stepsLeftContainer: {
    flexDirection: 'row',
  },
  stepsGradient: {
    flex: 1,
    height: 50,
    marginHorizontal: 1,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  stepButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  stepButtonText: {
    flex: 1,
    fontFamily: 'poppins-regular',
    fontSize: 18,
    color: Colors.PURPLE,
  },
  stepButtonTextIncomplete: {
    color: Colors.DARK_GRAY,
  },
  stepButtonIcon: {
    marginRight: 15,
  },
  separator: {
    height: 1,
    width: width * 0.9,
    backgroundColor: Colors.GRAY,
  },
  footerBox: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  footerDesc: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  footerLink: {
    fontFamily: 'poppins-regular',
    color: Colors.PURPLE,
    fontWeight: '600',
    fontSize: 12,
    marginHorizontal: 10,
  },
});
