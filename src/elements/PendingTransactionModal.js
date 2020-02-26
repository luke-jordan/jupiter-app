import React from 'react';

import { View, Text, Modal, TouchableOpacity } from 'react-native';

import { Endpoints } from '../util/Values';

export default class PendingTransactionModal extends React.PureComponent {

  async recheckPendingTransaction() {
    try {
      const result = await fetch(`${Endpoints.CORE}pending/check`);
    } catch (error) {
      this.props.onErrorInRequest(error);
    }
  }

  async remindSupportOfPending() {
    try {
      const result = await fetch(`${Endpoints.CORE}pending/remind`)
    } catch (error) {
      this.props.onErrorInRequest(error);
    }
  }

  async cancelPendingTransaction() {
    try {
      const result = await fetch(`${Endpoints.CORE}pending/cancel`);
    } catch (error) {
      this.props.onErrorInRequest(error);
    }
  }

  render() {
    return (
      <Modal
        visible={this.props.showModal}
      >
        <View>
          <Text>Pending Transaction</Text>
        </View>
        <View>
          <TouchableOpacity
            onPress={this.recheckPendingTransaction}
          >
            <Text>Recheck transaction</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.remindSupportOfPending()}
          >
            <Text>Remind support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={this.cancelPendingTransaction()}
          >
            <Text>Cancel transaction</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    )
  }

}