import React from 'react';
import { connect } from 'react-redux';

import { ActivityIndicator, StyleSheet, Image, Text, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback, Linking, Dimensions } from 'react-native';
import { Button, Input, Overlay } from 'react-native-elements';

import moment from 'moment';

import HeaderWithBack from '../elements/HeaderWithBack';

import { Endpoints, Colors, FallbackSupportNumber } from '../util/Values';
import { getFormattedValue, standardFormatAmount } from '../util/AmountUtil';
import { LoggingUtil } from '../util/LoggingUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getAccountId } from '../modules/profile/profile.reducer';
import { getCurrentServerBalanceFull, getComparatorRates } from '../modules/balance/balance.reducer';

const { height } = Dimensions.get('window');

// need this correspondence as displayed names and names here (keyed to bank verifier) are not exact matches
const bankNameMap = {
  'FNB': 'FNB',
  'CAPITEC': 'Capitec',
  'STANDARD': 'Standard_Bank',
  'ABSA': 'ABSA',
  'NEDBANK': 'Nedbank',
};

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
  accountId: getAccountId(state),
  currentBalance: getCurrentServerBalanceFull(state),
  comparatorRates: getComparatorRates(state),
});

class WithdrawStep2 extends React.Component {
  constructor(props) {
    super(props);
    const bank = this.props.navigation.getParam('bank');
    const accountNumber = this.props.navigation.getParam('accountNumber');
    const data = this.props.navigation.getParam('initiateResponseData');
    this.state = {
      bank,
      accountNumber,
      currency: 'R',
      amountToWithdraw: '',
      balance: data.availableBalance ? data.availableBalance.amount : -1,
      unit: data.availableBalance ? data.availableBalance.unit : 'WHOLE_CURRENCY',
      bankRates: {},

      cardTitle: data.cardTitle,
      cardBody: data.cardBody,

      dialogVisible: false,
      showAccountDetails: height > 640,
      withdrawLoading: false,
      showErrorDialog: false,
    };
  }

