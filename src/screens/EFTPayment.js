import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, Dimensions } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class EFTPayment extends React.Component {

  constructor(props) {
    super(props);
    this.state = {

    };
  }

  async componentDidMount() {
    // LoggingUtil.logEvent('USER_ENTERED_....');
  }

  onPressDone = (attempts) => {
    if (!attempts) attempts = 0;
    this.setState({loading: true});
    if (this.state.fetchingProfile && attempts < 10) {
      setTimeout(() => {this.onPressDone(attempts + 1)}, 1000);
    } else {
      this.setState({loading: false});
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home', { userInfo: this.state.userInfo });
    }
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
            <Image style={styles.image} source={require('../../assets/card.png')} resizeMode="contain"/>
            <Text style={styles.title}>Pay via EFT</Text>
            <Text style={styles.description}>EFT’s take <Text style={styles.descriptionBold}>2-3 working days</Text> to reflect. As soon as we receive the funds your balance will be updated.</Text>
          </View>
          <View style={styles.reference}>
            <Text style={styles.referenceTitle}>USE THIS REFERENCE</Text>
            <Text style={styles.referenceText}>FILL THIS</Text>
            <TouchableOpacity style={styles.copyButton} onPress={this.onPressCopy}>
              <Image style={styles.copyIcon} source={require('../../assets/copy.png')} resizeMode="contain"/>
            </TouchableOpacity>
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
  },
  image: {
    marginBottom: 15,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 7.2 * FONT_UNIT,
    marginVertical: 5,
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 4 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
  },
  descriptionBold: {
    fontWeight: 'bold',
  },
  reference: {
    alignSelf: 'stretch',
    marginHorizontal: 15,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
  },
  referenceTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.5 * FONT_UNIT,
    marginBottom: 5,
    textAlign: 'center',
    color: Colors.DARK_GRAY,
  },
  referenceText: {
    fontFamily: 'poppins-regular',
    fontSize: 3.9 * FONT_UNIT,
    textAlign: 'center',
    color: Colors.PURPLE,
  },
  copyButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  copyIcon: {
    width: 22,
    height: 22,
    tintColor: Colors.PURPLE,
    alignSelf: 'flex-end',
  },
});
