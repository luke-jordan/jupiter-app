import React from 'react';
import {
  Clipboard,
  Dimensions,
  Image,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import Toast from 'react-native-easy-toast';

import { LoggingUtil } from '../util/LoggingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { Colors } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class EFTPayment extends React.Component {
  constructor(props) {
    super(props);
    this.toastRef = React.createRef();
    const humanReference = this.props.navigation.getParam('humanReference');
    this.state = {
      bank: '',
      beneficiaryName: '',
      accountNumber: '',
      branchCode: '',
      accountType: '',
      humanReference,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_EFT_DETAILS');
    const bankDetails = this.props.navigation.getParam('bankDetails') || {};
    // our default used in case the backend doesn't supply details
    this.setState({
      bank: bankDetails.bankName || 'FNB',
      beneficiaryName: bankDetails.beneficiaryName || 'Jupiter Savings App',
      accountNumber: bankDetails.accountNumber || '62828393728',
      accountType: bankDetails.accountType || 'Cheque',
      routingNumber: bankDetails.routingNumber || '250655',
    });
  }

  onPressCopy = text => {
    Clipboard.setString(text);
    this.toastRef.current.show('Copied to clipboard!');
  };

  onPressShare = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });
    try {
      const result = await Share.share({
        message: `Jupiter Payment Details: Bank: ${this.state.bank}; Beneficiary Name: ${this.state.beneficiaryName}; Account Type: Current/Cheque; Account Number: ${this.state.accountNumber}; Branch code: ${this.state.branchCode}`,
      });
      console.log(result);
    } catch (error) {
      console.log(error);
      // handle somehow?
    }
    this.setState({ loading: false });
  };

  onPressDone = () => {
    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home', {
      userInfo: this.state.userInfo,
    });
  };

  render() {
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
            <Image
              style={styles.image}
              source={require('../../assets/card.png')}
              resizeMode="contain"
            />
            <Text style={styles.title}>Pay via EFT</Text>
            <Text style={styles.description}>
              EFT’s take{' '}
              <Text style={styles.descriptionBold}>2-3 working days</Text> to
              reflect. As soon as we receive the funds your balance will be
              updated.
            </Text>
          </View>
          <View style={styles.reference}>
            <Text style={styles.referenceTitle}>USE THIS REFERENCE</Text>
            <Text style={styles.referenceText}>
              {this.state.humanReference}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => this.onPressCopy(this.state.humanReference)}
            >
              <Image
                style={styles.copyIcon}
                source={require('../../assets/copy.png')}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.bottomBox}>
            <Text style={styles.bottomTitle}>PLEASE MAKE PAYMENT TO:</Text>
            <View style={styles.separator} />
            <Text style={styles.bottomText}>
              Bank: <Text style={styles.bottomBold}>{this.state.bank}</Text>
            </Text>
            <Text style={styles.bottomText}>
              Benificiary Name:{' '}
              <Text style={styles.bottomBold}>
                {this.state.beneficiaryName}
              </Text>
            </Text>
            <Text style={styles.bottomText}>
              Account Type: {this.state.accountType}
            </Text>
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>
                Account Number:{' '}
                <Text style={styles.bottomBold}>
                  {this.state.accountNumber}
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => this.onPressCopy(this.state.accountNumber)}
              >
                <Image
                  style={styles.copyIcon}
                  source={require('../../assets/copy.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>
                Branch code:{' '}
                <Text style={styles.bottomBold}>
                  {this.state.routingNumber}
                </Text>
              </Text>
              <TouchableOpacity
                onPress={() => this.onPressCopy(this.state.routingNumber)}
              >
                <Image
                  style={styles.copyIcon}
                  source={require('../../assets/copy.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={this.onPressShare}
            >
              <Image
                style={styles.shareIcon}
                source={require('../../assets/share.png')}
                resizeMode="contain"
              />
              <Text style={styles.shareText}>Share Payment Details</Text>
            </TouchableOpacity>
          </View>
          <Button
            title="DONE"
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

        <Toast ref={this.toastRef} opacity={1} style={styles.toast} />
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
    justifyContent: 'space-around',
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
    marginTop: 30,
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
  bottomBox: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignSelf: 'stretch',
    marginHorizontal: 15,
    borderRadius: 10,
    padding: 20,
  },
  bottomTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.5 * FONT_UNIT,
    color: Colors.DARK_GRAY,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.GRAY,
    marginVertical: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomText: {
    fontFamily: 'poppins-regular',
    width: '90%',
    color: Colors.MEDIUM_GRAY,
    marginVertical: 7,
  },
  bottomBold: {
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },
  shareIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: Colors.PURPLE,
  },
  shareText: {
    fontFamily: 'poppins-regular',
    textDecorationLine: 'underline',
    color: Colors.PURPLE,
  },
  toast: {
    backgroundColor: Colors.DARK_GRAY,
    width: '60%',
    alignItems: 'center',
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    alignSelf: 'stretch',
    paddingHorizontal: 15,
  },
});
