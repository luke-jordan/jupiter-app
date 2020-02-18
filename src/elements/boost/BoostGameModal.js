import React from 'react';

import { StyleSheet, Text, View, TouchableOpacity, Image, Modal } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

const BoostGameModal = ({
    showModal,
    gameDetails,
    onCloseGameDialog,
    onPressViewOtherBoosts,
    onPressStartGame,
    onPressPlayLater,
}) => {

    const getTitle = () => {
      return gameDetails.customTitle || 'Boost Challenge Unlocked!';
    };

    const getPrimaryMessage = () => {
      if (gameDetails.customStartMessage) {
        return gameDetails.customStartMessage;
      }

      if (gameDetails.gameType === 'TAP_SCREEN' || gameDetails.gameType === 'CHASE_ARROW') {
        return `Your top up was successful and you now stand a chance to win ${gameDetails.boostAmount}. Follow the instructions below to play the game:`;
      }

      return 'Game failure, please contact support';
    }

    const getInstructionStrap = () => {
      if (gameDetails.customInstructionBand) {
        return gameDetails.customInstructionBand;
      }

      if (gameDetails.gameType === 'TAP_SCREEN') {
        return `Tap the screen at least ${gameDetails.winningThreshold} times in ${gameDetails.timeLimitSeconds} seconds`;
      }

      if (gameDetails.gameType === 'CHASE_ARROW') {
        return `Tap the arrow of the circle as it spins around as many times as you can in ${gameDetails.timeLimitSeconds} seconds`;
      }

      return 'Game failure, please contact support';
    }

    const renderGameStartDialog = () => {
      return (
        <View style={styles.backgroundWrapper}>
          <Modal
            animationType="slide"
            transparent
            visible={showModal}
            onRequestClose={onCloseGameDialog}
          >
            <View style={styles.gameDialog}>
              <View style={styles.header}>
                <Text style={styles.textTitle}>{getTitle()}</Text>
                <TouchableOpacity onPress={onPressPlayLater} style={styles.closeDialog}>
                  <Image source={require('../../../assets/close.png')} />
                </TouchableOpacity>
              </View>
              <Text style={styles.gameInfoBody}>
                {getPrimaryMessage(gameDetails)}
              </Text>
              <View style={styles.gameInstructions}>
                <View style={styles.gameInstructionsRow}>
                  <Image
                    style={styles.gameInstructionsImage}
                    resizeMode="contain"
                    source={require('../../../assets/tapToScreen.png')}
                  />
                  <Text style={styles.gameInstructionsText}>
                    {getInstructionStrap()}
                  </Text>
                </View>
              </View>
              <Button
                title="START GAME"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={onPressStartGame}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
              />
              <Text style={styles.gamePlayLater} onPress={onPressPlayLater}>
                Play Later
              </Text>
            </View>
          </Modal>
        </View>
      );
    }

    const renderGameEndDialog = () => {

      if (!['REDEEMED', 'PENDING', 'FAILED'].includes(gameDetails.gameResult)) {
        return null;
      }

      let resultIcon; let resultHeader; let resultBody = '';
      switch(gameDetails.gameResult) {
        case 'REDEEMED':
          resultIcon = require('../../../assets/boost-success-smiley.png');
          resultHeader = gameDetails.customTitle || 'Congratulations!';
          resultBody = `You've successfully completed the challenge and won ${gameDetails.amountWon}!\n` +
            `Keep being the speedy, smart saver you are to get a chance to unlock further boost challenges and save even more.`;
          break;
        case 'PENDING':
          resultIcon = require('../../../assets/boost_thumbs_up.png');
          resultHeader = gameDetails.customTitle || 'Nice Work!';
          resultBody = `You tapped ${gameDetails.numberOfTaps} times in ${gameDetails.timeTaken} seconds!\n` +
            'Winners of the challenge will be notified when time is up. Good luck!'
          break;
        case 'FAILED':
          resultIcon = require('../../../assets/boost_failure.png');
          resultHeader = gameDetails.customTitle || 'Sorry, better luck next time!';
          resultBody = `You missed out on this boost challenge, but keep an eye out for future boosts to earn more towards your savings!`;
          break;
        default:
          console.log('Error, should not happen');
      }

      return (
        <View style={styles.backgroundWrapper}>
          <Modal
            animationType="slide"
            transparent
            visible={showModal}
            onRequestClose={onCloseGameDialog}
          >
            <View style={styles.gameDialog}>
              <View style={styles.header}>
                <Image
                  style={styles.gameResultIcon}
                  source={resultIcon}
                  resizeMode="contain"
                />
                <TouchableOpacity onPress={onCloseGameDialog} style={styles.closeDialog}>
                  <Image source={require('../../../assets/close.png')} />
                </TouchableOpacity>
              </View>
              <View style={styles.resultTextContainer}>
                <Text style={styles.textTitle}>{resultHeader}</Text>
                <Text style={styles.gameResultBody}>
                  {resultBody}
                </Text>
              </View>
              <Button
                title="DONE"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={onCloseGameDialog}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
              />
              <Text
                style={styles.gamePlayLater}
                onPress={onPressViewOtherBoosts}
              >
                View other boosts
              </Text>
            </View>
          </Modal>
        </View>
      );
    }
    
    if (!gameDetails) return null;

    if (!gameDetails.gameResult) {
        return renderGameStartDialog(gameDetails);
    } else {
        return renderGameEndDialog(gameDetails);
    }

};

const styles = StyleSheet.create({
  backgroundWrapper: {
    position: 'absolute',
    opacity: 0.3,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.BLACK,
  },
  gameDialog: {
    marginTop: 'auto',
    marginBottom: 'auto',
    marginHorizontal: '5%',
    width: '90%',
    minHeight: 380,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  textTitle: {
    color: Colors.DARK_GRAY,
    fontSize: 18,
    fontFamily: 'poppins-semibold',
    textAlign: 'center',
    paddingHorizontal: 25, // to leave space for cross
  },
  closeDialog: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  gameResultIcon: {
    height: 78,
    width: 127,
  },
  gameInfoBody: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
  resultTextContainer: {
    marginTop: 10,
  },
  gameResultBody: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  gameInstructions: {
    backgroundColor: Colors.PURPLE_TRANSPARENT,
    borderRadius: 20,
    minHeight: 30,
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  gameInstructionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  gameInstructionsImage: {
    flex: 1,
  },
  gameInstructionsText: {
    flex: 5,
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    textAlignVertical: 'center',
    marginLeft: 5,
  },
  gamePlayLater: {
    marginTop: 10,
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
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
});

export default BoostGameModal;
