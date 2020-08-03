import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';

import GameResultModal from '../elements/boost/GameResultModal';
import NavigationBar from '../elements/NavigationBar';

import { boostService } from '../modules/boost/boost.service';

import { LoggingUtil } from '../util/LoggingUtil';

import { getAuthToken } from '../modules/auth/auth.reducer';
import { updateBoostViewed } from '../modules/boost/boost.actions';
import { updateServerBalance } from '../modules/balance/balance.actions';

import { Colors, Endpoints } from '../util/Values';
import { getRequest } from '../modules/auth/auth.helper';

const { width, height } = Dimensions.get('window');

// feels like one more of these and we should create a holding component to reuse
// but for the moment, they are simple enough, and repeating elements are just a few lines
// and we'd have to pass some really complicated stuff in the parameters, so this is for now

const mapStateToProps = state => ({
  token: getAuthToken(state),
});

const mapPropsToDispatch = {
  updateBoostViewed,
  updateServerBalance,
};

const GRID_WIDTH = 4;
const GRID_HEIGHT = 5;

const TILE_WIDTH = Math.floor((width * 0.85) / GRID_WIDTH);
const TILE_HEIGHT = Math.floor((height * 0.55) / GRID_HEIGHT);

const TILE_COLORS = [Colors.LIGHT_BLUE, Colors.GOLD, Colors.NOTIF_RED, Colors.PURPLE];
const MAX_PER_COLOR = Math.ceil((GRID_WIDTH * GRID_HEIGHT) / TILE_COLORS.length);

const ICON_NAMES = ['rocket', 'watch', 'cup', 'bell', 'umbrella', 'piggy', 'music', 'smiley', 'heart', 'cash'];
const MAX_PER_ICON = Math.ceil((GRID_WIDTH * GRID_HEIGHT) / ICON_NAMES.length);

const backgroundImage = require('../../assets/logo_tile.png');

const selectArrayRandom = (list) => list[Math.floor(Math.random() * list.length)];

class MatchingGame extends React.PureComponent {
  
  constructor(props) {
    super(props);


    this.state = {
      timeLimit: 5,
      gameTimer: 5,

      // this guy is the heart of things, an array of array of icon types & background colors
      tileGrid: Array(GRID_HEIGHT).fill(Array(GRID_WIDTH).fill()),

      // then to record the user taps
      firstTapXY: [],
      secondTapXY: [],

      matchCounter: 0,

      gameInProgress: false,
      matchInProgress: false,
      showGameResultModal: false,
    }
  }

  async componentDidMount() {
    const gameParams = this.props.navigation.getParam('gameParams');
    if (!gameParams) {
      LoggingUtil.logError(Error('Match game initiated with no parameters'));
      return;
    }

    this.setState({
      timeLimit: gameParams.timeLimitSeconds,
      gameTimer: gameParams.timeLimitSeconds,
      boostId: gameParams.boostId,
    });

    LoggingUtil.logEvent('USER_PLAYED_MATCH_GAME');
    this.populateTiles();
    this.startGame();
  }

  // eslint-disable-next-line react/sort-comp
  populateTiles() {
    
    let lastColor = null;
    const colorTracker = TILE_COLORS.reduce((obj, color) => ({ ...obj, [color]: 0 }), {});
    console.log('Max per color: ', MAX_PER_COLOR, ' and color tracker: ', colorTracker);

    const iconTracker = ICON_NAMES.reduce((obj, icon) => ({ ...obj, [icon]: 0 }), {});

    const tileGrid = [];
    
    for (let row = 0; row < GRID_HEIGHT; row += 1) {
      const thisRow = [];
      for (let column = 0; column < GRID_WIDTH; column += 1) {
        const tile = { revealed: false, unrolledIndex: row * GRID_WIDTH + column }; // since they all start flipped
        
        // first, we select a color, that is different from the last color (using the intermediate step to guard against scope issues)
        const excludedColor = lastColor;
        const availableColors = TILE_COLORS.filter((color) => (color !== excludedColor && colorTracker[color] < MAX_PER_COLOR));
        const selectedColor = selectArrayRandom(availableColors);

        tile.backgroundColor = selectedColor;
        colorTracker[selectedColor] += 1;
        lastColor = selectedColor;

        // then, we randomly select an icon that has not appeared; we do allow two icons next to each other (can be hardest to find)
        const availableIcons = ICON_NAMES.filter((icon) => iconTracker[icon] < MAX_PER_ICON);
        const selectedIcon = selectArrayRandom(availableIcons);

        tile.iconName = selectedIcon;
        iconTracker[selectedIcon] += 1;

        thisRow.push(tile);
      }
      tileGrid.push(thisRow);
    }

    this.setState({ tileGrid });
  }

