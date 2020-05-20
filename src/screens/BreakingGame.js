import React from 'react';

import { StyleSheet, View, Text, TouchableWithoutFeedback, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import NavigationBar from '../elements/NavigationBar';

import { boostService } from '../modules/boost/boost.service';
import { LoggingUtil } from '../util/LoggingUtil';

import { Colors } from '../util/Values';

// the need to use absolute positions etc in the grid requires these calculations
const { width, height } = Dimensions.get('window');
const topPadding = height > 640 ? 50 : 10;
const bottomPadding = height > 640 ? 30 : 5;

const IMAGE_WIDTH = 320;
const GRID_SIDE_LENGTH = 4;
const SIDE_PADDING = Math.max(0, (width - IMAGE_WIDTH) / 2);

export default class BreakingGame extends React.PureComponent {
  
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
    }
  }

  async componentDidMount() {
    // const { gameParams } = this.props;
    // if (!gameParams) {
    //   return;
    // }

    // this.setState({
    //   tapsPerSquare: gameParams.tapsPerSquare || 5,
    // });

    LoggingUtil.logEvent('USER_PLAYED_BREAKING_GAME');
    this.startGame();
  }

  // eslint-disable-next-line react/sort-comp
  startGame() {
    this.setState({ gameInProgress: true },  () => {
      // set up so at end of game we are complete
      setTimeout(() => { this.handleGameEnd(); }, this.state.timeLimit * 1000);
      
      // initiate countdown for user
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

  calculateOpacity = (rowNumber, columnNumber) => {
    const numberTaps = this.state[rowNumber][columnNumber];
    const proportionDestroyed = numberTaps / this.state.tapsPerSquare;
    return 1 - proportionDestroyed;
  }

  decrementGameTimer = () => {
    if (this.state.gameTimer > 0) {
      setTimeout(() => { this.decrementGameTimer(); }, 1000);
      this.setState({ gameTimer: this.state.gameTimer - 1 });
    }
  };

  calculatePercentDestroyed() {
    const { tapCounter } = this.state;
    const summedRows = tapCounter.map((row) => row.reduce((sum, columnValue) => sum + columnValue, 0));
    const summedTaps = summedRows.reduce((sum, summedRow) => sum + summedRow, 0);
    return summedTaps / (this.state.tapsPerSquare * GRID_SIDE_LENGTH * GRID_SIDE_LENGTH);
  }

  handleGameEnd() {
    this.setState({ gameInProgress: false, showSubmittingModal: true }, () => {
      const percentDestroyed = this.calculatePercentDestroyed();
      console.log('Percent destroyed: ', percentDestroyed);
      this.submitGameResults();
    });
  }

  async submitGameResults() {
    const { gameParams } = this.state;
    const resultOptions = {
      timeTaken: gameParams,
      boostId: gameParams.boostId,
      percentDestroyed: this.calculatePercentDestroyed(),
    }

    const resultOfSubmission = await boostService.sendTapGameResults(resultOptions);
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

  showGameResultDialog(resultOfGame) {
    this.setState({
      showSubmittingModal: false,
      showGameResultDialog: true,
      resultOfGame,
    });

    if (resultOfGame.amountWon) {
      this.updateBalance();
    }
  }

  async updateBalance() {
    // do this and return
  }

  // https://stackoverflow.com/questions/47362222/how-to-show-the-only-part-of-the-image
  renderGridElement(rowNumber, columnNumber) {
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
            source={require("../../assets/credit-card.png")}
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

  renderGridRow(rowNumber) {
    return (
      <View key={`row-${rowNumber}`} style={styles.gridRow}>
        {Array(GRID_SIDE_LENGTH).fill().map((_, index) => this.renderGridElement(rowNumber, index))}
      </View>
    )
  }

  renderGrid() {
    return Array(GRID_SIDE_LENGTH).fill().map((_, index) => this.renderGridRow(index));
  }

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
          style={styles.gradientContainer}
        >
          <Text style={styles.gameHeader}>
            Break the credit card
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
});
