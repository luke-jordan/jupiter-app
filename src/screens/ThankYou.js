import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Icon } from 'react-native-elements';

import iconCheck from '../../assets/check.png';
import { LoggingUtil } from '../util/LoggingUtil';
import { Colors } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class ThankYou extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_FINISHED_ADDING_NAME_LIST');
  }

  onPressIntro = () => {
    this.props.navigation.navigate('Onboarding');
  };

  onPressWebsite = () => {
    Linking.openURL('https://jupitersave.com');
  };

  onPressClose = () => {
    this.props.navigation.navigate('Onboarding');
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={this.onPressClose}
        >
          <Icon
            name="close"
            type="evilicon"
            size={35}
            color={Colors.DARK_GRAY}
          />
        </TouchableOpacity>
        <View style={styles.top}>
          <Image style={styles.image} source={iconCheck} resizeMode="contain" />
          <Text style={styles.title}>
            Thank you for your interest in Jupiter!
          </Text>
          <Text style={styles.description}>
            You’ll receive an email as soon as we’ve launched access to
            everyone.
          </Text>
        </View>
        <View style={styles.bottom}>
          <Text style={styles.textAsButton} onPress={this.onPressIntro}>
            View intro again
          </Text>
          <Text style={styles.textAsButton} onPress={this.onPressWebsite}>
            Learn more on our website
          </Text>
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
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  top: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 50,
    marginBottom: 50,
  },
  bottom: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    marginBottom: 15,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 6.8 * FONT_UNIT,
    lineHeight: 9.3 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 4.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
  },
  textAsButton: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    textDecorationLine: 'underline',
    fontSize: 3.7 * FONT_UNIT,
    marginBottom: 10,
  },
});
