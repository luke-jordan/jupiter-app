import React from 'react';

import { StyleSheet, Text, View, TouchableOpacity, Image, Modal } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

export default class GameResultModal extends React.PureComponent {
  
  renderGameEndDialog() {
    
    const { gameDetails } = this.props;
    
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
    
    console.log('RENDERING END GAME DIALOG, SHOW MODAL : ', this.props.showModal);
    
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
              <Image
                style={styles.gameResultIcon}
                source={resultIcon}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={this.props.onCloseGameDialog} style={styles.closeDialog}>
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
              onPress={this.props.onCloseGameDialog}
              linearGradientProps={{
                colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                start: { x: 0, y: 0.5 },
                end: { x: 1, y: 0.5 },
              }}
            />
            <Text
              style={styles.gamePlayLater}
              onPress={this.props.onPressViewOtherBoosts}
            >
              View other boosts
            </Text>
          </View>
        </Modal>
      </View>
      );
    }
    
    render() {
      if (!this.props.gameDetails) {
        return null;
      }
      
      console.log('RERENDERING GAME DIALOG, RESULT: ', this.props.gameDetails.gameResult);
      
      if (!this.props.gameDetails.gameResult) {
        return this.renderGameStartDialog();
      } else {
        return this.renderGameEndDialog();
      }
      
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
    gameResultIcon: {
      height: 78,
      width: 127,
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
  