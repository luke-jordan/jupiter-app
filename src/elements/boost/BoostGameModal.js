import React from 'react';

import { StyleSheet, Text, View, TouchableOpacity, Image, Modal } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

const KNOWN_GAMES = ['TAP_SCREEN', 'CHASE_ARROW', 'DESTROY_IMAGE', 'MATCH_TILES'];

export default class BoostGameModal extends React.PureComponent {
          
    getTitle() {
      return this.props.gameDetails.customTitle || 'Boost Challenge Unlocked!';
    };
    
    getPrimaryMessage() {
      const { gameDetails } = this.props;
      
      if (gameDetails.customStartMessage) {
        return gameDetails.customStartMessage;
      }
      
      if (KNOWN_GAMES.includes(gameDetails.gameType)) {
        // console.log('Flags present ? :: ', gameDetails.flags);
        return gameDetails.flags && gameDetails.flags.includes('RANDOM_AMOUNT') ?
          `Play your game and you could win a random boost of up to ${gameDetails.boostAmount}` :
          `Your top up was successful and you now stand a chance to win ${gameDetails.boostAmount}`;
      }
      
      return 'Game failure, please contact support';
    }

    getSimpleThresholdStrap = (gameDetails) => {
      if (gameDetails.gameType === 'TAP_SCREEN') {
        return `Tap the screen at least ${gameDetails.winningThreshold} times in ${gameDetails.timeLimitSeconds} seconds`;
      }
      
      if (gameDetails.gameType === 'CHASE_ARROW') {
        return `Tap the arrow of the circle as it spins at least ${gameDetails.winningThreshold} times in ${gameDetails.timeLimitSeconds} seconds`;
      }

      if (gameDetails.gameType === 'DESTROY_IMAGE') {
        return `Break the image by tapping on the grid squares until they are gone - destroy at least ${gameDetails.winningThreshold}% in ${gameDetails.timeLimitSeconds} seconds`;
      }

      if (gameDetails.gameType === 'MATCH_TILES') {
        return `Flip tiles to see the pictures, and try to match at least ${gameDetails.winningThreshold} before the time is up!`
      }
    };

    getTournamentStrap = (gameDetails) => {
      const winnerPhrase = gameDetails.numberWinners === 1 ? 'top score' : `top ${gameDetails.numberWinners} scores`;

      if (gameDetails.gameType === 'TAP_SCREEN') {
        return `Tap the screen as much as you can in ${gameDetails.timeLimitSeconds} seconds! The ${winnerPhrase} will win the boost`;
      }
      
      if (gameDetails.gameType === 'CHASE_ARROW') {
        return `Tap the arrow of the circle as much as you can in ${gameDetails.timeLimitSeconds} seconds! The top ${gameDetails.numberWinners} scores will win the boost`;
      }

      if (gameDetails.gameType === 'DESTROY_IMAGE') {
        return `Tap the image grid to destroy as much of it as you can in ${gameDetails.timeLimitSeconds} seconds! The ${winnerPhrase} will win the boost`;
      }

      if (gameDetails.gameType === 'MATCH_TILES') {
        return `Flip tiles to see the pictures and match as many as you can! The most matches will win the boost`;
      }

    };
    
    getInstructionStrap = () => {
      const { gameDetails } = this.props;

      if (gameDetails.customInstructionBand) {
        return gameDetails.customInstructionBand;
      }

      if (gameDetails.winningThreshold) {
        return this.getSimpleThresholdStrap(gameDetails);
      }
      
      if (gameDetails.numberWinners) {
        return this.getTournamentStrap(gameDetails);
      }
      
      return 'Game failure, please contact support';
    }
    
    render() {
      if (!this.props.gameDetails) {
        return null;
      }

      return (
        <View style={styles.backgroundWrapper}>
          <Modal
            animationType="slide"
            transparent
            visible={this.props.showModal}
            onRequestClose={this.props.onCloseGameDialog}
          >
            <View style={styles.gameDialog}>
              <View style={styles.header}>
                <Text style={styles.textTitle}>{this.getTitle()}</Text>
                <TouchableOpacity onPress={this.props.onPressPlayLater} style={styles.closeDialog}>
                  <Image source={require('../../../assets/close.png')} />
                </TouchableOpacity>
              </View>
              <Text style={styles.gameInfoBody}>
                {this.getPrimaryMessage()}
              </Text>
              <View style={styles.gameInstructions}>
                <View style={styles.gameInstructionsRow}>
                  <Image
                    style={styles.gameInstructionsImage}
                    resizeMode="contain"
                    source={require('../../../assets/tapToScreen.png')}
                  />
                  <Text style={styles.gameInstructionsText}>
                    {this.getInstructionStrap()}
                  </Text>
                </View>
              </View>
              <Button
                title="START GAME"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.props.onPressStartGame}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
              />
              <Text style={styles.gamePlayLater} onPress={this.props.onPressPlayLater}>
                Play Later
              </Text>
            </View>
          </Modal>
        </View>
        );
      }
      
    }
    
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
    gameInfoBody: {
      color: Colors.MEDIUM_GRAY,
      fontFamily: 'poppins-regular',
      fontSize: 15,
      lineHeight: 20,
      textAlign: 'center',
    },
    gameInstructions: {
      backgroundColor: Colors.PURPLE_TRANSPARENT,
      borderRadius: 20,
      minHeight: 30,
      alignItems: 'center',
      width: '100%',
      marginVertical: 16,
      textAlignVertical: 'center',
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
      marginHorizontal: 8,
      marginTop: 'auto',
      marginBottom: 'auto',
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
    