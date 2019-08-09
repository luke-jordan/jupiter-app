import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, TouchableOpacity, Clipboard } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import Toast, {DURATION} from 'react-native-easy-toast';

export default class Payment extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      paymentLink: "http://pay.ozow.com/p/27UEB49E758",
    };
  }

  async componentDidMount() {

  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressAlreadyPaid = () => {
    this.props.navigation.navigate('CheckingForPayment');
  }

  onPressCopy = () => {
    Clipboard.setString(this.state.paymentLink);
    this.refs.toast.show('Copied to clipboard!');
  }

  onPressPaymentLink = () => {
    //TODO
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={this.onPressBack} >
            <Icon
              name='chevron-left'
              type='evilicon'
              size={45}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.contentWrapper}>
          <Text style={styles.title}>Payment</Text>
          <View style={styles.mainContent}>
            <Text style={styles.secondaryTitle}>Pay with Ozow</Text>
            <Image style={styles.ozowLogo} source={require('../../assets/ozow_black.png')}/>
            <Text style={styles.description}>We use <Text style={styles.bold}>Ozow</Text>, South Africa’s premium payment solution, to process all instant EFT payments and transfer cash directly to your Jupiter account. </Text>
            <Text style={styles.buttonDescription}>Tap the link to pay with Ozow:</Text>
            <LinearGradient start={[0, 0.5]} end={[1, 0.5]} colors={[Colors.LIGHT_BLUE, Colors.PURPLE]} style={[styles.buttonStyle]}>
              <Text style={styles.paymentLink} onPress={this.onPressPaymentLink}>{this.state.paymentLink}</Text>
              <TouchableOpacity onPress={this.onPressCopy}>
                <Image style={styles.copyIcon} source={require('../../assets/copy.png')} resizeMode="contain"/>
              </TouchableOpacity>
            </LinearGradient>
            <TouchableOpacity style={styles.alreadyPaidButton} onPress={this.onPressAlreadyPaid}>
              <Text style={styles.alreadyPaidButtonText}>I'VE ALREADY PAID</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.footer, styles.boxShadow]}>
          <Text style={styles.footerTitle}>THE EASIEST WAY TO PAY:</Text>
          <Image style={styles.shield} source={require('../../assets/shield.png')}/>
          <View style={styles.footerItem}>
            <Icon
              name='check'
              type='feather'
              size={19}
              color={Colors.PURPLE}
            />
            <Text style={styles.footerItemText}>No registration or app download required</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon
              name='check'
              type='feather'
              size={19}
              color={Colors.PURPLE}
            />
            <Text style={styles.footerItemText}>Payments completed in seconds</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon
              name='check'
              type='feather'
              size={19}
              color={Colors.PURPLE}
            />
            <Text style={styles.footerItemText}>No proof of payment necessary</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon
              name='check'
              type='feather'
              size={19}
              color={Colors.PURPLE}
            />
            <Text style={styles.footerItemText}><Text style={styles.bold}>No</Text> banking login details stored</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon
              name='check'
              type='feather'
              size={19}
              color={Colors.PURPLE}
            />
            <Text style={styles.footerItemText}>Safe and secure</Text>
          </View>
        </View>
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
  header: {
    width: '100%',
    height: 50,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 22,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    width: '100%',
    paddingLeft: 15,
  },
  mainContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-around',
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignItems: 'center',
  },
  buttonStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '90%',
    borderRadius: 10,
    minHeight: 65,
    minWidth: 220,
  },
  secondaryTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 20,
    color: Colors.DARK_GRAY,
  },
  ozowLogo: {

  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  buttonDescription: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
  },
  paymentLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
  },
  alreadyPaidButton: {
    borderWidth: 2,
    borderColor: Colors.PURPLE,
    borderRadius: 4,
    marginBottom: 10,
  },
  alreadyPaidButtonText: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.PURPLE,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    padding: 15,
  },
  footerTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 14,
    color: Colors.PURPLE,
    marginBottom: 2,
  },
  shield: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  footerItem: {
    flexDirection: 'row',
    marginVertical: 2,
    alignItems: 'center',
  },
  footerItemText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    marginBottom: 2,
    marginLeft: 5,
  },
  boxShadow: {
    shadowColor: 'red',
    shadowOffset: { width: 0, height: 1000 },
    shadowOpacity: 0.1,
    shadowRadius: 500,
    elevation: 20,
  },
  copyIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
});
