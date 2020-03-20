import React from 'react';
import {
  Animated,
  ActivityIndicator,
  Clipboard,
  Easing,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  View,
  ScrollView,
  Dimensions,
  Share,
  AsyncStorage,
} from 'react-native';
import { Overlay } from 'react-native-elements';
import Toast from 'react-native-easy-toast';

import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { Endpoints, Colors, FallbackSupportNumber, FallbackBankDetails } from '../util/Values';
import { getDivisor } from '../util/AmountUtil';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const HOURGLASS_ROTATION_DURATION = 10000;

export default class PendingManualTransfer extends React.Component {
  
  constructor(props) {
    super(props);
    this.toastRef = React.createRef();
    this.state = {
      amountToAdd: this.props.navigation.getParam('amountToAdd') || '',
      isOnboarding: this.props.navigation.getParam('isOnboarding'),
      token: this.props.navigation.getParam('token'),
      loading: false,
      checkingForPayment: false,
      stillPendingModal: false,
      rotation: new Animated.Value(0),
      bankDetails: FallbackBankDetails,
    };
  }

  async componentDidMount() {
    this.rotateHourglass();
    LoggingUtil.logEvent('USER_ENTERED_PENDING_TRANSFER_MANUAL');
    const { params } = this.props.navigation.state;
    // console.log('Started manual transaction screen, have: ', params);

    if (!params.transactionId) {
      await this.getLikelyTransaction();
    } else if (!params.bankDetails || !params.humanReference) {
      await this.getTransactionDetails(params.transactionId);
    } else {
      this.setState({ bankDetails: params.bankDetails, humanReference: params.humanReference, transactionId: params.transactionId });
    }
  }

  async getTransactionDetails(transactionId) {
    this.setState({ transactionId }, async () => {
      try {
        // should probably be a GET but would cause complications on api gateway that are not worth it at present
        const transactionDetailsRaw = await fetch(`${Endpoints.CORE}pending/describe`, {
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
        body: JSON.stringify({ transactionId }),
      });

      if (!transactionDetailsRaw.ok) {
        throw transactionDetailsRaw;
      }

      const transactionDetails = await transactionDetailsRaw.json();
      const { bankDetails, humanReference, amount, unit } = transactionDetails;
      this.setState({ 
        bankDetails: bankDetails || FallbackBankDetails,
        humanReference,
        amountToAdd: amount / getDivisor(unit),
      });
      } catch (err) {
        console.log('Error getting details for transaction: ', JSON.stringify(err));
      }
    });
  }

