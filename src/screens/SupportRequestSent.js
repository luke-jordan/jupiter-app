import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, Dimensions, BackHandler, Linking } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { MessagingUtil } from '../util/MessagingUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon } from 'react-native-elements';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class SupportRequestSent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleHardwareBackPress);
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleHardwareBackPress = () => {
    this.backHandler.remove();
    this.onPressDone();
    return false;
  }

  onPressDone = (attempts) => {
    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Splash');
  }

  onPressEmail = () => {
    Linking.openURL('mailto:ineedhelp@jupitersave.com');
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={this.onPressDone}>
          <Icon
            name='close'
            type='evilicon'
            size={30}
            color={Colors.MEDIUM_GRAY}
          />
        </TouchableOpacity>
        <View style={styles.mainContent}>
          <View style={styles.top}>
            <Image style={styles.image} source={require('../../assets/thank_you.png')} resizeMode="contain"/>
            <Text style={styles.title}>Report sent successfully</Text>
            <Text style={styles.description}>Your request has been submitted and someone will be in touch soon.</Text>
            <Text style={styles.description}>If you don't hear back, you can also email <Text style={styles.textLink} onPress={this.onPressEmail}>ineedhelp@jupitersave.com</Text></Text>
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
          }} />
      </View>
    );
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
  box: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    borderRadius: 15,
    flexDirection: 'row',
    paddingHorizontal: 50,
    paddingVertical: 15,
    marginVertical: 20,
  },
  superscript: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    textAlignVertical: 'top',
    fontSize: 3.7 * FONT_UNIT,
    marginTop: 5,
  },
  amount: {
    fontFamily: 'poppins-semibold',
    fontSize: 7.4 * FONT_UNIT,
    color: Colors.PURPLE,
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
  bold: {
    fontFamily: 'poppins-semibold',
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
