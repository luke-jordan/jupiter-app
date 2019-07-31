import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Colors, Endpoints } from '../util/Values';

let {height, width} = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class LimitedUsers extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      notifyMode: false,
    };
  }

  async componentDidMount() {

  }

  onPressNotifyMe = () => {
    this.setState({
      notifyMode: !this.state.notifyMode,
    });
  }

  onPressLogin = () => {
    this.props.navigation.navigate('Login');
  }

  onPressContinue = () => {
    if (this.state.notifyMode) {
      //TODO send request to subscribe
      this.props.navigation.navigate('ThankYou');
    } else {
      //TODO send request to check for correctness
      // this.props.navigation.navigate('CreateAccount');
      this.props.navigation.navigate('ThankYou');
    }
  }

  render() {
    return (
      <KeyboardAvoidingView style={styles.container} contentContainerStyle={styles.container} behavior="position" keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        <View style={styles.wrapper}>
          <Image style={styles.image} source={require('../../assets/group_10.png')} resizeMode="contain"/>
          <Text style={styles.title}>Jupiter is giving early access to limited users.</Text>
          <Text style={styles.description}><Text style={styles.bold}>{this.state.notifyMode ? "Don’t have a referral code?" : "Found a referral code? "}</Text>{this.state.notifyMode ? "\nBe one of the first to know when access is open! " : ""}
            <Text style={styles.textAsButton} onPress={this.onPressNotifyMe}>{this.state.notifyMode ? "Notify me" : "Press here to enter it"}</Text>
          </Text>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.labelStyle}>{this.state.notifyMode ? "Enter your email address to be notified*" : "Enter your referral code*"}</Text>
          <Input
            value={this.state.email}
            onChangeText={(text) => this.setState({email: text})}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            containerStyle={styles.containerStyle}
          />
        </View>
        <View style={styles.nextButtonWrapper}>
          <Button
            title={this.state.notifyMode ? "NOTIFY ME" : "CONTINUE"}
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressContinue}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }} />
        </View>
        <Text style={styles.haveAnAccountText}>Already have an account?<Text style={styles.textAsButton} onPress={this.onPressLogin}> Log in</Text></Text>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 5,
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 15,
  },
  image: {
    height: '30%',
    marginBottom: 30,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 7.2 * FONT_UNIT,
    lineHeight: 10 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
  },
  description: {
    marginTop: 10,
    marginHorizontal: 12 * FONT_UNIT,
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
    textAlign: 'center',
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  textAsButton: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
  },
  labelStyle: {
    fontSize: 12,
    fontFamily: 'poppins-semibold',
    marginVertical: 5,
  },
  containerStyle: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: '80%',
  },
  nextButtonWrapper: {
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  haveAnAccountText: {
    marginTop: 10,
    marginHorizontal: 12 * FONT_UNIT,
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
    textAlign: 'center',
    marginBottom: 15,
  },
});
