import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, Modal, Dimensions } from 'react-native';
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

// the need to use absolute positions etc in the grid requires these calculations
const { width, height } = Dimensions.get('window');
const topPadding = height > 640 ? 50 : 10;
const bottomPadding = height > 640 ? 30 : 5;

const IMAGE_WIDTH = 320;
const GRID_SIDE_LENGTH = 4;
const SIDE_PADDING = Math.max(0, (width - IMAGE_WIDTH) / 2);

const mapStateToProps = state => ({
  token: getAuthToken(state),
});

const mapPropsToDispatch = {
  updateBoostViewed,
  updateServerBalance,
}

const GAME_BACKGROUNDS = {
  'CREDIT_CARD': require('../../assets/credit-card.png'),
  'LOAN_SHARK': require('../../assets/loan-shark.png'),
  'PYRAMID_SCHEME': require('../../assets/pyramid-scheme.png'),
};

const GAME_TITLES = {
  'CREDIT_CARD': 'credit card',
  'LOAN_SHARK': 'loan shark',
  'PYRAMID_SCHEME': 'pyramid scheme',
};

class BreakingGame extends React.PureComponent {
  
  constructor(props) {
    super(props);

    const tapCounter = Array(GRID_SIDE_LENGTH).fill(Array(GRID_SIDE_LENGTH).fill(0));
    const opacityGrid = Array(GRID_SIDE_LENGTH).fill([...Array(GRID_SIDE_LENGTH).fill(1)]);

    this.state = {
      timeLimit: 5,
      gameTimer: 5,

      tapsPerSquare: 5,
      tapCounter,
      opacityGrid,

      gameInProgress: false,

      showGameResultModal: false,
    }
  }

  async componentDidMount() {
    const gameParams = this.props.navigation.getParam('gameParams');
    if (!gameParams) {
      LoggingUtil.logError(Error('Breaking game initiated with no parameters'));
      return;
    }

    this.setState({
      tapsPerSquare: gameParams.tapsPerSquare || 5,
      timeLimit: gameParams.timeLimitSeconds,
      gameTimer: gameParams.timeLimitSeconds,
      boostId: gameParams.boostId,
      gameImage: gameParams.gameImage,
    });

    LoggingUtil.logEvent('USER_PLAYED_BREAKING_GAME');
    this.startGame();
  }

  // eslint-disable-next-line react/sort-comp
  startGame() {
    this.setState({ gameInProgress: true },  () => {
      setTimeout(() => { this.decrementGameTimer(); }, 1000);
    });
  }

  // we want to change the reference to force a rerender which adjusts the opacity, but only necessary for one of them
  onPressElement = (rowNumber, columnNumber) => {
    if (!this.state.gameInProgress) {
      return;
    }

    const { tapCounter: oldTapCounter, opacityGrid: oldOpacity } = this.state;
    const newRow = [...oldTapCounter[rowNumber]];
    
    const numberTaps = oldTapCounter[rowNumber][columnNumber] + 1;
    if (numberTaps > this.state.tapsPerSquare) {
      return;
    }

    newRow[columnNumber] = numberTaps;
    const tapCounter = [...oldTapCounter];
    tapCounter[rowNumber] = newRow;

    // console.log('Opacity grid: ', JSON.stringify(opacityGrid));
    
    // console.log('Number taps: ', numberTaps, ' and taps per square: ', this.state.tapsPerSquare);
    const newItemOpacity = 1 - numberTaps / this.state.tapsPerSquare;

    const newOpacityRow = [...oldOpacity[rowNumber]];
    newOpacityRow[columnNumber] = newItemOpacity;
    const opacityGrid = [...oldOpacity];
    opacityGrid[rowNumber] = newOpacityRow;

    this.setState({ tapCounter, opacityGrid });
  }

  onPressDone = () => {
    this.setState({ showGameResultDialog: false, gameResult: null });
    this.props.navigation.navigate('Home');
  }

