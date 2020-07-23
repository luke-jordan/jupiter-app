import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, Text, Dimensions, Linking } from 'react-native';
import { Button } from 'react-native-elements';

import { LoggingUtil } from '../util/LoggingUtil';
import { LogoutUtil } from '../util/LogoutUtil';
import { Colors, FallbackSupportNumber } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class FailedVerification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_FAILED_VERIFICATION');
  }

  onPressLogout = () => {
    LogoutUtil.logout(this.props.navigation);
  };

  onPressContactUs = () => {
    this.props.navigation.navigate('Support', { originScreen: 'FailedVerification' });
  };

  onPressEdit = () => {
    this.props.navigation.navigate('Profile', { failedVerification: true });
  };

  onPressMinorSupport = () => {
    const defaultText = 'Hi! I had a problem on the app with my ID details, I am under 18 and I would like to join Jupiter';
    const whatsAppLink = `https://wa.me/${FallbackSupportNumber.link}?text=${encodeURIComponent(defaultText)}`;
    Linking.openURL(whatsAppLink).catch((err) => {
      LoggingUtil.logError(err);
      this.onPressContactUs();
    });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.top}>
            <LinearGradient
              start={[0, 0.5]}
              end={[1, 0.5]}
              colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
              style={styles.gradientStyle}
            >
              <Text style={styles.exclamation}>!</Text>
            </LinearGradient>
            <Text style={styles.title}>Please check your details</Text>
            <Text style={styles.description}>
              The ID number you provided did not match your name.
            </Text>
            <Text style={styles.descriptionBold}>
              Please double check both the ID number and spelling of your name
              and retry.
            </Text>
            <Text style={styles.description}>
              Note: If you are under 18, <Text style={styles.descriptionLink} onPress={this.onPressMinorSupport}>contact Jupiter Support</Text> to find out how you can join us
            </Text>
          </View>
          <Button
            title="EDIT DETAILS"
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={() => this.onPressEdit()}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
        </View>
        <View style={styles.bottomView}>
          <Text style={styles.bottomText}>Still having problems?</Text>
          <View style={styles.footerInner}>
            <Text style={styles.footerLink} onPress={this.onPressLogout}>
              Logout
            </Text>
            <Text style={{ color: Colors.PURPLE }}>|</Text>
            <Text style={styles.footerLink} onPress={this.onPressContactUs}>
              Support
            </Text>
          </View>
        </View>
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
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 6.8 * FONT_UNIT,
    lineHeight: 9.3 * FONT_UNIT,
    marginVertical: 5,
    marginHorizontal: 80,
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 3.7 * FONT_UNIT,
    marginVertical: 15,
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
    marginHorizontal: 25,
  },
  descriptionBold: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.7 * FONT_UNIT,
    marginVertical: 15,
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
    marginHorizontal: 25,
  },
  descriptionLink: {
    color: Colors.PURPLE,
  },
  gradientStyle: {
    width: 13 * FONT_UNIT,
    height: 13 * FONT_UNIT,
    borderRadius: 6.5 * FONT_UNIT,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  exclamation: {
    marginTop: 4,
    fontFamily: 'poppins-semibold',
    fontSize: 10 * FONT_UNIT,
    color: Colors.WHITE,
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
    alignSelf: 'center',
  },
  bottomView: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    width: '100%',
    alignItems: 'center',
    padding: 10,
  },
  bottomText: {
    fontFamily: 'poppins-regular',
    color: Colors.MEDIUM_GRAY,
  },
  footerInner: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerLink: {
    fontFamily: 'poppins-regular',
    color: Colors.PURPLE,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
});