  async componentDidMount() {
    LoggingUtil.logEvent('USER_SUBMITTED_WITHDRAWAL_ACCOUNT');
    
    this.setState({
      accountId: this.props.accountId,
      token: this.props.authToken,
    });
    
    if (this.props.comparatorRates && this.props.comparatorRates.rates) {
      const rateMapKey = bankNameMap[this.state.bank];
      this.setState({
        bankRates: this.props.comparatorRates.rates[rateMapKey],
      })
    }

    if (this.state.balance === -1) {
      this.setState({
        balance: this.props.currentBalance.amount,
        unit: this.props.currentBalance.unit,  
      })
    }

    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.onShowKeyboard);
    this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.onHideKeyboard);
  }

  async componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  onShowKeyboard = () => {
    this.setState({ showAccountDetails: false });
  }

  onHideKeyboard = () => {
    this.setState({ showAccountDetails: height > 640 });
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onChangeAmount = text => {
    this.setState({ amountToWithdraw: text });
    if (parseInt(text, 10) > 0) {
      this.calculateProjectedLoss(parseInt(text, 10));
    }
  };

  onChangeAmountEnd = () => {
    this.setState({
      amountToWithdraw: parseFloat(this.state.amountToWithdraw).toFixed(0),
    });
    this.amountInputRef.blur();
  };

  onPressEditAccount = () => {
    this.props.navigation.navigate('WithdrawStep1');
  };

  onCloseDialog = () => {
    this.setState({
      dialogVisible: false,
    });
    return true;
  };

  onPressWithdrawNow = () => {
    this.onCloseDialog();
    this.finishWithdrawal(true);
  };

  onPressCancelWithdraw = () => {
    this.onCloseDialog();
    this.finishWithdrawal(false);
  };

  onPressErrorWhatsApp = () => {
    const defaultText = 'Hi, I am trying to withdraw but it is giving me an error';
    const whatsAppLink = `https://wa.me/${FallbackSupportNumber.link}?text=${encodeURIComponent(defaultText)}`;
    Linking.openURL(whatsAppLink).catch((err) => {
      LoggingUtil.logError(err);
      this.props.navigation.navigate('Support', {
        preFilledSupportMessage: 'Hi, I have a problem with a withdrawal',
      });
    });
  }

  showError = (err) => {
    this.setState({ showErrorDialog: true });
    LoggingUtil.logError(err);
  }

  initiateWithdrawal = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    try {
      LoggingUtil.logEvent('USER_SUBMITTED_WITHDRAWAL_AMOUNT');
      const result = await fetch(`${Endpoints.CORE}withdrawal/amount`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
        body: JSON.stringify({
          accountId: this.state.accountId,
          amount: this.state.amountToWithdraw * 10000, // multiplying by 100 to get cents and again by 100 to get hundreth cent
          unit: 'HUNDREDTH_CENT',
          currency: 'ZAR', // TODO implement for handling other currencies
        }),
      });
      if (result.ok) {
        const resultJson = await result.json();
        this.setState({
          dialogVisible: true,
          loading: false,
          transactionId: resultJson.transactionId,
          delayOffer: resultJson.delayOffer,
          interestProjection: resultJson.potentialInterest,
        });
        LoggingUtil.logEvent('USER_PRESENTED_WITHDRAWAL_LOSS');
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ loading: false });
      this.showError(error);
    }
  };

  finishWithdrawal = async isWithdrawing => {
    if (this.state.withdrawLoading) return;
    this.setState({ withdrawLoading: true });

    try {
      LoggingUtil.logEvent(`USER_DECIDED_TO_${isWithdrawing ? 'WITHDRAW' : 'CANCEL_WITHDRAWAL'}`);
      const result = await fetch(`${Endpoints.CORE}withdrawal/decision`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'POST',
        body: JSON.stringify({
          transactionId: this.state.transactionId,
          userDecision: isWithdrawing ? 'WITHDRAW' : 'CANCEL',
        }),
      });
      if (result.ok) {
        this.setState({ withdrawLoading: false });
        if (isWithdrawing) {
          this.props.navigation.navigate('WithdrawalComplete', {
            amount: this.state.amountToWithdraw,
            token: this.state.token,
          });
        } else {
          this.props.navigation.navigate('Home');
        }
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ withdrawLoading: false });
      this.showError(error);
    }
  };

  getBoostAmount = () => {
    const amount = this.state.delayOffer.boostAmount;
    const parts = amount.split('::');
    return (parts[0] / this.getDivisor(parts[1])).toFixed(0); // + " " + parts[2];
  };

  getFutureInterestAmount = () => {
    return getFormattedValue(this.state.interestProjection.amount, this.state.interestProjection.unit, 2);
  };

  calculateProjectedLoss = (relevantAmount) => {
    try {
      if (!this.state.bankRates) {
        return;
      }

      const { bankRates } = this.state;

      let result = 0;
      let bankThreshold = -1;

      for (const key in bankRates) {
        if (key === 'label') continue;

        const keyInt = parseInt(key);
        if (relevantAmount > keyInt && keyInt > bankThreshold) {
          result = bankRates[key];
          bankThreshold = keyInt;
        }
      }

      const amountBankRate = parseFloat(result / 100);
      const jupiterRate = parseFloat(this.props.comparatorRates.referenceRate / 100);
      
      const jupiterProjection = relevantAmount * ((1 + (jupiterRate / 100)) ** 5);
      const bankProjection = relevantAmount * ((1 + (amountBankRate / 100)) ** 5);
      const projectedLoss = jupiterProjection - bankProjection;

      const bankLabel = bankRates.label;

      this.setState({ 
        amountBankRate, jupiterProjection, bankProjection, projectedLoss, bankLabel, jupiterRate,
      });
    } catch (err) {
      // being very cautious, given sensitivity of this step
      LoggingUtil.logError(err);
    }
  }

  formatProjection = (amount, decimals = 0) => standardFormatAmount(amount, 'WHOLE_CURRENCY', 'ZAR', decimals);

  renderLossCard() {
    return (
      <View style={styles.bottomBox}>
        <Text style={styles.lossProjectionTitle}>
          You&apos;re losing {this.formatProjection(this.state.projectedLoss, 2)}!
        </Text>
        <Text style={styles.bottomBoxText}>
          At {this.state.bankLabel}, saving accounts pay you {this.state.amountBankRate.toFixed(1)}%, but 
          Jupiter pays more - {this.state.jupiterRate.toFixed(1)}% per year. So this withdrawal will only
          grow to {this.formatProjection(this.state.bankProjection)} in {this.state.bankLabel} after 5 years
          vs {this.formatProjection(this.state.jupiterProjection)} in your MoneyWheel.
        </Text>
      </View>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderWithBack
          headerText="Withdraw Cash"
          onPressBack={this.onPressBack}
        />
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            {this.state.showAccountDetails && (
              <View style={styles.topBox}>
                <Text style={styles.topBoxText}>
                  Cash withdrawn will be paid into:
                </Text>
                <Text style={styles.topBoxText}>
                  Bank: <Text style={styles.bold}>{this.state.bank}</Text> | Acc No:{' '}
                  <Text style={styles.bold}>{this.state.accountNumber}</Text>
                </Text>
                <Text style={styles.topBoxLink} onPress={this.onPressEditAccount}>
                  Edit Account Details
                </Text>
              </View>
            )}
            <View style={styles.midSection}>
              <Text style={styles.inputLabel}>Enter an amount to withdraw</Text>
              <View style={styles.inputWrapper}>
                <View style={styles.inputWrapperLeft}>
                  <Text style={styles.currencyLabel}>{this.state.currency}</Text>
                </View>
                <Input
                  keyboardType="numeric"
                  ref={ref => {
                    this.amountInputRef = ref;
                  }}
                  value={this.state.amountToWithdraw}
                  onChangeText={text => this.onChangeAmount(text)}
                  onEndEditing={() => this.onChangeAmountEnd()}
                  inputContainerStyle={styles.inputContainerStyle}
                  inputStyle={styles.inputStyle}
                  containerStyle={styles.containerStyle}
                />
              </View>
              <Text style={styles.makeSureDisclaimer}>
                <Text style={styles.bold}>
                  Your available balance is {this.state.currency}
                  {getFormattedValue(this.state.balance, this.state.unit)}.{'\n'}
                </Text>
              </Text>
            </View>
            {this.state.projectedLoss ? this.renderLossCard() : (
              <View style={styles.bottomBox}>
                <View style={styles.bottomBoxImageWrapper}>
                  <Image
                    style={styles.bottomBoxImage}
                    source={require('../../assets/bulb.png')}
                  />
                </View>
                <Text style={styles.bottomBoxTitle}>{this.state.cardTitle}</Text>
                <Text style={styles.bottomBoxText}>{this.state.cardBody}</Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
        <Button
          title="WITHDRAW CASH"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.initiateWithdrawal}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}
        />

        <Overlay
          isVisible={this.state.dialogVisible}
          onBackdropPress={this.onCloseDialog}
          width="auto"
          height="auto"
        >
          <View style={styles.dialogContent}>
            <View style={styles.dialogTitleWrapper}>
              <Text style={styles.dialogTitle}>
                {this.state.delayOffer
                  ? 'Delay your withdrawal to earn a boost of:'
                  : 'Are you sure?'}
              </Text>
            </View>
            {this.state.delayOffer ? (
              <View style={styles.dialogBoostView}>
                <Image
                  style={styles.dialogBoostImage}
                  source={require('../../assets/gift.png')}
                />
                <View style={styles.dialogBoostTextWrapper}>
                  <Text style={styles.dialogBoostSuperscript}>R</Text>
                  <Text style={styles.dialogBoostText}>
                    {this.getBoostAmount()}
                  </Text>
                </View>
              </View>
            ) : null}
            {this.state.delayOffer ? (
              <Text style={styles.dialogDescription}>
                Simply delay your withdrawal until{' '}
                {moment(this.state.delayOffer.requiredDelay).format(
                  'Do MMMM YYYY, HH:mm:ss'
                )}{' '}
                to earn this boost.
              </Text>
            ) : null}
            {this.state.interestProjection && !this.state.delayOffer && (
              <Text style={styles.interestProjectionText}>
                This money could earn a lot if you leave it in your account. Thanks to compound interest,
                over the next five years it could make:
              </Text>
            )}
            {this.state.interestProjection && !this.state.delayOffer && (
              <View style={styles.dialogBoostView}>
                <View style={styles.dialogBoostTextWrapper}>
                  <Text style={styles.dialogBoostSuperscript}>R</Text>
                  <Text style={styles.dialogBoostText}>
                    {this.getFutureInterestAmount()}
                  </Text>
                </View>
              </View>
            )}
            <Button
              title="CANCEL WITHDRAWAL"
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={this.onPressCancelWithdraw}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
            <Text
              style={styles.dialogTextAsButton}
              onPress={this.onPressWithdrawNow}
            >
              Withdraw now
            </Text>
            <TouchableOpacity
              style={styles.closeDialog}
              onPress={this.onCloseDialog}
            >
              <Image source={require('../../assets/close.png')} />
            </TouchableOpacity>
          </View>
        </Overlay>

        <Overlay
          isVisible={this.state.withdrawLoading}
          height="auto"
          width="auto"
          onBackdropPress={() => {
            return true;
          }}
        >
          <View style={styles.finalDialogWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
            <Text style={styles.finalDialogText}>Please wait...</Text>
          </View>
        </Overlay>


        <Overlay
          isVisible={this.state.showErrorDialog}
          height="auto"
          width="auto"
          onBackdropPress={() => this.setState({ showErrorDialog: false })}
        >
          <View style={styles.finalDialogWrapper}>
            <Text style={styles.finalDialogText}>
              We&apos;re sorry, there was an error with our server. We know how important it is
              for you to be able to access your funds, so please try again, or just contact our 
              support line, via <Text onPress={this.onPressErrorWhatsApp} style={styles.finalDialogLink}>WhatsApp</Text>
            </Text>
          </View>
        </Overlay>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 15,
    justifyContent: 'space-around',
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 220,
  },
  buttonContainerStyle: {
    marginVertical: 10,
    justifyContent: 'center',
    width: '90%',
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '100%',
    height: 70,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.PURPLE,
    borderRadius: 20,
    marginTop: 20,
  },
  inputWrapperLeft: {
    width: '13%',
    marginVertical: -1,
    marginLeft: -1,
    backgroundColor: Colors.PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  currencyLabel: {
    fontFamily: 'poppins-regular',
    color: Colors.WHITE,
    fontSize: 24,
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputStyle: {
    marginLeft: 12,
    fontFamily: 'poppins-regular',
    fontSize: 35,
  },
  containerStyle: {
    width: '86%',
    borderRadius: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    textAlign: 'left',
    width: '90%',
    marginBottom: -15,
  },
  topBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    paddingVertical: 15,
  },
  topBoxText: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 13,
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  topBoxLink: {
    marginTop: 10,
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.PURPLE,
  },
  makeSureDisclaimer: {
    fontFamily: 'poppins-regular',
    fontSize: 13.5,
    marginTop: 10,
    color: Colors.MEDIUM_GRAY,
  },
  bottomBox: {
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    paddingVertical: 15,
  },
  bottomBoxImageWrapper: {
    marginTop: -50,
    borderWidth: 8,
    borderColor: Colors.WHITE,
    borderRadius: 100,
  },
  bottomBoxTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.DARK_GRAY,
  },
  bottomBoxText: {
    fontFamily: 'poppins-regular',
    fontSize: 13,
    marginTop: 10,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
  },
  lossProjectionTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.RED,
  },
  dialogContent: {
    width: '90%',
    minHeight: 220,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  closeDialog: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  dialogTitleWrapper: {
    width: '75%',
  },
  dialogTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19.5,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
  },
  dialogBoostView: {
    borderWidth: 1,
    borderRadius: 15,
    borderColor: Colors.GRAY,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 25,
  },
  dialogBoostTextWrapper: {
    marginLeft: 10,
    flexDirection: 'row',
  },
  dialogBoostText: {
    fontFamily: 'poppins-semibold',
    fontSize: 33,
    color: Colors.PURPLE,
  },
  dialogBoostSuperscript: {
    fontFamily: 'poppins-semibold',
    color: Colors.PURPLE,
    textAlignVertical: 'top',
    fontSize: 17,
    marginTop: 5,
  },
  dialogDescription: {
    fontFamily: 'poppins-regular',
    fontSize: 16,
    marginTop: 10,
    marginHorizontal: 10,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'center',
  },
  interestProjectionText: {
    fontFamily: 'poppins-regular',
    fontSize: 16,
    marginVertical: 10,
    marginHorizontal: 10,
    color: Colors.MEDIUM_GRAY,
    textAlign: 'left',
  },
  dialogTextAsButton: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
    color: Colors.PURPLE,
    textDecorationLine: 'underline',
  },
  finalDialogWrapper: {
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    paddingBottom: 0,
  },
  finalDialogText: {
    fontFamily: 'poppins-regular',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    marginHorizontal: 30,
    textAlign: 'center',
  },
  finalDialogLink: {
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
  },
});

export default connect(mapStateToProps)(WithdrawStep2);