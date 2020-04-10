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
  ScrollView,
  Linking,
} from 'react-native';
import { Button, Icon, Overlay } from 'react-native-elements';
import Toast from 'react-native-easy-toast';

import { LoggingUtil } from '../util/LoggingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { Colors, Endpoints, FallbackSupportNumber, FallbackBankDetails } from '../util/Values';

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

export default class EFTPayment extends React.Component {
  constructor(props) {
    super(props);
    this.toastRef = React.createRef();
    this.state = {
      isOnboarding: true,
      numberDoneChecks: 0,
      showDoneModal: false,
      showStilPendingModal: false,
      loading: false,
      loadingInstant: false,
      token: this.props.navigation.getParam('token'),
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_ENTERED_EFT_DETAILS');
    const { params } = this.props.navigation.state;
    const { token, humanReference, amountToAdd, transactionId } = params;
    const bankDetails = params.bankDetails || FallbackBankDetails;
    // our default used in case the backend doesn't supply details
    this.setState({
      token,
      humanReference,
      amountToAdd,
      transactionId,
      isOnboarding: params.isOnboarding || false,
      bankName: bankDetails.bankName || 'FNB',
      beneficiaryName: bankDetails.beneficiaryName || 'Jupiter Stokvel',
      accountNumber: bankDetails.accountNumber || '62828393728',
      accountType: bankDetails.accountType || 'Cheque',
      routingNumber: bankDetails.routingNumber || '250655',
    });
  }

  onPressBack = () => {
    LoggingUtil.logEvent('USER_WENT_BACK_AT_PAYMENT_LINK');
    this.props.navigation.goBack();
  };

  onPressCopy = text => {
    Clipboard.setString(text);
    this.toastRef.current.show('Copied to clipboard!');
  };

  onPressShare = async () => {
    try {
      await Share.share({
        message: `Jupiter Payment Details: Bank: ${this.state.bankName}; Beneficiary Name: ${this.state.beneficiaryName}; Account Type: Current/Cheque; Account Number: ${this.state.accountNumber}; Branch code: ${this.state.branchCode}`,
      });
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

  onCheckDone = async () => {
    this.setState({ loading: true });
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
      // console.log('Received response: ', resultJson);
      if (resultJson.error) {
        throw resultJson.error;
      }

      const { result: checkResult } = resultJson;

      if (['ADMIN_MARKED_PAID', 'PAYMENT_SUCCEEDED'].includes(checkResult)) {
        this.setState({ showDoneModal: false, showStilPendingModal: false, loading: false });
        NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'PaymentComplete',
          {
            transactionId: this.state.transactionId,
            token: this.state.token,
            isOnboarding: this.state.isOnboarding,
            newBalance: resultJson.newBalance,
            amountAdded: this.state.amountToAdd,
          }
        );
      } else {
        const newDoneChecks = this.state.numberDoneChecks + 1;
        this.setState({ showStilPendingModal: true, numberDoneChecks: newDoneChecks, loading: false });
      }
    } catch (err) {
      console.log('ERROR: ', JSON.stringify(err));
      const newDoneChecks = this.state.numberDoneChecks + 1;
      this.setState({ showStilPendingModal: true, numberDoneChecks: newDoneChecks, loading: false });
    }
  };

  onCloseModals = () => {
    this.setState({ showDoneModal: false, showStilPendingModal: false });
  };

  onOpenDoneModal = () => {
    this.setState({ showDoneModal: true });
  }

  moveToNextScreen = () => {
    this.setState({ showDoneModal: false, showStilPendingModal: false, loading: false });
    if (this.state.isOnboarding) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'PendingManualTransfer', {
        transactionId: this.state.transactionId,
        token: this.state.token,
        bankDetails: this.state.bankDetails,
        humanReference: this.state.humanReference,
        isOnboarding: true,
      });
    } else {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Home', {
        userInfo: this.state.userInfo,
      });
    }
  };

  // first we check, unless that is already done, in which case, we go to the end
  onPressDone = async () => {
    if (this.state.numberDoneChecks > 0) {
      this.setState({ showDoneModal: true });
    } else {
      this.onCheckDone();
    }
  };

  onPressInstant = async () => {
    if (this.state.loadingInstant) return;
    this.setState({ loadingInstant: true });

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
        this.setState({ loadingInstant: false });
        this.props.navigation.navigate('Payment', {
          urlToCompletePayment: resultJson.paymentRedirectDetails.urlToCompletePayment,
          transactionId: this.state.transactionId,
          humanReference: resultJson.humanReference,
          amountToAdd: this.state.amountToAdd,
          token: this.state.token,
          isOnboarding: this.state.isOnboarding,
        });  
      } else {
        throw resultJson;
      }
    } catch (err) {
      console.log('Error switching!: ', JSON.stringify(err));
      this.setState({ loadingInstant: false });
    }
  };

  render() {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.onPressBack}
          >
            <Icon
              name="chevron-left"
              type="evilicon"
              size={45}
              color={Colors.MEDIUM_GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Pay with EFT</Text>
        </View>
        <View style={styles.mainContent}>
          <View style={styles.top}>
            <Image
              style={styles.image}
              source={require('../../assets/card.png')}
              resizeMode="contain"
            />
            <Text style={styles.description}>
              EFT’s take{' '}
              <Text style={styles.descriptionBold}>2-3 working days</Text> to
              reflect. As soon as we receive the funds your balance will be
              updated.
            </Text>
          </View>
          <TouchableOpacity
            onPress={this.onPressInstant}
            style={styles.switchButton}
          >
            <Text style={styles.switchButtonText}>
              {this.state.loadingInstant ? 'LOADING...' : 'OR SWITCH TO INSTANT EFT'}
            </Text>
          </TouchableOpacity>
          <View style={styles.reference}>
            <Text style={styles.referenceTitle}>TRANSFER R{this.state.amountToAdd} USING REFERENCE</Text>
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
              Bank: <Text style={styles.bottomBold}>{this.state.bankName}</Text>
            </Text>
            <Text style={styles.bottomText}>
              Account Name:{' '}
              <Text style={styles.bottomBold}>
                {this.state.beneficiaryName}
              </Text>
            </Text>
            <Text style={styles.bottomText}>
              Account Type: <Text style={styles.bottomBold}>{this.state.accountType}</Text>
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
              <Text style={styles.shareText}>Share payment Details</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={this.onPressSendPOP}
            >
              <Image
                style={styles.shareIcon}
                source={require('../../assets/message-circle.png')}
                resizeMode="contain"
              />
              <Text style={styles.shareText}>WhatsApp us the proof of payment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={this.onCheckDone}
            >
              <Image
                style={styles.shareIcon}
                source={require('../../assets/message-circle.png')}
                resizeMode="contain"
              />
              <Text style={styles.shareText}>Check payment complete</Text>
            </TouchableOpacity>
          </View>
          <Button
            title={this.state.numberDoneChecks > 0 ? "DONE" : "I'VE TRANSFERRED"}
            loading={this.state.loading}
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

        <Overlay
          isVisible={this.state.showDoneModal}
          dialogStyle={styles.dialogStyle}
          height="auto"
          width="auto"
          onBackdropPress={this.onCloseModals}
          onHardwareBackPress={this.onCloseModals}
        >
          <View style={styles.dialogWrapper}>
            <TouchableOpacity style={styles.closeButton} onPress={this.moveToNextScreen}>
              <Icon
                name="close"
                type="evilicon"
                size={30}
                color={Colors.MEDIUM_GRAY}
              />
            </TouchableOpacity>
            <Text style={styles.dialogText}>
              {this.state.isOnboarding 
                ? 'We will notify you when the EFT reflects and your account is fully open' 
                : 'We will notify you when the EFT reflects and your MoneyWheel is updated' }
            </Text>
            <Button
              title="OKAY"
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={this.moveToNextScreen}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
          </View>
        </Overlay>

        <Overlay
          isVisible={this.state.showStilPendingModal}
          dialogStyle={styles.dialogStyle}
          height="auto"
          width="auto"
          onBackdropPress={this.onCloseModals}
          onHardwareBackPress={this.onCloseModals}
        >
          <View style={styles.dialogWrapper}>
            <TouchableOpacity style={styles.closeButton} onPress={this.onCloseModals}>
              <Icon
                name="close"
                type="evilicon"
                size={30}
                color={Colors.MEDIUM_GRAY}
              />
            </TouchableOpacity>
            <Text style={styles.dialogText}>
              Unfortunately, we have not received the payment yet. You can WhatsApp the proof of payment to our
              support team, or try checking in again later.
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
    justifyContent: 'space-around',
  },
  header: {
    width: '100%',
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 7,
  },
  title: {
    fontFamily: 'poppins-semibold',
    fontSize: 6 * FONT_UNIT,
    color: Colors.DARK_GRAY,
    width: '100%',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
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
    fontFamily: 'poppins-semibold',
    fontSize: 4.5 * FONT_UNIT,
    textAlign: 'center',
    color: Colors.PURPLE,
    fontWeight: '600',
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
    marginTop: 15,
    borderRadius: 10,
    padding: 20,
  },
  bottomTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.9 * FONT_UNIT,
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
    fontFamily: 'poppins-semibold',
    fontWeight: 'bold',
    color: Colors.DARK_GRAY,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
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
    marginVertical: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  dialogWrapper: {
    maxWidth: '90%',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  dialogText: {
    fontFamily: 'poppins-regular',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginVertical: 10,
    textAlign: 'center',
  },
  switchButton: {
    width: 220,
    height: 35,
    borderRadius: 4,
    borderColor: Colors.PURPLE,
    borderWidth: 1, 
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  switchButtonText: {
    fontFamily: 'poppins-regular',
    fontWeight: '600',
    fontSize: 13,
    color: Colors.PURPLE,
  },
});
