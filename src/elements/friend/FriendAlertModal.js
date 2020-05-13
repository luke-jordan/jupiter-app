import React from 'react';

import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Overlay, Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

export default class FriendAlertModal extends React.PureComponent {

  render() {
    const { friendAlertData } = this.props;
    if (!friendAlertData) {
      return;
    }

    const { alertStatus, logsOfType, alertLog } = friendAlertData;

    let alertType = 'UNKNOWN_TYPE';
    if (alertStatus === 'SINGLE_ALERT') {
      alertType = alertLog ? alertLog.logType : 'UNKNOWN_TYPE';
    } else if (alertStatus === 'MULTIPLE_ALERTS') {
      alertType = logsOfType;
    }

    const showRequestsBtn = alertType === 'FRIENDSHIP_REQUESTED';
    
    let modalTitle = '';
    let modalBody = '';
    
    switch (alertType) {
      case 'FRIENDSHIP_REQUESTED':
        modalTitle = 'Saving Buddy Request';
        modalBody = 'You have one or more new buddy requests! Please go to the buddy request page to view them';
        break;
      case 'FRIENDSHIP_ACCEPTED':
        modalTitle = 'Saving Buddy Connected';
        modalBody = 'Great news! Your buddy request has been accepted. Your new saving buddy is now connected';
        break;
      case 'MULTIPLE_TYPES':
      case 'UNKNOWN_TYPE':
      default:
        modalTitle = 'Saving Buddy Alert';
        modalBody = 'A bunch has happened while you were away! You have new saving buddies and new requests. Check your buddy list and requests to see the details!'
    }

    return (
      <Overlay
        isVisible={this.props.isVisible}
        animationType="fade"
        width="90%"
        height="auto"
        onRequestClose={this.props.onRequestClose}
        onBackdropPress={this.props.onRequestClose}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>
            {modalTitle}
          </Text>
          <Text style={styles.modalBody}>
            {modalBody}
          </Text>
          {showRequestsBtn && (
            <Button
              title="VIEW REQUESTS"
              onPress={this.props.onPressViewRequests}
              titleStyle={styles.goToRequestsBtnTitle}
              buttonStyle={styles.goToRequestsBtnStyle}
              containerStyle={styles.goToRequestsBtnContainerStyle}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
          )}
          <TouchableOpacity style={styles.closeDialog} onPress={this.props.onRequestClose}>
            <Image source={require('../../../assets/close.png')} resizeMode="contain" style={{ width: 25 }} />
          </TouchableOpacity>
        </View>
      </Overlay>
    )
  }

}

const styles = StyleSheet.create({
  modalContainer: {
    marginTop: 'auto',
    marginHorizontal: 15,
    marginBottom: 'auto',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    paddingBottom: 15,
    justifyContent: 'center',
  },  
  modalHeader: {
    fontFamily: 'poppins-semibold',
    fontSize: 18,
    color: Colors.DARK_GRAY,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
  },
  modalBody: {
    fontFamily: 'poppins-regular',
    fontSize: 14,
    color: Colors.MEDIUM_GRAY,
  },
  goToRequestsBtnContainerStyle: {
    marginTop: 20,
    paddingHorizontal: 15,
    minWidth: '80%',
  },
  goToRequestsBtnStyle: {
    height: 55,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  goToRequestsBtnTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.WHITE,
  },
  closeDialog: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});