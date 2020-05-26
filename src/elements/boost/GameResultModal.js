import React from 'react';
import moment from 'moment';

import { StyleSheet, Text, View, TouchableOpacity, Image, Modal } from 'react-native';
import { Button } from 'react-native-elements';

import { Colors } from '../../util/Values';

import { getCurrencySymbol, standardFormatAmountDict, formatPercent } from '../../util/AmountUtil';

export default class GameResultModal extends React.PureComponent {

  renderImmediateResponse (gameDetails) {

    let resultIcon; let resultHeader; let resultBody = '';

    console.log('Game details: ', gameDetails);
  
    const { gameResult, endTime } = gameDetails;
    
    switch(gameResult) {
      case 'REDEEMED': {
        resultIcon = require('../../../assets/boost-success-smiley.png');
        resultHeader = gameDetails.customTitle || 'Congratulations!';
        resultBody = `You've successfully completed the challenge and won ${gameDetails.amountWon}!\n` +
        `Keep being the speedy, smart saver you are to get a chance to unlock further boost challenges and save even more.`;
        break;
      }
      case 'PENDING': {
        resultIcon = require('../../../assets/boost_thumbs_up.png');
        resultHeader = gameDetails.customTitle || 'Nice Work!';
        const resultClause = endTime ? `, in about ${moment(endTime).fromNow(true)}` : '';
        
        const tappedOrPercentClause = gameDetails.numberOfTaps 
          ? `tapped ${gameDetails.numberOfTaps} times` : `broke ${formatPercent(gameDetails.percentDestroyed)} of the credit card`;
        
        resultBody = `You ${tappedOrPercentClause} in ${gameDetails.timeTaken} seconds!\n` +
          `Winners of the challenge will be notified when time is up${resultClause}. Good luck!`;
        break;
      }
      case 'FAILED': {
        resultIcon = require('../../../assets/boost_failure.png');
        resultHeader = gameDetails.customTitle || 'Sorry, better luck next time!';
        resultBody = `You missed out on this boost challenge, but keep an eye out for future boosts to earn more towards your savings!`;
        break;
      }
      default: {
        console.log('Error, should not happen');
      }
    }
    
    return (
      <>
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
      </>
    )
  }
  
  renderTournamentResult (gameDetails) {
    const userWon = gameDetails.gameResult === 'REDEEMED';
    const { accountScore, ranking, topScore, scoreType } = gameDetails.gameLog;
    const scoreIsPercent = scoreType === 'PERCENT';
    
    const title = userWon ? 'You won the boost challenge!' : 'The boost results are in!';

    const boostAwardAmount = `${getCurrencySymbol(gameDetails.boostCurrency)}${gameDetails.boostAmount}`
    const body = userWon ? `Congrats! ${boostAwardAmount} will be add to your Jupiter savings` : 'Thank you for taking part in this challenge';

    return (
      <>
        <View style={styles.header}>
          <Image
            style={styles.gameResultIcon}
            resizeMode="contain"
            source={userWon ? require('../../../assets/winner-boost-challenge.png') : require('../../../assets/boost-tournament-result.png')}
          />
          <TouchableOpacity onPress={this.props.onCloseGameDialog} style={styles.closeDialog}>
            <Image source={require('../../../assets/close.png')} />
          </TouchableOpacity>
        </View>
        <View style={styles.resultTextContainer}>
          <Text style={styles.textTitle}>{title}</Text>
          <Text style={styles.gameResultBody}>{body}</Text>
        </View>
        <View style={styles.rankContainer}>
          <Text style={styles.rankTitle}>YOUR RANK</Text>
          <Text style={styles.rankNumber}>{ranking}</Text>
        </View>
        {userWon ? (
          <View style={styles.tournamentWonScoreHolder}>
            <Text style={styles.tournamentScoreTitle}>Your Top Score</Text>
            <Text style={styles.tournamentScoreNumber}>{scoreIsPercent ? formatPercent(accountScore) : accountScore}</Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <View style={styles.tournamentLossScoreHolder}>
              <Text style={styles.tournamentScoreTitle}>Your Score</Text>
              <Text style={styles.tournamentScoreNumber}>{scoreIsPercent ? formatPercent(accountScore) : accountScore}</Text>
            </View>
            <View style={styles.tournamentLossScoreHolder}>
              <Text style={styles.tournamentScoreTitle}>Top Score</Text>
              <Text style={styles.tournamentScoreNumber}>{scoreIsPercent ? formatPercent(topScore) : topScore}</Text>
            </View>
          </View>
        )}
        <Button
          title="CLOSE"
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
      </>
    )
  }
  
        
  render() {
    if (!this.props.resultOfGame) {
      return null;
    }
    
    const { resultOfGame } = this.props;

    const { awardBasis, amountWon: amountWonDict, gameLog } = resultOfGame;
    const amountWon = amountWonDict ? standardFormatAmountDict(amountWonDict) : null;

    const isTournament = awardBasis === 'TOURNAMENT';

    if (isTournament && !gameLog) {
      console.log('Error, must be legacy : tournament with no outcome log');
      return null;
    }

    const gameDetails = { ...resultOfGame, amountWon };

    return (
      <View style={styles.backgroundWrapper}>
        <Modal
          animationType="slide"
          transparent
          visible={this.props.showModal}
          onRequestClose={this.props.onCloseGameDialog}
        >
          <View style={styles.gameDialog}>
            {isTournament ? this.renderTournamentResult(gameDetails) : this.renderImmediateResponse(gameDetails)}
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
      alignItems: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      width: '100%',
    },
    textTitle: {
      color: Colors.DARK_GRAY,
      fontSize: 18,
      lineHeight: 24,
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
    tournamentScoreTitle: {
      fontSize: 14, 
      fontFamily: 'poppins-regular', 
      color: Colors.MEDIUM_GRAY,      
    },
    tournamentScoreNumber: {
      fontSize: 25, 
      fontWeight: '600', 
      fontFamily: 'poppins-semibold', 
      color: Colors.DARK_GRAY,      
    },
    tournamentLossScoreHolder: {
      marginHorizontal: 7,
      paddingVertical: 10, 
      paddingHorizontal: 20, 
      backgroundColor: 
      Colors.BACKGROUND_GRAY, 
      borderRadius: 10, 
      justifyContent: 'center', 
      alignItems: 'center',
    },
    tournamentWonScoreHolder: { width: '75%', paddingVertical: 10, backgroundColor: Colors.BACKGROUND_GRAY, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    rankContainer: { width: '100%', alignItems: 'center', marginTop: 10 },
    rankTitle: { fontSize: 16, fontWeight: '600', fontFamily: 'poppins-semibold', color: Colors.DARK_GRAY },
    rankNumber: { lineHeight: 70, fontSize: 50, fontFamily: 'poppins-regular', color: Colors.YELLOW },
  });
  