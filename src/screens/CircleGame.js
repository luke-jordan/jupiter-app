import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, Text, Image, TouchableOpacity, Modal, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import GameResultModal from '../elements/boost/GameResultModal';
import NavigationBar from '../elements/NavigationBar';

import { boostService } from '../modules/boost/boost.service';

import { LoggingUtil } from '../util/LoggingUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { updateBoostViewed } from '../modules/boost/boost.actions';
import { updateServerBalance } from '../modules/balance/balance.actions';

import { Colors, Endpoints } from '../util/Values';
import { getRequest } from '../modules/auth/auth.helper';

const mapStateToProps = state => ({
  token: getAuthToken(state),
});

const mapPropsToDispatch = {
  updateBoostViewed,
  updateServerBalance,
};

const { width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;

const CIRCLE_ROTATION_DURATION = 6000;
const CIRCLE_SCALE_DURATION = 200;

class CircleGame extends React.PureComponent {
  
  constructor(props) {
    super(props);

    this.state = {
      gameParams: null,

      tapScreenGameMode: false,
      chaseArrowGameMode: false,
      showSubmittingModal: false,

      arrowRotation: new Animated.Value(0),
      circleScale: new Animated.Value(0),
    }
  }

  async componentDidMount() {
    const gameParams = this.props.navigation.getParam('gameParams');
    if (!gameParams) {
      LoggingUtil.logError(Error('Tap or arrow game initiated with no parameters'));
      return;
    }

    LoggingUtil.logEvent(`USER_PLAYED_${gameParams.gameType}`);

    this.setState({ gameParams }, () => this.startGame());
  }

  // CORE GAME HANDLING

  // eslint-disable-next-line react/sort-comp
  startGame() {
    if (this.state.gameParams.gameType === 'TAP_SCREEN') {
      this.startTapGame();
    } else {
      this.startArrowGame();
    }
  }

  startTapGame() {
    const { gameParams } = this.state;
    this.setState({
      tapScreenGameMode: true,
      tapScreenGameTimer: gameParams.timeLimitSeconds,
    }, () => {
      this.tapScreenGameTaps = 0;
    
      setTimeout(() => {
        this.handleTapScreenGameEnd();
      }, gameParams.timeLimitSeconds * 1000);
      
      setTimeout(() => {
        this.decrementTapScreenGameTimer();
      }, 1000);
      
    });

    // console.log('&&& ROTATING');
    this.rotateGameCircle(1); // since we still want this effect
  }

  startArrowGame() {
    const { gameParams } = this.state;
    this.setState({
      chaseArrowGameMode: true,
      chaseArrowGameTimer: gameParams.timeLimitSeconds,
      arrowRotation: new Animated.Value(0),
    }, () => {
      this.chaseArrowGameTaps = 0;

      setTimeout(() => {
        this.handleChaseArrrowGameEnd();
      }, gameParams.timeLimitSeconds * 1000);
      setTimeout(() => {
        this.decrementChaseArrowGameTimer();
      }, 1000);
  
      this.rotateGameCircle(gameParams.arrowSpeedMultiplier);  
    });
  }

  scaleCircle() {
    Animated.timing(this.state.circleScale, {
      toValue: 1,
      duration: CIRCLE_SCALE_DURATION,
      easing: Easing.linear,
    }).start(() => {
      this.setState({
        circleScale: new Animated.Value(0),
      });
    });
  };

  decrementTapScreenGameTimer = () => {
    if (this.state.tapScreenGameTimer > 0) {
      setTimeout(() => { this.decrementTapScreenGameTimer(); }, 1000);
    }
    this.setState({ tapScreenGameTimer: this.state.tapScreenGameTimer - 1 });
  };

  handleTapScreenGameEnd = () => {
    this.setState({ tapScreenGameMode: false, showSubmittingModal: true });
    this.submitGameResults(this.tapScreenGameTaps);
  };

  decrementChaseArrowGameTimer = () => {
    if (this.state.chaseArrowGameTimer > 0) {
      setTimeout(() => { this.decrementChaseArrowGameTimer(); }, 1000);
    }
    this.setState({ chaseArrowGameTimer: this.state.chaseArrowGameTimer - 1 });
  };

  handleChaseArrrowGameEnd = () => {
    this.setState({ chaseArrowGameMode: false, showSubmittingModal: true });
    this.submitGameResults(this.chaseArrowGameTaps);    
  };

  async submitGameResults(numberOfTaps) {
    LoggingUtil.logEvent('GAME_USER_COMPLETED');

    const { gameParams } = this.state;
    const resultOptions = { 
      numberTaps: numberOfTaps, 
      timeTaken: gameParams.timeLimitSeconds,
      boostId: gameParams.boostId,
      authenticationToken: this.props.token,
    };

    const resultOfGame = await boostService.sendTapGameResults(resultOptions);
    // seems to sometimes abort before completion on iPhones -- not showing the result is not great, but better than a crash
    // console.log('Result of game in new screen: ', resultOfGame);
    if (!resultOfGame) {
      LoggingUtil.logError(Error('Result of game was null'));
      this.showErrorDialog();
      return;
    }

    this.handleGameResult(numberOfTaps, resultOfGame);
  }

  async handleGameResult(numberOfTaps, resultOfGame) {
    
    const { amountWon, statusMet } = resultOfGame;
  
    const gameResultParams = { ...resultOfGame, numberOfTaps, timeTaken: this.state.gameParams.timeLimitSeconds };

    if (amountWon) {
      // want to force this, for now (but check speed)
      await this.updateBalance();
    }
  
    if (Array.isArray(statusMet) && statusMet.length > 0) {
      statusMet.forEach((viewedStatus) => this.props.updateBoostViewed({ boostId: this.state.gameParams.boostId, viewedStatus }));
    }

    this.tapScreenGameTaps = 0;
    this.chaseArrowGameTaps = 0;

    this.setState({
      gameResultParams,
      showSubmittingModal: false,
      showGameResultDialog: true,
      tapScreenGameTimer: 0,
      chaseArrowGameTimer: 0,
    });

    // console.log('Statusses met: ', statusMet);
    if (Array.isArray(statusMet) && statusMet.length > 0) {
      statusMet.forEach((viewedStatus) => this.props.updateBoostViewed({ boostId: this.state.boostId, viewedStatus }));
    }
  }

  onPressTapScreenGame = () => {
    this.tapScreenGameTaps += 1;
    this.scaleCircle();
    this.forceUpdate();
  };

  onPressArrow = () => {
    if (this.state.chaseArrowGameMode) {
      this.chaseArrowGameTaps += 1;
      this.scaleCircle();
      this.forceUpdate();
    }
  };

  // BUNCH OF HANDLERS

  onPressDone = () => {
    this.setState({ showGameResultDialog: false, gameResultParams: null });
    this.props.navigation.navigate('Home', { makeWheelGold: true });
  }

  onPressBoosts = () => {
    this.setState({ showGameResultDialog: false, gameResultParams: null });
    this.props.navigation.navigate('Boosts');
  }

  onPressErrorGoHome = () => {
    this.setState({ showErrorDialog: false });
    this.props.navigation.navigate('Home');
  }

  onPressErrorSupport = () => {
    this.setState({ showErrorDialog: false });
    this.props.navigation.navigate('Support');
  }

  showErrorDialog() {
    this.setState({ 
      showSubmittingModal: false,
      showErrorDialog: true,
    });
  }

  async updateBalance() {
    // do this and return, so on home screen balance is correct
    try {
      const url = `${Endpoints.CORE}balance`; 
      const balanceResult = await getRequest({  token: this.props.token, url });

      if (!balanceResult.ok) {
        LoggingUtil.logApiError(url, balanceResult);
        throw balanceResult;
      }

      const serverBalance = await balanceResult.json();
      // console.log('Retrieved server balance after game: ', serverBalance);
      this.props.updateServerBalance(serverBalance);
    } catch (err) {
      console.log('ERROR fetching new balance: ', JSON.stringify(err));
    }
  }

  // /////////////////////////////////////////////////////////////////////////////
  // /////////////////// MAIN RENDER METHODS ////////////////////////////////////
  // /////////////////////////////////////////////////////////////////////////////

  renderTapCounter() {
    let taps = 0;
    let timer = 0;
    if (this.state.tapScreenGameMode) {
      taps = this.tapScreenGameTaps ? this.tapScreenGameTaps : 0;
      timer = this.state.tapScreenGameTimer ? this.state.tapScreenGameTimer : 0;
    } else if (this.state.chaseArrowGameMode) {
      taps = this.chaseArrowGameTaps ? this.chaseArrowGameTaps : 0;
      timer = this.state.chaseArrowGameTimer ? this.state.chaseArrowGameTimer : 0;
    }
    return (
      <View style={styles.tapCounterWrapper}>
        <Text style={styles.tapDisplay}>{taps}</Text>
        <Text style={styles.timerStyle}>
          {timer} {timer === 1 ? ' second' : ' seconds'} left
        </Text>
      </View>
    );
  }

  rotateGameCircle(arrowSpeedMultiplier) {
    const rotationDuration = CIRCLE_ROTATION_DURATION / arrowSpeedMultiplier;
    Animated.timing(this.state.arrowRotation, {
      toValue: 1,
      duration: rotationDuration,
      easing: Easing.linear,
    }).start(() => {
      this.setState({ arrowRotation: new Animated.Value(0) }, () => this.rotateGameCircle(arrowSpeedMultiplier));
    });
  };

  renderRotatingArrow() {
    const gameCircleRotation = this.state.arrowRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    let circleScale = 1;
    if (this.state.tapScreenGameMode || this.state.chaseArrowGameMode) {
      circleScale = this.state.circleScale.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.04],
      });
    }

    return (
      <>
        <Image
          style={styles.coloredCircle}
          source={require('../../assets/oval.png')}
        />
        {this.state.chaseArrowGameMode ? (
          <Animated.View
            style={[
              styles.whiteCircle,
              {
                transform: [
                  { rotate: gameCircleRotation },
                  { scale: circleScale },
                ],
              },
            ]}
          >
            <Image
              source={require('../../assets/circle.png')}
              style={styles.animatedViewCircle}
              resizeMode="cover"
            />
            <TouchableOpacity
              activeOpacity={1}
              style={styles.animatedViewArrow}
              onPress={this.onPressArrow}
            >
              <Image source={require('../../assets/arrow.png')} />
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View
            style={[
              styles.whiteCircle,
              {
                transform: [
                  { rotate: gameCircleRotation },
                  { scale: circleScale },
                ],
              },
            ]}
          >
            <Image
              source={require('../../assets/circle.png')}
              style={styles.animatedViewCircle}
              resizeMode="cover"
            />
            <View style={styles.animatedViewArrow}>
              <Image source={require('../../assets/arrow.png')} />
            </View>
          </Animated.View>
        )}
      </>
    )
  }

  render() {
    return (
      <View style={styles.container}>
        
        <LinearGradient colors={[Colors.LIGHT_BLUE, Colors.PURPLE]} style={styles.gradientContainer}>

          <View style={styles.backgroundImageWrapper}>
            <Image
              style={styles.backgroundLines}
              source={require('../../assets/stars.png')}
              resizeMode="contain"
            />
          </View>

          <View style={styles.mainContent}>
            <View style={styles.circlesWrapper}>
              {this.renderRotatingArrow()}
            </View>

            {this.renderTapCounter()}
          
          </View>

          <NavigationBar navigation={this.props.navigation} currentTab={0} disabled />
          
          {this.state.showSubmittingModal && (
            <Modal
              animationType="slide"
              transparent
              visible={this.state.showSubmittingModal}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Submitting...</Text>
              </View>
            </Modal>
          )}
          {this.state.showErrorDialog && (
            <Modal
              animationType="slide"
              transparent
              visible={this.state.showErrorDialog}
            >
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Sorry! There was an error submitting the game.
                  Please <Text style={styles.modalLink} onPress={this.onPressErrorSupport}>contact support</Text> or go{' '}
                  <Text onPress={this.onPressErrorGoHome} style={styles.modalLink}>back to home</Text>
                </Text>
              </View>
            </Modal>
          )}
          {this.state.showGameResultDialog && (
          <GameResultModal
            showModal={this.state.showGameResultDialog}
            resultOfGame={this.state.gameResultParams}
            onPressViewOtherBoosts={this.onPressBoosts}
            onCloseGameDialog={this.onPressDone}
          />
          )}

          {this.state.tapScreenGameMode && (
            <TouchableOpacity style={styles.tapScreenGameWrapper} onPress={this.onPressTapScreenGame} />
          )}

        </LinearGradient>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_GRAY,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
  },
  backgroundImageWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  tapScreenGameWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  tapCounterWrapper: {
    alignItems: 'center',
  },
  tapDisplay: {
    color: Colors.WHITE,
    fontSize: 13 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    lineHeight: 70,
  },
  timerStyle: {
    color: Colors.WHITE,
    fontSize: 5 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    lineHeight: 50,
  },
  circlesWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whiteCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width,
    height: width,
  },
  animatedViewArrow: {
    position: 'absolute',
    left: '10%',
    top: '71.8%',
  },
  animatedViewCircle: {
    position: 'absolute',
    width: width * 1.1,
    height: width * 1.1,
  },
  coloredCircle: {
    position: 'absolute',
    width: width * 0.895,
    height: width * 0.895,
  },
  modalContent: {
    marginTop: 'auto',
    marginHorizontal: 40,
    marginBottom: 'auto',
    minHeight: 120,
    backgroundColor: Colors.WHITE,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalText: {
    color: Colors.DARK_GRAY,
    fontSize: 20,
    fontFamily: 'poppins-semibold',
    marginTop: 'auto',
    marginBottom: 'auto',
    padding: 10,
  },
  modalLink: {
    color: Colors.PURPLE,
  },
});

export default connect(mapStateToProps, mapPropsToDispatch)(CircleGame);
