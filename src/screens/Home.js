import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, Dimensions, Animated, Easing, YellowBox, TouchableOpacity, Linking, Alert } from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { Colors, Sizes, Endpoints } from '../util/Values';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Button } from 'react-native-elements';
import NavigationBar from '../elements/NavigationBar';
import { NotificationsUtil } from '../util/NotificationsUtil';
import { MessagingUtil } from '../util/MessagingUtil';
import { NavigationUtil } from '../util/NavigationUtil';
import { LoggingUtil } from '../util/LoggingUtil';
import AnimatedNumber from '../elements/AnimatedNumber';
import moment from 'moment';
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';
import { NavigationEvents } from 'react-navigation';

// import VersionCheck from 'react-native-version-check-expo';

/*
This is here because currently long timers are not purely supported on Android.
We should continue to follow the support threads on this issue (visible in the error if you remove this ignore block)
*/
YellowBox.ignoreWarnings([
  'Setting a timer',
]);

const { height, width } = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;
const TIME_BETWEEN_FETCH = 10 * 1000; // don't fetch if time is between this (i.e., less than a minute)

const CIRCLE_ROTATION_DURATION = 6000;
const CIRCLE_SCALE_DURATION = 200;

const DEFAULT_BALANCE_ANIMATION_INTERVAL = 14;
const DEFAULT_BALANCE_ANIMATION_DURATION = 3500;
const DEFAULT_BALANCE_ANIMATION_STEP_SIZE = 50;

