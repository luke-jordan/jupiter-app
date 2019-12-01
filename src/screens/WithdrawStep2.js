import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LoggingUtil } from '../util/LoggingUtil';
import { Image, Text, AsyncStorage, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationUtil } from '../util/NavigationUtil';
import { Endpoints, Colors } from '../util/Values';
import { Button, Icon, Input } from 'react-native-elements';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';
import moment from 'moment';

export default class Withdraw extends React.Component {

  constructor(props) {
    super(props);
    let bank = this.props.navigation.getParam("bank");
    let accountHolder = this.props.navigation.getParam("accountHolder");
    let accountNumber = this.props.navigation.getParam("accountNumber");
    let data = this.props.navigation.getParam("initiateResponseData");
    this.state = {
      bank: bank,
      accountNumber: accountNumber,
      accountHolder: accountHolder,
      currency: "R",
      amountToWithdraw: parseFloat(50).toFixed(2),
      balance: 0,
      dialogVisible: false,
      cardTitle: data.cardTitle,
      cardBody: data.cardBody,
      withdrawLoading: false,
    };
  }

  async componentDidMount() {
    // LoggingUtil.logEvent('USER_ENTERED_....');

    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
      this.setState({
        balance: info.balance.currentBalance.amount,
        unit: info.balance.currentBalance.unit,
        accountId: info.balance.accountId[0],
        token: info.token,
      });
    }
  }

  onPressBack = () => {
    this.props.navigation.goBack();
  }

  onPressWithdraw = () => {
    this.initiateWithdrawal();
  }

  onChangeAmount = (text) => {
    this.setState({amountToWithdraw: text});
  }

  onChangeAmountEnd = () => {
    this.setState({amountToWithdraw: parseFloat(this.state.amountToWithdraw).toFixed(2)});
    this.amountInputRef.blur();
  }

  onPressEditAccount = () => {
    this.props.navigation.navigate('Account');
  }

  getFormattedBalance(balance) {
    return (balance / this.getDivisor(this.state.unit)).toFixed(2);
  }

  getDivisor(unit) {
    switch(unit) {
      case "MILLIONTH_CENT":
      return 100000000;

      case "TEN_THOUSANDTH_CENT":
      return 1000000;

      case "THOUSANDTH_CENT":
      return 100000;

      case "HUNDREDTH_CENT":
      return 10000;

      case "WHOLE_CENT":
      return 100;

      case "WHOLE_CURRENCY":
      return 1;

      default:
      return 1;
    }
  }

  onCloseDialog = () => {
    this.setState({
      dialogVisible: false,
    });
    return true;
  }

  onPressWithdrawNow = () => {
    this.onCloseDialog();
    this.finishWithdrawal(true);
  }

  onPressCancelWithdraw = () => {
    this.onCloseDialog();
    this.finishWithdrawal(false);
  }

  initiateWithdrawal = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});

    try {
      let result = await fetch(Endpoints.CORE + 'withdrawal/amount', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.state.token,
        },
        method: 'POST',
        body: JSON.stringify({
          "accountId": this.state.accountId,
          "amount": this.state.amountToWithdraw * 10000, //multiplying by 100 to get cents and again by 100 to get hundreth cent
          "unit": "HUNDREDTH_CENT",
          "currency": "ZAR" //TODO implement for handling other currencies
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        this.setState({
          dialogVisible: true,
          loading: false,
          transactionId: resultJson.transactionId,
          delayOffer: resultJson.delayOffer,
        });
      } else {
        let resultText = await result.text();
        console.log("resultText:", resultText);
        throw result;
      }
    } catch (error) {
      console.log("error!", error);
      this.setState({loading: false});
      this.showError(error);
    }
  }

  finishWithdrawal = async (isWithdrawing) => {
    if (this.state.withdrawLoading) return;
    this.setState({withdrawLoading: true});

    try {
      let result = await fetch(Endpoints.CORE + 'withdrawal/decision', {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer ' + this.state.token,
        },
        method: 'POST',
        body: JSON.stringify({
          "transactionId": this.state.transactionId,
          "userDecision": isWithdrawing ? "WITHDRAW" : "CANCEL",
        }),
      });
      if (result.ok) {
        let resultJson = await result.json();
        this.setState({withdrawLoading: false});
        console.log(resultJson);
        if (isWithdrawing) {
          this.props.navigation.navigate("WithdrawalComplete", { amount: this.state.amountToWithdraw, token: this.state.token });
        } else {
          this.props.navigation.navigate("Home");
        }
      } else {
        let resultText = await result.text();
        console.log("resultText:", resultText);
        throw result;
      }
    } catch (error) {
      console.log("error!", error);
      this.setState({withdrawLoading: false});
      this.showError(error);
    }
  }

  showError(error) {

  }

  getBoostAmount = () => {
    let amount = this.state.delayOffer.boostAmount;
    let parts = amount.split("::");
    return (parts[0] / this.getDivisor(parts[1])).toFixed(2); // + " " + parts[2];
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
              color={Colors.GRAY}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdraw Cash</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.topBox}>
            <Text style={styles.topBoxText}>Cash withdrawn will be paid into:</Text>
            <Text style={styles.topBoxText}>Bank: <Text style={styles.bold}>{this.state.bank}</Text> | Acc No: <Text style={styles.bold}>{this.state.accountNumber}</Text></Text>
            <Text style={styles.topBoxLink} onPress={this.onPressEditAccount}>Edit Account Details</Text>
          </View>
          <View style={styles.midSection}>
            <Text style={styles.inputLabel}>Enter an amount to withdraw</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputWrapperLeft}>
                <Text style={styles.currencyLabel}>{this.state.currency}</Text>
              </View>
              <Input
                keyboardType='numeric'
                ref={(ref) => {this.amountInputRef = ref;}}
                value={this.state.amountToWithdraw}
                onChangeText={(text) => this.onChangeAmount(text)}
                onEndEditing={() => this.onChangeAmountEnd()}
                inputContainerStyle={styles.inputContainerStyle}
                inputStyle={styles.inputStyle}
                containerStyle={styles.containerStyle}
              />
            </View>
            <Text style={styles.makeSureDisclaimer}><Text style={styles.bold}>Your current balance is {this.state.currency}{this.getFormattedBalance(this.state.balance)}.{"\n"}</Text>Please make sure you have added the correct amount as this transaction cannot be reversed.</Text>
          </View>
          <View style={styles.bottomBox}>
            <View style={styles.bottomBoxImageWrapper}>
              <Image style={styles.bottomBoxImage} source={require('../../assets/bulb.png')} />
            </View>
            <Text style={styles.bottomBoxTitle}>{this.state.cardTitle}</Text>
            <Text style={styles.bottomBoxText}>{this.state.cardBody}</Text>
          </View>
        </View>
        <Button
          title={"WITHDRAW CASH"}
          loading={this.state.loading}
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressWithdraw}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }} />


        <Dialog
          visible={this.state.dialogVisible}
          dialogStyle={styles.dialogWrapper}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          onTouchOutside={this.onCloseDialog}
          onHardwareBackPress={this.onCloseDialog}
        >
          <DialogContent style={styles.dialogContent}>
            <View style={styles.dialogTitleWrapper}>
              <Text style={styles.dialogTitle}>{this.state.delayOffer ? "Delay your withdrawal to earn a boost of:" : "Are you sure?"}</Text>
            </View>
            {
              this.state.delayOffer ?
              <View style={styles.dialogBoostView}>
                <Image style={styles.dialogBoostImage} source={require('../../assets/gift.png')} />
                <View style={styles.dialogBoostTextWrapper}>
                  <Text style={styles.dialogBoostSuperscript}>R</Text>
                  <Text style={styles.dialogBoostText}>{this.getBoostAmount()}</Text>
                </View>
              </View>
              : null
            }
            {
              this.state.delayOffer ?
              <Text style={styles.dialogDescription}>Simply delay your withdrawal until {moment(this.state.delayOffer.requiredDelay).format("Do MMMM YYYY, HH:mm:ss")} to earn this boost.</Text>
              : null
            }
            <Button
              title="CANCEL WITHDRAW"
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              onPress={this.onPressCancelWithdraw}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}/>
            <Text style={styles.dialogTextAsButton} onPress={this.onPressWithdrawNow}>Withdraw now</Text>
            <TouchableOpacity style={styles.closeDialog} onPress={this.onCloseDialog} >
              <Image source={require('../../assets/close.png')}/>
            </TouchableOpacity>
          </DialogContent>
        </Dialog>

        <Dialog
          visible={this.state.withdrawLoading}
          dialogStyle={styles.dialogStyle}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          onTouchOutside={() => {}}
          onHardwareBackPress={() => {return true;}}
        >
          <DialogContent style={styles.finalDialogWrapper}>
            <ActivityIndicator size="large" color={Colors.PURPLE} />
            <Text style={styles.finalDialogText}>Please wait...</Text>
          </DialogContent>
        </Dialog>
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
    backgroundColor: 'white',
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
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 25,
  },
  bottomBoxImageWrapper: {
    marginTop: -50,
    borderWidth: 8,
    borderColor: 'white',
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
  dialogWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogContent: {
    width: '90%',
    minHeight: 390,
    backgroundColor: 'white',
    borderRadius: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  closeDialog: {
    position: 'absolute',
    top: 20,
    right: 20,
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
    fontFamily: 'poppins-semibold',
    fontSize: 17,
    color: Colors.DARK_GRAY,
    marginTop: 10,
    marginHorizontal: 30,
    textAlign: 'center',
  },
});