  onPressBoosts = () => {
    this.setState({ showGameResultDialog: false, gameResult: null });
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

  calculateOpacity = (rowNumber, columnNumber) => {
    const numberTaps = this.state[rowNumber][columnNumber];
    const proportionDestroyed = numberTaps / this.state.tapsPerSquare;
    return 1 - proportionDestroyed;
  }

  decrementGameTimer = () => {
    if (this.state.gameTimer > 0) {
      setTimeout(() => { this.decrementGameTimer(); }, 1000);
      this.setState({ gameTimer: this.state.gameTimer - 1 });
    } else {
      this.handleGameEnd();
    }
  };

  calculatePercentDestroyed() {
    const { tapCounter } = this.state;
    const summedRows = tapCounter.map((row) => row.reduce((sum, columnValue) => sum + columnValue, 0));
    const summedTaps = summedRows.reduce((sum, summedRow) => sum + summedRow, 0);
    return summedTaps * 100 / (this.state.tapsPerSquare * GRID_SIDE_LENGTH * GRID_SIDE_LENGTH);
  }

  handleGameEnd() {
    this.setState({ gameInProgress: false, showSubmittingModal: true }, () => {
      this.submitGameResults();
    });
  }

  async submitGameResults() {
    const resultOptions = {
      timeTaken: this.state.timeLimit,
      boostId: this.state.boostId,
      percentDestroyed: this.calculatePercentDestroyed(),
      authenticationToken: this.props.token,
    }

    const resultOfSubmission = await boostService.sendTapGameResults(resultOptions);
    // console.log('SUBMITTED : ', resultOfSubmission);
    if (!resultOfSubmission) {
      LoggingUtil.logError(Error('Result of game was null'));
      this.showErrorDialog();
    }

    this.showGameResultDialog(resultOfSubmission);
  }

  showErrorDialog() {
    this.setState({ 
      showSubmittingModal: false,
      showErrorDialog: true,
    });
  }

  async showGameResultDialog(resultOfGame) {
    const { amountWon, statusMet } = resultOfGame;
    const percentDestroyed = this.calculatePercentDestroyed();
    const gameResultParams = { ...resultOfGame, percentDestroyed, timeTaken: this.state.timeLimit };

    if (amountWon) {
      // want to force this, for now (but check speed)
      await this.updateBalance();
    }

    this.setState({
      showSubmittingModal: false,
      showGameResultDialog: true,
      gameResultParams,
    });

    // console.log('Statusses met: ', statusMet);
    if (Array.isArray(statusMet) && statusMet.length > 0) {
      statusMet.forEach((viewedStatus) => this.props.updateBoostViewed({ boostId: this.state.boostId, viewedStatus }));
    }
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

  // https://stackoverflow.com/questions/47362222/how-to-show-the-only-part-of-the-image
  renderGridElement(rowNumber, columnNumber, backgroundImage) {
    const GRID_ITEM_SQUARE_LENGTH = 80;

    const OFFSET_TOP = rowNumber * GRID_ITEM_SQUARE_LENGTH;
    const OFFSET_LEFT = columnNumber * GRID_ITEM_SQUARE_LENGTH;

    return (
      <TouchableWithoutFeedback 
        key={`row-${rowNumber}-column-${columnNumber}`}
        onPress={() => this.onPressElement(rowNumber, columnNumber)}
      >
        <View
          onPress={() => this.onPressElement(rowNumber, columnNumber)}
          style={{
            maxHeight: GRID_ITEM_SQUARE_LENGTH,
            maxWidth: GRID_ITEM_SQUARE_LENGTH,
            overflow: 'hidden',
            position: 'absolute',
            top: OFFSET_TOP,
            left: OFFSET_LEFT,
            borderColor: Colors.LIGHT_GRAY,
            borderRightWidth: columnNumber < (GRID_SIDE_LENGTH - 1) ? 1 : 0,
            borderBottomWidth: rowNumber < (GRID_SIDE_LENGTH - 1) ? 1 : 0,
          }}
        >
          <Image
            source={backgroundImage}
            style={{
              overflow: 'hidden',
              marginTop: -OFFSET_TOP,
              marginLeft: -OFFSET_LEFT,
              opacity: this.state.opacityGrid[rowNumber][columnNumber],
            }}  
          />
        </View>
      </TouchableWithoutFeedback>
    )
  }

  renderGridRow(rowNumber, backgroundImage) {
    return (
      <View key={`row-${rowNumber}`} style={styles.gridRow}>
        {Array(GRID_SIDE_LENGTH).fill().map((_, index) => this.renderGridElement(rowNumber, index, backgroundImage))}
      </View>
    )
  }

  renderGrid() {
    const backgroundImage = this.state.gameImage ? GAME_BACKGROUNDS[this.state.gameImage] : GAME_BACKGROUNDS.CREDIT_CARD;
    return Array(GRID_SIDE_LENGTH).fill().map((_, index) => this.renderGridRow(index, backgroundImage));
  }

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
          style={styles.gradientContainer}
        >
          <Text style={styles.gameHeader}>
            Break the {this.state.gameImage ? GAME_TITLES[this.state.gameImage] : 'credit card'}
          </Text>
          <View style={styles.imageHolder}>
            {this.renderGrid()}
          </View>
          <View style={styles.gameTimerHolder}>
            <Text style={styles.gameTimer}>
              {this.state.gameTimer}
            </Text>
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
  gameHeader: {
    fontFamily: 'poppins-regular',
    fontSize: 24,
    color: Colors.WHITE, 
    width: '100%',
    textAlign: 'center',
    marginTop: topPadding,
    marginBottom: 30,
  },
  gameTimerHolder: {
    justifyContent: 'flex-end',
  },
  gameTimer: {
    fontFamily: 'poppins-regular',
    color: Colors.GOLD,
    fontSize: 45,
    marginBottom: bottomPadding,
    width: '100%',
    textAlign: 'center',
  },
  imageHolder: {
    flex: 1,
    paddingHorizontal: SIDE_PADDING,
  },
  gridRow: {
    flexDirection: 'row',
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

export default connect(mapStateToProps, mapPropsToDispatch)(BreakingGame);