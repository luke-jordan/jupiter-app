import React from 'react';
import * as Font from 'expo-font';
import { StyleSheet, View, Image, Text, AsyncStorage, Dimensions, Clipboard, TouchableOpacity } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';
import NavigationBar from '../elements/NavigationBar';
import { Input, Button } from 'react-native-elements';
import Toast, {DURATION} from 'react-native-easy-toast'

let {height, width} = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class Friends extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      shareCode: "jupiter2019!savings",
    };
  }

  async componentDidMount() {

  }

  onPressShare = () => {

  }

  onPressCopy = () => {
    Clipboard.setString(this.state.shareCode);
    this.refs.toast.show('Copied to clipboard!');
    //TODO show toast
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainContent}>
          <Image style={styles.image} source={require('../../assets/group_77.png')} resizeMode="contain"/>
          <Text style={styles.title}>Jupiter will be launching the ability to save with your friends soon</Text>
          <Text style={styles.description}><Text style={styles.bold}>While you wait - </Text>
            Invite your friends to Jupiter using the referral code below. We’ll add <Text style={styles.bold}>R20.00</Text> to your balance each time one of them signs up and starts saving!
          </Text>
        </View>
        <View style={styles.input}>
          <View style={styles.shareLine}>
            <Text style={styles.shareCode}>{this.state.shareCode}</Text>
            <TouchableOpacity onPress={this.onPressCopy}>
              <Image style={styles.copyIcon} source={require('../../assets/copy.png')} resizeMode="contain"/>
            </TouchableOpacity>
          </View>
          <Button
            title="SHARE WITH FRIENDS"
            loading={this.state.loading}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={this.onPressShare}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}/>
        </View>
        <NavigationBar navigation={this.props.navigation} currentTab={1} />
        <Toast ref="toast" opacity={1} style={styles.toast}/>
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
  toast: {
    backgroundColor: Colors.DARK_GRAY,
    width: '60%',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  input: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  image: {
    marginBottom: 35,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 6.8 * FONT_UNIT,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 3.7 * FONT_UNIT,
    marginBottom: 5,
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  shareLine: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.GRAY,
    marginBottom: 20,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 10,
  },
  shareCode: {
    flex: 1,
    marginLeft: 15,
    fontFamily: 'poppins-regular',
    color: Colors.PURPLE,
    fontSize: 16,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: 'white',
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: '90%',
  },
  buttonContainerStyle: {
    marginTop: 10,
    marginBottom: 15,
    justifyContent: 'center',
    width: '100%',
  },
  copyIcon: {
    marginRight: 15,
    width: 22,
    height: 22,
  },

});