  async getFullProfileAndDirect() {
    try {
      const fullProfileRaw = await fetch(`${Endpoints.AUTH}profile/fetch`, {
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'GET',
      });

      // option is to logout, but that might risk a doom loop, so for the moment, leave as is
      if (!fullProfileRaw.ok) {
        throw fullProfileRaw;
      }

      const resultJson = await fullProfileRaw.json();
      await AsyncStorage.setItem('userInfo', JSON.stringify(resultJson));
      const { screen, params } = NavigationUtil.directBasedOnProfile(resultJson);
      this.setState({ checkingForPayment: false });
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, screen, params);

    } catch (err) {
      console.log('Error fetching profile: ', JSON.stringify(err));
      this.setState({ checkingForPayment: false });
    }
  }

  async getLikelyTransaction() {
    // this can take a while, especially if lambdas not warm, so show the thing
    try {
      this.setState({ checkingForPayment: true });
      // as elsewhere, this should really be a GET, but would require more hassle on API GW than it's worth, at present
      const pendingTransactionsRaw = await fetch(`${Endpoints.CORE}pending/list`, {
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
      });

      if (!pendingTransactionsRaw.ok) {
        throw pendingTransactionsRaw;
      }

      const { pending } = await pendingTransactionsRaw.json();
      if (pending.length > 0) {
        await this.getTransactionDetails(pending[0].transactionId);
      } else {
        // most likely, transaction has been marked complete, so user can go to home
        await this.getFullProfileAndDirect();
      }
      this.setState({ checkingForPayment: false });
    } catch (err) {
      console.log('Error listing pending transactions: ', JSON.stringify(err));
      this.setState({ checkingForPayment: false });
    }
  }

  constructBankDetailsReadable = () => {
    const { bankDetails } = this.state;
    return `Jupiter Payment Details:\n\n` +
      `Bank: ${bankDetails.bankName}\n` +
      `Beneficiary Name: ${bankDetails.beneficiaryName}\n` +
      `Account Type: ${bankDetails.accountType}\n` +
      `Account Number: ${bankDetails.accountNumber}\n` + 
      `Branch code: ${bankDetails.routingNumber}\n` +
      `Reference: ${this.state.humanReference}`;
  }

  onPressCopy = () => {
    console.log('*** COPIED');
    Clipboard.setString(this.constructBankDetailsReadable());
    this.toastRef.current.show('Copied to clipboard!');
  };

  onPressShare = async () => {
    try {
      const result = await Share.share({
        message: this.constructBankDetailsReadable(),
      });
      console.log(result);
    } catch (error) {
      console.log(error);
      // handle somehow?
    }
  };

  onPressSendPOP = () => {
    const defaultText = `Hi! I made a payment already for ${this.state.humanReference} - here is my proof of payment: `;
    const whatsAppLink = `https://wa.me/${FallbackSupportNumber.link}?text=${encodeURIComponent(defaultText)}`;
    Linking.openURL(whatsAppLink);
  };

  onPressContactSupport = () => {
    const preFilledSupportMessage = `Please check transaction ${this.state.humanReference} again as soon as possible. ` +
      `It is still marked as pending.`;
      const params = { preFilledSupportMessage, originScreen: 'PendingManualTransfer' };
      this.props.navigation.navigate('Support', params);
  };

  navigateToDone = async (resultJson) => {
    console.log('Navigating to done, result JSON: ', resultJson);
    const { transactionAmount } = resultJson;
    const amountAdded = transactionAmount ? transactionAmount.amount / getDivisor(transactionAmount.unit) : '';
    console.log('Extracted amount added: ', amountAdded);
    NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'PaymentComplete', {
        transactionId: this.state.transactionId,
        token: this.state.token,
        isOnboarding: this.state.isOnboarding,
        newBalance: resultJson.newBalance,
        amountAdded,
      }
    );
  };

  onPressCheckAgain = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true, checkingForPayment: true });

    try {
      const result = await fetch(`${Endpoints.CORE}pending/check`, {
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
        body: JSON.stringify({ transactionId: this.state.transactionId }),
      });

      if (!result.ok) {
        throw result;
      }

      const resultJson = await result.json();
      const { result: checkResult } = resultJson;

      switch (checkResult) {
        case 'ADMIN_MARKED_PAID':
        case 'PAYMENT_SUCCEEDED':
          this.setState({ checkingForPayment: false });
          this.navigateToDone(resultJson);
          return;
        default:
          this.setState({
            loading: false,
            checkingForPayment: false,
            stillPendingModal: true,
          })
      }

    } catch (err) {
      console.log('Error checking again: ', JSON.stringify(err));
      this.setState({ loading: false, checkingForPayment: false });
    }
  };

  onCloseStillPendingModal = () => {
    this.setState({ stillPendingModal: false });
  };

  onPressInstant = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    try {
      LoggingUtil.logEvent('USER_SWITCHED_TRANSFER_TO_INSTANT');

      const result = await fetch(`${Endpoints.CORE}pending/update`, {
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
        body: JSON.stringify({ transactionId: this.state.transactionId, paymentMethod: 'OZOW' }),
      });

      if (!result.ok) {
        throw result;
      }

      const resultJson = await result.json();
      if (resultJson.paymentRedirectDetails) {
        this.setState({ loading: false });
        this.props.navigation.navigate('Payment', {
          urlToCompletePayment: resultJson.paymentRedirectDetails.urlToCompletePayment,
          transactionId: this.state.transactionId,
          humanReference: resultJson.humanReference,
          amountToAdd: resultJson.amount,
          token: this.state.token,
          isOnboarding: this.state.isOnboarding,
        });  
      } else {
        throw resultJson;
      }
    } catch (err) {
      console.log('Error switching!: ', JSON.stringify(err));
      this.setState({ loading: false });
    }
  };

  onPressLogout = () => {
    NavigationUtil.logout(this.props.navigation);
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  async rotateHourglass() {
    const rotationDuration = HOURGLASS_ROTATION_DURATION;
    Animated.timing(this.state.rotation, {
      toValue: 1,
      duration: rotationDuration,
      easing: Easing.linear,
    }).start(() => {
      this.setState({
        rotation: new Animated.Value(0),
      });
      this.rotateHourglass();
    });
  }

  render() {
    const hourglassRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mainContent}>
          <View style={styles.section}>
            <ImageBackground
              style={styles.hourglassBackground}
              source={require('../../assets/hourglass_path.png')}
            >
              <Animated.Image
                style={[
                  styles.hourglass,
                  { transform: [{ rotate: hourglassRotation }] },
                ]}
                source={require('../../assets/hourglass.png')}
              />
            </ImageBackground>
            <Text style={styles.title}>Processing save</Text>
            {this.state.isOnboarding && (
              <Text style={styles.description}>
                We are awaiting your transfer by EFT. As soon as we receive the funds your balance will
                be updated.
              </Text>
            )}
            {!this.state.isOnboarding && (
              <Text style={styles.description}>
                We are awaiting your transfer by EFT. As soon as we receive the funds or you send us 
                proof of payment, your account will be complete.
              </Text>
            )}
          </View>
          <View style={styles.graySection}>
            <Text style={styles.bottomTitle}>
              EFT BANKING DETAILS
              (<Text onPress={this.onPressCopy} style={styles.titleLink}>copy</Text>)
            </Text>
            <View style={styles.separator} />
            <Text style={styles.bottomText}>
              Amount: <Text style={styles.bottomBold}>R{this.state.amountToAdd}</Text>
            </Text>
            <Text style={styles.bottomText}>
              Bank: <Text style={styles.bottomBold}>{this.state.bankDetails.bankName}</Text>
            </Text>
            <Text style={styles.bottomText}>
              Benificiary Name:{' '}
              <Text style={styles.bottomBold}>
                {this.state.bankDetails.beneficiaryName}
              </Text>
            </Text>
            <Text style={styles.bottomText}>
              Account Type: {this.state.bankDetails.accountType}
            </Text>
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>
                Account Number:{' '}
                <Text style={styles.bottomBold}>
                  {this.state.bankDetails.accountNumber}
                </Text>
              </Text>
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>
                Branch code:{' '}
                <Text style={styles.bottomBold}>
                  {this.state.bankDetails.routingNumber}
                </Text>
              </Text>
            </View>
            <View style={styles.separator} />
            <Text style={styles.bottomText}>
              User reference: <Text style={styles.bottomBold}>{this.state.humanReference}</Text>
            </Text>
            <TouchableOpacity
              style={styles.bottomInsideAreaButton}
              onPress={this.onPressShare}
            >
              <Image
                style={styles.shareIcon}
                source={require('../../assets/share.png')}
                resizeMode="contain"
              />
              <Text style={styles.shareText}>Share Payment Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomInsideAreaButton}
              onPress={this.onPressSendPOP}
            >
              <Image
                style={styles.shareIcon}
                source={require('../../assets/share.png')}
                resizeMode="contain"
              />
              <Text style={styles.shareText}>WhatsApp proof of payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomInsideAreaButton}
              onPress={this.onPressContactSupport}
            >
              <Image
                style={styles.shareIcon}
                source={require('../../assets/message-circle.png')}
                resizeMode="contain"
              />
              <Text style={styles.shareText}>Contact support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bottomInsideAreaButton}
              onPress={this.onPressCheckAgain}
            >
              <Image
                style={styles.shareIcon}
                source={require('../../assets/message-circle.png')}
                resizeMode="contain"
              />
              <Text style={styles.shareText}>Check again</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.footerText}>
            Don&apos;t want to wait to see your savings grow? Add some more
          </Text>
          <TouchableOpacity
            onPress={this.onPressInstant}
            style={styles.footerButton}
          >
            <Text style={styles.footerButtonText}>
              PAY VIA INSTANT EFT
            </Text>
          </TouchableOpacity>

          <Text style={styles.logoutText}>
            Stuck? Try <Text style={styles.logoutTextLink} onPress={this.onPressLogout}>logout</Text>
            {!this.state.isOnboarding && (
              <Text>{' '} or <Text style={styles.logoutTextLink} onPress={this.onPressBack}>go back</Text></Text>
            )}
          </Text>
        </View>

        <Overlay
          isVisible={this.state.checkingForPayment}
          dialogStyle={styles.dialogStyle}
          height="auto"
          width="auto"
          onBackdropPress={() => {}}
          onHardwareBackPress={() => {
            this.setState({ checkingForPayment: false });
            return true;
          }}
        >
          <View style={styles.dialogWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
            <Text style={styles.dialogText}>
              Checking if your payment is complete...
            </Text>
          </View>
        </Overlay>

        <Overlay
          isVisible={this.state.stillPendingModal}
          dialogStyle={styles.dialogStyle}
          height="auto"
          width="auto"
          onBackdropPress={this.onCloseStillPendingModal}
          onHardwareBackPress={this.onCloseStillPendingModal}
        >
          <View style={styles.dialogWrapper}>
            <Text style={styles.dialogText}>
              Sorry, the save is still pending; please contact support
              or WhatsApp us the proof of payment
            </Text>
          </View>
        </Overlay>


        <Toast ref={this.toastRef} opacity={1} style={styles.toast} />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  section: {
    width: '100%',
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hourglass: {
    marginTop: 10,
  },
  hourglassBackground: {
    width: 120,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 27,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'poppins-regular',
    fontSize: 15,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
    marginVertical: 10,
    marginHorizontal: 20,
  },
  bottomTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.5 * FONT_UNIT,
    color: Colors.DARK_GRAY,
  },
  titleLink: {
    textDecorationLine: 'underline',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.DARK_GRAY,
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
  bottomInsideAreaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  shareIcon: {
    width: 22,
    height: 22,
    marginRight: 10,
    tintColor: Colors.PURPLE,
  },
  shareText: {
    fontFamily: 'poppins-regular',
    color: Colors.PURPLE,
  },
  footerText: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
    marginTop: 20,
    maxWidth: '90%',
    textAlign: 'center',
  },
  footerButton: {
    width: 210,
    height: 35,
    borderRadius: 4,
    borderColor: Colors.PURPLE,
    borderWidth: 2, 
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  footerButtonText: {
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
    fontSize: 14,
    color: Colors.PURPLE,
  },
  toast: {
    backgroundColor: Colors.DARK_GRAY,
    width: '60%',
    alignItems: 'center',
  },
  dialogWrapper: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  dialogText: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    textAlign: 'center',
  },
  graySection: {
    backgroundColor: Colors.BACKGROUND_GRAY,
    alignSelf: 'stretch',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 10,
    padding: 20,
  },
  logoutText: {
    fontFamily: 'poppins-regular',
    textAlign: 'center',
    marginVertical: 10,
  },
  logoutTextLink: {
    color: Colors.PURPLE,
    textDecorationLine: 'underline',
  },
});