  // eslint-disable-next-line react/sort-comp
  startGame() {
    this.setState({ gameInProgress: true });
  }

  // we want to change the reference to force a rerender which adjusts the opacity, but only necessary for one of them
  onPressElement = (rowNumber, columnNumber) => {
    if (!this.state.gameInProgress) {
      return;
    }

    this.setState({ matchInProgress: true }); // so user can't flip many at same time, setting up race

    const oldTileGrid = this.state.tileGrid;
    if (this.state.firstTapXY.length === 0) {
      const tile = oldTileGrid[rowNumber][columnNumber];
      tile.revealed = true;
      const newTileGrid = { ...oldTileGrid };
      newTileGrid[rowNumber][columnNumber] = tile;
      this.setState({ firstTapXY: [rowNumber, columnNumber], tileGrid: newTileGrid, matchInProgress: false });
      return;
    }

    const secondTap = [rowNumber, columnNumber];
    oldTileGrid[rowNumber][columnNumber].revealed = true;
    this.setState({ tileGrid: oldTileGrid, secondTapXY: secondTap }, this.checkForMatch);
  }

  checkForMatch = () => {
    const { tileGrid } = this.state;
    const firstTap = this.state.firstTapXY;
    const firstTile = tileGrid[firstTap[0]][firstTap[1]];
    const firstIcon = firstTile.iconName;

    const secondTap = this.state.secondTapXY;
    const secondTile = tileGrid[secondTap[0]][secondTap[1]];
    const secondIcon = secondTile.iconName;

    if (firstIcon === secondIcon) {
      console.log('Matched!');
      this.setState({ matchCounter: this.state.matchCounter + 1, firstTapXY: [], secondTapXY: [], matchInProgress: false });
      // do some congratulations and send interim result to server
    } else {
      console.log('Not matched!');
      tileGrid[firstTap[0]][firstTap[1]].revealed = false;
      tileGrid[secondTap[0]][secondTap[1]].revealed = false;
      // we want to allow users to see the tiles, we flip back after 1 second
      const resetGrid = () => this.setState({ firstTapXY: [], secondTapXY: [], tileGrid, matchInProgress: false })
      setTimeout(resetGrid, 1000);
    }
  }

  onMatchMade = async () => {
    this.setState({ matchCongratulations: true });
    setTimeout(() => this.setState({ matchCongratulations: false }), 500);
    await boostService.sendTapGameResults();
  };

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

  renderGridElement(rowNumber, columnNumber) {
    const tile = this.state.tileGrid[rowNumber][columnNumber];
    return tile && (
      <TouchableOpacity
        key={`row-${rowNumber}-column-${columnNumber}`}
        onPress={() => this.onPressElement(rowNumber, columnNumber)}
        disabled={this.state.matchInProgress || tile.revealed}
        style={[
          styles.tileHolder, 
          { backgroundColor: tile.revealed ? tile.backgroundColor : Colors.WHITE },
        ]}
      >
        {tile.revealed ? (
          // <Icon 
          //   name={tile.iconName}
          //   type="jupiter"
          //   size={35}
          //   colors={Colors.WHITE}
          // />
          <Text>{tile.iconName}</Text>
        ) : (
          <Image
            source={backgroundImage}
            style={styles.hiddenTile}
          />         
        )}
      </TouchableOpacity>
    )
  }

