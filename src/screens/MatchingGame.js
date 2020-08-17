import React from 'react';
import { connect } from 'react-redux';

import { StyleSheet, View, Text, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
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
const MAX_PER_COLOR = Math.ceil((GRID_WIDTH * GRID_HEIGHT) / (TILE_COLORS.length * 2)); // the extra 2 is because colours double 

const backgroundImage = require('../../assets/logo_tile.png');

// could do this with a font, but (1) custom font import for icons is painful (docs/debugging not clear), (2) a handful of pngs actually smaller
const TILE_IMAGES = {
  'bell': require('../../assets/tiles/bell.png'),
  'coffee': require('../../assets/tiles/coffee.png'),
  'heart': require('../../assets/tiles/heart.png'),
  'money': require('../../assets/tiles/money.png'),
  'music': require('../../assets/tiles/music.png'),
  'piggy-bank': require('../../assets/tiles/piggy-bank.png'),
  'smile': require('../../assets/tiles/smile.png'),
  'umbrella': require('../../assets/tiles/umbrella.png'),
  'wallet': require('../../assets/tiles/wallet.png'),
  'watch': require('../../assets/tiles/watch.png'),
};

const ICON_NAMES = Object.keys(TILE_IMAGES);
const MAX_PER_ICON = Math.ceil((GRID_WIDTH * GRID_HEIGHT) / ICON_NAMES.length);
const MAX_MATCHES = GRID_HEIGHT * GRID_WIDTH / 2;

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

  // if an icon is second in its pair, then we use the same color that it used
  // eslint-disable-next-line react/sort-comp
  populateTiles() {
    let lastColor = null;
    
    const colorCounter = TILE_COLORS.reduce((obj, color) => ({ ...obj, [color]: 0 }), {});
    const iconCounter = ICON_NAMES.reduce((obj, icon) => ({ ...obj, [icon]: 0 }), {});
    const iconColorTracker = {};

    const tileGrid = [];
    
    for (let row = 0; row < GRID_HEIGHT; row += 1) {
      const thisRow = [];
      for (let column = 0; column < GRID_WIDTH; column += 1) {
        const tile = { revealed: false, unrolledIndex: row * GRID_WIDTH + column }; // since they all start flipped

        // first, we randomly select an icon that has not appeared; we do allow two icons next to each other (can be hardest to find)
        const availableIcons = ICON_NAMES.filter((icon) => iconCounter[icon] < MAX_PER_ICON);
        const selectedIcon = selectArrayRandom(availableIcons);

        tile.iconName = selectedIcon;
        iconCounter[selectedIcon] += 1;

        // then, if the icon has already been selected / has a colour, we use that, otherwise we select one and push it
        let selectedColor = null;
        // console.log(`Row: ${row}, column: ${column}, icon: ${selectedIcon}, prior color: ${iconColorTracker[selectedIcon]}`);
        if (iconColorTracker[selectedIcon]) {
          // use the prior color, and then remove it (i.e., so just in case icons duplicate, second pair is on new color)
          selectedColor = iconColorTracker[selectedIcon];
          Reflect.deleteProperty(iconColorTracker, selectedIcon);
        } else {
          // we select a color, that is different from the last color (using the intermediate step to guard against scope issues)
          const excludedColor = lastColor;
          const availableColors = TILE_COLORS.filter((color) => (color !== excludedColor && colorCounter[color] < MAX_PER_COLOR));
          selectedColor = selectArrayRandom(availableColors);
          iconColorTracker[selectedIcon] = selectedColor;
        }

        tile.backgroundColor = selectedColor;
        colorCounter[selectedColor] += 1;
        lastColor = selectedColor;

        thisRow.push(tile);
      }
      tileGrid.push(thisRow);
    }

    this.setState({ tileGrid });
  }

  // eslint-disable-next-line react/sort-comp
  startGame() {
    this.setState({ gameInProgress: true }, () => setTimeout(() => { this.decrementGameTimer(); }, 1000));
  }

  decrementGameTimer = () => {
    if (this.state.gameTimer > 0) {
      setTimeout(() => { this.decrementGameTimer(); }, 1000);
      this.setState({ gameTimer: this.state.gameTimer - 1 });
    } else {
      this.handleGameEnd();
    }
  };

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
      this.setState({ matchCounter: this.state.matchCounter + 1, firstTapXY: [], secondTapXY: [], matchInProgress: false }, 
          () => this.onMatchMade());
    } else {
      const newTileGrid = JSON.parse(JSON.stringify(tileGrid));
      newTileGrid[firstTap[0]][firstTap[1]].revealed = false;
      newTileGrid[secondTap[0]][secondTap[1]].revealed = false;
      // we want to allow users to see the tiles, we flip back after 1 second
      const resetGrid = () => this.setState({ firstTapXY: [], secondTapXY: [], tileGrid: newTileGrid, matchInProgress: false })
      setTimeout(resetGrid, 800);
    }
  }

  onNoMatch = () => {
    this.setState({ })
  }

  onMatchMade = async () => {
    this.setState({ matchCongratulations: true }, () => {
      setTimeout(() => this.setState({ matchCongratulations: false }), 1000);
      if (this.state.matchCounter > 0 && this.state.matchCounter % MAX_MATCHES === 0) {
        setTimeout(() => this.populateTiles(), 1000);
      }
    });
  };

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
          <Image 
            source={TILE_IMAGES[tile.iconName]}
            size={35}
            colors={Colors.WHITE}
            resizeMode="contain"
          />
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
          {this.state.matchCongratulations ? (
            <Text style={[styles.gameHeader, { fontFamily: 'poppins-semibold' }]}>
              Match found!
            </Text>
          ) :(
            <Text style={styles.gameHeader}>
              Uncover the matching tiles
            </Text>
          )}
          <View style={styles.gridHolder}>
            {this.renderGrid()}
          </View>
          <View style={styles.footerWithCounters}>
            <View style={styles.matchCounterHolder}>
              <Text style={styles.matchTitle}>Your matches</Text>
              <Text style={styles.matchCounter}>{this.state.matchCounter}</Text>
            </View>
            <View style={styles.gameTimerHolder}>
              <Text style={styles.gameTimerTitle}>Time remaining</Text>
              <Text style={styles.gameTimer}>{this.state.gameTimer}</Text>
            </View>
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

  handleGameEnd() {
    this.setState({ gameInProgress: false, showSubmittingModal: true }, () => {
      this.submitGameResults();
    });
  }

  async submitGameResults() {
    const resultOptions = {
      timeTaken: this.state.timeLimit,
      boostId: this.state.boostId,
      numberTaps: this.state.matchCounter,
      authenticationToken: this.props.token,
    }

    const resultOfSubmission = await boostService.sendTapGameResults(resultOptions);
    if (!resultOfSubmission) {
      LoggingUtil.logError(Error('Result of game was null'));
      this.showErrorDialog();
    }

    this.showGameResultDialog(resultOfSubmission);
  }

  onPressDone = () => {
    this.setState({ showGameResultDialog: false, gameResultParams: null });
    this.props.navigation.navigate('Home');
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
    this.setState({ showSubmittingModal: false, showErrorDialog: true });
  }

  async showGameResultDialog(resultOfGame) {
    const { amountWon, statusMet } = resultOfGame;
    const gameResultParams = { ...resultOfGame, numberOfMatches: this.state.matchCounter, timeTaken: this.state.timeLimit };

    if (amountWon) {
      await this.updateBalance();
    }

    this.setState({
      showSubmittingModal: false,
      showGameResultDialog: true,
      gameResultParams,
    });

    if (Array.isArray(statusMet) && statusMet.length > 0) {
      statusMet.forEach((viewedStatus) => this.props.updateBoostViewed({ boostId: this.state.boostId, viewedStatus }));
    }
  }

  async updateBalance() {
    try {
      const balanceResult = await getRequest({ token: this.props.token, url: `${Endpoints.CORE}balance` });
      if (!balanceResult.ok) {
        LoggingUtil.logApiError('balance', balanceResult);
        throw balanceResult;
      }
      const serverBalance = await balanceResult.json();
      this.props.updateServerBalance(serverBalance);
    } catch (err) {
      console.log('ERROR fetching new balance: ', JSON.stringify(err));
    }
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
    fontSize: height > 640 ? 24 : 20,
    lineHeight: 30,
    color: Colors.WHITE, 
    width: '100%',
    textAlign: 'center',
    marginTop: height > 640 ? 30 : 15,
    marginBottom: height > 640 ? 10 : 5,
  },
  footerWithCounters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: height > 640 ? 15: 5,
    paddingHorizontal: 15,
    marginBottom: height > 640 ? 15 : 0,
  },
  matchCounterHolder: {
    alignItems: 'flex-start',
  },
  matchTitle: {
    textTransform: 'uppercase',
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.WHITE,
  },
  matchCounter: {
    fontFamily: 'poppins-regular',
    color: Colors.GOLD,
    fontSize: 30,
    width: '100%',
    textAlign: 'left',
  },
  gameTimerHolder: {
    justifyContent: 'flex-end',
  },
  gameTimerTitle: {
    textTransform: 'uppercase',
    fontFamily: 'poppins-semibold',
    fontSize: 13,
    color: Colors.WHITE,
  },
  gameTimer: {
    fontFamily: 'poppins-regular',
    color: Colors.GOLD,
    fontSize: 30,
    width: '100%',
    textAlign: 'right',
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
    borderWidth: 1,
    borderColor: Colors.BACKGROUND_GRAY,
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
