/* eslint-disable react/sort-comp */
import { Notifications } from 'expo';
import { LinearGradient } from 'expo-linear-gradient';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Permissions from 'expo-permissions';
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { Alert, Animated, AsyncStorage, Dimensions, Easing, Image, StyleSheet, Text, TouchableOpacity, View, Modal, TouchableWithoutFeedback, ImageStore } from 'react-native';
import { Icon } from 'react-native-elements';

// import VersionCheck from 'react-native-version-check-expo';
import { NavigationEvents } from 'react-navigation';

import { Colors, Endpoints } from '../util/Values';
import { NotificationsUtil } from '../util/NotificationsUtil';
import { MessagingUtil } from '../util/MessagingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import { LogoutUtil } from '../util/LogoutUtil';

import { getDivisor, standardFormatAmount } from '../util/AmountUtil';

import BalanceNumber from '../elements/BalanceNumber';
import NavigationBar from '../elements/NavigationBar';
import MessageCard from '../elements/MessageCard';

import BoostResultModal from '../elements/boost/BoostResultModal';
// import BoostOfferModal from '../elements/boost/BoostOfferModal';

import { updateAuthToken } from '../modules/auth/auth.actions';
import { getAuthToken } from '../modules/auth/auth.reducer';
import { getRequest } from '../modules/auth/auth.helper';

import { boostService } from '../modules/boost/boost.service';
import handleMessageActionPress from '../modules/boost/helpers/handleMessageActionPress';

import { updateServerBalance, updateShownBalance, updateSavingHeat } from '../modules/balance/balance.actions';
import { getCurrentServerBalanceFull, getCurrentHeatLevel } from '../modules/balance/balance.reducer';

import { updateBoostCount, updateBoostViewed, updateMessagesAvailable, updateMessageSequence, updateMessageViewed } from '../modules/boost/boost.actions';
import { getViewedBoosts, hasViewedFallback, getNextMessage, getAvailableMessages, getViewedMessages } from '../modules/boost/boost.reducer';

import { updateProfileFields, updateOnboardSteps, updateAccountId, updateAllFields } from '../modules/profile/profile.actions';
import { getOnboardStepsRemaining, getProfileData, getAccountId } from '../modules/profile/profile.reducer'; 

import { updateFriendAlerts } from '../modules/friend/friend.actions';
import { friendService } from '../modules/friend/friend.service';

import BoostGameModal from '../elements/boost/BoostGameModal';
import GameResultModal from '../elements/boost/GameResultModal';

import SnippetOverlay from './SnippetOverlay';

const CIRCLE_IMAGES = {
  DEFAULT: require('../../assets/oval.png'),
  CHILLY: require('../../assets/heat/chilly.png'),
  GOLDEN: require('../../assets/heat/golden.png'),
  TROPICAL: require('../../assets/heat/tropical.png'),
  BLAZING: require('../../assets/heat/blazing.png'),
}

const mapDispatchToProps = {
  updateBoostCount,
  updateFriendAlerts,
  updateServerBalance,
  updateShownBalance,
  updateBoostViewed,
  updateMessagesAvailable,
  updateMessageSequence,
  updateMessageViewed,
  updateAuthToken,
  updateProfileFields,
  updateOnboardSteps,
  updateAccountId,
  updateSavingHeat,
  updateWholeProfile: updateAllFields,
  clearState: () => ({ type: 'USER_LOGOUT' }), 
};

const mapStateToProps = state => ({
  authToken: getAuthToken(state),
  profile: getProfileData(state),
  accountId: getAccountId(state),
  onboardStepsRemaining: getOnboardStepsRemaining(state),
  viewedBoosts: getViewedBoosts(state),
  hasShownFallback: hasViewedFallback(state),
  nextMessage: getNextMessage(state),
  availableMessages: getAvailableMessages(state),
  viewedMessages: getViewedMessages(state),
  currentBalance: getCurrentServerBalanceFull(state),
  heatLevel: getCurrentHeatLevel(state),
});

