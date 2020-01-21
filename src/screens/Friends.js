import React from 'react';
import {
  AsyncStorage,
  Dimensions,
  Clipboard,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-easy-toast';
import { Button } from 'react-native-elements';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Colors } from '../util/Values';
import NavigationBar from '../elements/NavigationBar';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

class Friends extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      shareCode: "",
      shareLink: "https://jupitersave.com/",
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_FRIENDS_SCREEN');
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
      this.setState({
        shareCode: info.profile.referralCode,
      });
    }

  }

  onPressShare = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});
    try {
      const result = await Share.share({
        message: `I’d love for you to join me as a friend on the Jupiter app. Jupiter makes saving at good rates, with no lock up, easy and enticing for everyone! As friends we can earn extra rewards and encourage each other to save more! Just use my referral code ${this.state.shareCode} to sign up. Download here: ${this.state.shareLink}`,
      });
      this.setState({loading: false});
      console.log('Result of share: ', result);
      LoggingUtil.logEvent("USER_SHARED_REFERRAL_CODE");
    } catch (error) {
      this.setState({loading: false});
      //handle somehow?
    }
  }

  onPressCopy = () => {
    Clipboard.setString(this.state.shareCode);
    this.refs.toast.show('Copied to clipboard!');
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
              <Image
                style={styles.copyIcon}
                source={require('../../assets/copy.png')}
                resizeMode="contain"
              />
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
        <NavigationBar
          navigation={this.props.navigation}
          currentTab={1}
        />
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
    height: '35%',
    marginTop: 10,
    marginBottom: 35,
  },
  title: {
    fontFamily: 'poppins-regular',
    fontSize: 5.4 * FONT_UNIT,
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 2.9 * FONT_UNIT,
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
    fontSize: 4.4 * FONT_UNIT,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 5 * FONT_UNIT,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: '90%',
  },
  buttonContainerStyle: {
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

export default Friends;
