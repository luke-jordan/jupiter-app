import React from 'react';

import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

const BoostGameModal = ({
    gameDetails,
    onCloseGameDialog,
    onPressViewOtherBoosts,
    onPressStartGame,
    onPressPlayLater,
}) => {

    const getGameDetailsBody = (body) => {
      let taps = 0;
      if (this.tapScreenGameTaps && this.tapScreenGameTaps > 0)
        taps = this.tapScreenGameTaps;
      else if (this.chaseArrowGameTaps && this.chaseArrowGameTaps > 0)
        taps = this.chaseArrowGameTaps;
      if (body.includes('#{numberUserTaps}')) {
        body = body.replace('#{numberUserTaps}', taps);
      }
      return body;
    }

    const renderGameEndDialog = () => {
        return (
          <View style={styles.gameDialog}>
            <Text style={styles.helpTitle}>{gameDetails.title}</Text>
            <Text style={styles.gameInfoBody}>
              {getGameDetailsBody(gameDetails.body)}
            </Text>
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
            <TouchableOpacity
              style={styles.closeDialog}
              onPress={onCloseGameDialog}
            >
              <Image source={require('../../../assets/close.png')} />
            </TouchableOpacity>
          </View>
        );
      }
    
      const renderGameStartDialog = () => {
        return (
          <View style={styles.gameDialog}>
            <Text style={styles.helpTitle}>{gameDetails.title}</Text>
            <Text style={styles.gameInfoBody}>
              {getGameDetailsBody(gameDetails.body)}
            </Text>
            <View style={styles.gameInstructions}>
              <View style={styles.gameInstructionsRow}>
                <Image
                  style={styles.gameInstructionsImage}
                  resizeMode="contain"
                  source={require('../../../assets/clock.png')}
                />
                <Text style={styles.gameInstructionsText}>
                  {gameDetails.actionContext.gameParams.instructionBand}
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
        );
      }

    if (!gameDetails) return null;

    if (gameDetails.actionContext.gameParams) {
        return renderGameStartDialog(gameDetails);
    } else {
        return renderGameEndDialog(gameDetails);
    }

};

const styles = StyleSheet.create({
  gameDialog: {
    width: '90%',
    minHeight: 380,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
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
    marginVertical: 10,
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
    fontSize: 13,
    textAlignVertical: 'center',
    marginLeft: 5,
  },
  gamePlayLater: {
    marginTop: -10,
    color: Colors.PURPLE,
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default BoostGameModal;
