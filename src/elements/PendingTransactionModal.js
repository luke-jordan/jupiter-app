import React from 'react';

import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Overlay, Button } from 'react-native-elements';

import { Endpoints, Colors } from '../util/Values';

export default class PendingTransactionModal extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      recheckingTx: false,
      cancellingTx: false,
      transactionComplete: false,
    }
  }

  onPressCloseOrDone = () => {
    this.props.onRequestClose(this.state.transactionComplete);
  }

  getBodyText() {
    const { transactionType } = this.props.transaction.details;
    if (transactionType === 'USER_SAVING_EVENT') {
      return 'This save is still marked as pending, which means the funds are still on the way to us, but you can check again or ping the support team to check.';
    }

    if (transactionType === 'WITHDRAWAL') {
      return 'The withdrawal is still pending, because the EFT is being processed to your account. We do not show the ' +
        'withdrawal as complete until the EFT has left the Jupiter Stokvel account. You can check again, request support to ' +
        'expedite, or, best yet, have second thoughts and leave your cash to make more interest';
    }

    return 'This is a pending transaction. Choose an action to take: ';
  }

  getCancelText() {
    const { transactionType } = this.props.transaction.details;
    if (transactionType === 'USER_SAVING_EVENT') {
      return 'CANCEL SAVE';
    }

    if (transactionType === 'WITHDRAWAL') {
      return 'CANCEL WITHDRAWAL';
    }

    return 'CANCEL';
  }

  remindSupportOfPending = () => {
    const preFilledSupportMessage = `Please check transaction ${this.props.transaction.details.humanReference} again as soon as possible. ` +
      `It is still marked as pending.`;
    this.props.navigateToSupport(preFilledSupportMessage); 
  }

  recheckPendingTransaction = async () => {
    try {
      this.setState({ recheckingTx: true });
      const result = await fetch(`${Endpoints.CORE}pending/check`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'POST',
        body: JSON.stringify({ transactionId: this.props.transaction.details.transactionId }),
      });

      if (!result.ok) {
        throw result;
      }

      const resultJson = await result.json();
      console.log('Received response: ', resultJson);
      if (resultJson.error) {
        throw resultJson.error;
      }

      const { result: checkResult } = resultJson;

      let resultText = 'Sorry, it looks like the transaction is still being processed';
      let transactionComplete = false;

      switch (checkResult) {
        case 'ADMIN_MARKED_PAID':
          resultText = 'Good news! This save has now had its payment marked complete by our support team. It should reflect in your account shortly.'
          transactionComplete = true;
          break;
        case 'PAYMENT_SUCCEEDED':
          resultText = 'Good news! The transfer has now been recognized by our system and will shortly be credited to your account';
          transactionComplete = true;
          break;
        case 'PAYMENT_PENDING':
          resultText = 'Sorry, it looks like the transfer for this save is still being processed. Please check again later, or notify support.';
          transactionComplete = false;
          break;
        case 'WITHDRAWAL_PENDING':
          resultText = 'Sorry, your withdrawal is still being processed. Feel free to contact us via the support form to ask for it to be expedited.';
          transactionComplete = false;
          break;
        case 'WITHDRAWAL_SETTLED':
          resultText = 'Your withdrawal has been completed--the EFT has left our account. If it is not in your account already, please allow the usual time for EFTs to come through';
          transactionComplete = true;
          break;
        case 'ADMIN_CANCELLED':
        case 'USER_CANCELLED':
          resultText = 'This transaction has already been cancelled.' // todo add more information & maybe keep notify support
          transactionComplete = false;
          break;
      };

      this.setState({
        resultBody: true,
        resultText,
        hideCheck: true,
        transactionComplete,
        recheckingTx: false,
      });

    } catch (error) {
      console.log('Error in pending TX request: ', JSON.stringify(error));
      this.setState({ recheckingTx: false });
      this.props.onErrorInRequest(error);
    }
  }

  cancelPendingTransaction = async () => {
    try {
      this.setState({ cancellingTx: true });
      const result = await fetch(`${Endpoints.CORE}pending/cancel`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'POST',
        body: JSON.stringify({ transactionId: this.props.transaction.details.transactionId }),
      });

      if (!result.ok) {
        throw result;
      }

      const resultJson = await result.json();
      // console.log('Result of cancellation: ', resultJson);

      const { transactionType } = this.props.transaction.details;
      
      // eslint-disable-next-line no-nested-ternary
      const transactionLabel = transactionType === 'USER_SAVING_EVENT' ? 'save' : 
        (transactionType === 'WITHDRAWAL' ? 'withdrawal' : 'transaction');

      if (resultJson.result === 'SUCCESS') {
        this.setState({
          cancellingTx: false,
          transactionComplete: true,
          hideCheck: true,
          resultBody: true,
          resultText: `This ${transactionLabel} has now been cancelled`,
        });
      } else {
        this.setState({
          cancellingTx: false,
          transactionComplete: false,
          hideCheck: true,
          resultBody: true,
          resultText: `Sorry, there was an error cancelling the ${transactionLabel}.`,
        });
      }

    } catch (error) {
      console.log('Error in cancelling TX request: ', JSON.stringify(error));
      this.setState({ cancellingTx: false });
      this.props.onErrorInRequest(error);
    }
  }

  render() {
    return (
      <Overlay
        animationType="slide"
        height="auto"
        width="auto"
        isVisible={this.props.showModal}
        onBackdropPress={this.onPressCloseOrDone}
        onHardwareBackPress={this.onPressCloseOrDone}
      >
        <View style={styles.dialogView}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Pending Transaction</Text>
            <TouchableOpacity onPress={this.onPressCloseOrDone} style={styles.closeDialog}>
              <Image source={require('../../assets/close.png')} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dialogBodyContainer}>

            {!this.state.resultBody && (
              <Text style={styles.dialogBody}>
                {this.getBodyText()}
              </Text>
            )}

            {this.state.resultBody && (
              <Text style={styles.dialogBody}>
                {this.state.resultText}
              </Text>
            )}

            {!this.state.hideCheck && (
              <Button
                title="CHECK AGAIN"
                loading={this.state.recheckingTx}
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.recheckPendingTransaction}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
              />
            )}

            {!this.state.transactionComplete && (
              <Button
                title="NOTIFY SUPPORT"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.remindSupportOfPending}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
              />
            )}

            {!this.state.transactionComplete && (
              <Button
                title={this.getCancelText()}
                loading={this.state.cancellingTx}
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.cancelPendingTransaction}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
              />
            )}

            {this.state.transactionComplete && (
              <Button
                title="DONE"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.onPressCloseOrDone}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
              />
            )}

          </View>
        </View>
      </Overlay>
    )
  }

}

const styles = StyleSheet.create({
  dialogView: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    maxWidth: '90%',
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    color: Colors.DARK_GRAY,
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
    paddingHorizontal: 25, // to leave space for cross
  },
  dialogBodyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  dialogBody: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 15,
    lineHeight: 20,
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 15,
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
    marginTop: 10,
  },
});
