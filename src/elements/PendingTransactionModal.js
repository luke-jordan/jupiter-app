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
    }
  }

  getBodyText() {
    const { transactionType } = this.props.transaction.details;
    if (transactionType === 'USER_SAVING_EVENT') {
      return 'This save is still marked as pending, which means the funds are still on the way to us, but you can check again or ping the support team to check.';
    }

    if (transactionType === 'WITHDRAWAL') {
      return 'This withdrawal is still marked as pending, because the EFT is being processed to your account. We do not show the ' +
        'withdrawal as complete until the EFT has left the Jupiter Stokvel account. You can try checking again, request support to ' +
        'speed up the process, or, best yet, have second thoughts and leave your cash to make more interest';
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

      let resultText = 'Sorry, it looks like the save is still being processed';
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
          resultText = 'Sorry, it looks like the transfer for this save is still being processed. Check again later, or notify support';
          transactionComplete = true;
          break;
      };

      this.setState({
        resultBody: true,
        resultText,
        hideCheck: true,
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
      console.log('Result of cancellation: ', resultJson);

      // if (resultJson.result === 'SUCCESS') {
      //   this.setState({
      //     operationCompleted: true,
      //     operationPerformed: 'CANCEL'
      //   });
      // }

      this.setState({ cancellingTx: false });
      this.props.onRequestClose();
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
        onBackdropPress={this.props.onRequestClose}
        onHardwareBackPress={this.props.onRequestClose}
      >
        <View style={styles.dialogView}>
          <View style={styles.dialogHeader}>
            <Text style={styles.dialogTitle}>Pending Transaction</Text>
            <TouchableOpacity onPress={this.props.onRequestClose} style={styles.closeDialog}>
              <Image source={require('../../assets/close.png')} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dialogBodyContainer}>
            <Text style={styles.dialogBody}>
              {this.getBodyText()}
            </Text>

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
})