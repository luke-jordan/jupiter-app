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
  'WITHDRAWAL': 'Keep your savings growing!',
}

const DEFAULT_BODY = {
  'SIMPLE': 'Save {boostThresholdFormatted} before {boostExpiryFormatted} and you will be rewarded with {boostAmountFormatted}. Save now to get your reward!',
  'GAME': 'Save {boostThresholdFormatted} before {boostExpiryFormatted} and you can play a game that might win you {boostAmountFormatted}. Save now to play!',
  'WITHDRAWAL': 'We\'ve received your request to withdraw your savings, but to help grow your saving habit, we\'ll top you up by {boostAmountFormatted} if you leave the savings in Jupiter',
}

const FLAG_BODIES = {
  'SIMPLE': {
    'RANDOM_AMOUNT': 'Save {boostThresholdFormatted} before {boostExpiryFormatted} and you could win between {boostMin} and {boostMax}. Save now to get your reward!',
    'RANDOM_SELECTION': 'Save {boostThresholdFormatted} before {boostExpiryFormatted}, and you could get a boost of {boostAmountFormatted}! {numberSelected} will be chosen at random to win',
  },
  'GAME': {
    'RANDOM_AMOUNT': 'Save {boostThresholdFormatted} before {boostExpiryFormatted} and you get to play a game that could win you a random reward of up to {boostMax}!',
    'RANDOM_SELECTION': DEFAULT_BODY.GAME,
  },
  'WITHDRAWAL': {
    'RANDOM_SELECTION': 'To help grow your saving habit, if you cancel your pending withdrawal you\'ll have a chance to get a {boostAmountFormatted} boost! Just cancel the withdrawal, and each month {numberSelected} will get the boost!',
    'RANDOM_AMOUNT': 'We\'ve received your request to withdraw your savings, but to help grow your saving habit, we\'ll top you up by between {boostMin} and {boostMax} if you leave the savings in Jupiter'
  },
};

const obtainDefaultBody = (boostDetails) => {
  const { boostType, flags } = boostDetails;
  if (!flags || flags.length === 0) {
    return DEFAULT_BODY[boostType];
  }

  if (flags.includes('RANDOM_SELECTION') || flags.includes('RANDOM_AMOUNT')) {
    const firstFlag = flags.find((flag) => flag === 'RANDOM_SELECTION' || flag === 'RANDOM_AMOUNT'); // makes a little random but at present no case of both
    return FLAG_BODIES[boostType][firstFlag];
  }

  return DEFAULT_BODY[boostType];
};

const BoostOfferModal = ({
  showModal,
  hideModal,
  boostMessage,
  boostDetails,
  navigation,
}) => {

  // these provide the ability to customize messages in time, with safe defaults now
  const title = (boostMessage && boostMessage.title) || DEFAULT_TITLE[boostDetails.boostType] || DEFAULT_TITLE.SIMPLE;
  const bodyTemplate = (boostMessage && boostMessage.body) || obtainDefaultBody(boostDetails) || DEFAULT_BODY.SIMPLE;

  const defaultAction = boostDetails.boostType === 'WITHDRAWAL' ? 'CANCEL_WITHDRAWAL' : 'ADD_CASH';
  const actionToTake = (boostMessage && boostMessage.actionToTake) || defaultAction;
  
  const boostThresholdFormatted = boostDetails.boostThreshold 
    ? `${getCurrencySymbol(boostDetails.boostCurrency)}${boostDetails.boostThreshold.toFixed(0)}` : 'ERROR';
  const boostExpiryFormatted = moment(boostDetails.endTime).format('dddd DD MMM [at] hA');
  const currency = getCurrencySymbol(boostDetails.boostCurrency);
  
  const amountHasDecimals = hasDecimals(boostDetails.boostAmount, boostDetails.boostUnit);
  const boostAmountFormatted = `${currency}${getFormattedValue(boostDetails.boostAmount, boostDetails.boostUnit, amountHasDecimals ? 2 : 0)}`;
    
  const stringParameters = { boostThresholdFormatted, boostExpiryFormatted, boostAmountFormatted };
  
  // boostMin, boostMax, numberSelected
  if (boostDetails.flags && boostDetails.flags.includes('RANDOM_AMOUNT')) {
    const { rewardParameters } = boostDetails;
    const minAmount = rewardParameters && rewardParameters.minRewardAmountPerUser ? rewardParameters.minRewardAmountPerUser.amount : 1;
    const minUnit = rewardParameters && rewardParameters.minRewardAmountPerUser ? rewardParameters.minRewardAmountPerUser.unit : 'WHOLE_CURRENCY';
    stringParameters.boostMax = boostAmountFormatted;
    stringParameters.boostMin = `${currency}${getFormattedValue(minAmount, minUnit, 0)}`;
  }

  if (boostDetails.flags && boostDetails.flags.includes('RANDOM_SELECTION')) {
    const { statusConditions } = boostDetails;
    console.log('Status conditions: ', statusConditions);
    const randomCondition = statusConditions.REDEEMED.filter((condition) => condition.startsWith('randomly_chosen_first_N'));
    stringParameters.numberSelected = randomCondition.length > 0 ? randomCondition[0].match(/#{(.*)}/)[1] : 1;
  }

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