const { height, width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;
const TIME_BETWEEN_FETCH = 10 * 1000; // don't fetch if time is between this (i.e., less than a minute)

const CIRCLE_ROTATION_DURATION = 6000;

const COLOR_WHITE = '#fff';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      loading: false,

      rotation: new Animated.Value(0),

      hasMessage: false,
      messageDetails: null,
      
      showGameUnlockedModal: false,
      showGameResultModal: false,

      gameParams: null,
      gameInProgress: false,
      showSubmittingModal: false,

      lastFetchTimeMillis: 0,
      
      inPreviewMode: this.props.navigation.getParam('inPreviewMode') || false,

      showSnippet: false,
      makeWheelGold: false,

      circleImage: CIRCLE_IMAGES.DEFAULT,
      circleTint: null,
    };
  }

  async componentDidMount() {
    // console.log('HOME MOUNTED');
    this.showInitialData();
    this.rotateCircle();
    this.checkForFriendAlerts(); // only do once
  }

  async handleRefocus() {
    // check params if we come from payment etc, we make the wheel gold, while also checking for and updating heat
    if (this.props.navigation.getParam('makeWheelGold')) {
      this.setState({ makeWheelGold: true });
      this.fetchCurrentHeat();
    }
    // check params if we have params.showModal we show modal with game
    if (this.props.navigation.getParam('showGameUnlockedModal')) {
      this.showGameUnlocked(this.props.navigation.getParam('boostDetails'));
      this.props.navigation.setParams({ showGameUnlockedModal: false }); // so we don't have an infinite loop
    } else {
      this.checkBalanceOnReload();
    }
  }

  logout() {
    this.props.clearState();
    LogoutUtil.logout(this.props.navigation);
  }

  async showInitialData() {
    let info = this.props.navigation.getParam('userInfo');
    const { params } = this.props.navigation.state;
    if (!info) {
      const storedInfo = await AsyncStorage.getItem('userInfo');
      if (!storedInfo) {
        this.logout();
        return;
      }
      
      info = JSON.parse(storedInfo);
    }

    if (['FAILED_VERIFICATION', 'REVIEW_FAILED'].includes(info.profile.kycStatus)) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'OnboardPending', { stepToTake: 'FAILED_VERIFICATION' });
      return;
    }

    this.setState({ firstName: this.props.profile.calledName || this.props.profile.personalName });

    if (this.state.inPreviewMode) {
      this.fetchMessagesIfNeeded();
    }

    if (params && params.makeWheelGold) {
      this.setState({ makeWheelGold: true });
    }
    
    // check params if we have params.showModal we show modal with game
    if (params && params.showGameUnlockedModal) {
      this.showGameUnlocked(params.boostDetails);
      this.props.navigation.setParams({ showGameUnlockeModal: false }); // so we don't have an infinite loop
    }

    info.onboardStepsRemaining = this.props.onboardStepsRemaining;
    
    const shouldGoToOnboarding = !this.state.inPreviewMode && Array.isArray(this.props.onboardStepsRemaining) && this.props.onboardStepsRemaining.length > 0;
    if (shouldGoToOnboarding) {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'OnboardPending');
      return;
    }

    this.handleNotificationsModule();

    LoggingUtil.setUserId(info.systemWideUserId);
    LoggingUtil.logEvent('USER_ENTERED_HOME_SCREEN');

    if (info.balance) {
      this.props.updateServerBalance(info.balance);
    }

    this.fetchCurrentProfileFromServer();
    this.checkForTriggeredBoost();
    this.fetchCurrentHeat();
  }

  showLogoutAlert = () => {
    Alert.alert(
      'Session expired',
      'For your security, Jupiter will ask you to login again from time to time. Please click below to login again',
      [{ text: 'OK', onPress: () => this.logout() }],
      { cancelable: false }
    );
  }

  handlePendingTransactions = (balanceResult) => {
    if (!balanceResult || !Array.isArray(balanceResult.pendingTransactions) || balanceResult.pendingTransactions.length === 0) {
      this.setState({ hasPendingTransactions: false });
      return;
    }

    const { pendingTransactions } = balanceResult;
    const equalizeTx = (transaction) => transaction.amount / getDivisor(transaction.unit);
    const totalPendingAmount = pendingTransactions.reduce((sum, tx) => sum + equalizeTx(tx), 0);
    // console.log('Pending transactions: ', pendingTransactions);
    const pendingHasWithdrawals = pendingTransactions.some((tx) => tx.transactionType === 'WITHDRAWAL');
    const pendingHasSaves = pendingTransactions.some((tx) => tx.transactionType === 'USER_SAVING_EVENT');

    this.setState({
      hasPendingTransactions: true,
      numberPendingTx: pendingTransactions.length,
      totalPendingAmount,
      pendingHasSaves,
      pendingHasWithdrawals,
    });
  };

  fetchCurrentProfileFromServer = async () => {
    if (this.state.loading) return;
    this.setState({ loading: true });

    try {
      const result = await getRequest({ url: `${Endpoints.AUTH}profile/fetch`, token: this.props.authToken });
      
      if (!result.ok) {
        if (result.status === 401 || result.status === 403) {
          this.showLogoutAlert();
          return;
        }
        throw result;
      }

      const resultJson = await result.json();

      this.props.updateWholeProfile(resultJson);
      const { screen, params } = NavigationUtil.directBasedOnProfile(resultJson);
      
      if (screen && screen !== 'Home' && !this.state.inPreviewMode) {
        NavigationUtil.navigateWithoutBackstack(this.props.navigation, screen, params);
        return;
      }
      
      const { balance } = resultJson;

      this.storeUpdatedBalance(balance);
      this.props.updateServerBalance(balance);
      this.props.updateBoostCount(parseInt(balance.availableBoostCount || 0));
      this.handlePendingTransactions(balance);

      this.setState({
        lastFetchTimeMillis: moment().valueOf(),
        loading: false,
      });

    } catch (error) {
      console.log('Error fetching balance!', error.message);
      this.setState({ loading: false });
    }
  };

  async storeUpdatedBalance(response) {
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      this.logout();
    } else {
      info = JSON.parse(info);
    }
    if (response && info) {
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
      this.logout();
    }

    if (this.state.lastFetchTimeMillis === 0) {
      // have not fetched before, so do not do so
      return;
    }

    // in case we adjusted this somewhere else
    this.setState({ firstName: this.props.profile.calledName || this.props.profile.personalName });

    const { balance } = JSON.parse(info);
    this.props.updateServerBalance(balance);

    const millisSinceLastFetch = moment().valueOf() - this.state.lastFetchTimeMillis;
    if (millisSinceLastFetch > TIME_BETWEEN_FETCH) {
      await Promise.all([this.fetchCurrentProfileFromServer(), this.checkForTriggeredBoost(), this.fetchMessagesIfNeeded()]);
    }
  }

  async fetchCurrentHeat() {
    try {
      const result = await getRequest({ url: `${Endpoints.CORE}heat`, token: this.props.authToken });
      if (!result.ok) {
        throw result;
      }

      const { currentLevel } = await result.json();
      this.props.updateSavingHeat(currentLevel);
      console.log('Fetched saving heat: ', currentLevel);
      this.setHeatColors(currentLevel);
    } catch (err) {
      console.log('Error fetching heat state: ', JSON.stringify(err));
    }
  }

  // add to component did update if user feedback says need switch to happen quickly
  setHeatColors(latestHeatLevel) {
    const heatLevel = latestHeatLevel || this.props.heatLevel;
    if (heatLevel && typeof heatLevel.levelColor === 'string') {
      const levelColor = heatLevel.levelColor.toUpperCase();
      const colorCode = Colors[levelColor] || this.props.heatLevel.levelColorCode;
      const levelName = heatLevel.levelName ? heatLevel.levelName.toUpperCase() : '';
      
      const haveImage = Object.keys(CIRCLE_IMAGES).includes(levelName);
      const circleTint = haveImage ? null : colorCode;
      const circleImage = CIRCLE_IMAGES[levelName] || CIRCLE_IMAGES.DEFAULT;
      this.setState({ circleImage, circleTint }); 
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

  showSnippet = () => {
    this.setState({
      showSnippet: true,
    });
  }

  hideSnippet = () => {
    this.setState({
      showSnippet: false,
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
      NotificationsUtil.uploadTokenToServer(token, this.props.authToken);
      return true;
    } catch (err) {
      err.message = `Push notification registration error: ${err.message}`;
      LoggingUtil.logError(err);
      return false;
    }
  };

  // ALSO HERE CHECK FOR NEW FRIEND AND BOOST CHANGES, TO ALERT USER ACCORDINGLY
  async checkForFriendAlerts() {
    const alertResult = await friendService.checkForFriendAlert(this.props.authToken);
    if (!alertResult) {
      return;
    }
    // console.log('Result of log check: ', alertResult);
    this.props.updateFriendAlerts(alertResult);
  }

  async checkForTriggeredBoost() {
    // note : we do the check regardless of whether boost count is above 0, because if, e.g., the user
    // claims a boost right after they add the cash, then we will have a race condition between this and balance update
    try {
      const result = await fetch(`${Endpoints.CORE}boost/display`, {
        headers: {
          Authorization: `Bearer ${this.props.authToken}`,
        },
        method: 'GET',
      });

      if (result.ok) {
        const resultJson = await result.json();
        // console.log('Triggered boost result: ', resultJson);
        const transformedBoosts = resultJson.map((boost) => boostService.convertBoostAndLogsToGameDetails(boost));
        this.handleBoostCheckResult(transformedBoosts);    
      } else {
        throw result;
      }
    } catch (error) {
      console.log('Error fetching changed boost!', JSON.stringify(error));
    }

  }

  handleBoostCheckResult(boostArray) {
    // console.log('Boost array from check endpoint: ', boostArray);
    if (!Array.isArray(boostArray) || boostArray.length === 0) {
      return;
    }

    const { viewedBoosts } = this.props;
    const statusNotViewedFilter = (boost, status) => boost.boostStatus === status &&
      (Object.keys(viewedBoosts).indexOf(boost.boostId) < 0 || viewedBoosts[boost.boostId].indexOf(status) < 0); 

    const redeemedBoosts = boostArray.filter((boost) => statusNotViewedFilter(boost, 'REDEEMED'));
    const consoledBoosts = boostArray.filter((boost) => statusNotViewedFilter(boost, 'CONSOLED'));
    const expiredBoosts = boostArray.filter((boost) => statusNotViewedFilter(boost, 'EXPIRED'));

    const redeemedOrExpiredBoosts = [...redeemedBoosts, ...consoledBoosts, ...expiredBoosts];
    // console.log('redeemed or expired length: ', redeemedOrExpiredBoosts.length);

    if (redeemedOrExpiredBoosts.length > 0) {
      this.showBoostObtainedOrMissedModal(redeemedOrExpiredBoosts[0]); // i.e., first one, relies on backend to have sorted it for us
      return;
    }

    const unlockedGames = boostArray.filter((boost) => statusNotViewedFilter(boost, 'UNLOCKED') && boost.boostType === 'GAME');
    if (unlockedGames.length > 0) {
      // if this is a game then bring up the game dialogue; otherwise ignore it (for now)
      this.showGameUnlocked(unlockedGames[0]);
      this.props.updateBoostViewed({ boostId: unlockedGames[0].boostId, viewedStatus: 'UNLOCKED' });
    }
  }

  showBoostObtainedOrMissedModal(boostToView) {
    const stateUpdate = {};
    
    const isGameBoost = boostToView.boostType === 'GAME';
    const hasGameLog = typeof boostToView.gameLog === 'object' && boostToView.gameLog !== null;

    const isFriendTournament = Array.isArray(boostToView.flags) && boostToView.flags.includes('FRIEND_TOURNAMENT');
    const shouldSkipResult = isFriendTournament && !hasGameLog; // ie tournament that did not play
    // console.log('Is this a friend tournament ? :', isFriendTournament, ' should we skip it ? ', shouldSkipResult);

    if (isGameBoost && hasGameLog) {
      stateUpdate.showGameResultModal = true;
      stateUpdate.gameResultParams = boostToView;
    } else if (!shouldSkipResult) {
      stateUpdate.showBoostResultModal = true;
      stateUpdate.boostResultDetails = boostToView; 
    }
    // console.log('State update: ', stateUpdate);
    this.setState(stateUpdate, () => this.props.updateBoostViewed({ boostId: boostToView.boostId, viewedStatus: boostToView.boostStatus }));

    // finally, update balance, if boost was redeemed (and, if we are onboarding, get the whole profile)
    if (boostToView.boostStatus === 'REDEEMED' || boostToView.boostStatus === 'CONSOLED') {
      this.fetchCurrentProfileFromServer();
      this.setState({ makeWheelGold: true });
    }
  }

  hideBoostResultModal() {
    this.setState({ showBoostResultModal: false }, () => {
      this.checkForTriggeredBoost(); // in case there is another one pending in the meantime
    });
  }

  // sequence of checks (first 'true' ends sequence):
  // (1) are we in preview, if so, we show a welcome kind of message; 
  // (2) has some other component / logic set the next message already; if so, show that 
  // (3) does the backend have a next message for us to show; if so, show
  // (4) is there a remaining fallback message tha thasn't been viewed; if so, show 
  async fetchMessagesIfNeeded() {
    if (this.state.hasMessage) {
      return;
    }

    const showWelcomeMessage = this.state.inPreviewMode || (this.props.onboardStepsRemaining && this.props.onboardStepsRemaining.includes('ADD_CASH'));
    if (showWelcomeMessage) {
      this.showMessage(MessagingUtil.getWelcomeMessage());
      return;
    }

    const { nextMessage } = this.props;
    if (nextMessage) {
      this.showMessage(nextMessage);
      return;
    } 

    const messageResult = await MessagingUtil.fetchMessagesAndGetTop(this.props.authToken);
    if (!messageResult) { // Sentry says this happens sometimes (must be state mgmt somewhere)
      this.showMessageOrFallback();
      return;
    }

    const { availableMessages, messageSequence } = messageResult;
    this.props.updateMessagesAvailable(availableMessages);
    this.props.updateMessageSequence(messageSequence);
    this.showMessageOrFallback(this.props.nextMessage);    
  }

  showMessageOrFallback(message) {
    if (message) {
      this.showMessage(message);
    } else if (!this.props.hasShownFallback) {
      const shownMessages = this.props.viewedMessages;
      const fallbackMessages = MessagingUtil.getFallbackMessages();
      const unseenMessageIds = fallbackMessages.map((msg) => msg.messageId).filter((msgId) => !shownMessages.includes(msgId));

      if (unseenMessageIds.length === 0) {
        return;
      }

      const pickedMsgId = unseenMessageIds[Math.floor(Math.random() * unseenMessageIds.length)];
      this.showMessage(fallbackMessages.find((msg) => msg.messageId === pickedMsgId));
    }
  }

  showMessage(message) {
    if (message.display.type.includes('CARD')) {
      this.setState({
        hasMessage: true,
        messageDetails: message,
      });
    }

    if (!this.state.inPreviewMode) {
      this.props.updateMessageViewed(message);
    }
  }

  onFlingMessage() {
    this.setState({
      hasMessage: false,
    });
    MessagingUtil.tellServerMessageAction('DISMISSED', this.state.messageDetails.messageId, this.props.authToken);
  }

  onPressMsgAction = () => {
    this.setState({ hasMessage: false });
    const { messageDetails } = this.state;
    
    if (messageDetails) {
      MessagingUtil.tellServerMessageAction('ACTED', messageDetails.messageId, this.props.authToken);
    }

    // console.log('HERE WE GO: ', messageDetails);
    handleMessageActionPress(messageDetails, this.props.navigation, this.props.currentBalance);
  };

  onPressPending = () => {
    // console.log('Pressed pending!');
    this.props.navigation.navigate('History');
  }

  renderPendingBalance() {
    let descriptor = 'transaction';
    if (this.state.pendingHasSaves && !this.state.pendingHasWithdrawals) {
      descriptor = 'save';
    } else if (this.state.pendingHasWithdrawals && !this.state.pendingHasSaves) {
      descriptor = 'withdrawal';
    }
    
    const isWithdrawal = this.state.totalPendingAmount < 0;
    const label = this.state.numberPendingTx === 1 ? `Pending ${descriptor}` :
            `${isWithdrawal ? '' : '+ '}${this.state.numberPendingTx} pending ${descriptor}s`;
    const icon = isWithdrawal ? require('../../assets/withdrawal_home.png') : require('../../assets/add_home.png');
    const amount = `R${Math.abs(this.state.totalPendingAmount).toFixed(0)}`;

    return (
      <TouchableOpacity style={styles.pendingItemsHolder} onPress={this.onPressPending}>
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

  showGameUnlocked(boostDetails) {
    const boostAmount = standardFormatAmount(boostDetails.boostAmount, boostDetails.boostUnit, boostDetails.boostCurrency);
    const gameParams = { ...boostDetails.gameParams, boostId: boostDetails.boostId, flags: boostDetails.flags, boostAmount };
    
    this.setState({
      showGameUnlockeModal: true,
      gameParams,
    });
    LoggingUtil.logEvent('GAME_PRESENTED_TO_USER');
  }

  onPressPlayLater = () => {
    this.setState({
      showGameUnlockeModal: false,
    });
    LoggingUtil.logEvent('GAME_USER_DISMISSED');
  };

  onPressStartGame = () => {
    const { gameParams } = this.state;
    // console.log('Starting a game: ', gameParams);

    if (gameParams.gameType.includes('TAP_SCREEN') || gameParams.gameType.includes('CHASE_ARROW')) {
      this.setState({ showGameUnlockeModal: false });
      this.props.navigation.navigate('CircleGame', { gameParams });
    } else if (gameParams.gameType.includes('DESTROY_IMAGE')) {
      this.setState({ showGameUnlockeModal: false });
      this.props.navigation.navigate('BreakingGame', { gameParams });
    } else if (gameParams.gameType.includes('MATCH_TILES')) {
      this.setState({ showGameUnlockeModal: false });
      this.props.navigation.navigate('MatchingGame', { gameParams });
    } else if (gameParams.gameType.includes('QUIZ')) {
      this.setState({ showGameUnlockeModal: false });
      this.props.navigation.navigate('QuizGame', { gameParams });
    }

    LoggingUtil.logEvent('GAME_USER_INITIATED');
  };

  onCloseGameDialog = () => {
    // MessagingUtil.tellServerMessageAction('DISMISSED', this.state.gameMessageId, this.state.token);
    this.setState({ showGameUnlockedModal: false, showGameResultModal: false });
  };

  hideBoostChallengeModal = () => {
    this.setState({ showGameUnlockedModal: false, showGameResultModal: false });
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

  renderRotatingArrow() {
    const circleRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    let { circleTint } = this.state;

    // this overrides, for now
    if (this.state.makeWheelGold) {
      circleTint = Colors.GOLD; 
    }

    return (
      <>
        <Image style={styles.coloredCircle} source={this.state.circleImage} tintColor={circleTint} />
        <Animated.View
          style={[styles.whiteCircle, { transform: [{ rotate: circleRotation }] }]}
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
      </>
    )
  }

  render() {

    const showMessage = !(
      this.state.showGameUnlockedModal || 
      this.state.showGameResultModal || 
      this.state.showBoostResultModal || 
      this.state.gameInProgress
    );

    return (
      <View style={styles.container}>
        <NavigationEvents onDidFocus={() => this.handleRefocus()} />

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

            <View style={this.state.hasMessage ? styles.headerWithMessage : styles.header}>
              {this.state.firstName && this.state.firstName.length > 0 ? (
                <Text style={this.state.hasMessage ? styles.helloTextWithMessage : styles.helloText}>
                  Hello,{' '}
                  <Text style={styles.firstName}>{this.state.firstName}</Text>
                </Text>
              ) : null}
            </View>


            <View style={styles.mainContent}>
              <View style={styles.circlesWrapper}>
                {this.renderRotatingArrow()}
              </View>

              <TouchableWithoutFeedback onPress={this.showSnippet} disabled={this.state.showSnippet}>
                <View style={this.state.hasPendingTransactions ? styles.balanceWrapper : [styles.balanceWrapper, styles.tapPadding]}>
                  <BalanceNumber
                    balanceStyle={styles.balance}
                    currencyStyle={styles.currency}
                    onSlowAnimationStarted={() => this.fetchMessagesIfNeeded()}
                    onPressWrapper={this.showSnippet}
                  />
                </View>
              </TouchableWithoutFeedback>

              {this.state.hasPendingTransactions ? this.renderPendingBalance() : null}
              {this.state.showSnippet && <SnippetOverlay isVisible={this.state.showSnippet} onCloseSnippet={this.hideSnippet} />}
            
            </View>

            {this.state.hasMessage && showMessage && (
              <MessageCard 
                messageDetails={this.state.messageDetails}
                onFlingMessage={() => this.onFlingMessage()}
                onPressActionButton={(actionToTake) => this.onPressMsgAction(actionToTake)}
              />
            )}

            <NavigationBar navigation={this.props.navigation} currentTab={0} />
          </LinearGradient>
        </View>

        {this.state.showGameUnlockeModal && (
          <BoostGameModal
            showModal={this.state.showGameUnlockeModal}
            gameDetails={this.state.gameParams}
            onPressStartGame={this.onPressStartGame}
            onPressPlayLater={this.onPressPlayLater}
            onCloseGameDialog={this.onCloseGameDialog}
            onPressViewOtherBoosts={this.onPressViewOtherBoosts}
          />
        )}

        {/*  this pains me, but Apple is playing not-nice with too many state flips, hence. clear candidate for refactor */}
        {this.state.showGameResultModal && (
          <GameResultModal
            showModal={this.state.showGameResultModal}
            resultOfGame={this.state.gameResultParams}
            onPressViewOtherBoosts={this.onPressViewOtherBoosts}
            onCloseGameDialog={this.onCloseGameDialog}
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
    width: '100%',
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
  balanceWrapper: {
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 'auto', 
  },
  tapPadding: {
    paddingVertical: 50,
  },
  balance: {
    color: COLOR_WHITE,
    fontSize: 13 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    lineHeight: 70,
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
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
