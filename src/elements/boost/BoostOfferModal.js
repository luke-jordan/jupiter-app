import moment from 'moment';
import React from 'react';
import { Modal, StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';
import { formatStringTemplate, getCurrencySymbol, getFormattedValue, hasDecimals } from '../../util/AmountUtil';

import getSomeActionToTake from '../../modules/boost/helpers/getSomeActionToTake';

const closeImage = require('../../../assets/close.png');

const DEFAULT_TITLE = {
  'SIMPLE': 'Get rewarded for saving!',
  'GAME': 'Unlock a boost game!',
}

const DEFAULT_BODY = {
  'SIMPLE': 'Save {boostThresholdFormatted} before {boostExpiryFormatted} and you will be rewarded with {boostAmountFormatted}. Save now to get your reward!',
  'GAME': 'Save {boostThresholdFormatted} before {boostExpiryFormatted} and you can play a game that might win you {boostAmountFormatted}. Save now to play!',
}

const BoostOfferModal = ({
  showModal,
  hideModal,
  boostMessage,
  boostDetails,
  navigation,
}) => {

  // these provide the ability to customize messages in time, with safe defaults now
  const title = (boostMessage && boostMessage.title) || DEFAULT_TITLE[boostDetails.boostType] || DEFAULT_TITLE.SIMPLE;
  const bodyTemplate = (boostMessage && boostMessage.body) || DEFAULT_BODY[boostDetails.boostType] || DEFAULT_BODY.SIMPLE;

  const actionToTake = (boostMessage && boostMessage.actionToTake) || 'ADD_CASH';
  
  const boostThresholdFormatted = boostDetails.boostThreshold 
    ? `${getCurrencySymbol(boostDetails.boostCurrency)}${boostDetails.boostThreshold.toFixed(0)}` : 'ERROR';
  const boostExpiryFormatted = moment(boostDetails.endTime).format('dddd DD MMM [at] hA');
  const currency = getCurrencySymbol(boostDetails.boostCurrency);
  
  const amountHasDecimals = hasDecimals(boostDetails.boostAmount, boostDetails.boostUnit);
  const boostAmountFormatted = `${currency}${getFormattedValue(boostDetails.boostAmount, boostDetails.boostUnit, amountHasDecimals ? 2 : 0)}`;
    
  const stringParameters = { boostThresholdFormatted, boostExpiryFormatted, boostAmountFormatted };
  
  const bodyText = formatStringTemplate(bodyTemplate, stringParameters);

  // Get button handler and label depending on the `actionToTake`
  const { onPressHandler, buttonLabel } = getSomeActionToTake(actionToTake);

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
              source={require('../../../assets/group_7.png')}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={hideModal} style={styles.closeDialog}>
              <Image source={closeImage} />
            </TouchableOpacity>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.textTitle}>{title}</Text>
            <Text style={styles.content}>{bodyText}</Text>
          </View>
          <Button
            title={buttonLabel}
            titleStyle={styles.buttonTitleStyle}
            buttonStyle={styles.buttonStyle}
            containerStyle={styles.buttonContainerStyle}
            onPress={() => onPressHandler(navigation, hideModal, boostDetails.boostThreshold, boostDetails.boostId)}
            linearGradientProps={{
              colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }}
          />
          <TouchableOpacity
            style={styles.playLaterContainer}
            onPress={hideModal}
          >
            <Text style={styles.playLaterContent}>Close</Text>
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
  textTitle: {
    color: Colors.DARK_GRAY,
    fontSize: 18,
    fontFamily: 'poppins-semibold',
  },
  image: {
    height: 100,
    width: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 25,
    paddingHorizontal: 16,
  },
  closeDialog: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingVertical: 18,
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

export default BoostOfferModal;
