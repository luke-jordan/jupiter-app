import React from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AsyncStorage,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';

import { NavigationUtil } from '../util/NavigationUtil';
import { Colors, FallbackSupportNumber } from '../util/Values';

import iconThx from '../../assets/thank_you.png';
import iconFailed from '../../assets/boost_failure.png';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class SupportRequestSent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showError: false,
    };
  }

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleHardwareBackPress
    );

    const isError = this.props.navigation.getParam('showError');
    if (typeof isError === 'boolean' && isError) {
      this.setState({
        showError: true,
      });
    }

    const screenToNavigatePostSubmit = this.props.navigation.getParam('screenToNavigatePostSubmit');
    if (screenToNavigatePostSubmit) {
      this.setState({ screenToNavigatePostSubmit });
    }

  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleHardwareBackPress = () => {
    this.backHandler.remove();
    this.onPressDone();
    return false;
  };

  onPressDone = async () => {
    if (this.state.screenToNavigatePostSubmit) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, this.state.screenToNavigatePostSubmit);
      return;
    }

    const info = await AsyncStorage.getItem('userInfo');
    const userInfo = typeof info === 'string' && info.length > 0 ? JSON.parse(info) : null;
    if (userInfo && userInfo.token && userInfo.token.length > 0) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home');
      return;
    }

    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Splash');
  };

  onPressEmail = () => {
    Linking.openURL('mailto:ineedhelp@jupitersave.com');
  };

  onPressWhatsApp = () => {
    const defaultText = 'Hello, I am stuck in the Jupiter App and the support screen failed';
    const whatsAppLink = `https://wa.me/${FallbackSupportNumber.link}?text=${encodeURIComponent(defaultText)}`;
    Linking.openURL(whatsAppLink).catch((err) => console.error('An error occurred: ', err));
  };

  onPressCall = () => {
    Linking.openURL(`tel:${FallbackSupportNumber.display}`);
  }

  renderSuccess() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={this.onPressDone}>
          <Icon
            name="close"
            type="evilicon"
            size={30}
            color={Colors.MEDIUM_GRAY}
          />
        </TouchableOpacity>
        <View style={styles.mainContent}>
          <View style={styles.top}>
            <Image style={styles.image} source={iconThx} resizeMode="contain" />
            <Text style={styles.title}>Report sent successfully</Text>
            <Text style={styles.description}>
              Your request has been submitted and someone will be in touch soon.
            </Text>
            <Text style={styles.description}>
              If you don&apos;t hear back, you can also email{' '}
              <Text style={styles.textLink} onPress={this.onPressEmail}>
                ineedhelp@jupitersave.com
              </Text>
            </Text>
          </View>
        </View>
        <Button
          title="DONE"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressDone}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
      </View>
    );
  }

  renderError() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={this.onPressDone}>
          <Icon
            name="close"
            type="evilicon"
            size={30}
            color={Colors.MEDIUM_GRAY}
          />
        </TouchableOpacity>
        <View style={styles.mainContent}>
          <View style={styles.top}>
            <Image style={styles.image} source={iconFailed} resizeMode="contain" />
            <Text style={styles.title}>Sorry!</Text>
            <Text style={styles.description}>
              Something went wrong submitting your support request. We know this is frustrating so here is how you can 
              contact us directly:
            </Text>
            <Text style={styles.description}>
              Email: {' '}
              <Text style={styles.textLink} onPress={this.onPressEmail}>
                ineedhelp@jupitersave.com
              </Text>
            </Text>
            <Text style={styles.description}>
              WhatsApp: {' '}
              <Text style={styles.textLink} onPress={this.onPressWhatsApp}>
                Start a WhatsApp chat with us
              </Text>
            </Text>
            <Text style={styles.description}>
              Phone: {' '}
              <Text style={styles.textLink} onPress={this.onPressCall}>
                {FallbackSupportNumber.display}
              </Text>
            </Text>
          </View>
        </View>
        <Button
          title="DONE"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressDone}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />
      </View>
    )
  }

  render() {
    if (this.state.showError) {
      return this.renderError();
    } else {
      return this.renderSuccess();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  top: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 50,
    marginBottom: 70,
    width: '90%',
  },
  image: {
    marginBottom: 15,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 6.8 * FONT_UNIT,
    lineHeight: 9.3 * FONT_UNIT,
    marginVertical: 5,
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 3.7 * FONT_UNIT,
    marginVertical: 10,
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
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
  textLink: {
    textDecorationLine: 'underline',
  },
});
