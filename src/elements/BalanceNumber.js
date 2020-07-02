import React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import { Text, View, StyleSheet, YellowBox } from 'react-native';
import { getFormattedValue } from '../util/AmountUtil';

import AnimatedNumber from './AnimatedNumber';

import { updateAuthToken, removeAuthToken } from '../modules/auth/auth.actions';

import {
  updateServerBalance,
  updateShownBalance,
} from '../modules/balance/balance.actions';

import {
  getLastShownBalanceAmount,
  getLastServerBalanceFull,
  getEndOfTodayBalanceAmount,
  getCurrentReferenceAmount,
} from '../modules/balance/balance.reducer';

// depending on the phone, a shorter interval actually leads to a longer animation, because the animation can't
// move as fast as desired (given calculations etc), especially at large balances
const DEFAULT_BALANCE_ANIMATION_INTERVAL = 75;
const DEFAULT_BALANCE_ANIMATION_DURATION = 4000;
const DEFAULT_REST_DAY_STEP_SIZE = 100;

const mapStateToProps = state => ({
  lastShownBalance: getLastShownBalanceAmount(state),
  currentReferenceBalance: getCurrentReferenceAmount(state),
  currentTargetBalance: getEndOfTodayBalanceAmount(state),
  balanceDict: getLastServerBalanceFull(state),
});

const mapDispatchToProps = {
  updateShownBalance,
  updateServerBalance,
  updateAuthToken,
  removeAuthToken,
};

/*
  This is here because currently long timers are not purely supported on Android. A long timer is used for the rest-of-day-animation
  We should continue to follow the support threads on this issue (visible in the error if you remove this ignore block)
*/
YellowBox.ignoreWarnings(['Setting a timer']);

// The state has crucial variables that control what the central balance displays, and how quickly it is
// animating towards its target or not. there are two kinds of animation of the balance,
// "accelerated" when the displayed balance needs to reach a much higher or lower balance quickly, e.g.,
// when the app is loaded (so, from 0 to the current or last stored balance) and after the user
// has saved or a boost has been awarded, or similar. "Slow" is when the balance is stable and is just
// ticking upwards to its projected level at the end of the day (calculated by the server).

// The AnimatedNumber component that handles the animation has four inputs: initial (where to start),
// target (where to reach), duration (how long to animate), and interval (how often to tick up or down)
// It will calculate how big a step to take based on the step size and duration.

// Three numbers therefore control the animation: the current reference balance; the last shown balance;
// and the target balance for the end of the day:

// ** The current reference balance (currentReferenceBalance) is the user's balance as of either the start of the day or the last
// balance-related event (save, withdraw, boost award), whichever  is latest. The current reference balance always forms
// the initial balance for the slow animation. It is stored in Redux state in balance.reducer.js.

// ** The last shown balance (lastShownBalance) is whatever is currently on the screen or was the last time the user was on
// this screen. It serves as the "initial" point each time the balance is rendered

// ** The target balance (endOfDayBalance) for the end of the day is where the server projects the user will be if they do not
// have any balance-related event, i.e., in steady state earning interest. In steady-state, the balance
// animation (in "slow"), animates to reach this number at the end of the day. The balance reducer obtains this by looking at
// the projections it has in state and finding the one that matches today.

// The animation decision tree is therefore as follows: if the anchor balance is not the target point of the animation, then
// do a quick animation to converge to it; otherwise if the end of day target is the target point of the animation, do a slow
// animation towards it; otherwise stop animating.

