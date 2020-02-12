/* eslint-disable react/sort-comp */
import { Notifications } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Permissions from 'expo-permissions';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { Alert, Animated, AsyncStorage, Dimensions, Easing, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

// import VersionCheck from 'react-native-version-check-expo';
import { NavigationEvents } from 'react-navigation';

import { Colors, Endpoints } from '../util/Values';
import { NotificationsUtil } from '../util/NotificationsUtil';
import { MessagingUtil } from '../util/MessagingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { getDivisor, extractAmount } from '../util/AmountUtil';

import BalanceNumber from '../elements/BalanceNumber';
import NavigationBar from '../elements/NavigationBar';
import MessageCard from '../elements/MessageCard';

import BoostModalChallenge from '../elements/boost/BoostChallengeModal';
import BoostResultModal from '../elements/boost/BoostResultModal';
// import BoostOfferModal from '../elements/boost/BoostOfferModal';

import { updateServerBalance, updateShownBalance } from '../modules/balance/balance.actions';
import { updateBoostCount, updateBoostViewed, updateMessagesAvailable, updateMessageSequence, updateMessageViewed } from '../modules/boost/boost.actions';
import { getViewedBoosts, hasViewedFallback, getNextMessage, getAvailableMessages } from '../modules/boost/boost.reducer';

const mapDispatchToProps = {
  updateBoostCount,
  updateServerBalance,
  updateShownBalance,
  updateBoostViewed,
  updateMessagesAvailable,
  updateMessageSequence,
  updateMessageViewed,
};

const mapStateToProps = state => ({
  viewedBoosts: getViewedBoosts(state),
  hasShownFallback: hasViewedFallback(state),
  nextMessage: getNextMessage(state),
  availableMessages: getAvailableMessages(state),
});

const { height, width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;
const TIME_BETWEEN_FETCH = 10 * 1000; // don't fetch if time is between this (i.e., less than a minute)

const CIRCLE_ROTATION_DURATION = 6000;
const CIRCLE_SCALE_DURATION = 200;

const COLOR_WHITE = '#fff';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      loading: false,

      rotation: new Animated.Value(0),
      gameRotation: new Animated.Value(0),
      circleScale: new Animated.Value(0),

      hasMessage: false,
      messageDetails: null,
      gameModalDetails: null,
      tapScreenGameMode: false,
      chaseArrowGameMode: false,

      lastFetchTimeMillis: 0,
    };
  }

  async componentDidMount() {
    this.showInitialData();
    this.rotateCircle();
  }

  /*
    // eslint-disable-next-line react/sort-comp
    async storeAuthToken() {
      if (!this.props.token) {
        const storedInfo = await AsyncStorage.getItem('userInfo');
        const userInfo = JSON.parse(storedInfo);
        this.props.updateAuthToken(userInfo.token);
      }
    }

    async updateBalance () {
      await this.storeAuthToken();

      const result = await fetch(`${Endpoints.CORE}balance`, {
        headers: {
          Authorization: `Bearer ${this.props.token}`,
        },
        method: 'GET',
      });

      if (result.ok) {
        const resultJson = await result.json();
        this.props.updateServerBalance(resultJson);
      } else {
        throw result;
      }
    }
  */

  async showInitialData() {
    let info = this.props.navigation.getParam('userInfo');
    const { params } = this.props.navigation.state;
    if (!info) {
      info = await AsyncStorage.getItem('userInfo');
      if (!info) {
        NavigationUtil.logout(this.props.navigation);
      } else {
        info = JSON.parse(info);
      }
    }
    // check params if we have params.showModal we show modal with game
    if (params) {
      await this.setState({
        token: info.token,
        firstName: info.profile.personalName,
      });
    } else {
      await this.setState({
        token: info.token,
        firstName: info.profile.personalName,
      });
    }

    if (info.profile.kycStatus === 'FAILED_VERIFICATION' || info.profile.kycStatus === 'REVIEW_FAILED') {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'FailedVerification', { fromHome: true });
      return;
    }

    this.handleNotificationsModule();

    LoggingUtil.setUserId(info.systemWideUserId);
    LoggingUtil.logEvent('USER_ENTERED_HOME_SCREEN');

    this.props.updateServerBalance(info.balance);

    this.fetchCurrentBalanceFromServer();
    this.fetchMessagesIfNeeded();
    this.checkForTriggeredBoost();
  }

  showLogoutAlert = () => {
    Alert.alert(
      'Session expired',
      'For your security, Jupiter will ask you to login again from time to time. Please click below to login again',
      [{ text: 'OK', onPress: () => { NavigationUtil.logout(this.props.navigation); } }],
      { cancelable: false }
    );
  }

  handlePendingTransactions = (balanceResult) => {
    if (!balanceResult || !Array.isArray(balanceResult.pendingTransactions)) {
      this.setState({ hasPendingTransactions: false });
      return;
    }

    const { pendingTransactions } = balanceResult;
    const equalizeTx = (transaction) => transaction.amount / getDivisor(transaction.unit);
    const totalPendingAmount = pendingTransactions.reduce((sum, tx) => sum + equalizeTx(tx), 0);

    this.setState({
      hasPendingTransactions: true,
      numberPendingTx: pendingTransactions.length,
      totalPendingAmount,
    });
  };

  fetchCurrentBalanceFromServer = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    try {
      const result = await fetch(`${Endpoints.CORE}balance`, {
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'GET',
      });

      if (result.ok) {
        const resultJson = await result.json();
        this.storeUpdatedBalance(resultJson);
        this.props.updateServerBalance(resultJson);
        this.props.updateBoostCount(
          parseInt(resultJson.availableBoostCount || 0)
        );
        this.handlePendingTransactions(resultJson);
        this.setState({
          lastFetchTimeMillis: moment().valueOf(),
          loading: false,
        });
      } else {
        if (result.status === 401 || result.status === 403) {
          this.showLogoutAlert();
          return;
        }
        throw result;
      }
    } catch (error) {
      console.log('Error fetching balance!', error.message);
      this.setState({ loading: false });
    }
  };

  async storeUpdatedBalance(response) {
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
    }
    if (response) {
      info.balance = response;
      await AsyncStorage.setItem('userInfo', JSON.stringify(info));
      this.props.updateServerBalance(response);
    }
  }

  async checkBalanceOnReload() {
    // first we reload the balance from storage, in case it changed (e.g., by stashing after payment complete)
    // note : remove this shortly once payment & withdrawal convert to using redux
    const info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      // means something went wrong while on other screens or some backdoor attempt
      NavigationUtil.logout(this.props.navigation);
    }

    if (this.state.lastFetchTimeMillis === 0) {
      // have not fetched before, so do not do so
      return;
    }

    const { balance } = JSON.parse(info);
    this.props.updateServerBalance(balance);

    const millisSinceLastFetch = moment().valueOf() - this.state.lastFetchTimeMillis;
    // console.log('Time since fetch: ', millisSinceLastFetch);
    if (millisSinceLastFetch > TIME_BETWEEN_FETCH) {
      // console.log('Enough time elapsed, check for new balance');
      await Promise.all([this.fetchCurrentBalanceFromServer(), this.checkForTriggeredBoost(), this.fetchMessagesIfNeeded()]);
    }
  }

  rotateCircle() {
    const rotationDuration = CIRCLE_ROTATION_DURATION;
    Animated.timing(this.state.rotation, {
      toValue: 1,
      duration: rotationDuration,
      easing: Easing.linear,
    }).start(() => {
      this.setState({
        rotation: new Animated.Value(0),
      });
      this.rotateCircle();
    });
  }

  // ////////////////////////////////////////////////////////////////////////////////////
  // ///////////////////  NOTIFICATION AND MESSAGE HANDLING /////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////

  async handleNotificationsModule() {
    this.registerForPushNotifications();
    this._notificationSubscription = Notifications.addListener(this.handleNotification);
  }

  handleNotification = notification => {
    NotificationsUtil.handleNotification(this.props.navigation, notification);
  };

  registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(
          Permissions.NOTIFICATIONS
        );
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync();
      NotificationsUtil.uploadTokenToServer(token, this.state.token);
      return true;
    } catch (err) {
      err.message = `Push notification registration error: ${err.message}`;
      LoggingUtil.logError(err);
      return false;
    }
  };

  async checkForTriggeredBoost() {
    // note : we do the check regardless of whether boost count is above 0, because if, e.g., the user
    // claims a boost right after they add the cash, then we will have a race condition between this and balance update
    try {
      const result = await fetch(`${Endpoints.CORE}boost/display`, {
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        method: 'GET',
      });

      if (result.ok) {
        const resultJson = await result.json();
        this.handleBoostCheckResult(resultJson);    
      } else {
        throw result;
      }
    } catch (error) {
      console.log('Error fetching changed boost!', error.message);
    }
  }

  handleBoostCheckResult(boostArray) {
    if (!Array.isArray(boostArray) || boostArray.length === 0) {
      return;
    }

    const { viewedBoosts } = this.props;
    const statusNotViewedFilter = (boost, status) => boost.boostStatus === status &&
      (Object.keys(viewedBoosts).indexOf(boost.boostId) < 0 || viewedBoosts[boost.boostId].indexOf(status) < 0); 

    const redeemedBoosts = boostArray.filter((boost) => statusNotViewedFilter(boost, 'REDEEMED'));
    
    if (redeemedBoosts.length > 0) {
      const boostToView = redeemedBoosts[0]; // i.e., first one
      this.setState({ 
        showBoostResultModal: true,
        boostResultDetails: boostToView, 
      },
      () => this.props.updateBoostViewed({ boostId: boostToView.boostId, viewedStatus: 'REDEEMED' }));
      return;
    }

    const pendingBoosts = boostArray.filter((boost) => statusNotViewedFilter(boost, 'PENDING'));
    if (pendingBoosts.length > 0) {
      // if this is a game then bring up the game dialogue; otherwise ignore it (for now)
      this.props.updateBoostViewed({ boostId: pendingBoosts[0].boostId, viewedStatus: 'PENDING' });
    }
  }

  hideBoostResultModal() {
    this.setState({ showBoostResultModal: false }, () => {
      this.checkForTriggeredBoost(); // in case there is another one pending in the meantime
    });
  }

  async fetchMessagesIfNeeded() {
    const { nextMessage } = this.props;
    if (nextMessage) {
      this.showMessage(nextMessage);
    } else {
      const { availableMessages, messageSequence } = await MessagingUtil.fetchMessagesAndGetTop(this.state.token);
      this.props.updateMessagesAvailable(availableMessages);
      this.props.updateMessageSequence(messageSequence);
      this.showMessageOrFallback(this.props.nextMessage);
    }
  }

  showMessageOrFallback(message) {
    if (message) {
      this.showMessage(message);
    } else if (!this.props.hasShownFallback) {
      this.showMessage(MessagingUtil.getFallbackMessage());
    }
  }

  showMessage(message) {
    if (message.display.type.includes('CARD')) {
      this.setState({
        hasMessage: true,
        messageDetails: message,
      });
    } else if (message.display.type.includes('MODAL')) {
      this.setState({
        // hasGameModal: true,
        gameModalDetails: message,
      });
    }
    this.props.updateMessageViewed(message);
  }

  onFlingMessage() {
    this.setState({
      hasMessage: false,
    });
    MessagingUtil.tellServerMessageAction('DISMISSED', this.state.messageDetails.messageId, this.state.token);
  }

  onPressMsgAction = action => {
    this.setState({ hasMessage: false });
    const { messageDetails } = this.state;
    
    if (messageDetails) {
      MessagingUtil.tellServerMessageAction('ACTED', messageDetails.messageId, this.state.token);
    }

    const actionContext = messageDetails ? messageDetails.actionContext : null;
    console.log('Processing message action, message details: ', messageDetails);
    
    switch (action) {
      case 'ADD_CASH': {
          const addCashEmbeddedAmount = actionContext ? actionContext.addCashPreFilled : null;
          if (addCashEmbeddedAmount) {
            const preFilledAmount = extractAmount(addCashEmbeddedAmount, 'WHOLE_CURRENCY');
            this.props.navigation.navigate('AddCash', { preFilledAmount });
          } else {
            this.props.navigation.navigate('AddCash');
          }
          break;
      }

      case 'VIEW_HISTORY':
        this.props.navigation.navigate('History');
        break;

      case 'VISIT_WEB':
        if (actionContext && actionContext.urlToVisit) {
          Linking.openURL(actionContext.urlToVisit);
        } else {
          Linking.openURL('https://jupitersave.com')
        }
        break;

      default:
        break;
    }
  };

  renderPendingBalance() {
    const isWithdrawal = this.state.totalPendingAmount < 0;
    const descriptor = isWithdrawal ? 'withdrawal' : 'save';
    const label = this.state.numberPendingTx === 1 ? `Pending ${descriptor}` :
            `${isWithdrawal ? '' : '+ '}${this.state.numberPendingTx} pending ${descriptor}s`;
    const icon = isWithdrawal ? require('../../assets/withdrawal_home.png') : require('../../assets/add_home.png');
    const amount = `R${Math.abs(this.state.totalPendingAmount).toFixed(0)}`;
    return (
      <TouchableOpacity style={styles.pendingItemsHolder}>
        <View style={styles.endOfMonthBalanceWrapper}>
          <Image style={styles.pendingItemsIcon} source={icon} />
          <Text style={styles.endOfMonthBalance}>
            {amount}
          </Text>
          <Icon name='chevron-right' containerStyle={styles.pendingItemsChevron} type='evilicon' size={30} color={Colors.GRAY} />
        </View>
        <Text style={styles.endOfMonthDesc}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // ////////////////////////////////////////////////////////////////////////////////////
  // ///////////////////  GAME HANDLING /////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////////////////////////////////

  rotateGameCircle(arrowSpeedMultiplier) {
    const rotationDuration = CIRCLE_ROTATION_DURATION / arrowSpeedMultiplier;
    // console.log(rotationDuration);
    Animated.timing(this.state.gameRotation, {
      toValue: 1,
      duration: rotationDuration,
      easing: Easing.linear,
    }).start(() => {
      if (this.state.chaseArrowGameMode) {
        this.setState({
          gameRotation: new Animated.Value(0),
        });
        this.rotateGameCircle(arrowSpeedMultiplier);
      }
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
  }

  onPressPlayLater = () => {
    // this.setState({
    //   hasGameModal: false,
    // });
    // TODO show gameDetails.actionContext.gameParams.waitMessage maybe?
  };

  onPressStartGame = () => {
    const game = this.state.gameModalDetails;
    // console.log(game);
    // this.setState({
    //   hasGameModal: false,
    // });
    if (game.actionContext.gameParams.gameType.includes('TAP_SCREEN')) {
      this.setState({
        tapScreenGameMode: true,
        tapScreenGameTimer: game.actionContext.gameParams.timeLimitSeconds,
      });
      this.tapScreenGameTaps = 0;
      setTimeout(() => {
        this.handleTapScreenGameEnd();
      }, game.actionContext.gameParams.timeLimitSeconds * 1000);
      setTimeout(() => {
        this.decrementTapScreenGameTimer();
      }, 1000);
    } else if (game.actionContext.gameParams.gameType.includes('CHASE_ARROW')) {
      this.setState({
        chaseArrowGameMode: true,
        chaseArrowGameTimer: game.actionContext.gameParams.timeLimitSeconds,
        // "arrowFuzziness": "10%",
        gameRotation: new Animated.Value(0),
      });
      this.chaseArrowGameTaps = 0;
      const { arrowSpeedMultiplier } = game.actionContext.gameParams;
      this.rotateGameCircle(arrowSpeedMultiplier);
      setTimeout(() => {
        this.handleChaseArrrowGameEnd();
      }, game.actionContext.gameParams.timeLimitSeconds * 1000);
      setTimeout(() => {
        this.decrementChaseArrowGameTimer();
      }, 1000);
    }
  };

  decrementTapScreenGameTimer = () => {
    setTimeout(() => {
      this.decrementTapScreenGameTimer();
    }, 1000);
    this.setState({ tapScreenGameTimer: this.state.tapScreenGameTimer - 1 });
  };

  handleTapScreenGameEnd = () => {
    this.setState({ tapScreenGameMode: false });

    const nextStepId = this.state.gameModalDetails.actionContext.gameParams.finishedMessage;
    const nextStep = this.props.availableMessages[nextStepId];
    if (nextStep) this.showMessage(nextStep);
    MessagingUtil.sendTapGameResults(this.tapScreenGameTaps, this.state.token);
  };

  decrementChaseArrowGameTimer = () => {
    setTimeout(() => {
      this.decrementChaseArrowGameTimer();
    }, 1000);
    this.setState({ chaseArrowGameTimer: this.state.chaseArrowGameTimer - 1 });
  };

  handleChaseArrrowGameEnd = () => {
    this.setState({ chaseArrowGameMode: false });

    const nextStepId = this.state.gameModalDetails.actionContext.gameParams.finishedMessage;
    const nextStep = this.props.availableMessages[nextStepId]
    if (nextStep) this.showMessage(nextStep);
    MessagingUtil.sendTapGameResults(this.chaseArrowGameTaps, this.state.token);
  };

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

  onCloseGameDialog = () => {
    MessagingUtil.tellServerMessageAction('DISMISSED', this.state.gameModalDetails.messageId, this.state.token);
  };

  /**
   * handler for hide modal with game
   */
  hideBoostChallengeModal = async () => {
    await this.setState({ showModal: false });
  };

  getGameDetailsBody(body) {
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

  onPressViewOtherBoosts = () => {
    this.onCloseGameDialog();
    this.props.navigation.navigate('Boosts');
  };

  renderTapCounter() {
    let taps = 0;
    let timer = 0;
    if (this.state.tapScreenGameMode) {
      taps = this.tapScreenGameTaps ? this.tapScreenGameTaps : 0;
      timer = this.state.tapScreenGameTimer ? this.state.tapScreenGameTimer : 0;
    } else if (this.state.chaseArrowGameMode) {
      taps = this.chaseArrowGameTaps ? this.chaseArrowGameTaps : 0;
      timer = this.state.chaseArrowGameTimer
        ? this.state.chaseArrowGameTimer
        : 0;
    }
    return (
      <View style={styles.tapCounterWrapper}>
        <Text style={styles.balance}>{taps}</Text>
        <Text style={styles.timerStyle}>
          {timer} {timer === 1 ? ' second' : ' seconds'} left
        </Text>
      </View>
    );
  }

  render() {
    const circleRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    const gameCircleRotation = this.state.gameRotation.interpolate({
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
      <View style={styles.container}>
        <NavigationEvents onDidFocus={() => this.checkBalanceOnReload()} />

        <View style={styles.gradientWrapper}>
          <LinearGradient
            colors={[Colors.LIGHT_BLUE, Colors.PURPLE]}
            style={styles.gradientContainer}
          >
            <View style={styles.backgroundLinesWrapper}>
              <Image
                style={styles.backgroundLines}
                source={require('../../assets/stars.png')}
                resizeMode="contain"
              />
            </View>
            <View
              style={
                this.state.hasMessage ? styles.headerWithMessage : styles.header
              }
            >
              {this.state.firstName.length > 0 ? (
                <Text
                  style={
                    this.state.hasMessage
                      ? styles.helloTextWithMessage
                      : styles.helloText
                  }
                >
                  Hello,{' '}
                  <Text style={styles.firstName}>{this.state.firstName}</Text>
                </Text>
              ) : null}
            </View>
            <View style={styles.mainContent}>
              <View style={styles.circlesWrapper}>
                <Image
                  style={styles.coloredCircle}
                  source={require('../../assets/oval.png')}
                />
                {/*
                  <Animated.Image style={[styles.coloredCircle, {transform: [{rotate: circleRotation}]}]} source={require('../../assets/oval.png')}/>

                */}
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
                          { rotate: circleRotation },
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
              </View>

              {this.state.tapScreenGameMode || this.state.chaseArrowGameMode ? (
                this.renderTapCounter()
              ) : (
                <BalanceNumber
                  balanceStyle={styles.balance}
                  currencyStyle={styles.currency}
                />
              )}

              {this.state.hasPendingTransactions ? this.renderPendingBalance() : null}

              {/* {<View style={styles.endOfMonthBalanceWrapper}>
                <Text style={styles.endOfMonthBalance}>+R{this.state.expectedToAdd}</Text>
                  <Icon
                    name='chevron-right'
                    type='evilicon'
                    size={30}
                    color={Colors.GRAY}
                  />
              </View>
              <Text style={styles.endOfMonthDesc}>Due end of month</Text>} */}
            </View>

            {this.state.hasMessage && (
              <MessageCard 
                messageDetails={this.state.messageDetails}
                onFlingMessage={() => this.onFlingMessage()}
                onPressActionButton={(actionToTake) => this.onPressMsgAction(actionToTake)}
              />
            )}

            <NavigationBar navigation={this.props.navigation} currentTab={0} />
          </LinearGradient>
        </View>

        {this.state.showModal && (
          <BoostModalChallenge
            showModal={this.state.showModal}
            hideModal={this.hideBoostChallengeModal}
            startGame={() => {}}
          />
        )}

        {this.state.showBoostResultModal && (
          <BoostResultModal
            showModal={this.state.showBoostResultModal}
            hideModal={() => this.hideBoostResultModal()}
            boostDetails={this.state.boostResultDetails}
            navigation={this.props.navigation}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientWrapper: {
    flex: 1,
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  backgroundLinesWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundLines: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  header: {
    marginTop: height * 0.022,
    minHeight: 50,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  headerWithMessage: {
    marginTop: height * 0.008,
    minHeight: 40,
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  helloText: {
    color: COLOR_WHITE,
    fontSize: 28,
    fontFamily: 'poppins-regular',
  },
  helloTextWithMessage: {
    color: COLOR_WHITE,
    fontSize: 24,
    fontFamily: 'poppins-regular',
  },
  firstName: {
    fontFamily: 'poppins-semibold',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
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
  tapCounterWrapper: {
    alignItems: 'center',
  },
  balance: {
    color: COLOR_WHITE,
    fontSize: 13 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    lineHeight: 70,
  },
  timerStyle: {
    color: COLOR_WHITE,
    fontSize: 5 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    lineHeight: 50,
  },
  currency: {
    color: COLOR_WHITE,
    fontSize: 6.5 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    textAlignVertical: 'top',
    marginRight: 2,
    lineHeight: 40,
  },
  pendingItemsHolder: {
    alignItems: 'center',
    width: '100%',
  },
  pendingItemsIcon: {
    marginRight: 5, 
    width: 19,
    height: 19,
  },
  pendingItemsChevron: {
    marginLeft: -5,
  },
  endOfMonthBalanceWrapper: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  endOfMonthBalance: {
    color: COLOR_WHITE,
    fontSize: 6 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    paddingRight: 0,
    marginRight: 0,
  },
  endOfMonthDesc: {
    color: Colors.GRAY,
    fontSize: 4 * FONT_UNIT,
    fontFamily: 'poppins-regular',
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
