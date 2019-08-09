import React from 'react';
import { StyleSheet, View, Image, Text, AsyncStorage, ImageBackground, Dimensions, Animated, Easing, YellowBox, TouchableOpacity } from 'react-native';
import { Colors, Sizes, Endpoints } from '../util/Values';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, Button } from 'react-native-elements';
import NavigationBar from '../elements/NavigationBar';
import { NavigationUtil } from '../util/NavigationUtil';
import AnimatedNumber from '../elements/AnimatedNumber';
import moment from 'moment';
import { FlingGestureHandler, Directions, State } from 'react-native-gesture-handler';
import VersionCheck from 'react-native-version-check-expo';
import Dialog, { SlideAnimation, DialogContent } from 'react-native-popup-dialog';

/*
This is here because currently long timers are not purely supported on Android.
We should continue to follow the support threads on this issue (visible in the error if you remove this ignore block)
*/
YellowBox.ignoreWarnings([
  'Setting a timer',
]);

let {height, width} = Dimensions.get('window');
const FONT_UNIT = 0.01 * width;
const FETCH_DELAY = 15 * 60 * 1000; //15 minutes * 60 seconds * 1000 millis

const CIRCLE_ROTATION_DURATION = 6000;

const DEFAULT_BALANCE_ANIMATION_INTERVAL = 14;
const DEFAULT_BALANCE_ANIMATION_DURATION = 5000;
const DEFAULT_BALANCE_ANIMATION_STEP_SIZE = 50;