class BalanceNumber extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currency: 'R',
      unit: 'HUNDREDTH_CENT',
      animationStartNumber: 0,
      animationTargetNumber: 0,
      animationInterval: DEFAULT_BALANCE_ANIMATION_INTERVAL,
      animationDuration: DEFAULT_BALANCE_ANIMATION_DURATION,
      lastShownBalance: 0,
    };
  }

  componentDidMount() {
    // console.log('***** RESTARTING BALANCE NUMBER ANIMATION *****');
    this.initiateAppropriateAnimation(false, 'componentDidMount');
  }

  componentDidUpdate(prevProps) {
    // if anchor balance changes anywhere, then we animate rapidly to it, else we relax
    if (prevProps.currentReferenceBalance !== this.props.currentReferenceBalance) {
      // console.log('*** Anchor balance updated, force rapid animation');
      this.initiateAppropriateAnimation(true, 'componentDidUpdate');
    }
  }

  onProgressBalanceAnimation(value) {
    this.setState({ lastShownBalance: value });
    if (
      !this.state.lastSetStorage ||
      moment().valueOf() - this.state.lastSetStorage.valueOf() > 1000
    ) {
      this.props.updateShownBalance(value);
      this.setState({ lastSetStorage: moment() });
    }
  }

  onFinishBalanceAnimation() {
    // console.log(`Balance animation finished, last shown: ${this.state.lastShownBalance} and anchor: ${this.props.currentReferenceBalance}`);
    if (this.state.lastShownBalance !== this.props.lastShownBalance) {
      this.props.updateShownBalance(this.state.lastShownBalance);
    }
    this.initiateAppropriateAnimation(false, 'onFinishBalanceAnimation');
  }

  // if we put this in the reducer, it gets called all the time, and hits performance badly, because of state refresh
  calculateTargetBalanceAtReferenceMillis(referenceMillis) {
    // console.log('*** Calculating reference balance');
    const { balanceStartDayOrLastSettled, balanceEndOfToday } = this.props.balanceDict;
    
    if (!balanceEndOfToday) {
      return balanceStartDayOrLastSettled.amount;
    }
  
    const targetMinusAnchorMillis = balanceEndOfToday.epochMilli - balanceStartDayOrLastSettled.epochMilli;
    const targetMinusAnchorAmount = balanceEndOfToday.amount - balanceStartDayOrLastSettled.amount;
    const elapsedSinceTarget = referenceMillis - balanceStartDayOrLastSettled.epochMilli;
  
    const amountSinceStart = (elapsedSinceTarget / targetMinusAnchorMillis) * targetMinusAnchorAmount;
  
    return balanceStartDayOrLastSettled.amount + amountSinceStart;
  }
  

  initiateAppropriateAnimation(forceRapidAnimation = false) {
    if (this.state.lastShownBalance === 0 || forceRapidAnimation) {
      this.setState({ referenceMoment: moment().valueOf() }, () => this.animateToAnchorBalance());
      return;
    }

    // console.log(`Last animation target: ${this.state.animationTargetNumber}, and currentBalance: ${this.props.currentReferenceBalance} and target: ${this.props.currentTargetBalance}`);
    const referenceAnchor = this.calculateTargetBalanceAtReferenceMillis(this.state.referenceMoment);
    const isAnimatingToRightAnchor = this.state.animationTargetNumber === referenceAnchor;
    // as below note, end of day target is *always* above current, so this will guard against accidental declines
    const isAnimatingToRightTarget = this.state.animationTargetNumber === Math.max(this.props.currentTargetBalance, referenceAnchor);
    // this is a hard block to make sure we never show users their balance "ticking down"; note that this may cause some issues
    // on occasion with users seeing balances that are too high, but history, add cash, etc., all others will reflect the current balance
    const isReferenceAboveLastShown = referenceAnchor > this.state.lastShownBalance;

    if (isReferenceAboveLastShown && !isAnimatingToRightAnchor && !isAnimatingToRightTarget) {
      // neither heading to anchor balance nor on way to target, so go to anchor quickly
      this.animateToAnchorBalance();
      return;
    }

    if (isAnimatingToRightAnchor && this.state.lastShownBalance === this.state.animationTargetNumber) {
      this.animateToEndOfDayBalance();
      return;
    }

    console.log('Animation completed, no further animating to do');
  }

  animateToAnchorBalance() {
    const animationDuration = DEFAULT_BALANCE_ANIMATION_DURATION;
    const animationInterval = DEFAULT_BALANCE_ANIMATION_INTERVAL;
    const animationStartNumber = this.state.lastShownBalance;
    const animationTargetNumber = this.calculateTargetBalanceAtReferenceMillis(this.state.referenceMoment);

    this.setState({
      animationStartNumber,
      animationTargetNumber,
      animationInterval,
      animationDuration,
    });
  }

  animateToEndOfDayBalance() {

    // users are not seeing this happen, so we are going to 'speed it up' with a min duration
    const animationDuration = moment().endOf('day').valueOf() - moment().valueOf();

    const animationStartNumber = this.state.lastShownBalance;
    // this prevents an accidental decline (e.g., on day changeover), and is valid, since interest mechanics
    // dictate that the only way a balance should decline is via withdrawal, i.e., change in server balance, so end of day target always higher
    
    console.log(`*** TARGET: ${this.props.currentTargetBalance} and anchor: ${this.props.currentReferenceBalance}`);
    const animationTargetNumber = Math.max(
      this.props.currentTargetBalance,
      this.props.currentReferenceBalance,
      0 // see note above on making sure we do not go negative
    );

    // in here we calculate this (animated number can, but would then require reverting to two differently set up anim-numbers, which
    // current refactor eliminates, as one of its larger gains); interval = duration / number of steps, where nu
    const numberSteps = Math.abs(
      (animationTargetNumber - animationStartNumber) /
        DEFAULT_REST_DAY_STEP_SIZE
    );
    if (numberSteps === 0) {
      // console.log('Nothing to do, exiting');
      return;
    }

    const animationInterval = animationDuration / numberSteps;

    this.setState({
      animationStartNumber,
      animationTargetNumber,
      animationInterval,
      animationDuration,
    });

    if (this.props.onSlowAnimationStarted) {
      this.props.onSlowAnimationStarted();
    }
  }

  render() {
    return (
      <View style={styles.balanceWrapper}>
        <Text style={this.props.currencyStyle}>{this.state.currency}</Text>
        <AnimatedNumber
          style={this.props.balanceStyle}
          initial={this.state.animationStartNumber}
          target={this.state.animationTargetNumber}
          formatting={value => getFormattedValue(value, this.state.unit)}
          interval={this.state.animationInterval}
          duration={this.state.animationDuration}
          onAnimationProgress={value => {
            this.onProgressBalanceAnimation(value);
          }}
          onAnimationFinished={() => {
            this.onFinishBalanceAnimation(true);
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  balanceWrapper: {
    flexDirection: 'row',
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(BalanceNumber);
