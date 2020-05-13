import React from 'react';
import { connect } from 'react-redux';

import { ActivityIndicator, StyleSheet, Image, Text, TouchableOpacity, View, Keyboard, TouchableWithoutFeedback, Linking } from 'react-native';
import { Button, Icon, Input, Overlay } from 'react-native-elements';
import moment from 'moment';

import { Endpoints, Colors, FallbackSupportNumber } from '../util/Values';
import { getDivisor, getFormattedValue } from '../util/AmountUtil';
import { LoggingUtil } from '../util/LoggingUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { getAccountId } from '../modules/profile/profile.reducer';
import { getCurrentServerBalanceFull } from '../modules/balance/balance.reducer';

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
  accountId: getAccountId(state),
  currentBalance: getCurrentServerBalanceFull(state),
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
      balance: 0,
      dialogVisible: false,
      cardTitle: data.cardTitle,
      cardBody: data.cardBody,
      withdrawLoading: false,
      showErrorDialog: false,
    };
  }

  async componentDidMount() {
    // LoggingUtil.logEvent('USER_ENTERED_....');
    this.setState({
      balance: this.props.currentBalance.amount,
      unit: this.props.currentBalance.unit,
      accountId: this.props.accountId,
      token: this.props.authToken,
    });
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  };

  onPressWithdraw = () => {
    this.initiateWithdrawal();
  };

  onChangeAmount = text => {
    this.setState({ amountToWithdraw: text });
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

  getFormattedBalance(balance) {
    return (balance / getDivisor(this.state.unit)).toFixed(2);
  }

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
      } else {
        throw result;
      }
    } catch (error) {
      this.setState({ loading: false });
      this.showError(error);
    }
  };

  finishWithdrawal = async isWithdrawing => {
    console.log('Finishing withdrawal, user chose to: ', isWithdrawing);
    if (this.state.withdrawLoading) return;
    this.setState({ withdrawLoading: true });

    try {
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
    return getFormattedValue(this.state.interestProjection.amount, this.state.interestProjection.unit);
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={this.onPressBack}
          >
            <Icon
              name="chevron-left"
              type="evilicon"
              size={45}
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Cash</Text>
        </View>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
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
                  Your current balance is {this.state.currency}
                  {this.getFormattedBalance(this.state.balance)}.{'\n'}
                </Text>
              </Text>
            </View>
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
          </View>
        </TouchableWithoutFeedback>
        <Button
          title="WITHDRAW CASH"
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressWithdraw}
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
  header: {
    width: '100%',
    height: 50,
    backgroundColor: Colors.WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  headerTitle: {
    marginLeft: -5,
    fontFamily: 'poppins-semibold',
    fontSize: 22,
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
    marginTop: 25,
    marginBottom: -15,
  },
  topBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    paddingVertical: 25,
  },
  topBoxText: {
    fontFamily: 'poppins-regular',
    color: Colors.DARK_GRAY,
    fontSize: 16,
  },
  bold: {
    fontFamily: 'poppins-semibold',
  },
  topBoxLink: {
    marginTop: 20,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
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
    paddingVertical: 25,
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