export default class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      currency: "R",
      balance: 0,
      // expectedToAdd: "100.00",
      rotation: new Animated.Value(0),
      hasMessage: true,
      loading: false,
      balanceAnimationInterval: DEFAULT_BALANCE_ANIMATION_INTERVAL,
      balanceAnimationStepSize: DEFAULT_BALANCE_ANIMATION_STEP_SIZE,
      balanceAnimationDuration: DEFAULT_BALANCE_ANIMATION_DURATION,
      initialBalanceAnimationStarted: false,
      secondaryBalanceAnimationStarted: false,
      updateRequiredDialogVisible: false,
      updateAvailableDialogVisible: false,
    };
  }

  async componentWillMount() {
    this.showInitialData();
  }

  async componentDidMount() {
    this.rotateCircle();
    this.checkIfUpdateNeeded();
  }

  async checkIfUpdateNeeded() {
    let localVersion = VersionCheck.getCurrentVersion();
    // let remoteVersion = await VersionCheck.getLatestVersion();
    // if (this.needsUpdate(localVersion, remoteVersion)) {
    //   this.showUpdateDialog(true);
    // }
    // this.showUpdateDialog(false);
  }

  needsUpdate(localVersion, remoteVersion) {
    let localParts = localVersion.split('.');
    if (!remoteVersion) return false;
    let remoteParts = remoteVersion.split('.');
    if (localParts[0] < remoteParts[0]) return true;
    if (localParts[1] < remoteParts[1]) return true;
    if (localParts[2] < remoteParts[2]) return true;
    return false;
  }

  async showUpdateDialog(required){
    if (required) {
      this.setState({updateRequiredDialogVisible: true});
    } else {
      this.setState({updateAvailableDialogVisible: true});
    }
  }

  onCloseDialog = () => {
    this.setState({
      updateRequiredDialogVisible: false,
      updateAvailableDialogVisible: false,
    });
    return true;
  }

  onPressUpdate = () => {
    //TODO handle update
    this.onCloseDialog();
  }

  async showInitialData() {
    let info = this.props.navigation.getParam('userInfo');
    if (!info) {
      info = await AsyncStorage.getItem('userInfo');
      if (!info) {
        NavigationUtil.navigateWithoutBackstack(this.props.navigation, 'Login');
      } else {
        info = JSON.parse(info);
      }
    }
    await this.setState({
      token: info.token,
      firstName: info.profile.personalName,
    });
    this.animateBalance(info.balance);
    this.fetchUpdates();
  }

  fetchUpdates = async () => {
    if (this.state.loading) return;
    this.setState({loading: true});
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
          endOfDayBalance: resultJson.balanceEndOfToday.amount
        });
      } else {
        throw result;
      }
    } catch (error) {
      console.log("error!", error.status);
      this.setState({loading: false});
    }
    setTimeout(() => {this.fetchUpdates()}, FETCH_DELAY);
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
    Animated.timing(
      this.state.rotation,
      {
        toValue: 1,
        duration: CIRCLE_ROTATION_DURATION,
        easing: Easing.linear,
      }
    ).start(() => {
      this.setState({
        rotation: new Animated.Value(0),
      });
      this.rotateCircle();
    });
  }

  onFlingMessage(event) {
    this.setState({
      hasMessage: false,
    });
  }

  renderMessageCard() {
    return (
      <FlingGestureHandler
            direction={Directions.DOWN}
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === State.ACTIVE) {
                this.onFlingMessage(nativeEvent);
              }
            }}>
            <View style={styles.messageCard}>
              <View style={styles.messageCardHeader}>
                <Image style={styles.messageCardIcon} source={require('../../assets/notification.png')}/>
                <Text style={styles.messageCardTitle}>Watch your savings grow</Text>
              </View>
              <Text style={styles.messageCardText}>Since July 2019 you have earned <Text style={styles.messageCardBold}>R40.57</Text> in interest! Keep adding cash to your Pluto account to earn more each month for nothing.</Text>
                <View style={styles.messageCardButton}>
                  <Text style={styles.messageCardButtonText}>SEE HISTORY</Text>
                    <Icon
                      name='chevron-right'
                      type='evilicon'
                      size={30}
                      color={Colors.PURPLE}
                    />
                </View>
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
    return (value / this.getDivisor(this.state.unit)).toFixed(2);
  }

  render() {
    const circleRotation = this.state.rotation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    return (
      <View style={styles.container}>
        <View style={styles.gradientWrapper}>
          <LinearGradient colors={[Colors.LIGHT_BLUE, Colors.PURPLE]} style={styles.gradientContainer}>
            <View style={styles.backgroundLinesWrapper}>
              <Image style={styles.backgroundLines} source={require('../../assets/group_3.png')} resizeMode="contain"/>
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
                <Animated.Image style={[styles.whiteCircle, {transform: [{rotate: circleRotation}]}]} source={require('../../assets/arrow_circle.png')}/>
              </View>
              {
                this.state.initialBalanceAnimationStarted ?
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
                : null
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
          visible={this.state.updateRequiredDialogVisible}
          dialogStyle={styles.dialogWrapper}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'bottom',
          })}
          onTouchOutside={this.onCloseDialog}
        >
          <DialogContent style={styles.helpDialog}>
            <Text style={styles.helpTitle}>Update Required</Text>
            <Text style={styles.helpContent}>
              We've made some big changes to the app,(more than usual). Please update to activate the new features. This version will no longer be supported in the future.
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
              We've made some changes to the app. Please update to activate the new features.
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
    color: 'white',
    fontSize: 28,
    fontFamily: 'poppins-regular',
  },
  helloTextWithMessage: {
    color: 'white',
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
    position: 'absolute',
    width: width,
    height: width,
  },
  coloredCircle: {
    position: 'absolute',
    width: width * 0.895,
    height: width * 0.895,
  },
  balanceWrapper: {
    flexDirection: 'row',
  },
  balance: {
    color: 'white',
    fontSize: 13 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    lineHeight: 70,
  },
  currency: {
    color: 'white',
    fontSize: 6.5 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
    textAlignVertical: 'top',
    marginRight: 2,
    lineHeight: 40,
  },
  endOfMonthBalanceWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginLeft: 10,
    marginBottom: -10,
  },
  endOfMonthBalance: {
    color: 'white',
    fontSize: 7.5 * FONT_UNIT,
    fontFamily: 'poppins-semibold',
  },
  endOfMonthDesc: {
    color: Colors.GRAY,
    fontSize: 5 * FONT_UNIT,
    fontFamily: 'poppins-regular',
  },
  messageCard: {
    minHeight: height * 0.23,
    width: '95%',
    backgroundColor: 'white',
    marginBottom: - (Sizes.NAVIGATION_BAR_HEIGHT - Sizes.VISIBLE_NAVIGATION_BAR_HEIGHT),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
  },
  messageCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  messageCardIcon: {
    marginRight: 10,
  },
  messageCardTitle: {
    fontFamily: 'poppins-semibold',
    fontSize: 3.7 * FONT_UNIT,
  },
  messageCardText: {
    fontFamily: 'poppins-regular',
    fontSize: 3.2 * FONT_UNIT,
  },
  messageCardBold: {
    fontFamily: 'poppins-semibold',
  },
  messageCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  helpDialog: {
    width: '90%',
    minHeight: 340,
    backgroundColor: 'white',
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
    color: 'white',
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
