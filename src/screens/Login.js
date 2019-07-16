import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, ImageBackground } from 'react-native';
import { Colors } from '../util/Values';
import { Input, Button } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';

export default class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {

  }

  onPressLogin = () => {
    this.props.navigation.navigate('OTPVerification');
  }

  onPressSignUp = () => {

  }

  onPressWhatIs = () => {

  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.headerImage} source={require('../../assets/group_16.png')}/>
        <View style={styles.mainContent}>
          <Text style={styles.labelStyle}>Enter your ID/Phone Number or Email Address*</Text>
          <Input
            value={this.state.userId}
            onChangeText={(text) => this.setState({userId: text})}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            containerStyle={styles.containerStyle}
          />
          <Text style={styles.labelStyle}>Password*</Text>
          <Input
            secureTextEntry={true}
            value={this.state.password}
            onChangeText={(text) => this.setState({password: text})}
            inputContainerStyle={styles.inputContainerStyle}
            inputStyle={styles.inputStyle}
            containerStyle={styles.containerStyle}
          />
        <Text style={styles.textAsButton}>
            Forgot Password?
          </Text>
        </View>
        <Button
          title="LOGIN"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressLogin}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }} />
        <View style={styles.signUpLink}>
          <Text style={styles.noAccText}>Don't have an account yet?
            <Text style={styles.noAccButton} onPress={this.onPressSignUp}> Sign up</Text>
          </Text>
        </View>
        <ImageBackground source={require('../../assets/wave_pattern.png')} style={styles.bottomView}>
          <Text style={styles.bottomText} onPress={this.onPressWhatIs}>WHAT IS JUPITER?</Text>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerImage: {
    marginVertical: 80,
  },
  mainContent: {
    flex: 2,
    width: '90%',
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    fontFamily: 'poppins-semibold',
  },
  labelStyle: {
    fontSize: 14,
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
    minWidth: 320,
  },
  buttonContainerStyle: {
    flex: 1,
    justifyContent: 'center',
    width: '80%',
  },
  textAsButton: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
  },
  signUpLink: {
    alignItems: 'center',
    flex: 1,
  },
  noAccText: {
    fontFamily: 'poppins-regular',
    fontSize: 16,
  },
  noAccButton: {
    color: Colors.PURPLE,
    fontWeight: 'bold',
  },
  bottomView: {
    width: '100%',
    height: 75,
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomText: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: 'white',
    marginTop: 15,
  },
});
