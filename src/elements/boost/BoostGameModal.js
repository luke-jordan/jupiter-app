import React from 'react';

import { StyleSheet, Text, View, TouchableOpacity, Image, Modal } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

export default class BoostGameModal extends React.PureComponent {
          
    getTitle() {
      return this.props.gameDetails.customTitle || 'Boost Challenge Unlocked!';
    };
    
    getPrimaryMessage() {
      const { gameDetails } = this.props;
      
      if (gameDetails.customStartMessage) {
        return gameDetails.customStartMessage;
      }
      
      if (gameDetails.gameType === 'TAP_SCREEN' || gameDetails.gameType === 'CHASE_ARROW') {
        return `Your top up was successful and you now stand a chance to win ${gameDetails.boostAmount}. Follow the instructions below to play the game:`;
      }
      
      return 'Game failure, please contact support';
    }
    
    getInstructionStrap = () => {
      const { gameDetails } = this.props;

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
    