const COLOR_WHITE = '#fff';

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      currency: "R",
      balance: 0,
      // expectedToAdd: "100",
      rotation: new Animated.Value(0),
      gameRotation: new Animated.Value(0),
      circleScale: new Animated.Value(0),
      hasMessage: false,
      messageDetails: null,
      hasGameModal: false,
      gameModalDetails: null,
      loading: false,
      balanceAnimationInterval: DEFAULT_BALANCE_ANIMATION_INTERVAL,
      balanceAnimationStepSize: DEFAULT_BALANCE_ANIMATION_STEP_SIZE,
      balanceAnimationDuration: DEFAULT_BALANCE_ANIMATION_DURATION,
      initialBalanceAnimationStarted: false,
      secondaryBalanceAnimationStarted: false,
      updateRequiredDialogVisible: false,
      updateAvailableDialogVisible: false,
      tapScreenGameMode: false,
      chaseArrowGameMode: false,
      lastFetchTimeMillis: 0
    };
  }

  async componentDidMount() {
    console.log("COMPONENT MOUNTED");
    this.showInitialData();
    this.rotateCircle();
    // this.checkIfUpdateNeeded();
  }

  async fetchMessagesIfNeeded() {
    let gameId = await MessagingUtil.getGameId();
    if (gameId) {
      let game = await MessagingUtil.getGame(gameId);
      if (game) this.showGame(game);
    } else {
      let data = await MessagingUtil.fetchMessagesAndGetTop(this.state.token);
      if (data) this.showGame(data);
    }
  }

  async showGame(game) {
    if (game.display.type.includes("CARD")) {
      this.setState({
        hasMessage: true,
        messageDetails: game,
      });
    } else if (game.display.type.includes("MODAL")) {
      this.setState({
        hasGameModal: true,
        gameModalDetails: game,
      });
    }
  }

  // removing until we have a public page
  // async checkIfUpdateNeeded() {
  //   try {
  //     let localVersion = VersionCheck.getCurrentVersion();
  //     let remoteVersion = await VersionCheck.getLatestVersion();

  //     const updateStatus = this.needsUpdate(localVersion, remoteVersion);
  //     if (updateStatus == 2) {
  //       this.showUpdateDialog(true);
  //     } else if (updateStatus == 1) {
  //       this.showUpdateDialog(false);
  //     }
  //   } catch (err) {
  //     LoggingUtil.logError(err);
  //   }
  // }

  // needsUpdate(localVersion, remoteVersion) {
  //   let localParts = localVersion.split('.');
  //   if (!remoteVersion) return false;
  //   let remoteParts = remoteVersion.split('.');
  //   if (localParts[0] < remoteParts[0]) return 2;
  //   if (localParts[1] < remoteParts[1]) return 2;
  //   if (localParts[2] < remoteParts[2]) return 1;
  //   return 0;
  // }

  // async showUpdateDialog(required){
  //   if (required) {
  //     this.setState({updateRequiredDialogVisible: true});
  //   } else {
  //     this.setState({updateAvailableDialogVisible: true});
  //   }
  // }

  // onPressUpdate = async () => {
  //   let link = await VersionCheck.getStoreUrl();
  //   Linking.openURL(link);
  //   this.onCloseDialog();
  // }

  onCloseDialog = () => {
    this.setState({
      updateRequiredDialogVisible: false,
      updateAvailableDialogVisible: false,
    });
    return true;
  }

  async showInitialData() {
    let info = this.props.navigation.getParam('userInfo');
    if (!info) {
      info = await AsyncStorage.getItem('userInfo');
      if (!info) {
        NavigationUtil.logout(this.props.navigation);
      } else {
        info = JSON.parse(info);
      }
    }
    await this.setState({
      token: info.token,
      firstName: info.profile.personalName,
    });
    if (info.profile.kycStatus == "FAILED_VERIFICATION" || info.profile.kycStatus == "REVIEW_FAILED") {
      NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'FailedVerification', { "fromHome": true });
      return;
    }
    this.handleNotificationsModule();
    LoggingUtil.setUserId(info.systemWideUserId);
    LoggingUtil.logEvent("USER_ENTERED_SCREEN", {"screen_name": "Home"});
    this.animateBalance(info.balance);
    this.fetchUpdates();
    this.fetchMessagesIfNeeded();
  }

  async handleNotificationsModule() {
    this.registerForPushNotifications();
    this._notificationSubscription = Notifications.addListener(this.handleNotification);
  }

  handleNotification = (notification) => {
    NotificationsUtil.handleNotification(this.props.navigation, notification);
  };

  registerForPushNotifications = async () => {
    try {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }

      let token = await Notifications.getExpoPushTokenAsync();
      NotificationsUtil.uploadTokenToServer(token, this.state.token);
    } catch (err) {
      err.message = `Push notification registration error: ${err.message}`;
      LoggingUtil.logError(err);
    }
  }

  logUpdate = async () => {
    const millisSinceLastFetch = moment().valueOf() - this.state.lastFetchTimeMillis;
    console.log('Time since fetch: ', millisSinceLastFetch);
    if (millisSinceLastFetch > TIME_BETWEEN_FETCH) {
      console.log('Enough time elapsed, check for new balance');
      await this.fetchUpdates();
    }
  }

  fetchUpdates = async () => {
    console.log('Fetching updates, current state of loading: ', this.state.loading);
    if (this.state.loading) return;
    this.setState({loading: true});
    try {
      console.log('Sending update request ....');
      let result = await fetch(Endpoints.CORE + 'balance', {
        headers: {
          'Authorization': 'Bearer ' + this.state.token,
        },
        method: 'GET',
      });
      console.log('Fetched update request');

      //Uncomment this to force MA-69 test case
      // result.ok = false;
      // result.status = 403;

      if (result.ok) {
        let resultJson = await result.json();
        this.storeUpdatedBalance(resultJson);
        this.setState({
          endOfDayBalance: resultJson.balanceEndOfToday.amount,
          lastFetchTimeMillis: moment().valueOf(),
          loading: false
        });
      } else {
        if (result.status == 403) {
          Alert.alert(
            'Token expired',
            'For your security, please login again',
            [
              { text: 'OK', onPress: () => {NavigationUtil.logout(this.props.navigation)} }
            ],
            { cancelable: false }
          );
        }
        throw result;
      }
    } catch (error) {
      console.log("error!", error.status);
      this.setState({loading: false});
    }
  }

  async storeUpdatedBalance(response) {
    let info = await AsyncStorage.getItem('userInfo');
    if (!info) {
      NavigationUtil.logout(this.props.navigation);
    } else {
      info = JSON.parse(info);
    }
    if (response) {
      info.balance = response;
      AsyncStorage.setItem('userInfo', JSON.stringify(info));
    }
  }

  async animateBalance(balance) {
    // let lastShownBalance = await AsyncStorage.getItem('lastShownBalance');
    // if (lastShownBalance) lastShownBalance = JSON.parse(lastShownBalance);
    // else lastShownBalance = 0;
    let lastShownBalance = 0;
    this.setState({
      lastShownBalance: lastShownBalance,
      balance: balance.currentBalance.amount,
      endOfDayBalance: balance.balanceEndOfToday.amount,
      unit: balance.currentBalance.unit,
      currency: this.getCurrencySymbol(balance.currentBalance.currency),
      balanceAnimationStepSize: Math.abs(balance.currentBalance.amount - lastShownBalance) / 50,
      initialBalanceAnimationStarted: true,
    });
  }

  getCurrencySymbol(currencyName) {
    //todo improve this to handle more currencies
    switch (currencyName) {
      case "ZAR":
      return "R";

      default:
      return "?";
    }
  }

  getDivisor(unit) {
    switch(unit) {
      case "MILLIONTH_CENT":
      return 100000000;

      case "TEN_THOUSANDTH_CENT":
      return 1000000;

      case "THOUSANDTH_CENT":
      return 100000;

      case "HUNDREDTH_CENT":
      return 10000;

      case "WHOLE_CENT":
      return 100;

      case "WHOLE_CURRENCY":
      return 1;

      default:
      return 1;
    }
  }

  rotateCircle() {
    let rotationDuration = CIRCLE_ROTATION_DURATION;
    Animated.timing(
      this.state.rotation,
      {
        toValue: 1,
        duration: rotationDuration,
        easing: Easing.linear,
      }
    ).start(() => {
      this.setState({
        rotation: new Animated.Value(0),
      });
      this.rotateCircle();
    });
  }

  rotateGameCircle(arrowSpeedMultiplier) {
    let rotationDuration = CIRCLE_ROTATION_DURATION / arrowSpeedMultiplier;
    // console.log(rotationDuration);
    Animated.timing(
      this.state.gameRotation,
      {
        toValue: 1,
        duration: rotationDuration,
        easing: Easing.linear,
      }
    ).start(() => {
      if (this.state.chaseArrowGameMode) {
        this.setState({
          gameRotation: new Animated.Value(0),
        });
        this.rotateGameCircle(arrowSpeedMultiplier);
      }
    });
  }

  scaleCircle() {
    Animated.timing(
      this.state.circleScale,
      {
        toValue: 1,
        duration: CIRCLE_SCALE_DURATION,
        easing: Easing.linear,
      }
    ).start(() => {
      this.setState({
        circleScale: new Animated.Value(0),
      });
    });
  }

  onFlingMessage() {
    this.setState({
      hasMessage: false,
    });
    MessagingUtil.dismissedGame(this.state.token);
    AsyncStorage.removeItem("gameId");
    AsyncStorage.removeItem("currentGames");
  }

  getMessageCardButtonText(action) {
    switch (action) {
      case "ADD_CASH":
      return "ADD CASH";

      case "VIEW_HISTORY":
      return "VIEW HISTORY";

      case "VISIT_WEB":
        return "FOLLOW LINK"

      default:
      return "";
    }
  }

  getMessageCardIcon(iconType) {
    switch (iconType) {
      case "BOOST_ROCKET":
      return require('../../assets/rocket.png');

      case "UNLOCKED":
      return require('../../assets/unlocked.png');

      default:
      return require('../../assets/notification.png');
    }
  }

  onPressModalAction = (action) => {
    switch (action) {
      case "ADD_CASH":
      this.props.navigation.navigate('AddCash');
      break;

      case "VIEW_HISTORY":
      this.props.navigation.navigate('History');
      break;

      case "VISIT_WEB":
      Linking.openURL('https://jupitersave.com'); // TODO : make follow actual link
      break

      default:
      break;
    }
  }

  renderMessageCard() {
    let messageDetails = this.state.messageDetails;
    if (!messageDetails) {
      return null;
    }
    let isEmphasis = messageDetails.display.titleType && messageDetails.display.titleType.includes("EMPHASIS");
    let messageActionText = this.getMessageCardButtonText(messageDetails.actionToTake);
    return (
      <FlingGestureHandler
            direction={Directions.DOWN}
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.ACTIVE) {
                this.onFlingMessage(nativeEvent);
              }
            }}>
            <View style={styles.messageCard}>
              <View style={isEmphasis ? styles.messageCardHeaderEmphasis : styles.messageCardHeader}>
                {
                  !isEmphasis ?
                  <Image style={styles.messageCardIcon} source={this.getMessageCardIcon(messageDetails.display.iconType)}/>
                  : null
                }
                <Text style={isEmphasis ? styles.messageCardTitleEmphasis : styles.messageCardTitle}>{messageDetails.title}</Text>
                  {
                    isEmphasis ?
                    <Image style={styles.messageCardIconEmphasis} source={this.getMessageCardIcon(messageDetails.display.iconType)}/>
                    : null
                  }
              </View>
              <Text style={styles.messageCardText}>{messageDetails.body}</Text>
              {
                messageActionText && messageActionText.length > 0 ?
                <TouchableOpacity style={styles.messageCardButton} onPress={() => this.onPressModalAction(messageDetails.actionToTake)}>
                  <Text style={styles.messageCardButtonText}>{messageActionText}</Text>
                    <Icon
                      name='chevron-right'
                      type='evilicon'
                      size={30}
                      color={Colors.PURPLE}
                    />
                </TouchableOpacity>
                : null
              }
            </View>
        </FlingGestureHandler>
    );
  }

  async playNextAnimationPhase() {
    let currentBalance = this.state.balance; //get balance as of right now
    let endOfDayBalance = this.state.endOfDayBalance; //get end of day balance

    if (currentBalance < endOfDayBalance) { //only keep going if we actually need to animate anything
      let timeToEndOfDay = moment().endOf('day').valueOf() - moment().valueOf(); //get the time left until end of day in millis
      // let timeToEndOfDay = moment().add(30, 'seconds').valueOf() - moment().valueOf(); //testing for 120 seconds
      let balanceDiff = endOfDayBalance - currentBalance; //get the amount to be earned by the end of day in "huge numbers"
      let balanceDiffInCents = balanceDiff / this.getDivisor(this.state.unit) * 100; //get the amount to be earned by the end of day in cents

      let steps = balanceDiffInCents; //set a default amount of steps, equal to the amount of cents we want to increase
      let stepSize = 0.01; //set a default count by to 1 cent per step

      //if there are too many steps, make them go twice as fast until we reach a good speed
      //this way, if the amount to increase is way too big, we will be moving not by a cent every millisecond, but 2 cents per milli, etc.
      while (steps > timeToEndOfDay) {
        steps /= 2;
        stepSize *= 2;
      }

      this.setState({
        balance: this.state.endOfDayBalance,
        balanceAnimationStepSize: stepSize * this.getDivisor(this.state.unit),
        balanceAnimationDuration: timeToEndOfDay,
        secondaryBalanceAnimationStarted: true,
        initialBalanceAnimationFinished: true,
      });
    }
  }

  async onFinishBalanceAnimation(isInitial) {
    AsyncStorage.setItem('lastShownBalance', JSON.stringify(this.state.balance));
    this.setState({
      lastShownBalance: this.state.balance,
    });
    if (isInitial) {
      setTimeout(() => {
        this.playNextAnimationPhase();
      }, 300);
    } else {
      // this.setState({
      //   secondaryBalanceAnimationStarted: false
      // });
      // this.fetchEndOfDayUpdate();
    }
  }

  fetchEndOfDayUpdate = async () => {
    try {
      let result = await fetch(Endpoints.CORE + 'balance', {
        headers: {
          'Authorization': 'Bearer ' + this.state.token,
        },
        method: 'GET',
      });
      if (result.ok) {
        let resultJson = await result.json();
        this.setState({
          secondaryBalanceAnimationStarted: true,
          endOfDayBalance: resultJson.balanceEndOfToday.amount
        });
        this.playNextAnimationPhase();
      } else {
        throw result;
      }
    } catch (error) {
      console.log("error!", error.status);
      this.setState({loading: false});
    }
  }

  async onProgressBalanceAnimation(value) {
    this.setState({
      lastShownBalance: this.state.balance,
    });
    if (!this.state.lastSetStorage || moment().valueOf() - this.state.lastSetStorage.valueOf() > 15000) { //if the last time we saved it was more than 15 seconds ago, save it again
      AsyncStorage.setItem('lastShownBalance', JSON.stringify(value));
      this.setState({
        lastSetStorage: moment(),
      });
    }
  }

  getFormattedValue(value) {
    let result = (value / this.getDivisor(this.state.unit)).toFixed(2);
    result = result.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); //I don't understand how this works. It's a plain copy paste which allows comma separators
    return result;
  }

  onPressPlayLater = () => {
    this.setState({
      hasGameModal: false,
    });
    //TODO show gameDetails.actionContext.gameParams.waitMessage maybe?
  }

  onPressStartGame = () => {
    let game = this.state.gameModalDetails;
    console.log(game);
    this.setState({
      hasGameModal: false,
    });
    if (game.actionContext.gameParams.gameType.includes("TAP_SCREEN")) {
      this.setState({
        tapScreenGameMode: true,
        tapScreenGameTimer: game.actionContext.gameParams.timeLimitSeconds
      });
      this.tapScreenGameTaps = 0;
      setTimeout(() => {this.handleTapScreenGameEnd()}, game.actionContext.gameParams.timeLimitSeconds * 1000);
      setTimeout(() => {this.decrementTapScreenGameTimer()}, 1000);
    } else if (game.actionContext.gameParams.gameType.includes("CHASE_ARROW")) {
      this.setState({
        chaseArrowGameMode: true,
        chaseArrowGameTimer: game.actionContext.gameParams.timeLimitSeconds,
        // "arrowFuzziness": "10%",
        gameRotation: new Animated.Value(0),
      });
      this.chaseArrowGameTaps = 0;
      let arrowSpeedMultiplier = game.actionContext.gameParams.arrowSpeedMultiplier;
      this.rotateGameCircle(arrowSpeedMultiplier);
      setTimeout(() => {this.handleChaseArrrowGameEnd()}, game.actionContext.gameParams.timeLimitSeconds * 1000);
      setTimeout(() => {this.decrementChaseArrowGameTimer()}, 1000);
    }
  }

  decrementTapScreenGameTimer = () => {
    setTimeout(() => {this.decrementTapScreenGameTimer()}, 1000);
    this.setState({tapScreenGameTimer: this.state.tapScreenGameTimer - 1});
  }

  handleTapScreenGameEnd = async () => {
    this.setState({tapScreenGameMode: false});

    let nextStepId = this.state.gameModalDetails.actionContext.gameParams.finishedMessage;
    MessagingUtil.setGameId(nextStepId);
    let nextStep = await MessagingUtil.getGame(nextStepId);
    if (nextStep) this.showGame(nextStep);
    MessagingUtil.sendTapGameResults(this.tapScreenGameTaps, this.state.token);
  }

  decrementChaseArrowGameTimer = () => {
    setTimeout(() => {this.decrementChaseArrowGameTimer()}, 1000);
    this.setState({chaseArrowGameTimer: this.state.chaseArrowGameTimer - 1});
  }

  handleChaseArrrowGameEnd = async () => {
    this.setState({chaseArrowGameMode: false});

    let nextStepId = this.state.gameModalDetails.actionContext.gameParams.finishedMessage;
    MessagingUtil.setGameId(nextStepId);
    let nextStep = await MessagingUtil.getGame(nextStepId);
    if (nextStep) this.showGame(nextStep);
    MessagingUtil.sendTapGameResults(this.chaseArrowGameTaps, this.state.token);
  }

  onPressTapScreenGame = () => {
    this.tapScreenGameTaps = this.tapScreenGameTaps + 1;
    this.scaleCircle();
    this.forceUpdate();
  }

  onPressArrow = () => {
    if (this.state.chaseArrowGameMode) {
      this.chaseArrowGameTaps = this.chaseArrowGameTaps + 1;
      this.scaleCircle();
      this.forceUpdate();
    }
  }

  onCloseGameDialog = () => {
    this.setState({
      hasGameModal: false,
    });
    MessagingUtil.dismissedGame(this.state.token);
    AsyncStorage.removeItem("gameId");
    AsyncStorage.removeItem("currentGames");
  }

  getGameDetailsBody(body) {
    let taps = 0;
    if (this.tapScreenGameTaps && this.tapScreenGameTaps > 0) taps = this.tapScreenGameTaps;
    else if (this.chaseArrowGameTaps && this.chaseArrowGameTaps > 0) taps = this.chaseArrowGameTaps;
    if (body.includes("#{numberUserTaps}")) {
      body = body.replace("#{numberUserTaps}", taps);
    }
    return body;
  }

  onPressViewOtherBoosts = () => {
    this.onCloseGameDialog();
    this.props.navigation.navigate('Boosts');
  }

  renderGameDialog() {
    let gameDetails = this.state.gameModalDetails;
    if (!gameDetails) return null;

    if (gameDetails.actionContext.gameParams) {
      return this.renderGameStartDialog(gameDetails);
    } else {
      return this.renderGameEndDialog(gameDetails);
    }
  }

  renderGameEndDialog(gameDetails) {
    return (
      <DialogContent style={styles.gameDialog}>
        <Text style={styles.helpTitle}>{gameDetails.title}</Text>
        <Text style={styles.gameInfoBody}>
          {this.getGameDetailsBody(gameDetails.body)}
        </Text>
        <Button
          title="DONE"
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onCloseGameDialog}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}/>
        <Text style={styles.gamePlayLater} onPress={this.onPressPlayLater} onPress={this.onPressViewOtherBoosts}>View other boosts</Text>
        <TouchableOpacity style={styles.closeDialog} onPress={this.onCloseGameDialog} >
          <Image source={require('../../assets/close.png')}/>
        </TouchableOpacity>
      </DialogContent>
    );
  }

  renderGameStartDialog(gameDetails) {
    return (
      <DialogContent style={styles.gameDialog}>
        <Text style={styles.helpTitle}>{gameDetails.title}</Text>
        <Text style={styles.gameInfoBody}>
          {this.getGameDetailsBody(gameDetails.body)}
        </Text>
        <View style={styles.gameInstructions}>
          <View style={styles.gameInstructionsRow}>
            <Image style={styles.gameInstructionsImage} resizeMode='contain' source={require('../../assets/clock.png')}/>
            <Text style={styles.gameInstructionsText}>{gameDetails.actionContext.gameParams.instructionBand}</Text>
          </View>
        </View>
        <Button
          title="START GAME"
          titleStyle={styles.buttonTitleStyle}
          buttonStyle={styles.buttonStyle}
          containerStyle={styles.buttonContainerStyle}
          onPress={this.onPressStartGame}
          linearGradientProps={{
            colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
            start: { x: 0, y: 0.5 },
            end: { x: 1, y: 0.5 },
          }}/>
        <Text style={styles.gamePlayLater} onPress={this.onPressPlayLater} onPress={this.onPressPlayLater}>Play Later</Text>
      </DialogContent>
    );
  }

  renderBalance() {
    if (!this.state.initialBalanceAnimationStarted) return null;
    return (
      <View style={styles.balanceWrapper}>
        <Text style={styles.currency}>{this.state.currency}</Text>
        {
          this.state.initialBalanceAnimationStarted && !this.state.initialBalanceAnimationFinished ?
          <AnimatedNumber style={styles.balance}
            initial={this.state.lastShownBalance} target={this.state.balance}
            formatting={(value) => this.getFormattedValue(value)}
            stepSize={this.state.balanceAnimationStepSize}
            duration={this.state.balanceAnimationDuration}
            onAnimationProgress={(value) => {this.onProgressBalanceAnimation(value)}}
            onAnimationFinished={() => {this.onFinishBalanceAnimation(true)}}
            />
          : null
        }
        {
          this.state.initialBalanceAnimationFinished && this.state.secondaryBalanceAnimationStarted ?
          <AnimatedNumber style={styles.balance}
            initial={this.state.lastShownBalance} target={this.state.balance}
            formatting={(value) => this.getFormattedValue(value)}
            stepSize={this.state.balanceAnimationStepSize}
            duration={this.state.balanceAnimationDuration}
            onAnimationProgress={(value) => {this.onProgressBalanceAnimation(value)}}
            onAnimationFinished={() => {this.onFinishBalanceAnimation(false)}}
            />
          : null
        }
      </View>
    )
  }

  renderTapCounter() {
    let taps = 0, timer = 0;
    if (this.state.tapScreenGameMode) {
      taps = this.tapScreenGameTaps ? this.tapScreenGameTaps : 0;
      timer = this.state.tapScreenGameTimer ? this.state.tapScreenGameTimer : 0;
    } else if (this.state.chaseArrowGameMode) {
      taps = this.chaseArrowGameTaps ? this.chaseArrowGameTaps : 0;
      timer = this.state.chaseArrowGameTimer ? this.state.chaseArrowGameTimer : 0;
    }
    return (
      <View style={styles.tapCounterWrapper}>
        <Text style={styles.balance}>{taps}</Text>
        <Text style={styles.timerStyle}>{timer} {timer == 1 ? " second" : " seconds"} left</Text>
      </View>
    )
  }

  render() {
    const circleRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    const gameCircleRotation = this.state.gameRotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    let circleScale = 1;
    if (this.state.tapScreenGameMode || this.state.chaseArrowGameMode) {
      circleScale = this.state.circleScale.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.04]
      });
    }
    return (
      <View style={styles.container}>
        <NavigationEvents onDidFocus={() => this.logUpdate()} />

        <View style={styles.gradientWrapper}>
          <LinearGradient colors={[Colors.LIGHT_BLUE, Colors.PURPLE]} style={styles.gradientContainer}>
            <View style={styles.backgroundLinesWrapper}>
              <Image style={styles.backgroundLines} source={require('../../assets/stars.png')} resizeMode="contain"/>
            </View>
            <View style={this.state.hasMessage ? styles.headerWithMessage : styles.header}>
              {
                this.state.firstName.length > 0 ?
                <Text style={this.state.hasMessage ? styles.helloTextWithMessage : styles.helloText}>Hello, <Text style={styles.firstName}>{this.state.firstName}</Text></Text>
                : null
              }
            </View>
            <View style={styles.mainContent}>
              <View style={styles.circlesWrapper}>
                <Image style={styles.coloredCircle} source={require('../../assets/oval.png')}/>
                {/*
                  <Animated.Image style={[styles.coloredCircle, {transform: [{rotate: circleRotation}]}]} source={require('../../assets/oval.png')}/>

                */}
                {
                  this.state.chaseArrowGameMode ?
                  <Animated.View style={[styles.whiteCircle, {transform: [{rotate: gameCircleRotation}, {scale: circleScale}]}]}>
                    <Image source={require('../../assets/circle.png')} style={styles.animatedViewCircle} resizeMode="cover"/>
                    <TouchableOpacity activeOpacity={1} style={styles.animatedViewArrow} onPress={this.onPressArrow}>
                      <Image source={require('../../assets/arrow.png')}/>
                    </TouchableOpacity>
                  </Animated.View>
                  :
                  <Animated.View style={[styles.whiteCircle, {transform: [{rotate: circleRotation}, {scale: circleScale}]}]}>
                    <Image source={require('../../assets/circle.png')} style={styles.animatedViewCircle} resizeMode="cover"/>
                    <View style={styles.animatedViewArrow}>
                      <Image source={require('../../assets/arrow.png')}/>
                    </View>
                  </Animated.View>
                }
              </View>
              {
                this.state.tapScreenGameMode || this.state.chaseArrowGameMode ?
                this.renderTapCounter()
                :
                this.renderBalance()
              }
              {/*<View style={styles.endOfMonthBalanceWrapper}>
                <Text style={styles.endOfMonthBalance}>+R{this.state.expectedToAdd}</Text>
                  <Icon
                    name='chevron-right'
                    type='evilicon'
                    size={30}
                    color={Colors.GRAY}
                  />
              </View>
              <Text style={styles.endOfMonthDesc}>Due end of month</Text>*/}
            </View>
            {
              this.state.hasMessage ?
              this.renderMessageCard()
              : null
            }
            <NavigationBar navigation={this.props.navigation} currentTab={0} />
          </LinearGradient>
        </View>

        <Dialog
          visible={this.state.hasGameModal}
          dialogStyle={styles.dialogWrapper}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'top',
          })}
          onHardwareBackPress={this.onCloseGameDialog}
        >
          {
            this.renderGameDialog()
          }
        </Dialog>


        <Dialog
          visible={this.state.updateRequiredDialogVisible}
          dialogStyle={styles.dialogWrapper}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
        >
          <DialogContent style={styles.helpDialog}>
            <Text style={styles.helpTitle}>Update Required</Text>
            <Text style={styles.helpContent}>
              We&apos;ve made some big changes to the app,(more than usual). Please update to activate the new features. This version will no longer be supported in the future.
            </Text>
            <View style={styles.dialogBottomRight}>
              <Button
                title="UPDATE NOW"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.onPressUpdate}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}/>
            </View>
          </DialogContent>
        </Dialog>

        <Dialog
          visible={this.state.updateAvailableDialogVisible}
          dialogStyle={styles.dialogWrapper}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          onTouchOutside={this.onCloseDialog}
          onHardwareBackPress={this.onCloseDialog}
        >
          <DialogContent style={styles.helpDialog}>
            <Text style={styles.helpTitle}>New Features!</Text>
            <Text style={styles.helpContent}>
              We&apos;ve made some changes to the app. Please update to activate the new features.
            </Text>
            {/*
            <Text style={styles.helpContent}>
              Grow your savings even more with these new features on Jupiter:
            </Text>
            <View style={styles.updateFeatureItem}>
              <Icon
                name='check'
                type='feather'
                size={28}
                color={Colors.PURPLE}
              />
              <Text style={styles.updateFeatureItemText}>
                <Text style={styles.updateFeatureItemBold}>BOOSTS</Text> - Earn rewards to boost your savings even more!
              </Text>
            </View>
            <View style={styles.updateFeatureItem}>
              <Icon
                name='check'
                type='feather'
                size={28}
                color={Colors.PURPLE}
              />
              <Text style={styles.updateFeatureItemText}>
                <Text style={styles.updateFeatureItemBold}>SAVING HISTORY</Text> - Keep track of all your savings, with a full history view.
              </Text>
            </View>
            */}
            <View style={styles.dialogBottomLine}>
              <Text style={styles.helpLink} onPress={this.onCloseDialog}>Later</Text>
              <Button
                title="UPDATE NOW"
                titleStyle={styles.buttonTitleStyle}
                buttonStyle={styles.buttonStyle}
                containerStyle={styles.buttonContainerStyle}
                onPress={this.onPressUpdate}
                linearGradientProps={{
                  colors: [Colors.LIGHT_BLUE, Colors.PURPLE],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}/>
            </View>
            <TouchableOpacity style={styles.closeDialog} onPress={this.onCloseDialog} >
              <Image source={require('../../assets/close.png')}/>
            </TouchableOpacity>
          </DialogContent>
        </Dialog>

        {
          this.state.tapScreenGameMode ?
          <TouchableOpacity style={styles.tapScreenGameWrapper} onPress={this.onPressTapScreenGame}>
          </TouchableOpacity>
          : null
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tapScreenGameWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
    width: width,
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
    flexDirection: 'row',
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
  // endOfMonthBalanceWrapper: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   marginTop: 25,
  //   marginLeft: 10,
  //   marginBottom: -10,
  // },
  // endOfMonthBalance: {
  //   color: COLOR_WHITE,
  //   fontSize: 7.5 * FONT_UNIT,
  //   fontFamily: 'poppins-semibold',
  // },
  // endOfMonthDesc: {
  //   color: Colors.GRAY,
  //   fontSize: 5 * FONT_UNIT,
  //   fontFamily: 'poppins-regular',
  // },
  messageCard: {
    minHeight: height * 0.23,
    width: '95%',
    backgroundColor: COLOR_WHITE,
    marginBottom: - (Sizes.NAVIGATION_BAR_HEIGHT - Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  messageCardHeaderEmphasis: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: Colors.LIGHT_BLUE,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  messageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 15,
  },
  messageCardIcon: {
    marginHorizontal: 10,
  },
  messageCardIconEmphasis: {
    marginHorizontal: 10,
    position: 'absolute',
    top: -10,
    right: -10,
  },
  messageCardTitleEmphasis: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.7 * FONT_UNIT,
    color: COLOR_WHITE,
    paddingVertical: 10,
    marginLeft: 10,
  },
  messageCardTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.7 * FONT_UNIT,
  },
  messageCardText: {
    fontFamily: 'poppins-regular',
    fontSize: 3.2 * FONT_UNIT,
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  messageCardBold: {
    fontFamily: 'poppins-semibold',
  },
  messageCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 10,
  },
  messageCardButtonText: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.2 * FONT_UNIT,
    color: Colors.PURPLE,
    marginRight: -5,
  },
  dialogWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameDialog: {
    width: '90%',
    minHeight: 380,
    backgroundColor: COLOR_WHITE,
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
  helpDialog: {
    width: '90%',
    minHeight: 340,
    backgroundColor: COLOR_WHITE,
    borderRadius: 10,
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  helpTitle: {
    textAlign: 'left',
    fontFamily: 'poppins-semibold',
    fontSize: 19,
  },
  helpContent: {
    color: Colors.MEDIUM_GRAY,
    fontFamily: 'poppins-regular',
    fontSize: 16,
    lineHeight: 20,
  },
  helpLink: {
    fontFamily: 'poppins-semibold',
    fontSize: 16,
    color: Colors.PURPLE,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  closeDialog: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  dialogBottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogBottomRight: {
    alignItems: 'flex-end',
  },
  buttonTitleStyle: {
    fontFamily: 'poppins-semibold',
    fontSize: 19,
    color: COLOR_WHITE,
    marginHorizontal: 15,
  },
  buttonStyle: {
    borderRadius: 10,
    minHeight: 55,
  },
  buttonContainerStyle: {
    justifyContent: 'center',
  },
  updateFeatureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '87%',
  },
  updateFeatureItemText: {
    marginLeft: 10,
    marginTop: 5,
    fontFamily: 'poppins-regular',
    fontSize: 16,
    lineHeight: 20,
  },
  updateFeatureItemBold: {
    fontFamily: 'poppins-semibold',
  }
});
