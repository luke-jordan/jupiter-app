import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';

let {height, width} = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class ResetPassword extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      hasError: false,
      userInput: "",
    };
  }

  async componentDidMount() {

  }

  onPressReset = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    try {
      let result = await fetch(Endpoints.AUTH + 'otp/generate', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          "phoneOrEmail": this.state.userInput,
          "type": "RESET",
        }),
      });
      if (result.ok) {
        this.setState({loading: false});
        this.props.navigation.navigate('OTPVerification', {
          userId: this.state.userInput,
          redirection: 'Reset',
        });
      } else {
        let resultText = await result.text();
        console.log(resultText);
        throw result;
      }
    } catch (error) {
      // console.log("error!", error);
      this.showError();
    }
  }

  showError() {
    this.setState({
      loading: false,
      hasError: true,
    });
  }

  render() {
    return (
      <View style={styles.container} contentContainerStyle={styles.container} behavior="position" keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}>
        <Image style={styles.image} source={require('../../assets/lock.png')} resizeMode="contain"/>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>We’ll send you a code to reset your password.</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.labelStyle}>Enter your phone number or email address*</Text>
          <Input
            value={this.state.userInput}
            onChangeText={(text) => this.setState({userInput: text, hasError: false})}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={[styles.inputStyle, this.state.hasError ? styles.redText : null]}
            containerStyle={styles.containerStyle}
          />
          {
            this.state.hasError ?
            <Text style={styles.errorMessage}>Please enter a valid phone number or email address</Text>
            : null
          }
        </View>
        <Button
          title={"RESET PASSWORD"}
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressReset}
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
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  image: {
    height: '15%',
    marginVertical: 30,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 7.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.DARK_GRAY,
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 3.8 * FONT_UNIT,
    marginBottom: 10,
    textAlign: 'left',
    width: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  labelStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.2 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'left',
    width: '100%',
    color: Colors.MEDIUM_GRAY,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
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
    marginVertical: 10,
    justifyContent: 'center',
    width: '100%',
  },
  redText: {
    color: Colors.RED,
  },
  errorMessage: {
    fontFamily: 'poppins-regular',
    color: Colors.RED,
    fontSize: 12,
    marginTop: -15, //this is valid because of the exact alignment of other elements - do not reuse in other components
    marginBottom: 20,
  },
});
