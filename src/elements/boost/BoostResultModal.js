import React from 'react';
import { Modal, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';
import { formatStringTemplate, standardFormatAmount, hasDecimals } from '../../util/AmountUtil';

import { BoostStatus } from '../../modules/boost/models/index';

const DEFAULT_TITLES = {
    [BoostStatus.REDEEMED]: 'Congratulations!',
    [BoostStatus.EXPIRED]: 'Missed a boost!',
};

const DEFAULT_BODY = {
    [BoostStatus.REDEEMED]: 'Congrats! By being awesome and making smart decisions to grow your savings, Jupiter has rewarded you with a {boostAwardedAmount} boost! It\'s already in your MoneyWheel - keep it up :-)',
    [BoostStatus.EXPIRED]: 'That\'s a shame! You missed a boost that would have been worth {boostAwardedAmount}! Keep checking into the Jupiter app to not miss future rewards',
};

const hideAndNavigage = (screen, navigation, hideModal) => {
  navigation.navigate(screen);
  hideModal();
}

const BoostResultModal = ({
  showModal,
  hideModal,
  boostMessage,
  boostDetails,
  navigation,
}) => {

    let title = '';
    let body = '';

    const newStatus = boostDetails.boostStatus;

    if (boostMessage) {
        title = boostMessage.title || DEFAULT_TITLES[newStatus];
        body = boostMessage.body || DEFAULT_BODY[newStatus];
    } else {
        title = DEFAULT_TITLES[newStatus];
        body = DEFAULT_BODY[newStatus];
    }

    if (newStatus === 'REDEEMED' || newStatus === 'EXPIRED') {
      const amountHasDecimals = hasDecimals(boostDetails.boostAmount, boostDetails.boostUnit);
      boostDetails.boostAwardedAmount = standardFormatAmount(boostDetails.boostAmount, boostDetails.boostUnit, boostDetails.boostCurrency, amountHasDecimals ? 2 : 0);
    }

    body = formatStringTemplate(body, boostDetails);
    
    return (
      <View style={styles.backgroundWrapper}>
        <Modal
          animationType="slide"
          transparent
          visible={showModal}
          onRequestClose={() => {}}
        >
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Image
                style={styles.image}
                source={newStatus === 'EXPIRED' 
                  ? require('../../../assets/boost_failure.png') 
                  : require('../../../assets/boost-success-smiley.png')}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={hideModal} style={styles.closeDialog}>
                <Image source={require('../../../assets/close.png')} />
              </TouchableOpacity>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.textTitle}>{title}</Text>
              <Text style={styles.content}>{body}</Text>
            </View>
            <Button
              title="DONE"
              onPress={hideModal}
              titleStyle={styles.buttonTitleStyle}
              buttonStyle={styles.buttonStyle}
              containerStyle={styles.buttonContainerStyle}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
                }}
            />
            <TouchableOpacity
              style={styles.playLaterContainer}
              onPress={() => hideAndNavigage('Boosts', navigation, hideModal)}
            >
              <Text style={styles.playLaterContent}>View other boosts</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    );
};

const styles = StyleSheet.create({
  backgroundWrapper: {
    position: 'absolute',
    opacity: 0.3,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.BLACK,
  },
  modalContainer: {
    marginTop: 'auto',
    marginHorizontal: 15,
    marginBottom: 'auto',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
  },
  image: {
    height: 78,
    width: 127,
  },
  closeDialog: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  textTitle: {
    marginTop: 18,
    color: Colors.DARK_GRAY,
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 21,
    paddingHorizontal: 16,
  },
  textContainer: {
    paddingHorizontal: 8,
    paddingTop: 18,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    textAlign: 'center',
    color: Colors.MEDIUM_GRAY,
    lineHeight: 22,
    fontSize: 15,
  },
  buttonTitleStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
    minWidth: 176,
  },
  buttonContainerStyle: {
    paddingTop: 18,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  playLaterContainer: {
    paddingTop: 17,
    paddingBottom: 27,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playLaterContent: {
    color: Colors.PURPLE,
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default BoostResultModal;