  renderGridRow(rowNumber) {
    return (
      <View key={`row-${rowNumber}`} style={styles.gridRow}>
        {Array(GRID_WIDTH).fill().map((_, index) => this.renderGridElement(rowNumber, index, backgroundImage))}
      </View>
    )
  }

  renderGrid() {
    return Array(GRID_HEIGHT).fill().map((_, index) => this.renderGridRow(index, backgroundImage));
  }

  render() {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
          style={styles.gradientContainer}
        >
          <Text style={styles.gameHeader}>
            Uncover the matching tiles
          </Text>
          <View style={styles.gridHolder}>
            {this.renderGrid()}
          </View>
          <View style={styles.gameTimerHolder}>
            <Text style={styles.matchCounter}>
              {this.state.matchCounter}
            </Text>
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

    // handleGameEnd() {
  //   this.setState({ gameInProgress: false, showSubmittingModal: true }, () => {
  //     this.submitGameResults();
  //   });
  // }

  // async submitGameResults() {
  //   const resultOptions = {
  //     timeTaken: this.state.timeLimit,
  //     boostId: this.state.boostId,
  //     percentDestroyed: this.calculatePercentDestroyed(),
  //     authenticationToken: this.props.token,
  //   }

  //   const resultOfSubmission = await boostService.sendTapGameResults(resultOptions);
  //   // console.log('SUBMITTED : ', resultOfSubmission);
  //   if (!resultOfSubmission) {
  //     LoggingUtil.logError(Error('Result of game was null'));
  //     this.showErrorDialog();
  //   }

  //   this.showGameResultDialog(resultOfSubmission);
  // }

  // showErrorDialog() {
  //   this.setState({ showSubmittingModal: false, showErrorDialog: true });
  // }

  // async showGameResultDialog(resultOfGame) {
  //   const { amountWon, statusMet } = resultOfGame;
  //   const percentDestroyed = this.calculatePercentDestroyed();
  //   const gameResultParams = { ...resultOfGame, percentDestroyed, timeTaken: this.state.timeLimit };

  //   if (amountWon) {
  //     await this.updateBalance();
  //   }

  //   this.setState({
  //     showSubmittingModal: false,
  //     showGameResultDialog: true,
  //     gameResultParams,
  //   });

  //   if (Array.isArray(statusMet) && statusMet.length > 0) {
  //     statusMet.forEach((viewedStatus) => this.props.updateBoostViewed({ boostId: this.state.boostId, viewedStatus }));
  //   }
  // }

  // async updateBalance() {
  //   try {
  //     const balanceResult = await getRequest({ token: this.props.token, url: `${Endpoints.CORE}balance` });
  //     if (!balanceResult.ok) {
  //       LoggingUtil.logApiError('balance', balanceResult);
  //       throw balanceResult;
  //     }
  //     const serverBalance = await balanceResult.json();
  //     this.props.updateServerBalance(serverBalance);
  //   } catch (err) {
  //     console.log('ERROR fetching new balance: ', JSON.stringify(err));
  //   }
  // }
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
    marginTop: 10,
    marginBottom: 30,
  },
  gameTimerHolder: {
    justifyContent: 'flex-end',
  },
  gameTimer: {
    fontFamily: 'poppins-regular',
    color: Colors.GOLD,
    fontSize: 45,
    marginBottom: 10,
    width: '100%',
    textAlign: 'center',
  },
  gridHolder: {
    flex: 1,
    paddingHorizontal: 10,
    minWidth: '100%',
    justifyContent: 'space-between',
  },
  gridRow: {
    flexDirection: 'row',
    minWidth: '100%',
    justifyContent: 'space-between',
  },
  tileHolder: {
    minWidth: TILE_WIDTH,
    minHeight: TILE_HEIGHT,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
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

export default connect(mapStateToProps, mapPropsToDispatch)(MatchingGame);
